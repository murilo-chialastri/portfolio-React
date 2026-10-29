import { Link } from 'react-router'
import { useProjects, useFeaturedProjects } from '../hooks/useProjects'
import ProjectCarousel from './ProjectCarousel'
import { EmptyState, ErrorState, Loading } from './ui/AsyncState'
import Button from './ui/Button'
import Icon from './ui/Icon'
import Reveal from './ui/Reveal'

export default function ProjectsSection() {
  const projects = useProjects()
  const featured = useFeaturedProjects()
  const availableFeatured = (featured.data || [])
    .map((item) => projects.data?.find((repo) => repo.id === item.repo_id))
    .filter(Boolean)
  const selected = availableFeatured.length
    ? availableFeatured
    : projects.data?.slice(0, 6) || []
  return (
    <section id="projetos" className="projects-section section-pad">
      <div className="section-heading">
        <Reveal>
          <p className="eyebrow">02 / Trabalho em prática</p>
          <h2>
            Ideias que
            <br />
            <span className="muted">viraram código.</span>
          </h2>
        </Reveal>
        <Reveal className="section-aside" delay={0.16}>
          <p>
            Projetos, experimentos e aprendizados.
            <br />
            Direto do meu GitHub para cá.
          </p>
          <Link className="text-link" to="/projetos">
            Explorar todos <Icon name="arrow" size={18} />
          </Link>
        </Reveal>
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
        <Reveal delay={0.2}>
          <ProjectCarousel projects={selected} />
        </Reveal>
      )}
    </section>
  )
}
