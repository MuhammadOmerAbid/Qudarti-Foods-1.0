const ACCESS_TOKEN_KEY = 'qudarti_access_token'
const REFRESH_TOKEN_KEY = 'qudarti_refresh_token'

const getBaseUrl = () => {
  if (typeof process === 'undefined') return ''
  return process.env.NEXT_PUBLIC_API_BASE_URL || ''
}

export const setTokens = (access, refresh) => {
  if (typeof window === 'undefined') return
  if (access) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access)
  }
  if (refresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
}

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const clearTokens = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const apiFetch = async (path, options = {}) => {
  const baseUrl = getBaseUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getAccessToken()
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const data = await response.json()
      message = data?.message || data?.detail || message
    } catch {
      // ignore parse errors
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}
