import { useRef, useState } from 'react'
import { Tabs } from '@base-ui/react/tabs'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'

const groups = {
  'Back-end': ['Java', 'Spring Boot', 'Python', 'Node.js'],
  'Front-end': ['React', 'JavaScript', 'HTML', 'CSS'],
  'Dados & ferramentas': ['SQL', 'PostgreSQL', 'Git', 'GitHub', 'Linux'],
}
export default function AboutSection() {
  const ref = useRef(null)
  const [tab, setTab] = useState('pessoal')
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (
      !reducedMotion &&
      window.matchMedia('(min-width: 900px) and (min-height: 700px)').matches
    )
      setTab(value > 0.5 ? 'habilidades' : 'pessoal')
  })
  return (
    <section id="sobre" className="about-section" ref={ref}>
      <div className="about-sticky section-pad">
        <div className="about-photo">
          <img
            src="/images/perfil.webp"
            alt="Murilo Castro Chialastri"
            width="900"
            height="1125"
            loading="lazy"
            decoding="async"
          />
          <span className="photo-caption">
            Sempre aprendendo. Sempre construindo.
          </span>
        </div>
        <div className="about-content">
          <p className="eyebrow">01 / A pessoa por trás do código</p>
          <Tabs.Root value={tab} onValueChange={setTab}>
            <Tabs.List className="about-tabs">
              <Tabs.Tab value="pessoal">Pessoal</Tabs.Tab>
              <span className="tabs-rule" />
              <Tabs.Tab value="habilidades">Habilidades</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="pessoal">
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
                Minha base é o back-end com Java e Spring Boot, com experiências
                em React, PostgreSQL e análise de dados com Python. Também
                estudo desenvolvimento Java e dados na Alura.
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
            </Tabs.Panel>
            <Tabs.Panel value="habilidades">
              <h2>
                Minha caixa
                <br />
                de <span className="muted">ferramentas.</span>
              </h2>
              <p>
                Escolho a ferramenta a partir do problema. Estas são algumas que
                fazem parte do meu caminho.
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
            </Tabs.Panel>
          </Tabs.Root>
        </div>
        <motion.div
          className="about-progress"
          style={{ scaleX: reducedMotion ? 1 : scrollYProgress }}
        />
      </div>
    </section>
  )
}
