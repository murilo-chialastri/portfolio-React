import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// Load independently of the frontend package's module settings.
const source = await readFile(
  new URL('../functions/contact/index.js', import.meta.url),
  'utf8',
)
const { createContactHandler } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
)
const id = '12345678-1234-4123-8123-123456789abc'
const token = '87654321-1234-4123-8123-123456789abc'
const clock = Date.parse('2026-10-29T12:00:00Z')
const input = {
  name: 'Pessoa Teste',
  email: 'pessoa@example.com',
  subject: 'Projeto CP3',
  message: 'Uma mensagem de contato com mais de vinte caracteres.',
  website: '',
  submissionId: id,
}
const env = {
  ALLOWED_ORIGINS: 'https://portfolio.example.com,http://localhost:5173',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  CONTACT_FROM_EMAIL: 'CP3 <contato@example.com>',
  CONTACT_TO_EMAIL: 'murilocastro233@gmail.com',
  RESEND_API_KEY: 'test-resend-key',
}
const payload = {
  from: env.CONTACT_FROM_EMAIL,
  to: [env.CONTACT_TO_EMAIL],
  reply_to: input.email,
  subject: '[CP3] Projeto CP3',
  text: 'Conteúdo congelado pelo banco.',
}
const lease = (overrides = {}) => ({
  state: 'send',
  lease_token: token,
  lease_until: new Date(clock + 90000).toISOString(),
  retry_until: new Date(clock + 23 * 3600000).toISOString(),
  mail_payload: payload,
  ...overrides,
})
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status })
function setup(steps = [], overrides = {}) {
  const calls = []
  const handler = createContactHandler({
    getEnv: (key) => ({ ...env, ...overrides })[key],
    now: () => clock,
    fetchImpl: async (url, options) => {
      calls.push({ url, ...options, body: JSON.parse(options.body) })
      assert.ok(steps.length, 'Unexpected network request')
      const step = steps.shift()
      if (step instanceof Error) throw step
      return step
    },
  })
  return { handler, calls, steps }
}
function request(body = input, options = {}) {
  return new Request('https://test.supabase.co/functions/v1/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
    headers: {
      Origin: 'https://portfolio.example.com',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

test('save/lease happens before Resend and final status; key/payload stay stable', async () => {
  const ctx = setup([json(lease()), json({ id: 'provider-id' }), json(true)])
  const response = await ctx.handler(
    request({
      ...input,
      email: ' PESSOA@example.com ',
      message: ` ${input.message}\r\n `,
    }),
  )
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true })
  assert.match(ctx.calls[0].url, /rpc\/contact_reserve$/)
  assert.equal(ctx.calls[0].body.p_email, input.email)
  assert.equal(ctx.calls[0].body.p_message, input.message)
  assert.equal(ctx.calls[1].url, 'https://api.resend.com/emails')
  assert.equal(ctx.calls[1].headers['Idempotency-Key'], `cp3-contact/${id}`)
  assert.deepEqual(ctx.calls[1].body, payload)
  assert.equal(ctx.calls[2].body.p_status, 'sent')
  assert.equal(ctx.calls[2].body.p_provider_id, 'provider-id')
  assert.equal(ctx.calls[2].body.p_lease_token, token)
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://portfolio.example.com',
  )
})

for (const [state, status] of [
  ['sent', 200],
  ['conflict', 409],
  ['busy', 409],
  ['expired', 409],
  ['limited', 429],
  ['invalid', 400],
]) {
  test(`reservation ${state} never sends email`, async () => {
    const ctx = setup([json({ state })])
    const response = await ctx.handler(request())
    assert.equal(response.status, status)
    const result = await response.json()
    assert.deepEqual(Object.keys(result), [status === 200 ? 'ok' : 'error'])
    assert.equal(ctx.calls.length, 1)
  })
}

for (const failure of [
  new Error('timeout'),
  json({ error: 'secret provider details' }, 429),
  json({ unexpected: 'response' }),
]) {
  test('provider failure/uncertain result is persisted and never reported as success', async () => {
    const ctx = setup([json(lease()), failure, json(true)])
    const response = await ctx.handler(request())
    assert.equal(response.status, 502)
    assert.equal(ctx.calls[2].body.p_status, 'failed')
    assert.equal(ctx.calls[2].body.p_provider_id, null)
    assert.match((await response.json()).error, /Mensagem salva/)
    assert.equal(response.headers.get('Retry-After'), '30')
  })
}

test('retry uses the frozen sender and payload even after configuration changes', async () => {
  const ctx = setup(
    [json(lease()), json({ id: 'same-provider-id' }), json(true)],
    { CONTACT_FROM_EMAIL: 'Outro <outro@example.com>' },
  )
  assert.equal((await ctx.handler(request())).status, 200)
  assert.deepEqual(ctx.calls[1].body, payload)
  assert.equal(ctx.calls[1].headers['Idempotency-Key'], `cp3-contact/${id}`)
})

test('a DB outage prevents sending', async () => {
  const ctx = setup([json({}, 503)])
  assert.equal((await ctx.handler(request())).status, 503)
  assert.equal(ctx.calls.length, 1)
})
for (const result of [json(false), json({}, 503)]) {
  test('provider acceptance without committed DB status returns an honest error', async () => {
    const ctx = setup([json(lease()), json({ id: 'accepted' }), result])
    const response = await ctx.handler(request())
    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /pode estar salva ou enviada/)
  })
}
test('expired or malformed leases cannot send', async () => {
  for (const fields of [
    { lease_until: new Date(clock).toISOString() },
    { retry_until: 'invalid' },
    { lease_token: 'bad' },
    { mail_payload: { ...payload, to: ['attacker@example.com'] } },
  ]) {
    const ctx = setup([json(lease(fields))])
    assert.equal((await ctx.handler(request())).status, 503)
    assert.equal(ctx.calls.length, 1)
  }
})

test('strict origin allowlist and valid preflight support supabase.functions.invoke', async () => {
  const ctx = setup()
  for (const origin of [
    '',
    'null',
    'https://portfolio.example.com.evil.test',
  ]) {
    const response = await ctx.handler(
      request(input, { headers: { Origin: origin } }),
    )
    assert.equal(response.status, 403)
    assert.equal(response.headers.get('access-control-allow-origin'), null)
  }
  const response = await ctx.handler(
    request(undefined, {
      method: 'OPTIONS',
      body: null,
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers':
          'apikey, authorization, content-type, x-client-info, x-retry-count, traceparent, tracestate, baggage',
      },
    }),
  )
  assert.equal(response.status, 204)
  assert.equal(ctx.calls.length, 0)
  assert.equal(
    (await ctx.handler(request(undefined, { method: 'GET', body: null })))
      .status,
    405,
  )
  assert.equal(
    (
      await ctx.handler(
        request(undefined, {
          method: 'OPTIONS',
          body: null,
          headers: { 'Access-Control-Request-Method': 'DELETE' },
        }),
      )
    ).status,
    403,
  )
})

test('invalid configuration fails closed, including a changed recipient', async () => {
  for (const override of [
    { ALLOWED_ORIGINS: '*' },
    { ALLOWED_ORIGINS: 'https://portfolio.example.com/' },
    { CONTACT_TO_EMAIL: 'other@example.com' },
    { CONTACT_FROM_EMAIL: 'x\r\nBcc: x@example.com' },
    { RESEND_API_KEY: '' },
  ]) {
    const ctx = setup([], override)
    assert.equal((await ctx.handler(request())).status, 503)
    assert.equal(ctx.calls.length, 0)
  }
})

test('invalid fields, header injection and honeypot are rejected before DB', async () => {
  for (const change of [
    { message: 'curta' },
    { name: 'A' },
    { subject: 'x\nBcc: attacker@example.com' },
    { name: 'Teste\u0000' },
    { email: 'x@example.com\r\nBcc:x@example.com' },
    { email: '.x@example.com' },
    { website: 'https://spam.test' },
    { website: ' ' },
    { website: null },
    { submissionId: 'not-a-uuid' },
    { to: 'attacker@example.com' },
    { message: 'x'.repeat(5001) },
  ]) {
    const ctx = setup()
    assert.equal(
      (await ctx.handler(request({ ...input, ...change }))).status,
      400,
      JSON.stringify(change),
    )
    assert.equal(ctx.calls.length, 0)
  }
})

test('content type, malformed JSON and byte limits are enforced, including streaming', async () => {
  const ctx = setup()
  assert.equal(
    (
      await ctx.handler(
        request(input, { headers: { 'Content-Type': 'text/plain' } }),
      )
    ).status,
    415,
  )
  assert.equal((await ctx.handler(request(input, { body: '{' }))).status, 400)
  assert.equal(
    (
      await ctx.handler(
        request(input, { headers: { 'Content-Length': '16385' } }),
      )
    ).status,
    413,
  )
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(16385))
      controller.close()
    },
  })
  assert.equal(
    (await ctx.handler(request(input, { body: stream, duplex: 'half' })))
      .status,
    413,
  )
  assert.equal(ctx.calls.length, 0)
})
