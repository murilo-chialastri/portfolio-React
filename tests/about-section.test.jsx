import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AboutSection from '../src/components/AboutSection'
import { useMediaQuery } from '../src/hooks/useMediaQuery'

const timeline = vi.hoisted(() => ({ progress: null }))
vi.mock('../src/hooks/useMediaQuery', () => ({ useMediaQuery: vi.fn() }))
vi.mock('motion/react', async (importOriginal) => {
  const motion = await importOriginal()
  timeline.progress = motion.motionValue(0)
  return {
    ...motion,
    useScroll: () => ({ scrollYProgress: timeline.progress }),
  }
})

beforeEach(() => {
  timeline.progress.set(0)
  vi.mocked(useMediaQuery).mockReturnValue(true)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

describe('Painéis sobre mim', () => {
  it('troca o painel na metade da rolagem e preserva conteúdo com foco', () => {
    render(<AboutSection />)
    expect(screen.getByRole('tab', { name: 'Pessoal' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    act(() => timeline.progress.set(0.6))
    expect(screen.getByRole('tab', { name: 'Habilidades' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    screen.getByRole('tabpanel', { name: 'Habilidades' }).focus()
    act(() => timeline.progress.set(0.1))
    expect(screen.getByRole('tab', { name: 'Habilidades' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('permite alternar os painéis usando o teclado', async () => {
    const user = userEvent.setup()
    render(<AboutSection />)
    screen.getByRole('tab', { name: 'Pessoal' }).focus()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(screen.getByRole('tab', { name: 'Habilidades' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    )
  })

  it('mostra os dois conteúdos sem sticky em telas pequenas ou com movimento reduzido', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false)
    render(<AboutSection />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Olá, eu sou/ })).toBeVisible()
    expect(screen.getByRole('heading', { name: /Minha caixa/ })).toBeVisible()
    act(() => timeline.progress.set(0.9))
    expect(screen.getByRole('heading', { name: /Olá, eu sou/ })).toBeVisible()
    expect(screen.getByRole('heading', { name: /Minha caixa/ })).toBeVisible()
  })
})
