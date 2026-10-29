import { Link } from 'react-router'
import { formatDate, projectPath } from '../lib/format'
import Icon from './ui/Icon'

// As imagens são locais; os dados dos projetos são sempre consultados na API.
const covers = {
  'pokedex-inicial': '/images/projeto-03.webp',
  'menu-interativo-projeto-terravis': '/images/projeto-01.webp',
  opticode: '/images/projeto-02.webp',
}

export default function ProjectCard({ repo, index = 0 }) {
  const cover = covers[repo.name.toLowerCase()]
  return (
    <article className="project-card">
      <div className="project-visual">
        {cover ? (
          <img
            src={cover}
            alt={`Prévia de ${repo.name}`}
            width="1000"
            height="700"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-monogram" aria-hidden="true">
            {repo.name.slice(0, 2).toUpperCase()}
            <span>{'{ }'}</span>
          </div>
        )}
        <span className="project-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="project-language">
          {repo.language || 'Código aberto'}
        </span>
      </div>
      <div className="project-info">
        <p className="eyebrow">
          {repo.owner.login} / {repo.language || 'Projeto'}
        </p>
        <h3>
          <Link to={projectPath(repo)}>{repo.name.replaceAll('-', ' ')}</Link>
        </h3>
        <p className="project-description">
          {repo.description ||
            'Conheça o código, as tecnologias e os detalhes deste projeto no GitHub.'}
        </p>
        <div className="project-card-bottom">
          <span>Atualizado em {formatDate(repo.updated_at)}</span>
          <Link
            to={projectPath(repo)}
            className="project-open"
            aria-label={`Conhecer ${repo.name}`}
          >
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  )
}
