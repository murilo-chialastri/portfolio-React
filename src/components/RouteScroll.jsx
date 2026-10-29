import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useLenis } from 'lenis/react'

export default function RouteScroll() {
  const { pathname, hash, key } = useLocation()
  const lenis = useLenis()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const target = hash ? document.getElementById(hash.slice(1)) : 0
      if (target === null) return
      if (lenis) {
        lenis.scrollTo(target, { immediate: !hash || reduce, duration: 1.6 })
      } else if (hash) {
        target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth' })
      } else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key, lenis])
  return null
}
