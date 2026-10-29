export const formatDate = (value) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
    new Date(value),
  )

export const projectPath = (repo) =>
  `/projetos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`
