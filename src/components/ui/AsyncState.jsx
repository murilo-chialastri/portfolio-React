import Button from './Button'

export function Loading({ label = 'Carregando…', cards = false }) {
  return (
    <div role="status" className={cards ? 'skeleton-grid' : 'loading-state'}>
      <span className="sr-only">{label}</span>
      {cards ? (
        [0, 1, 2].map((i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))
      ) : (
        <>
          <span className="spinner" />
          {label}
        </>
      )}
    </div>
  )
}

export function ErrorState({
  error,
  retry,
  title = 'Não foi possível carregar',
}) {
  return (
    <div className="state-card" role="alert">
      <h3>{title}</h3>
      <p>{error?.message || 'Tente novamente em instantes.'}</p>
      {retry && <Button onClick={retry}>Tentar novamente</Button>}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="state-card">
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  )
}
