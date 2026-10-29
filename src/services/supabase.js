import { createClient } from '@supabase/supabase-js'
import { config, isBackendConfigured } from '../lib/config'

export const supabase = isBackendConfigured
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null

export function requireBackend() {
  if (!supabase)
    throw new Error(
      'O serviço ainda não está configurado. Entre em contato pelo e-mail abaixo.',
    )
  return supabase
}
