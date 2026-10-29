import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError)
      return (
        <main className="page-shell state-card">
          <h1>Algo saiu do esperado.</h1>
          <p>Recarregue a página para tentar novamente.</p>
          <a className="button" href="/">
            Voltar ao início
          </a>
        </main>
      )
    return this.props.children
  }
}
