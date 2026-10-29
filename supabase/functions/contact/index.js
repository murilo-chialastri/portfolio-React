const RECIPIENT = 'murilocastro233@gmail.com'
const MAX_BODY_BYTES = 16 * 1024
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/
// oxlint-disable-next-line no-control-regex -- Bloqueia injeção de cabeçalhos.
const SINGLE_LINE_CONTROL = /[\u0000-\u001f\u007f]/
// oxlint-disable-next-line no-control-regex -- Permite quebras de linha, rejeita outros controles.
const MESSAGE_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
// Supabase SDK headers, including optional retries and trace propagation.
const CORS_HEADERS =
  'authorization, apikey, content-type, x-client-info, x-retry-count, traceparent, tracestate, baggage'

class RequestError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function validEmail(value) {
  if (value.length > 254 || !EMAIL.test(value)) return false
  const [local, domain] = value.split('@')
  return (
    local.length <= 64 &&
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    !local.includes('..') &&
    domain.split('.').every((label) => label.length <= 63)
  )
}

function configFrom(getEnv) {
  const required = (key) => {
    const value = getEnv(key)?.trim()
    if (!value) throw new Error(`Missing ${key}`)
    return value
  }
  const origins = new Set(
    required('ALLOWED_ORIGINS')
      .split(',')
      .map((part) => part.trim()),
  )
  for (const origin of origins) {
    const url = new URL(origin)
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error('Invalid ALLOWED_ORIGINS')
    }
  }
  const from = required('CONTACT_FROM_EMAIL')
  const mailbox = from.match(/^(?:[^<>\r\n]+ <([^<>]+)>|([^<>]+))$/)
  if (
    from.length > 320 ||
    SINGLE_LINE_CONTROL.test(from) ||
    !mailbox ||
    !validEmail(mailbox[1] ?? mailbox[2])
  )
    throw new Error('Invalid sender')
  if (required('CONTACT_TO_EMAIL') !== RECIPIENT)
    throw new Error('Invalid recipient')
  const url = new URL(required('SUPABASE_URL'))
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  )
    throw new Error('Invalid Supabase URL')
  return {
    origins,
    from,
    url: url.origin,
    serviceKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    resendKey: required('RESEND_API_KEY'),
  }
}

async function readBody(request) {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !==
    'application/json'
  ) {
    throw new RequestError(415, 'Envie o formulário como JSON.')
  }
  const length = request.headers.get('content-length')
  if (
    length !== null &&
    (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)
  ) {
    throw new RequestError(413, 'O formulário excede o limite de 16 KiB.')
  }
  if (!request.body) throw new RequestError(400, 'Formulário vazio.')
  const reader = request.body.getReader()
  let timer
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new RequestError(408, 'Tempo esgotado ao receber o formulário.'))
      void reader.cancel().catch(() => {})
    }, 5000)
  })
  try {
    const chunks = []
    let total = 0
    while (true) {
      const { value, done } = await Promise.race([reader.read(), deadline])
      if (done) break
      total += value.byteLength
      if (total > MAX_BODY_BYTES)
        throw new RequestError(413, 'O formulário excede o limite de 16 KiB.')
      chunks.push(value)
    }
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    try {
      return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    } catch {
      throw new RequestError(400, 'JSON inválido.')
    }
  } finally {
    clearTimeout(timer)
    void reader.cancel().catch(() => {})
  }
}

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new RequestError(400, 'Formulário inválido.')
  }
  const fields = [
    'name',
    'email',
    'subject',
    'message',
    'website',
    'submissionId',
  ]
  if (
    Object.keys(body).some((key) => !fields.includes(key)) ||
    fields.some((key) => typeof body[key] !== 'string')
  ) {
    throw new RequestError(400, 'Campos do formulário inválidos.')
  }
  if (body.website !== '')
    throw new RequestError(400, 'Não foi possível aceitar o formulário.')
  const name = body.name.trim()
  const email = body.email.trim().toLowerCase()
  const subject = body.subject.trim()
  const message = body.message.replace(/\r\n?/g, '\n').trim()
  const size = (value, min, max) =>
    [...value].length >= min && [...value].length <= max
  if (!size(name, 2, 100) || SINGLE_LINE_CONTROL.test(name)) {
    throw new RequestError(
      400,
      'Nome deve conter entre 2 e 100 caracteres, em uma linha.',
    )
  }
  if (!validEmail(email)) throw new RequestError(400, 'E-mail inválido.')
  if (!size(subject, 3, 160) || SINGLE_LINE_CONTROL.test(subject)) {
    throw new RequestError(
      400,
      'Assunto deve conter entre 3 e 160 caracteres, em uma linha.',
    )
  }
  if (!size(message, 20, 5000) || MESSAGE_CONTROL.test(message)) {
    throw new RequestError(
      400,
      'Mensagem deve conter entre 20 e 5000 caracteres válidos.',
    )
  }
  if (!UUID_V4.test(body.submissionId))
    throw new RequestError(400, 'submissionId deve ser um UUID v4.')
  return {
    name,
    email,
    subject,
    message,
    submissionId: body.submissionId.toLowerCase(),
  }
}

// Dependency injection keeps HTTP tests local: no Supabase/Resend credentials needed.
export function createContactHandler({
  getEnv = (key) => Deno.env.get(key),
  fetchImpl = fetch,
  now = Date.now,
} = {}) {
  return async (request) => {
    const origin = request.headers.get('origin')
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Origin',
    }
    const reply = (status, body, extra = {}) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...headers, ...extra },
      })
    let config
    try {
      config = configFrom(getEnv)
    } catch {
      return reply(503, { error: 'Serviço de contato não configurado.' })
    }
    // Missing/null origins are rejected too. CORS is a browser policy, not auth.
    if (!origin || !config.origins.has(origin)) {
      return reply(403, { error: 'Origem não permitida.' })
    }
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = CORS_HEADERS
    headers['Access-Control-Expose-Headers'] = 'Retry-After'
    if (request.method === 'OPTIONS') {
      const requestedHeaders = (
        request.headers.get('access-control-request-headers') ?? ''
      )
        .toLowerCase()
        .split(',')
        .map((header) => header.trim())
        .filter(Boolean)
      if (
        request.headers.get('access-control-request-method') !== 'POST' ||
        requestedHeaders.some(
          (header) => !CORS_HEADERS.split(', ').includes(header),
        )
      ) {
        return reply(403, { error: 'Preflight não permitido.' })
      }
      return new Response(null, { status: 204, headers })
    }
    if (request.method !== 'POST')
      return reply(
        405,
        { error: 'Método não permitido.' },
        { Allow: 'POST, OPTIONS' },
      )

    const rpc = async (name, args) => {
      const response = await fetchImpl(`${config.url}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
          apikey: config.serviceKey,
          Authorization: `Bearer ${config.serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error('Database unavailable')
      return await response.json()
    }

    try {
      const input = validate(await readBody(request))
      const reservation = await rpc('contact_reserve', {
        p_submission_id: input.submissionId,
        p_name: input.name,
        p_email: input.email,
        p_subject: input.subject,
        p_message: input.message,
        p_from: config.from,
      })
      switch (reservation?.state) {
        case 'sent':
          return reply(200, { ok: true })
        case 'invalid':
          return reply(400, { error: 'Formulário inválido.' })
        case 'conflict':
          return reply(409, {
            error:
              'Este envio já foi registrado com outro conteúdo. Revise os campos antes de tentar novamente.',
          })
        case 'limited':
          return reply(
            429,
            {
              error:
                'Limite de tentativas atingido. Aguarde 15 minutos antes de tentar novamente.',
            },
            { 'Retry-After': '900' },
          )
        case 'busy':
          return reply(
            409,
            {
              error:
                'Um envio está em andamento. Aguarde um pouco antes de tentar novamente.',
            },
            { 'Retry-After': String(reservation.retry_after ?? 90) },
          )
        case 'expired':
          return reply(409, {
            error:
              'Sua mensagem foi salva, mas o aviso por e-mail não pôde ser confirmado. Entre em contato diretamente por e-mail.',
          })
        case 'send':
          break
        default:
          throw new Error('Invalid reservation')
      }
      // Fail closed if a delayed worker wakes after its lease / retry deadline.
      if (
        !UUID_V4.test(reservation.lease_token) ||
        !Number.isFinite(Date.parse(reservation.lease_until)) ||
        !Number.isFinite(Date.parse(reservation.retry_until)) ||
        Math.min(
          Date.parse(reservation.lease_until),
          Date.parse(reservation.retry_until),
        ) <=
          now() + 12000 ||
        reservation.mail_payload?.to?.length !== 1 ||
        reservation.mail_payload.to[0] !== RECIPIENT
      )
        throw new Error('Invalid send lease')

      let providerId = null
      let failure = 'provider_unavailable'
      try {
        const response = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.resendKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `cp3-contact/${input.submissionId}`,
          },
          body: JSON.stringify(reservation.mail_payload),
          signal: AbortSignal.timeout(10000),
        })
        if (response.ok) {
          const result = await response.json()
          if (
            typeof result?.id === 'string' &&
            result.id.length > 0 &&
            result.id.length <= 200
          )
            providerId = result.id
        } else {
          failure = 'provider_rejected'
          void response.body?.cancel().catch(() => {})
        }
      } catch {
        // A timeout may mean Resend accepted the message. Same UUID/key/payload
        // are mandatory for a retry; never claim that nothing was sent.
      }
      const finished = await rpc('contact_finish', {
        p_submission_id: input.submissionId,
        p_lease_token: reservation.lease_token,
        p_status: providerId ? 'sent' : 'failed',
        p_provider_id: providerId,
        p_error: providerId ? null : failure,
      })
      if (finished !== true) throw new Error('Delivery state not committed')
      if (!providerId) {
        return reply(
          502,
          {
            error:
              'Mensagem salva, mas o envio do e-mail não foi confirmado. Aguarde e tente novamente sem alterar os campos.',
          },
          { 'Retry-After': '30' },
        )
      }
      return reply(200, { ok: true })
    } catch (error) {
      if (error instanceof RequestError)
        return reply(error.status, { error: error.message })
      return reply(
        503,
        {
          error:
            'Não foi possível confirmar o envio. Sua mensagem pode estar salva ou enviada. Aguarde e tente novamente sem alterar os campos.',
        },
        { 'Retry-After': '90' },
      )
    }
  }
}

// Supabase may import the entrypoint from its worker bootstrap.
if (typeof Deno !== 'undefined') Deno.serve(createContactHandler())
