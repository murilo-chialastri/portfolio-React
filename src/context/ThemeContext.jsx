import { useEffect, useState } from 'react'
import { ThemeContext } from './theme'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'dark',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('portfolio-theme', theme)
    } catch {
      /* O tema continua ativo sem persistência. */
    }
  }, [theme])
  return (
    <ThemeContext
      value={{
        theme,
        toggleTheme: () =>
          setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      }}
    >
      {children}
    </ThemeContext>
  )
}
