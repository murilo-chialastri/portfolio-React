import { useEffect, useState } from 'react'
import { AuthContext } from './auth'
import { supabase } from '../services/supabase'

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isAdmin: false,
    loading: Boolean(supabase),
    error: null,
  })
  useEffect(() => {
    if (!supabase) return
    let active = true
    let revision = 0
    async function update(session) {
      const currentRevision = ++revision
      if (!session?.user) {
        if (active)
          setState({ user: null, isAdmin: false, loading: false, error: null })
        return
      }
      if (active)
        setState({
          user: session.user,
          isAdmin: false,
          loading: true,
          error: null,
        })
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (active && currentRevision === revision)
        setState({
          user: session.user,
          isAdmin: Boolean(data) && !error,
          loading: false,
          error: error ? 'Não foi possível verificar suas permissões.' : null,
        })
    }
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error && active)
          setState({
            user: null,
            isAdmin: false,
            loading: false,
            error: 'Não foi possível recuperar a sessão.',
          })
        else if (active) void update(data.session)
      })
      .catch(() => {
        if (active)
          setState({
            user: null,
            isAdmin: false,
            loading: false,
            error: 'Não foi possível conectar ao serviço de login.',
          })
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Consultas fora do callback evitam bloquear o lock interno do Supabase Auth.
      setTimeout(() => {
        if (active) void update(session)
      }, 0)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])
  return <AuthContext value={state}>{children}</AuthContext>
}
