import { createContext, use } from 'react'
export const AuthContext = createContext(null)
export const useAuth = () => use(AuthContext)
