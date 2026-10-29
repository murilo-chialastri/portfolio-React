import { config } from '../lib/config'

export class GitHubError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function githubRequest(path, signal) {
  const response = await fetch(`https://api.github.com${path}`, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2026-03-10',
    },
  })
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const reset = response.headers.get('x-ratelimit-reset')
      const time = reset
        ? new Date(Number(reset) * 1000).toLocaleTimeString('pt-BR')
        : null
      throw new GitHubError(
        `O GitHub limitou temporariamente as consultas.${time ? ` Tente novamente após ${time}.` : ' Tente mais tarde.'}`,
        response.status,
      )
    }
    throw new GitHubError(
      response.status === 404
        ? 'Este projeto não foi encontrado no GitHub.'
        : 'O GitHub está indisponível. Tente novamente.',
      response.status,
    )
  }
  return response.json()
}

export async function fetchRepositories({ signal }) {
  const repositories = []
  let page = 1
  while (true) {
    const batch = await githubRequest(
      `/users/${encodeURIComponent(config.githubUsername)}/repos?type=owner&sort=updated&per_page=100&page=${page}`,
      signal,
    )
    repositories.push(...batch.filter((repo) => !repo.fork && !repo.archived))
    if (batch.length < 100) break
    page += 1
  }
  return repositories
}

export function fetchRepository(owner, name, signal) {
  return githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    signal,
  )
}
