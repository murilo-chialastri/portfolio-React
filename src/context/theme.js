import { createContext, use } from 'react'
export const ThemeContext = createContext(null)
export const useTheme = () => use(ThemeContext)
