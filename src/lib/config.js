export const config = {
  githubUsername: import.meta.env.VITE_GITHUB_USERNAME || 'murilo-chialastri',
  email: 'murilocastro233@gmail.com',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
}

export const isBackendConfigured = Boolean(
  config.supabaseUrl && config.supabaseKey,
)
