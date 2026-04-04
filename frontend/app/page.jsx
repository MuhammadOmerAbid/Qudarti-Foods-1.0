'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function RootPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (token && user) {
      router.replace('/gate-inward')
    } else {
      router.replace('/auth/login')
    }
  }, [token, user, router])

  return (
    <div className="min-h-screen bg-[var(--surface-2)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-400 flex items-center justify-center text-white font-bold text-lg">Q</div>
        <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}