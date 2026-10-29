import { useRef } from 'react'
import { motion, useReducedMotion, useScroll } from 'motion/react'
import { timelineEntries } from '../lib/timeline'
import Icon from './ui/Icon'
import Reveal from './ui/Reveal'
import './TimelineSection.css'

function TimelineEntry({ entry, index }) {
  const chapter = String(index + 1).padStart(2, '0')

  return (
    <li className="timeline-entry">
      <div className="timeline-marker">
        <time dateTime={entry.year}>{entry.year}</time>
      </div>
      <Reveal className="timeline-copy">
        <p className="eyebrow">Capítulo {chapter}</p>
        <h3>{entry.title || `Registros de ${entry.year}`}</h3>
        <p>
          {entry.description ||
            'As histórias e os aprendizados deste ano serão compartilhados aqui em breve.'}
        </p>
      </Reveal>
      <Reveal className="timeline-media" delay={0.12}>
        <figure>
          {entry.image ? (
            <>
              <div className="timeline-photo">
                <img
                  src={entry.image.src}
                  alt={entry.image.alt}
                  width={entry.image.width}
                  height={entry.image.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {entry.image.caption && (
                <figcaption>{entry.image.caption}</figcaption>
              )}
            </>
          ) : (
            <>
              <div className="timeline-placeholder" aria-hidden="true">
                <span className="timeline-frame-corner" />
                <span className="timeline-frame-number">{chapter}</span>
                <span className="eyebrow">Memórias em construção</span>
              </div>
              <figcaption>Fotografia de {entry.year} em breve.</figcaption>
            </>
          )}
        </figure>
      </Reveal>
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
