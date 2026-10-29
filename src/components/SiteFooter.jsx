import { Link } from 'react-router'
import { config } from '../lib/config'
import Icon from './ui/Icon'
const currentYear = new Date().getFullYear()

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© {currentYear} Murilo Chialastri</p>
      <div>
        <a
          href={`https://github.com/${config.githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub <Icon name="arrow" size={14} />
        </a>
        <a href={`mailto:${config.email}`}>
          E-mail <Icon name="arrow" size={14} />
        </a>
        <Link to="/login">Área do proprietário</Link>
      </div>
      <p>
        São Paulo, Brasil <span className="status-dot" />
      </p>
    </footer>
  )
}
