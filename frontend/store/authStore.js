'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      logout: () => {
        set({ user: null, token: null, refreshToken: null })
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
      },

      hasPermission: (perm) => {
        const { user } = get()
        if (!user) return false
        if (user.role === 'superuser') return true
        return user.permissions?.includes(perm) ?? false
      },

      isSuperuser: () => get().user?.role === 'superuser',
      canEdit: () => {
        const u = get().user
        return u?.role === 'superuser' || u?.can_edit === true
      },
      canDelete: () => {
        const u = get().user
        return u?.role === 'superuser' || u?.can_delete === true
      },
    }),
    { name: 'qud-auth' }
  )
)