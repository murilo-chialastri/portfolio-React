import { requireBackend, supabase } from './supabase'

export async function fetchFeaturedProjects() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('featured_projects')
    .select('*')
    .order('position')
    .order('repo_id')
  if (error) throw new Error('Não foi possível consultar os destaques salvos.')
  return data
}

export async function setFeaturedProject(repo, featured, position = 0) {
  const client = requireBackend()
  const { error } = featured
    ? await client
        .from('featured_projects')
        .upsert(
          { repo_id: repo.id, full_name: repo.full_name, position },
          { onConflict: 'repo_id' },
        )
    : await client.from('featured_projects').delete().eq('repo_id', repo.id)
  if (error)
    throw new Error(
      'Não foi possível salvar o destaque. Confira sua permissão e tente novamente.',
    )
}

export async function fetchMessages() {
  const { data, error } = await requireBackend()
    .from('messages')
    .select('id,name,email,subject,message,responded,email_status,created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Não foi possível carregar as mensagens.')
  return data
}

export async function setMessageResponded(id, responded) {
  const { error } = await requireBackend()
    .from('messages')
    .update({ responded })
    .eq('id', id)
  if (error) throw new Error('Não foi possível atualizar a mensagem.')
}

export async function sendContact(values) {
  const { data, error } = await requireBackend().functions.invoke('contact', {
    body: values,
  })
  if (error) {
    let message
    try {
      message = (await error.context?.json())?.error
    } catch {
      /* A rede pode não retornar JSON. */
    }
    throw new Error(
      message ||
        'Não foi possível enviar. Tente novamente ou escreva diretamente por e-mail.',
    )
  }
  if (!data?.ok)
    throw new Error(
      data?.error || 'O envio não foi confirmado. Tente novamente.',
    )
  return data
}
