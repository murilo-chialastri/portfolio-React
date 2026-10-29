import { useRef, useState } from 'react'
import { Tabs } from '@base-ui/react/tabs'
import { useLenis } from 'lenis/react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import Reveal from './ui/Reveal'

const groups = {
  'Back-end': ['Java', 'Spring Boot', 'Python', 'Node.js'],
  'Front-end': ['React', 'JavaScript', 'HTML', 'CSS'],
  'Dados & ferramentas': ['SQL', 'PostgreSQL', 'Git', 'GitHub', 'Linux'],
}
export default function AboutSection() {
  const ref = useRef(null)
  const [tab, setTab] = useState('pessoal')
  const reducedMotion = useReducedMotion()
  const sticky = useMediaQuery(
    '(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)',
  )
  const lenis = useLenis()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.08, 1])
  const Root = sticky ? Tabs.Root : 'div'
  const Panel = sticky ? Tabs.Panel : 'article'

  function selectTab(value) {
    setTab(value)
    const section = ref.current
    const start = section.getBoundingClientRect().top + window.scrollY
    const total = section.offsetHeight - window.innerHeight
    const top = start + total * (value === 'habilidades' ? 0.575 : 0.075)
    if (lenis) lenis.scrollTo(top, { duration: 1.6 })
    else window.scrollTo({ top, behavior: 'smooth' })
  }

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    // O scroll não deve ocultar um painel enquanto alguém usa seu teclado.
    if (sticky && !ref.current.contains(document.activeElement))
      setTab(value >= 0.5 ? 'habilidades' : 'pessoal')
  })
  return (
    <section id="sobre" className="about-section" ref={ref}>
      <div className="about-sticky section-pad">
        <Reveal className="about-photo">
          <div className="about-photo-frame">
            <motion.img
              src="/images/perfil.webp"
              alt="Murilo Castro Chialastri"
              width="900"
              height="1125"
              loading="lazy"
              decoding="async"
              style={{ scale: sticky && !reducedMotion ? photoScale : 1 }}
            />
          </div>
          <span className="photo-caption">
            Sempre aprendendo. Sempre construindo.
          </span>
        </Reveal>
        <div className="about-content">
          <Reveal>
            <p className="eyebrow">A pessoa por trás do código</p>
          </Reveal>
          <Root {...(sticky ? { value: tab, onValueChange: selectTab } : {})}>
            {sticky && (
              <Reveal delay={0.08}>
                <Tabs.List className="about-tabs" aria-label="Sobre mim">
                  <Tabs.Tab value="pessoal">Pessoal</Tabs.Tab>
                  <span className="tabs-rule" aria-hidden="true">
                    <motion.span style={{ scaleX: scrollYProgress }} />
                  </span>
                  <Tabs.Tab value="habilidades">Habilidades</Tabs.Tab>
                </Tabs.List>
              </Reveal>
            )}
            <div className="about-panels">
              <Panel
                className={`about-panel ${tab === 'habilidades' ? 'is-past' : ''}`}
                {...(sticky ? { value: 'pessoal', keepMounted: true } : {})}
              >
                <h2>
                  Olá, eu sou
                  <br />o <span className="muted">Murilo.</span>
                </h2>
                <p>
                  Estudante de Engenharia de Software na FIAP. Gosto de entender
                  como as coisas funcionam e transformar essa curiosidade em
                  soluções.
                </p>
                <p>
                  Minha base é o back-end com Java e Spring Boot, com
                  experiências em React, PostgreSQL e análise de dados com
                  Python. Também estudo desenvolvimento Java e dados na Alura.
                </p>
                <dl className="about-facts">
                  <div>
                    <dt>Base</dt>
                    <dd>São Paulo, SP</dd>
                  </div>
                  <div>
                    <dt>Formação</dt>
                    <dd>Eng. de Software / FIAP</dd>
                  </div>
                  <div>
                    <dt>Foco</dt>
                    <dd>Back-end & Full-stack</dd>
                  </div>
                </dl>
              </Panel>
              <Panel
                className="about-panel"
                {...(sticky ? { value: 'habilidades', keepMounted: true } : {})}
              >
                <h2>
                  Stack & <br />
                  <span className="muted">Ferramentas</span>
                </h2>
                <p>
                  Linguagens, frameworks e tecnologias que fazem parte da minha
                  rotina de desenvolvimento.
                </p>
                <div className="skill-groups">
                  {Object.entries(groups).map(([label, skills]) => (
                    <div key={label}>
                      <h3 className="eyebrow">{label}</h3>
                      <ul>
                        {skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </Root>
        </div>
        <motion.div
          className="about-progress"
          style={{ scaleX: sticky && !reducedMotion ? scrollYProgress : 1 }}
        />
      </div>
    </section>
  )
}
