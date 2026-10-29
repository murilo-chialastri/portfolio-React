import { Link, useParams } from 'react-router'
import { useProject } from '../hooks/useProjects'
import { ErrorState, Loading } from '../components/ui/AsyncState'
import { formatDate } from '../lib/format'
import Icon from '../components/ui/Icon'
import NotFoundPage from './NotFoundPage'

export default function ProjectPage() {
  const { owner, name } = useParams()
  const query = useProject(owner, name)
  if (query.isPending)
    return (
      <main className="page-shell">
        <Loading label="Carregando projeto…" />
      </main>
    )
  if (query.error?.status === 404) return <NotFoundPage />
  if (query.isError)
    return (
      <main className="page-shell">
        <ErrorState error={query.error} retry={query.refetch} />
      </main>
    )
  const repo = query.data
  const homepage =
    repo.homepage && /^https?:\/\//i.test(repo.homepage) ? repo.homepage : null
  return (
    <main id="main-content" className="page-shell project-detail">
      <title>{`${repo.name} — Murilo Chialastri`}</title>
      <Link className="text-link back-link" to="/projetos">
        <Icon name="left" size={16} />
        Todos os projetos
      </Link>
      <p className="eyebrow">{repo.full_name}</p>
      <h1>{repo.name.replaceAll('-', ' ')}</h1>
      <p className="page-intro">
        {repo.description ||
          'Um projeto de código aberto. Explore o repositório para conhecer a implementação e acompanhar sua evolução.'}
      </p>
      <div className="detail-topics">
        {repo.topics?.map((topic) => (
          <span className="chip" key={topic}>
            {topic}
          </span>
        ))}
      </div>
      <dl className="detail-facts">
        <div>
          <dt>Linguagem principal</dt>
          <dd>{repo.language || 'Não informada'}</dd>
        </div>
        <div>
          <dt>Última atualização</dt>
          <dd>{formatDate(repo.updated_at)}</dd>
        </div>
        <div>
          <dt>Estrelas</dt>
          <dd>{repo.stargazers_count}</dd>
        </div>
        <div>
          <dt>Licença</dt>
          <dd>{repo.license?.name || 'Não informada'}</dd>
        </div>
      </dl>
      <div className="detail-actions">
        <a
          className="button button-primary"
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Explorar código <Icon name="arrow" />
        </a>
        {homepage && (
          <a
            className="button"
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver aplicação <Icon name="arrow" />
          </a>
        )}
      </div>
      <section className="detail-note">
        <h2>Por dentro do projeto</h2>
        <p>
          A documentação, as decisões de implementação e as instruções para
          executar este projeto estão no repositório. Os dados desta página são
          consultados diretamente pela API do GitHub.
        </p>
        <a
          className="text-link"
          href={`${repo.html_url}#readme`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ler documentação <Icon name="arrow" size={18} />
        </a>
      </section>
    </main>
  )
}
