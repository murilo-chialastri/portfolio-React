import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { carouselPosition, wrapIndex } from '../lib/carousel'
import ProjectCard from './ProjectCard'
import Button from './ui/Button'
import Icon from './ui/Icon'

function CarouselSlide({
  repo,
  index,
  position,
  total,
  onSelect,
  reducedMotion,
}) {
  const ref = useRef(null)
  const innerRef = useRef(null)
  const previous = useRef(position)
  const active = position === 0

  useLayoutEffect(() => {
    const element = ref.current
    const prev = previous.current
    previous.current = position
    element.dataset.position = position
    if (
      reducedMotion ||
      !prev ||
      !position ||
      Math.sign(prev) === Math.sign(position)
    )
      return

    // O card que muda de lado contorna o palco em vez de cruzar o card ativo.
    element.dataset.position = Math.sign(prev) * 2
    const timer = setTimeout(() => {
      element.dataset.noAnimation = ''
      element.dataset.position = Math.sign(position) * 2
      void element.offsetWidth
      delete element.dataset.noAnimation
      element.dataset.position = position
    }, 380)
    return () => {
      clearTimeout(timer)
      delete element.dataset.noAnimation
    }
  }, [position, reducedMotion])

  function resetTilt() {
    innerRef.current.style.removeProperty('--tx')
    innerRef.current.style.removeProperty('--ty')
  }

  function tilt(event) {
    if (
      !active ||
      reducedMotion ||
      event.pointerType !== 'mouse' ||
      event.buttons
    )
      return
    const rect = ref.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    innerRef.current.style.setProperty('--tx', `${x * 10}deg`)
    innerRef.current.style.setProperty('--ty', `${-y * 10}deg`)
  }

  return (
    <div
      ref={ref}
      className="carousel-slide"
      data-position={position}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} de ${total}`}
      aria-hidden={!active}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
      onPointerDown={resetTilt}
    >
      <div ref={innerRef} className="carousel-card-inner" inert={!active}>
        <ProjectCard repo={repo} index={index} />
      </div>
      {!active && Math.abs(position) === 1 && (
        <button
          type="button"
          className="carousel-select"
          tabIndex={-1}
          aria-label={`Selecionar ${repo.name}`}
          onClick={(event) => {
            event.currentTarget
              .closest('.carousel-stage')
              .focus({ preventScroll: true })
            onSelect()
          }}
        />
      )}
    </div>
  )
}

export default function ProjectCarousel({ projects }) {
  const [selection, setSelection] = useState(null)
  const reducedMotion = useReducedMotion()
  const gesture = useRef(null)
  const suppressClick = useRef(false)
  const instructionId = useId()
  const selectedIndex = projects.findIndex((repo) => repo.id === selection)
  const current = Math.max(0, selectedIndex)

  function move(direction) {
    setSelection(projects[wrapIndex(current + direction, projects.length)]?.id)
  }

  function pointerDown(event) {
    if (event.button !== 0 || !event.isPrimary) return
    suppressClick.current = false
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dx: 0,
      dragging: false,
    }
  }

  function pointerMove(event) {
    const drag = gesture.current
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.dragging && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
      gesture.current = null
      return
    }
    if (!drag.dragging && Math.abs(dx) > 6) {
      drag.dragging = true
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.dataset.dragging = ''
    }
    drag.dx = dx
    if (drag.dragging && !reducedMotion)
      event.currentTarget.style.setProperty('--drag', `${dx * 0.6}px`)
  }

  function pointerEnd(event) {
    const drag = gesture.current
    if (!drag || drag.id !== event.pointerId) return
    gesture.current = null
    delete event.currentTarget.dataset.dragging
    event.currentTarget.style.removeProperty('--drag')
    if (!drag.dragging) return
    suppressClick.current = true
    if (event.type === 'pointerup') {
      if (drag.dx < -60) move(1)
      else if (drag.dx > 60) move(-1)
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }

  if (!projects.length) return null

  return (
    <div
      className="project-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Projetos em destaque"
    >
      <p className="sr-only" id={instructionId}>
        Use as setas do teclado, os botões ou arraste para trocar de projeto.
      </p>
      <div
        className="carousel-stage"
        role="group"
        aria-label="Navegar pelos projetos"
        aria-describedby={instructionId}
        tabIndex={0}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerEnd}
        onPointerCancel={pointerEnd}
        onLostPointerCapture={pointerEnd}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current && event.detail !== 0) {
            event.preventDefault()
            event.stopPropagation()
          }
          suppressClick.current = false
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            event.currentTarget.focus({ preventScroll: true })
            move(event.key === 'ArrowRight' ? 1 : -1)
          }
        }}
      >
        {projects.map((repo, index) => (
          <CarouselSlide
            key={repo.id}
            repo={repo}
            index={index}
            total={projects.length}
            position={carouselPosition(index, current, projects.length)}
            reducedMotion={reducedMotion}
            onSelect={() => setSelection(repo.id)}
          />
        ))}
      </div>
      <div className="carousel-controls">
        <Button
          variant="icon"
          aria-label="Projeto anterior"
          onClick={() => move(-1)}
          disabled={projects.length < 2}
        >
          <Icon name="left" />
        </Button>
        <p className="carousel-pill" aria-live="polite" aria-atomic="true">
          <span key={projects[current].id}>
            {projects[current].name.replaceAll('-', ' ')}
          </span>
          <span className="sr-only">
            {' '}
            — {current + 1} de {projects.length}
          </span>
        </p>
        <Button
          variant="icon"
          aria-label="Próximo projeto"
          onClick={() => move(1)}
          disabled={projects.length < 2}
        >
          <Icon name="right" />
        </Button>
      </div>
      <p className="carousel-count eyebrow" aria-hidden="true">
        {String(current + 1).padStart(2, '0')}{' '}
        <span className="muted">
          / {String(projects.length).padStart(2, '0')}
        </span>
      </p>
    </div>
  )
}
