import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('qud-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      try {
        const raw = localStorage.getItem('qud-auth')
        if (!raw) throw new Error('no session')
        const { state } = JSON.parse(raw)
        const { data } = await axios.post(`${BASE}/auth/token/refresh/`, { refresh: state.refreshToken })
        const parsed = JSON.parse(raw)
        parsed.state.token = data.access
        localStorage.setItem('qud-auth', JSON.stringify(parsed))
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
      }
    }
    const msg = err.response?.data?.detail
      || Object.values(err.response?.data || {}).flat().join(', ')
      || err.message
      || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export const get = (url, params) => api.get(url, { params }).then(r => r.data)
export const post = (url, body) => api.post(url, body).then(r => r.data)
export const put = (url, body) => api.put(url, body).then(r => r.data)
export const patch = (url, body) => api.patch(url, body).then(r => r.data)
export const del = (url) => api.delete(url).then(r => r.data)

export const download = async (url, params, filename) => {
  const res = await api.get(url, { params, responseType: 'blob' })
  const href = URL.createObjectURL(res.data)
  Object.assign(document.createElement('a'), { href, download: filename }).click()
  URL.revokeObjectURL(href)
}