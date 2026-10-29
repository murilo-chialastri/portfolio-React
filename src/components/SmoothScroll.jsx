import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import 'lenis/dist/lenis.css'

const easing = (time) => Math.min(1, 1.001 - 2 ** (-10 * time))

export default function SmoothScroll({ children }) {
  const reduce = useReducedMotion()
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        duration: reduce ? 0 : 1.25,
        easing,
        smoothWheel: !reduce,
        stopInertiaOnNavigate: true,
        prevent: (node) => Boolean(node.closest('[role="dialog"]')),
      }}
    >
      {children}
    </ReactLenis>
  )
}
