import { Link } from 'react-router'
import Icon from '../components/ui/Icon'
export default function NotFoundPage() {
  return (
    <main id="main-content" className="page-shell not-found">
      <title>Página não encontrada — Murilo Chialastri</title>
      <p className="eyebrow">Erro 404 / Fora da rota</p>
      <h1>
        Esse caminho
        <br />
        <span className="muted">ainda não existe.</span>
      </h1>
      <p>
        A página pode ter mudado de endereço ou o projeto não está mais público.
      </p>
      <Link className="button button-primary" to="/">
        Voltar ao início <Icon name="arrow" />
      </Link>
    </main>
  )
}
