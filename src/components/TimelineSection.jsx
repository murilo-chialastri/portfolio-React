import { useRef } from 'react'
import { motion, useReducedMotion, useScroll } from 'motion/react'
import { timelineEntries } from '../lib/timeline'
import Icon from './ui/Icon'
import Reveal from './ui/Reveal'
import './TimelineSection.css'

function TimelineEvent({ event }) {
  return (
    <article
      className={`timeline-event${event.image ? '' : ' timeline-event--text-only'}`}
      aria-labelledby={`timeline-${event.id}`}
    >
      <Reveal className="timeline-copy">
        <h3 id={`timeline-${event.id}`}>{event.title}</h3>
        <p>{event.description}</p>
      </Reveal>
      {event.image && (
        <Reveal className="timeline-media" delay={0.12}>
          <figure>
            <div className="timeline-photo">
              <img
                src={event.image.src}
                alt={event.image.alt}
                width={event.image.width}
                height={event.image.height}
                loading="lazy"
                decoding="async"
              />
            </div>
            {event.image.caption && (
              <figcaption>{event.image.caption}</figcaption>
            )}
          </figure>
        </Reveal>
      )}
    </article>
  )
}

function TimelineEntry({ entry, index }) {
  return (
    <li className="timeline-entry">
      <div className="timeline-marker">
        <time dateTime={entry.id}>
          <span>{entry.month}</span> <span>{entry.year}</span>
        </time>
      </div>
      <div className="timeline-events">
        <Reveal>
          <p className="eyebrow">
            Capítulo {String(index + 1).padStart(2, '0')}
          </p>
        </Reveal>
        {entry.events.map((event) => (
          <TimelineEvent key={event.id} event={event} />
        ))}
      </div>
    </li>
  )
}

export default function TimelineSection({ entries = timelineEntries }) {
  const trackRef = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start center', 'end center'],
  })

  return (
    <section
      id="trajetoria"
      className="timeline-section section-pad"
      aria-labelledby="timeline-title"
    >
      <div className="section-heading">
        <Reveal>
          <p className="eyebrow">02 / Linha do tempo</p>
          <h2 id="timeline-title">
            Cada passo,
            <br />
            <span className="muted">um novo capítulo.</span>
          </h2>
        </Reveal>
        <Reveal className="section-aside" delay={0.16}>
          <p>
            Minha trajetória com a programação.
            <br />
            De 2025 até aqui, com muito pela frente.
          </p>
        </Reveal>
      </div>
      <div className="timeline-track" ref={trackRef}>
        <div className="timeline-rail" aria-hidden="true">
          <motion.div style={{ scaleY: reduce ? 1 : scrollYProgress }} />
        </div>
        <ol className="timeline-entries" aria-label="Trajetória na programação">
          {entries.map((entry, index) => (
            <TimelineEntry key={entry.id} entry={entry} index={index} />
          ))}
        </ol>
        <div className="timeline-ending">
          <span className="timeline-next" aria-hidden="true">
            <Icon name="down" size={22} />
          </span>
          <Reveal>
            <p className="eyebrow">Próximos capítulos</p>
            <h3>
              A jornada está
              <br />
              <span className="muted">apenas começando.</span>
            </h3>
            <p>Ainda há muito código e muita história pela frente.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
