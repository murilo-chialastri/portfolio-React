import { useState } from 'react'
import { Link } from 'react-router'
import { useProjects, useFeaturedProjects } from '../hooks/useProjects'
import ProjectCard from './ProjectCard'
import { EmptyState, ErrorState, Loading } from './ui/AsyncState'
import Button from './ui/Button'
import Icon from './ui/Icon'

export default function ProjectsSection() {
  const projects = useProjects()
  const featured = useFeaturedProjects()
  const [index, setIndex] = useState(0)
  const selected = featured.data?.length
    ? featured.data
        .map((item) => projects.data?.find((repo) => repo.id === item.repo_id))
        .filter(Boolean)
    : projects.data?.slice(0, 6) || []
  const current = Math.min(index, Math.max(0, selected.length - 1))
  function move(direction) {
    setIndex((value) => (value + direction + selected.length) % selected.length)
  }
  return (
    <section id="projetos" className="projects-section section-pad">
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / Trabalho em prática</p>
          <h2>
            Ideias que
            <br />
            <span className="muted">viraram código.</span>
          </h2>
        </div>
        <div className="section-aside">
          <p>
            Projetos, experimentos e aprendizados.
            <br />
            Direto do meu GitHub para cá.
          </p>
          <Link className="text-link" to="/projetos">
            Explorar todos <Icon name="arrow" size={18} />
          </Link>
        </div>
      </div>
      {projects.isPending || featured.isPending ? (
        <Loading cards />
      ) : projects.isError ? (
        <ErrorState error={projects.error} retry={projects.refetch} />
      ) : featured.isError ? (
        <ErrorState error={featured.error} retry={featured.refetch} />
      ) : !selected.length ? (
        <EmptyState
          title="Nenhum projeto disponível"
          action={
            <Button onClick={() => projects.refetch()}>
              Atualizar projetos
            </Button>
          }
        >
          Os repositórios públicos aparecerão aqui.
        </EmptyState>
      ) : (
        <>
          <div
            className="project-carousel"
            aria-roledescription="carrossel"
            aria-label="Projetos em destaque"
          >
            <div className="carousel-grid">
              {[0, 1, 2].slice(0, selected.length).map((offset) => {
                const repoIndex = (current + offset) % selected.length
                return (
                  <ProjectCard
                    key={selected[repoIndex].id}
                    repo={selected[repoIndex]}
                    index={repoIndex}
                  />
                )
              })}
            </div>
          </div>
          <div className="carousel-controls">
            <p className="eyebrow" aria-live="polite">
              {String(current + 1).padStart(2, '0')}{' '}
              <span className="muted">
                / {String(selected.length).padStart(2, '0')}
              </span>
            </p>
            <div>
              <Button
                variant="icon"
                aria-label="Projeto anterior"
                onClick={() => move(-1)}
                disabled={selected.length < 2}
              >
                <Icon name="left" />
              </Button>
              <Button
                variant="icon"
                aria-label="Próximo projeto"
                onClick={() => move(1)}
                disabled={selected.length < 2}
              >
                <Icon name="right" />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
