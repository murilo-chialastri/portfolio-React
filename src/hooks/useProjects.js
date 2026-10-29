import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRepositories, fetchRepository } from '../services/github'
import { fetchFeaturedProjects } from '../services/portfolio'
import { config } from '../lib/config'

export const repositoriesKey = ['repositories', config.githubUsername]
export const featuredKey = ['featured-projects']

export function useProjects() {
  return useQuery({ queryKey: repositoriesKey, queryFn: fetchRepositories })
}

export function useFeaturedProjects() {
  return useQuery({ queryKey: featuredKey, queryFn: fetchFeaturedProjects })
}

export function useProject(owner, name) {
  const cache = useQueryClient()
  return useQuery({
    queryKey: ['repository', owner, name],
    queryFn: ({ signal }) => fetchRepository(owner, name, signal),
    initialData: () =>
      cache
        .getQueryData(repositoriesKey)
        ?.find(
          (repo) =>
            repo.full_name.toLowerCase() === `${owner}/${name}`.toLowerCase(),
        ),
    initialDataUpdatedAt: cache.getQueryState(repositoriesKey)?.dataUpdatedAt,
  })
}
