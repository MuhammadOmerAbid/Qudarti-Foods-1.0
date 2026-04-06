'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AppSidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  const { user, panel } = useAuthStore()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login')
    } else if (!panel) {
      router.replace('/panel-selection')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, panel])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-w', collapsed ? '68px' : '248px')
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

  if (!user || !panel) return null

  return (
    <div style={styles.layout}>
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={styles.main} className="app-main">
        {/* Top header bar */} 
        <header style={styles.header} className="app-header">
          <div style={styles.headerLeft}>
            <div style={styles.breadcrumb}>
              <span style={styles.breadcrumbRoot}>Qudrati Foods</span>
              <span style={styles.breadcrumbSep}>/</span>
              <span style={styles.breadcrumbCurrent}>Dashboard</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.headerBadge}>
              <span style={styles.dot} />
              Live
            </div>
            <div style={styles.headerDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={styles.content} className="app-content">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .app-main { padding-left: var(--sidebar-w, 68px); }
          .app-header { padding: 0 18px; height: 58px; }
          .app-content { padding: 20px; }
        }

        @media (max-width: 768px) {
          .app-header { flex-wrap: wrap; gap: 10px; height: auto; padding: 12px 16px; }
          .app-content { padding: 16px; }
        }

        @media (max-width: 520px) {
          .app-content { padding: 12px; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  layout: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f4faf4',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  main: {
    minHeight: '100vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    paddingLeft: 'var(--sidebar-w, 248px)',
  },
  header: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8f5e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(84,180,91,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  breadcrumbRoot: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  breadcrumbSep: {
    color: '#d1d5db',
  },
  breadcrumbCurrent: {
    color: '#1a2e1b',
    fontWeight: '600',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2d7a33',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '20px',
    padding: '4px 12px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#54B45B',
    display: 'inline-block',
    animation: 'pulse 2s infinite',
  },
  headerDate: {
    fontSize: '12.5px',
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: '28px',
    animation: 'fadeSlideUp 0.3s ease both',
  },
}