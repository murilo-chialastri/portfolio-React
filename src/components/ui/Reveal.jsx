import { useLayoutEffect, useRef } from 'react'

export default function Reveal({ children, className, delay = 0 }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!window.IntersectionObserver) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        element.classList.add('is-visible')
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
    )
    element.classList.add('reveal-ready')
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      data-reveal
      style={{ '--rd': `${delay}s` }}
    >
      {children}
    </div>
  )
}
