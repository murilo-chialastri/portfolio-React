import { describe, expect, it } from 'vitest'
import { validateContact } from '../src/lib/contact-validation'

const valid = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  subject: 'Um novo projeto',
  message: 'Gostaria de conversar sobre um projeto de software.',
}
describe('Validação do formulário de contato', () => {
  it('aceita uma mensagem válida', () => {
    expect(validateContact(valid)).toEqual({})
  })
  it('retorna um erro específico para cada campo vazio', () => {
    expect(Object.keys(validateContact({}))).toEqual([
      'name',
      'email',
      'subject',
      'message',
    ])
  })
  it.each(['inválido', 'ana@', 'a @example.com', 'a@example'])(
    'rejeita o e-mail %s',
    (email) => {
      expect(validateContact({ ...valid, email }).email).toMatch(
        /e-mail válido/,
      )
    },
  )
  it('não conta espaços para atingir o mínimo da mensagem', () => {
    expect(
      validateContact({ ...valid, message: `  ${'a'.repeat(19)}  ` }).message,
    ).toMatch(/20 caracteres/)
  })
  it('aceita exatamente 20 caracteres', () => {
    expect(validateContact({ ...valid, message: 'a'.repeat(20) })).toEqual({})
  })
  it('limita os tamanhos dos dados recebidos', () => {
    const errors = validateContact({
      name: 'a'.repeat(101),
      email: `${'a'.repeat(250)}@x.com`,
      subject: 'a'.repeat(151),
      message: 'a'.repeat(5001),
    })
    expect(Object.keys(errors)).toHaveLength(4)
  })
})
