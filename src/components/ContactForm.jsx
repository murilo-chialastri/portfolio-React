import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { validateContact } from '../lib/contact-validation'
import { sendContact } from '../services/portfolio'
import { config } from '../lib/config'
import Button from './ui/Button'
import Icon from './ui/Icon'

const fields = [
  {
    name: 'name',
    label: 'Seu nome',
    placeholder: 'Como posso te chamar?',
    autoComplete: 'name',
    maxLength: 100,
  },
  {
    name: 'email',
    label: 'Seu e-mail',
    placeholder: 'voce@exemplo.com',
    type: 'email',
    autoComplete: 'email',
    maxLength: 254,
  },
  {
    name: 'subject',
    label: 'Assunto',
    placeholder: 'Sobre o que vamos conversar?',
    maxLength: 150,
  },
  {
    name: 'message',
    label: 'Mensagem',
    placeholder: 'Me conte um pouco sobre sua ideia…',
    multiline: true,
    maxLength: 5000,
  },
]

export default function ContactForm() {
  const [errors, setErrors] = useState({})
  const [copied, setCopied] = useState(false)
  const submission = useRef(null)
  const sending = useRef(false)
  const mutation = useMutation({ mutationFn: sendContact })
  async function handleSubmit(event) {
    event.preventDefault()
    if (sending.current) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      form.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    const fingerprint = JSON.stringify(values)
    if (submission.current?.fingerprint !== fingerprint)
      submission.current = { fingerprint, id: crypto.randomUUID() }
    sending.current = true
    try {
      await mutation.mutateAsync({
        ...values,
        submissionId: submission.current.id,
      })
      form.reset()
      submission.current = null
    } catch {
      /* O erro é exibido abaixo. */
    } finally {
      sending.current = false
    }
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(config.email)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <form className="contact-card" noValidate onSubmit={handleSubmit}>
      <div className="contact-recipient">
        <span>Para</span>
        <a href={`mailto:${config.email}`}>{config.email}</a>
        <Button onClick={copyEmail} type="button" className="copy-button">
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      {fields.map(({ name, label, multiline, ...props }) => {
        const Input = multiline ? 'textarea' : 'input'
        return (
          <div className="form-field" key={name}>
            <label htmlFor={`contact-${name}`}>{label}</label>
            <Input
              id={`contact-${name}`}
              name={name}
              required
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              {...props}
            />
            {errors[name] && (
              <p className="field-error" id={`${name}-error`}>
                {errors[name]}
              </p>
            )}
          </div>
        )
      })}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-bottom">
        <p>Uma boa conversa é um bom começo.</p>
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <span className="spinner" />
              Enviando…
            </>
          ) : (
            <>
              Enviar mensagem <Icon name="arrow" />
            </>
          )}
        </Button>
      </div>
      {mutation.isError && (
        <p role="alert" className="form-feedback error">
          {mutation.error.message}{' '}
          <a href={`mailto:${config.email}`}>Enviar por e-mail</a>
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className="form-feedback">
          Mensagem enviada! Obrigado pelo contato. Vou responder pelo seu
          e-mail.
        </p>
      )}
    </form>
  )
}
