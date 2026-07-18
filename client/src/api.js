// Thin fetch client for the Fable & Ink API. Requests go to /api and are
// proxied to the backend by Vite in dev (see vite.config.js). The auth token is
// kept in localStorage and attached to every request.

const TOKEN_KEY = 'fable_ink_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* non-JSON error body */
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // auth
  demoLogin: () => request('/auth/demo', { method: 'POST', auth: false }),
  me: () => request('/auth/me'),

  // discovery + reading
  feed: ({ genre = 'All', blind = false } = {}) =>
    request(`/stories?genre=${encodeURIComponent(genre)}&blind=${blind}`),
  story: (id, { blind = false } = {}) => request(`/stories/${id}?blind=${blind}`),
  forks: (id) => request(`/stories/${id}/forks`),
  createFork: (id, kind) => request(`/stories/${id}/fork`, { method: 'POST', body: { kind } }),
  progress: () => request('/me/progress'),
  saveProgress: (storyId, chapterIndex, percent) =>
    request('/me/progress', { method: 'PUT', body: { storyId, chapterIndex, percent } }),

  // editor / drafts
  draft: () => request('/me/draft'),
  updateStory: (id, patch) => request(`/stories/${id}`, { method: 'PATCH', body: patch }),
  reorderScenes: (id, order) =>
    request(`/stories/${id}/scenes/order`, { method: 'PATCH', body: { order } }),
  publish: (id, payload) => request(`/stories/${id}/publish`, { method: 'POST', body: payload }),

  // profile
  profile: () => request('/me/profile'),
  updateProfile: (patch) => request('/me/profile', { method: 'PATCH', body: patch }),

  // stubbed AI
  beautify: (text) => request('/ai/beautify', { method: 'POST', body: { text } }),
  health: (storyId) => request('/ai/health', { method: 'POST', body: { storyId } }),
  narrate: (storyId, chapterIndex) =>
    request('/ai/narrate', { method: 'POST', body: { storyId, chapterIndex } }),
}
