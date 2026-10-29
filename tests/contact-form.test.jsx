import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ContactForm from '../src/components/ContactForm'
import { sendContact } from '../src/services/portfolio'

vi.mock('../src/services/portfolio', () => ({ sendContact: vi.fn() }))
function setup() {
  const cache = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={cache}>
      <ContactForm />
    </QueryClientProvider>,
  )
}
function fill() {
  fireEvent.change(screen.getByLabelText('Seu nome'), {
    target: { value: 'Ana Silva' },
  })
  fireEvent.change(screen.getByLabelText('Seu e-mail'), {
    target: { value: 'ana@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Assunto'), {
    target: { value: 'Novo projeto' },
  })
  fireEvent.change(screen.getByLabelText('Mensagem'), {
    target: { value: 'Vamos conversar sobre um projeto de software?' },
  })
}
describe('Envio do contato', () => {
  it('mostra validação por campo e não envia dados inválidos', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/ }))
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(sendContact).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Seu nome')).toHaveFocus()
  })
  it('bloqueia envio duplicado e só confirma após resposta do servidor', async () => {
    let resolve
    vi.mocked(sendContact).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    setup()
    fill()
    fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/ }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviando/ })).toBeDisabled(),
    )
    expect(sendContact).toHaveBeenCalledTimes(1)
    resolve({ ok: true })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Mensagem enviada!',
    )
  })
  it('preserva os campos e a chave idempotente quando há erro', async () => {
    vi.mocked(sendContact).mockRejectedValue(new Error('Envio indisponível'))
    setup()
    fill()
    fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Envio indisponível',
    )
    const firstId = sendContact.mock.calls.at(-1)[0].submissionId
    expect(screen.getByLabelText('Seu nome')).toHaveValue('Ana Silva')
    fireEvent.click(screen.getByRole('button', { name: /Enviar mensagem/ }))
    await waitFor(() =>
      expect(sendContact.mock.calls.at(-1)[0].submissionId).toBe(firstId),
    )
    expect(screen.queryByText(/Mensagem enviada!/)).not.toBeInTheDocument()
  })
})
