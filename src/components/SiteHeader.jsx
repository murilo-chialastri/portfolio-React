import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Link } from 'react-router'
import { useTheme } from '../context/theme'
import Button from './ui/Button'
import Icon from './ui/Icon'

const links = [
  ['home', 'Início'],
  ['sobre', 'Sobre mim'],
  ['projetos', 'Projetos'],
  ['contato', 'Contato'],
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="site-header">
      <Link
        to="/"
        className="wordmark"
        aria-label="MC. — Murilo Chialastri, início"
      >
        MC<span>.</span>
      </Link>
      <div className="header-actions">
        <Button
          variant="icon"
          onClick={toggleTheme}
          aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </Button>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            className="button button-icon menu-toggle"
            aria-label="Abrir menu"
          >
            <Icon name="menu" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="menu-backdrop" />
            <Dialog.Popup className="menu-popup">
              <div className="menu-heading">
                <Dialog.Title>Navegação</Dialog.Title>
                <Dialog.Close
                  className="button button-icon"
                  aria-label="Fechar menu"
                >
                  <Icon name="close" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                Explore as seções do portfólio.
              </Dialog.Description>
              <nav aria-label="Navegação principal">
                {links.map(([id, label], index) => (
                  <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)}>
                    <span>0{index + 1}</span>
                    {label}
                    <Icon name="arrow" />
                  </Link>
                ))}
              </nav>
              <Link
                className="menu-admin"
                to="/login"
                onClick={() => setOpen(false)}
              >
                Área do proprietário <Icon name="arrow" size={16} />
              </Link>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  )
}
