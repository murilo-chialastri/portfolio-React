export function validateContact(values) {
  const errors = {}
  if (!values.name?.trim() || values.name.trim().length < 2)
    errors.name = 'Informe seu nome com pelo menos 2 caracteres.'
  else if (values.name.trim().length > 100)
    errors.name = 'Use até 100 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email?.trim() || ''))
    errors.email = 'Informe um e-mail válido.'
  else if (values.email.trim().length > 254)
    errors.email = 'Use até 254 caracteres.'
  if (!values.subject?.trim() || values.subject.trim().length < 3)
    errors.subject = 'O assunto precisa ter pelo menos 3 caracteres.'
  else if (values.subject.trim().length > 150)
    errors.subject = 'Use até 150 caracteres.'
  if (!values.message?.trim() || values.message.trim().length < 20)
    errors.message = 'Escreva uma mensagem com pelo menos 20 caracteres.'
  else if (values.message.trim().length > 5000)
    errors.message = 'Use até 5.000 caracteres.'
  return errors
}
