import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { useAuth } from '../src/context/auth'

vi.mock('../src/context/auth', () => ({ useAuth: vi.fn() }))
function renderRoute(state) {
  vi.mocked(useAuth).mockReturnValue(state)
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<h1>Login</h1>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<h1>Mensagens privadas</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}
describe('Proteção do dashboard', () => {
  it('redireciona visitantes sem sessão ao login', async () => {
    renderRoute({ user: null, isAdmin: false, loading: false })
    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Mensagens privadas')).not.toBeInTheDocument()
  })
  it('nega uma conta autenticada sem permissão de administrador', async () => {
    renderRoute({ user: { id: 'visitante' }, isAdmin: false, loading: false })
    expect(await screen.findByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('Mensagens privadas')).not.toBeInTheDocument()
  })
  it('aguarda a verificação antes de mostrar dados', () => {
    renderRoute({ user: { id: 'admin' }, isAdmin: false, loading: true })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Mensagens privadas')).not.toBeInTheDocument()
  })
  it('permite apenas o administrador verificado', () => {
    renderRoute({ user: { id: 'admin' }, isAdmin: true, loading: false })
    expect(screen.getByText('Mensagens privadas')).toBeInTheDocument()
  })
  it('falha de autorização não libera acesso', () => {
    renderRoute({
      user: { id: 'admin' },
      isAdmin: false,
      loading: false,
      error: 'Permissões indisponíveis',
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Permissões indisponíveis',
    )
    expect(screen.queryByText('Mensagens privadas')).not.toBeInTheDocument()
  })
})
