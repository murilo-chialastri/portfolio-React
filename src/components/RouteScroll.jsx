import { useEffect } from 'react'
import { useLocation } from 'react-router'

export default function RouteScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash)
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
        })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  return null
}
