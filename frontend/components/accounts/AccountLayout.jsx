'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountSidebar from '@/components/layout/AccountSidebar'
import { Bell, Mail, Search } from 'lucide-react'

export default function AccountLayout({ children }) {
  const { user, token, panel, hasHydrated } = useAuthStore()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user || !token) router.replace('/auth/login')
    else if (!panel) router.replace('/panel-selection')
    else if (panel !== 'account') router.replace('/dashboard')
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
  const accountType = user?.role === 'superuser' ? 'Super User' : 'User'

  if (!hasHydrated || !user || !token || !panel) return null

  return (
    <div style={s.layout}>
      <AccountSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main style={{ ...s.main, paddingLeft: collapsed ? 88 : 256 }}>
        <header style={s.header}>
          <div style={s.searchWrap}>
            <Search size={14} color="#6c8d6c" style={{ flexShrink: 0 }} />
            <input style={s.searchInput} placeholder="Search accounts" type="text" />
            <kbd style={s.searchKbd}>⌘ F</kbd>
          </div>

          <div style={{ flex: 1 }} />

          <div style={s.headerRight}>
            <button style={s.iconBtn} title="Messages">
              <Mail size={16} strokeWidth={1.5} color="#2d7a33" />
            </button>
            <button style={s.iconBtn} title="Notifications">
              <Bell size={16} strokeWidth={1.5} color="#2d7a33" />
            </button>

            <div style={s.divider} />

            <div style={s.userPill}>
              <div style={s.avatar}>{initial}</div>
              <div style={s.userMeta}>
                <span style={s.userName}>{user?.username || 'User'}</span>
                <span style={s.userEmail}>{accountType}</span>
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
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'padding-left 0.25s cubic-bezier(.4,0,.2,1)',
    background: '#ffffff',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  header: {
    margin: '14px 20px 0 20px',
    height: 64,
    backgroundColor: '#e8ece8',
    border: '1px solid #d4dcd4',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: 12,
    position: 'sticky',
    top: 14,
    zIndex: 30,
    boxShadow: '0 4px 12px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    border: '1px solid #d4dfd4',
    borderRadius: '40px',
    padding: '6px 16px',
    flex: '0 1 260px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 13,
    color: '#2c3e2c',
    flex: 1,
    minWidth: 0,
    fontFamily: 'inherit',
  },
  searchKbd: {
    fontSize: 10,
    color: '#8aa88a',
    backgroundColor: '#f3f7f3',
    padding: '2px 8px',
    borderRadius: '30px',
    fontWeight: 600,
    fontFamily: 'inherit',
    border: 'none',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#d4dfd4',
    margin: '0 6px',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: '30px',
    border: '1px solid #d4dfd4',
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
    padding: '4px 16px 4px 4px',
    borderRadius: '40px',
    border: '1px solid #d4dfd4',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a3d1f, #2d7a33)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  userMeta: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: 12.5, fontWeight: 700, color: '#1e2a1e', lineHeight: 1.3 },
  userEmail: { fontSize: 10.5, color: '#7a9a7a', lineHeight: 1.3 },
  content: {
    flex: 1,
    padding: '20px 20px 28px',
    backgroundColor: '#ffffff',
  },
}

