import { useState } from 'react'
import { Tabs } from '@base-ui/react/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useProjects,
  useFeaturedProjects,
  featuredKey,
} from '../hooks/useProjects'
import {
  fetchMessages,
  setMessageResponded,
  setFeaturedProject,
} from '../services/portfolio'
import { requireBackend } from '../services/supabase'
import { formatDate } from '../lib/format'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '../components/ui/AsyncState'
import { config } from '../lib/config'

export default function DashboardPage() {
  const cache = useQueryClient()
  const [tab, setTab] = useState('messages')
  const [logoutError, setLogoutError] = useState(null)
  const projects = useProjects()
  const featured = useFeaturedProjects()
  const messages = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
    staleTime: 0,
  })
  const updateMessage = useMutation({
    mutationFn: ({ id, responded }) => setMessageResponded(id, responded),
    onSuccess: () => cache.invalidateQueries({ queryKey: ['messages'] }),
  })
  const updateFeatured = useMutation({
    mutationFn: ({ repo, value }) =>
      setFeaturedProject(repo, value, featured.data?.length || 0),
    onSuccess: () => cache.invalidateQueries({ queryKey: featuredKey }),
  })
  async function logout() {
    try {
      const { error } = await requireBackend().auth.signOut()
      if (error) throw error
      cache.removeQueries({ queryKey: ['messages'] })
    } catch {
      setLogoutError('Não foi possível encerrar a sessão. Tente novamente.')
    }
  }
  return (
    <main id="main-content" className="page-shell">
      <title>Dashboard — Murilo Chialastri</title>
      <div className="dashboard-top">
        <div>
          <p className="eyebrow">Área do proprietário</p>
          <h1>
            Seu <span className="muted">dashboard.</span>
          </h1>
        </div>
        <Button onClick={logout}>Sair</Button>
      </div>
      {logoutError && (
        <p role="alert" className="form-feedback error">
          {logoutError}
        </p>
      )}
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="dashboard-tabs">
          <Tabs.Tab value="messages">Mensagens recebidas</Tabs.Tab>
          <Tabs.Tab value="projects">Projetos em destaque</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="messages">
          <p className="dashboard-summary">
            As mensagens recebidas pelo formulário ficam aqui. Marcar como
            respondida apenas organiza a caixa; use o botão de e-mail para
            responder.
          </p>
          {messages.isPending ? (
            <Loading />
          ) : messages.isError ? (
            <ErrorState error={messages.error} retry={messages.refetch} />
          ) : !messages.data.length ? (
            <EmptyState
              title="Sua caixa está em dia"
              action={
                <Button onClick={() => messages.refetch()}>
                  Atualizar mensagens
                </Button>
              }
            >
              Novas mensagens aparecerão aqui quando alguém enviar o formulário.
            </EmptyState>
          ) : (
            <div className="message-list">
              {messages.data.map((message) => (
                <article className="message-card" key={message.id}>
                  <div className="message-heading">
                    <h3>{message.subject}</h3>
                    <span className="badge">
                      {message.responded ? 'Respondida' : 'A responder'}
                    </span>
                  </div>
                  <div className="message-meta">
                    <span>{message.name}</span>
                    <a href={`mailto:${message.email}`}>{message.email}</a>
                    <time dateTime={message.created_at}>
                      {formatDate(message.created_at)}
                    </time>
                    <span>
                      E-mail:{' '}
                      {message.email_status === 'sent'
                        ? 'enviado'
                        : message.email_status === 'failed'
                          ? 'falhou'
                          : 'pendente'}
                    </span>
                  </div>
                  <p className="message-body">{message.message}</p>
                  <div className="message-actions">
                    <a
                      className="button"
                      href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                    >
                      Responder por e-mail
                    </a>
                    <Button
                      variant={message.responded ? 'primary' : 'default'}
                      aria-label={
                        message.responded
                          ? 'Mensagem respondida. Marcar como pendente'
                          : undefined
                      }
                      disabled={updateMessage.isPending}
                      onClick={() =>
                        updateMessage.mutate({
                          id: message.id,
                          responded: !message.responded,
                        })
                      }
                    >
                      {message.responded && <Icon name="check" />}
                      {message.responded
                        ? 'Marcar como pendente'
                        : 'Marcar como respondida'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {updateMessage.isError && (
            <p role="alert" className="form-feedback error">
              {updateMessage.error.message}
            </p>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="projects">
          <p className="dashboard-summary">
            Escolha quais repositórios de {config.githubUsername} aparecem na
            home. Sem seleção, a home usa os seis projetos mais recentes.
          </p>
          {projects.isPending || featured.isPending ? (
            <Loading cards />
          ) : projects.isError || featured.isError ? (
            <ErrorState
              error={projects.error || featured.error}
              retry={() => {
                projects.refetch()
                featured.refetch()
              }}
            />
          ) : !projects.data.length ? (
            <EmptyState
              title="Nenhum repositório disponível"
              action={
                <Button onClick={() => projects.refetch()}>
                  Atualizar projetos
                </Button>
              }
            >
              Publique repositórios no GitHub para selecioná-los aqui.
            </EmptyState>
          ) : (
            <div className="featured-list">
              {projects.data.map((repo) => {
                const selected = featured.data.some(
                  (item) => item.repo_id === repo.id,
                )
                return (
                  <article className="featured-row" key={repo.id}>
                    <div>
                      <h3>{repo.name}</h3>
                      <p>
                        {repo.language || 'Código aberto'} · Atualizado em{' '}
                        {formatDate(repo.updated_at)}
                      </p>
                    </div>
                    <Button
                      aria-pressed={selected}
                      disabled={updateFeatured.isPending}
                      onClick={() =>
                        updateFeatured.mutate({ repo, value: !selected })
                      }
                    >
                      {selected ? 'Remover destaque' : 'Destacar projeto'}
                    </Button>
                  </article>
                )
              })}
            </div>
          )}
          {!projects.isPending &&
            !featured.isPending &&
            !projects.isError &&
            !featured.isError &&
            featured.data
              ?.filter(
                (item) =>
                  !projects.data.some((repo) => repo.id === item.repo_id),
              )
              .map((item) => (
                <article className="featured-row" key={item.repo_id}>
                  <div>
                    <h3>{item.full_name}</h3>
                    <p>
                      Este destaque não está mais disponível no perfil público.
                    </p>
                  </div>
                  <Button
                    disabled={updateFeatured.isPending}
                    onClick={() =>
                      updateFeatured.mutate({
                        repo: { id: item.repo_id },
                        value: false,
                      })
                    }
                  >
                    Remover destaque indisponível
                  </Button>
                </article>
              ))}
          {updateFeatured.isError && (
            <p role="alert" className="form-feedback error">
              {updateFeatured.error.message}
            </p>
          )}
        </Tabs.Panel>
      </Tabs.Root>
    </main>
  )
}
