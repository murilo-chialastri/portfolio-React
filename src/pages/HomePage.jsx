import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import AboutSection from '../components/AboutSection'
import ProjectsSection from '../components/ProjectsSection'
import ContactForm from '../components/ContactForm'
import Icon from '../components/ui/Icon'

export default function HomePage() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  return (
    <main id="main-content">
      <title>Murilo Chialastri — Desenvolvedor</title>
      <section id="home" className="hero section-pad" ref={ref}>
        <div className="hero-intro">
          <p>Murilo Castro Chialastri</p>
          <span>Desenvolvedor Back-end / Full-stack</span>
        </div>
        <motion.div className="hero-title" style={{ y: reduce ? 0 : y }}>
          <p className="eyebrow">Portfólio / 2026</p>
          <h1>
            Dê um scroll
            <br />
            <span className="hero-indent">para descobrir</span>
            <br />
            <span className="hero-indent-more muted">o meu trabalho.</span>
          </h1>
        </motion.div>
        <a className="hero-scroll" href="#sobre">
          <span className="scroll-circle">
            <Icon name="down" />
          </span>
          <span>
            Um pouco de mim.
            <br />
            Muito do que eu construo.
          </span>
        </a>
        <figure className="hero-photo">
          <img
            src="/images/hero.webp"
            width="560"
            height="560"
            alt="Murilo Chialastri"
            fetchPriority="high"
          />
          <figcaption>
            <span className="status-dot" /> Aberto a novas conexões
          </figcaption>
        </figure>
        <span className="hero-side-note">Lógica. Curiosidade. Código.</span>
      </section>
      <AboutSection />
      <ProjectsSection />
      <section id="contato" className="contact-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / Vamos conversar</p>
            <h2>
              Uma ideia?
              <br />
              <span className="muted">Me conta.</span>
            </h2>
          </div>
          <p className="section-aside">
            Projetos, oportunidades ou só um oi.
            <br />
            Minha caixa de entrada está aberta.
          </p>
        </div>
        <ContactForm />
      </section>
    </main>
  )
}
