import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router'
import { useLenis } from 'lenis/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import RouteScroll from '../src/components/RouteScroll'

vi.mock('lenis/react', () => ({ useLenis: vi.fn() }))
const scrollTo = vi.fn()

beforeEach(() => {
  vi.mocked(useLenis).mockReturnValue({ scrollTo })
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback()
    return 1
  })
})
afterEach(() => vi.restoreAllMocks())

function page() {
  return (
    <MemoryRouter initialEntries={['/#sobre']}>
      <div id="sobre">Sobre mim</div>
      <Link to="/#sobre">Voltar ao sobre</Link>
      <RouteScroll />
    </MemoryRouter>
  )
}

it('anima a âncora novamente ao navegar para o mesmo hash', async () => {
  const user = userEvent.setup()
  render(page())
  expect(scrollTo).toHaveBeenCalledWith(document.getElementById('sobre'), {
    duration: 1.6,
    immediate: false,
  })
  await user.click(screen.getByRole('link', { name: 'Voltar ao sobre' }))
  expect(scrollTo).toHaveBeenCalledTimes(2)
})

it('respeita movimento reduzido na navegação por âncoras', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
  render(page())
  expect(scrollTo).toHaveBeenCalledWith(document.getElementById('sobre'), {
    duration: 1.6,
    immediate: true,
  })
})
