import { apiFetch } from './client'

export const authApi = {
  login: async (username, password) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
}
