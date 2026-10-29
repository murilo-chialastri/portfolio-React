import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/auth'
import { isBackendConfigured } from '../lib/config'
import { requireBackend } from '../services/supabase'
import Button from '../components/ui/Button'
import { Loading } from '../components/ui/AsyncState'

export default function LoginPage() {
  const { user, isAdmin, loading, error: authError } = useAuth()
  const location = useLocation()
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const destination =
    location.state?.from === '/dashboard' ? location.state.from : '/dashboard'
  if (loading)
    return (
      <main className="page-shell">
        <Loading label="Verificando sessão…" />
      </main>
    )
  if (user && isAdmin) return <Navigate to={destination} replace />
  async function login(event) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    const values = new FormData(event.currentTarget)
    try {
      const { error: signInError } =
        await requireBackend().auth.signInWithPassword({
          email: values.get('email').trim(),
          password: values.get('password'),
        })
      if (signInError)
        throw new Error(
          'E-mail ou senha inválidos. Confira seus dados e tente novamente.',
        )
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setPending(false)
    }
  }
  return (
    <main id="main-content" className="page-shell login-shell">
      <title>Área do proprietário — Murilo Chialastri</title>
      <p className="eyebrow">Acesso reservado</p>
      <h1>
        Olá de <span className="muted">novo.</span>
      </h1>
      <p className="page-intro">
        Entre para acompanhar suas mensagens e escolher os projetos em destaque.
      </p>
      {!isBackendConfigured ? (
        <div className="login-note" role="status">
          A área administrativa está em preparação. Volte em breve.
        </div>
      ) : (
        <form className="login-form" onSubmit={login}>
          <label>
            E-mail
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </label>
          <Button variant="primary" type="submit" disabled={pending}>
            {pending ? 'Entrando…' : 'Entrar no dashboard'}
          </Button>
          {(error || authError) && (
            <p role="alert" className="field-error">
              {error || authError}
            </p>
          )}
        </form>
      )}
      {(location.state?.denied || (user && !isAdmin)) && (
        <div role="alert" className="login-note">
          <p>Esta conta não tem permissão de administrador.</p>
          <Button
            onClick={() =>
              requireBackend()
                .auth.signOut()
                .catch(() =>
                  setError('Não foi possível sair. Tente novamente.'),
                )
            }
          >
            Sair desta conta
          </Button>
        </div>
      )}
    </main>
  )
}
