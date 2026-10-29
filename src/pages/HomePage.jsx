import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Link } from 'react-router'
import AboutSection from '../components/AboutSection'
import ProjectsSection from '../components/ProjectsSection'
import ContactForm from '../components/ContactForm'
import Icon from '../components/ui/Icon'
import Reveal from '../components/ui/Reveal'

export default function HomePage() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const introY = useTransform(
    scrollYProgress,
    () => scrollYProgress.get() * (ref.current?.offsetHeight || 0) * 0.15,
  )
  const titleY = useTransform(
    scrollYProgress,
    () => scrollYProgress.get() * (ref.current?.offsetHeight || 0) * 0.35,
  )
  const photoY = useTransform(
    scrollYProgress,
    () => scrollYProgress.get() * (ref.current?.offsetHeight || 0) * -0.1,
  )
  const opacity = useTransform(scrollYProgress, () =>
    Math.max(
      0,
      1 -
        (scrollYProgress.get() * (ref.current?.offsetHeight || 0)) /
          (window.innerHeight * 0.75),
    ),
  )
  return (
    <main id="main-content">
      <title>Murilo Chialastri — Desenvolvedor</title>
      <section id="home" className="hero section-pad" ref={ref}>
        <motion.div className="hero-intro" style={{ y: reduce ? 0 : introY }}>
          <div className="hero-in" style={{ '--d': '0.1s' }}>
            <p>Murilo Castro Chialastri</p>
            <span>Desenvolvedor Back-end / Full-stack</span>
          </div>
        </motion.div>
        <motion.div
          className="hero-title"
          style={{ y: reduce ? 0 : titleY, opacity: reduce ? 1 : opacity }}
        >
          <p className="eyebrow">Portfólio / 2026</p>
          <h1>
            <span className="hero-line">
              <span style={{ '--i': 0 }}>Dê um scroll</span>
            </span>
            <span className="hero-line hero-indent">
              <span style={{ '--i': 1 }}>para descobrir</span>
            </span>
            <span className="hero-line hero-indent-more muted">
              <span style={{ '--i': 2 }}>o meu trabalho.</span>
            </span>
          </h1>
        </motion.div>
        <Link className="hero-scroll" to="/#sobre">
          <span className="scroll-circle">
            <Icon name="down" />
          </span>
          <span>
            Um pouco de mim.
            <br />
            Muito do que eu construo.
          </span>
        </Link>
        <motion.div className="hero-photo" style={{ y: reduce ? 0 : photoY }}>
          <figure className="hero-in" style={{ '--d': '1.1s' }}>
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
        </motion.div>
        <span className="hero-side-note">Lógica. Curiosidade. Código.</span>
      </section>
      <AboutSection />
      <ProjectsSection />
      <section id="contato" className="contact-section section-pad">
        <div className="section-heading">
          <Reveal>
            <p className="eyebrow">03 / Vamos conversar</p>
            <h2>
              Uma ideia?
              <br />
              <span className="muted">Me conta.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16} className="section-aside">
            <p>
              Projetos, oportunidades ou só um oi.
              <br />
              Minha caixa de entrada está aberta.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <ContactForm />
        </Reveal>
      </section>
    </main>
  )
}
