import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import ProjectCard from '../components/ProjectCard'
import Button from '../components/ui/Button'
import { EmptyState, ErrorState, Loading } from '../components/ui/AsyncState'

export default function ProjectsPage() {
  const query = useProjects()
  const [search, setSearch] = useState('')
  const projects =
    query.data?.filter((repo) =>
      `${repo.name} ${repo.description || ''} ${repo.language || ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) || []
  return (
    <main id="main-content" className="page-shell">
      <title>Projetos — Murilo Chialastri</title>
      <p className="eyebrow">Código em movimento</p>
      <h1>
        Meus <span className="muted">projetos.</span>
      </h1>
      <p className="page-intro">
        Repositórios públicos do meu GitHub. Cada projeto guarda uma parte do
        que aprendi.
      </p>
      <label className="search-field">
        Buscar por nome, tecnologia ou descrição
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Por exemplo: Java, React, Pokédex…"
        />
      </label>
      {query.isPending ? (
        <Loading cards />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : !projects.length ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          action={
            <Button onClick={() => (search ? setSearch('') : query.refetch())}>
              {search ? 'Limpar busca' : 'Atualizar projetos'}
            </Button>
          }
        >
          {search
            ? 'Experimente buscar por outro termo.'
            : 'Os repositórios públicos aparecerão aqui.'}
        </EmptyState>
      ) : (
        <div className="projects-grid">
          {projects.map((repo, index) => (
            <ProjectCard repo={repo} index={index} key={repo.id} />
          ))}
        </div>
      )}
    </main>
  )
}
