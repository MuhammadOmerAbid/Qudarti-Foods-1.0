'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AppSidebar from '@/components/layout/Sidebar'
import { Bell, Mail, Search } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { user, token, panel, hasHydrated } = useAuthStore()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user || !token) router.replace('/auth/login')
    else if (!panel) router.replace('/panel-selection')
  }, [hasHydrated, user, token, panel])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-w', collapsed ? '72px' : '240px')
      return () => document.documentElement.style.removeProperty('--sidebar-w')
    }
  }, [collapsed])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 1024px)')
    const apply = () => setCollapsed(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const initial = (user?.username?.[0] || 'U').toUpperCase()

  if (!hasHydrated || !user || !token || !panel) return null

  return (
    <div style={s.layout}>
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main style={{ ...s.main, paddingLeft: collapsed ? 88 : 256 }}>
        <header style={s.header}>
          <div style={s.searchWrap}>
            <Search size={15} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input style={s.searchInput} placeholder="Search task" type="text" />
            <kbd style={s.searchKbd}>Ctrl+F</kbd>
          </div>

          <div style={{ flex: 1 }} />

          <div style={s.headerRight}>
            <button style={s.iconBtn} title="Messages">
              <Mail size={18} strokeWidth={1.8} color="#6b7280" />
            </button>
            <button style={s.iconBtn} title="Notifications">
              <Bell size={18} strokeWidth={1.8} color="#6b7280" />
            </button>

            <div style={s.userPill}>
              <div style={s.avatar}>{initial}</div>
              <div style={s.userMeta}>
                <span style={s.userName}>{user?.username || 'User'}</span>
                <span style={s.userEmail}>
                  {user?.email || (user?.username?.toLowerCase() + '@qudrati.com')}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div style={s.content}>
          {children}
        </div>
      </main>
    </div>
  )
}

const s = {
  layout: {
    minHeight: '100vh',
    width: '100%',
    background: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
  },
  main: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'padding-left 0.25s cubic-bezier(.4,0,.2,1)',
  },

  header: {
    margin: '16px 20px 0 20px',
    height: 64,
    backgroundColor: '#f2f4f2',
    border: '1px solid #e2e8e2',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: 16,
    position: 'sticky',
    top: 16,
    zIndex: 30,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8e2',
    borderRadius: '40px',
    padding: '8px 16px',
    flex: '0 1 240px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 13.5,
    color: '#374151',
    flex: 1,
    minWidth: 0,
    fontFamily: 'inherit',
  },
  searchKbd: {
    fontSize: 11,
    color: '#8a9a8a',
    backgroundColor: '#eef2ee',
    padding: '2px 8px',
    borderRadius: '8px',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontWeight: 500,
    border: 'none',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: '12px',
    border: '1px solid #e2e8e2',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '5px 16px 5px 6px',
    borderRadius: '40px',
    border: '1px solid #e2e8e2',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2d7a33, #54B45B)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13.5,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userMeta: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: 13, fontWeight: 700, color: '#1a2e1b', lineHeight: 1.2 },
  userEmail: { fontSize: 11, color: '#8a9a8a', lineHeight: 1.2 },

  content: {
    flex: 1,
    padding: '20px',
    backgroundColor: 'transparent',
  },
}