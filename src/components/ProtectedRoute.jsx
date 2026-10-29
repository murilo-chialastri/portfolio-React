import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/auth'
import { ErrorState, Loading } from './ui/AsyncState'

export default function ProtectedRoute() {
  const { user, isAdmin, loading, error } = useAuth()
  const location = useLocation()
  if (loading) return <Loading label="Verificando acesso…" />
  if (error)
    return (
      <ErrorState
        error={new Error(error)}
        retry={() => window.location.reload()}
      />
    )
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <Navigate to="/login" replace state={{ denied: true }} />
  return <Outlet />
}
