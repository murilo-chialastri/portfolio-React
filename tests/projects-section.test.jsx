import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import ProjectsSection from '../src/components/ProjectsSection'

vi.mock('../src/hooks/useProjects', () => ({
  useProjects: () => ({
    data: [{ id: 1, name: 'Projeto público' }],
    isPending: false,
  }),
  useFeaturedProjects: () => ({
    data: [{ repo_id: 999, full_name: 'autor/removido' }],
    isPending: false,
  }),
}))
vi.mock('../src/components/ProjectCard', () => ({
  default: ({ repo }) => <article>{repo.name}</article>,
}))

it('mantém projetos públicos na home quando todos os destaques ficaram indisponíveis', () => {
  render(
    <MemoryRouter>
      <ProjectsSection />
    </MemoryRouter>,
  )
  expect(screen.getByRole('article')).toHaveTextContent('Projeto público')
  expect(
    screen.queryByText('Nenhum projeto disponível'),
  ).not.toBeInTheDocument()
})
