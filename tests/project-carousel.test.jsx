import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import ProjectCarousel from '../src/components/ProjectCarousel'

const projects = ['primeiro', 'segundo', 'terceiro'].map((name, id) => ({
  id,
  name,
  owner: { login: 'murilo' },
  updated_at: '2026-10-29T12:00:00Z',
  language: 'JavaScript',
}))

function carousel(items = projects) {
  return (
    <MemoryRouter>
      <ProjectCarousel projects={items} />
    </MemoryRouter>
  )
}

function activeSlide() {
  return screen
    .getAllByRole('group')
    .find((group) => group.getAttribute('aria-roledescription') === 'slide')
}

describe('Carrossel de projetos', () => {
  it('navega circularmente pelos botões e pelo teclado, sem perder o foco', async () => {
    const user = userEvent.setup()
    render(carousel())
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'primeiro',
    )
    await user.click(screen.getByRole('button', { name: 'Projeto anterior' }))
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'terceiro',
    )
    await user.click(screen.getByRole('button', { name: 'Próximo projeto' }))
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'primeiro',
    )

    const stage = screen.getByRole('group', { name: 'Navegar pelos projetos' })
    within(activeSlide()).getByRole('link', { name: 'primeiro' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'segundo',
    )
    expect(stage).toHaveFocus()
    expect(screen.getByText(/— 2 de 3/)).toBeInTheDocument()
  })

  it('torna os cards inativos inertes e permite selecionar um card lateral com o mouse', async () => {
    const user = userEvent.setup()
    render(carousel())
    const secondHeading = screen.getByRole('heading', {
      name: 'segundo',
      hidden: true,
    })
    const inner = secondHeading.closest('.carousel-card-inner')
    expect(inner).toHaveAttribute('inert')
    expect(inner.parentElement).toHaveAttribute('aria-hidden', 'true')
    await user.click(
      screen.getByRole('button', { name: 'Selecionar segundo', hidden: true }),
    )
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'segundo',
    )
    expect(inner).not.toHaveAttribute('inert')
    expect(
      screen.getByRole('group', { name: 'Navegar pelos projetos' }),
    ).toHaveFocus()
  })

  it('mantém a seleção por identidade após atualização e recupera um projeto removido', async () => {
    const user = userEvent.setup()
    const { rerender } = render(carousel())
    await user.click(screen.getByRole('button', { name: 'Próximo projeto' }))
    rerender(carousel([projects[2], projects[0], projects[1]]))
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'segundo',
    )
    rerender(carousel([projects[0]]))
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'primeiro',
    )
    expect(
      screen.getByRole('button', { name: 'Próximo projeto' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Projeto anterior' }),
    ).toBeDisabled()
  })

  it('arrasta horizontalmente, ignora gestos verticais e não navega ao cancelar', () => {
    render(carousel())
    const stage = screen.getByRole('group', { name: 'Navegar pelos projetos' })
    stage.setPointerCapture = vi.fn()
    stage.hasPointerCapture = vi.fn(() => true)
    stage.releasePointerCapture = vi.fn()
    function pointer(type, x, y = 100) {
      const event = new MouseEvent(type, {
        bubbles: true,
        button: 0,
        clientX: x,
        clientY: y,
      })
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        isPrimary: { value: true },
        pointerType: { value: 'touch' },
      })
      fireEvent(stage, event)
    }
    pointer('pointerdown', 200)
    pointer('pointermove', 100)
    pointer('pointerup', 100)
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'segundo',
    )
    expect(
      fireEvent.click(
        within(activeSlide()).getByRole('link', { name: 'segundo' }),
        { detail: 1 },
      ),
    ).toBe(false)
    pointer('pointerdown', 200)
    pointer('pointermove', 190, 200)
    pointer('pointerup', 100, 200)
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'segundo',
    )
    pointer('pointerdown', 200)
    pointer('pointermove', 100)
    pointer('pointercancel', 100)
    expect(within(activeSlide()).getByRole('heading')).toHaveTextContent(
      'segundo',
    )
    expect(stage).not.toHaveAttribute('data-dragging')
    expect(stage.style.getPropertyValue('--drag')).toBe('')
  })
})
