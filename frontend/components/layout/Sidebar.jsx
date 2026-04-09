'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Factory,
  Package,
  Warehouse,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BoxIcon,
  User,
  Users,
  Calculator,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',        label: 'Dashboard',        icon: LayoutDashboard, path: '/dashboard' },
  { id: 'gate-inward',      label: 'Gate Inward',      icon: ArrowDownToLine, path: '/gate-inward' },
  { id: 'goods-requisition',label: 'Goods Requisition',icon: ClipboardList,   path: '/requisition' },
  { id: 'daily-production', label: 'Daily Production', icon: Factory,         path: '/daily-production' },
  { id: 'finished-goods',   label: 'Finished Goods',   icon: Package,         path: '/finished-goods' },
  { id: 'production-order', label: 'Production Order', icon: BoxIcon,         path: '/production-order' },
  { id: 'inventory',        label: 'Inventory',        icon: Warehouse,       path: '/inventory' },
  { id: 'cbm-calculator',   label: 'CBM Calculator',   icon: Calculator,      path: '/cbm-calculator' },
]

function SettingsMenu({ collapsed, pathname, onNav }) {
  const isActive = pathname?.startsWith('/settings')
  const [open, setOpen] = useState(isActive)

  const SUB_ITEMS = [
    { label: 'Brand',     path: '/settings/brands' },
    { label: 'Category',  path: '/settings/categories' },
    { label: 'Products',  path: '/settings/products' },
    { label: 'Customers', path: '/settings/customers' },
    { label: 'Recipe',    path: '/settings/recipe' },
    { label: 'Users',     path: '/settings/users' },
  ]

  if (collapsed) {
    return (
      <button
        onClick={() => onNav('/settings')}
        title="Settings"
        style={{ ...styles.navBtn, ...(isActive ? styles.navBtnActive : {}), justifyContent: 'center', padding: '10px 0', gap: 0 }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f0faf0' }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <span style={{ ...styles.iconWrap, ...(isActive ? styles.iconWrapActive : {}) }}>
          <Settings size={17} strokeWidth={1.8} />
        </span>
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          ...styles.navBtn,
          ...(isActive ? styles.navBtnActive : {}),
          justifyContent: 'flex-start',
          padding: '9px 14px',
          gap: '10px',
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f0faf0' }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <span style={{ ...styles.iconWrap, ...(isActive ? styles.iconWrapActive : {}) }}>
          <Settings size={17} strokeWidth={1.8} />
        </span>
        <span style={styles.navLabel2}>Settings</span>
        <ChevronRight size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0)' }} />
      </button>
      {open && (
        <div style={{ paddingLeft: 18, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {SUB_ITEMS.map((sub) => {
            const subActive = pathname === sub.path
            return (
              <button
                key={sub.path}
                onClick={() => onNav(sub.path)}
                style={{
                  ...styles.navBtn,
                  ...(subActive ? { backgroundColor: '#f0fdf4', color: '#2d7a33', fontWeight: 600 } : {}),
                  fontSize: 13,
                  padding: '7px 12px',
                  borderLeft: `2px solid ${subActive ? '#54B45B' : '#e8f5e9'}`,
                  borderRadius: '0 8px 8px 0',
                }}
                onMouseEnter={(e) => { if (!subActive) e.currentTarget.style.backgroundColor = '#f0faf0' }}
                onMouseLeave={(e) => { if (!subActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {sub.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AppSidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [logoHover, setLogoHover] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.id === 'dashboard') return true
    if (user?.role === 'superuser') return true
    return user?.permissions?.includes(item.id)
  })

  const handleNavigation = (path) => router.push(path)
  const handleLogout = () => { logout(); router.push('/auth/login') }

  return (
    <aside
      className="app-sidebar"
      style={{ ...styles.sidebar, width: 'var(--sidebar-w, 248px)' }}
    >
      {/* Logo */}
      <div
        style={styles.logoSection}
        onMouseEnter={() => setLogoHover(true)}
        onMouseLeave={() => setLogoHover(false)}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          style={styles.logoMarkBtn}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {logoHover ? (
            collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
          ) : (
            <img src="/qudartinew.png" alt="Q" style={styles.logoImg} />
          )}
        </button>
        {!collapsed && (
          <div style={styles.logoText}>
            <span style={styles.appName}>Qudrati</span>
            <span style={styles.appSub}>Foods</span>
          </div>
        )}
      </div>

      {/* Nav Label */}
      {!collapsed && <p style={styles.navLabel}>MAIN MENU</p>}

      {/* Navigation */}
      <nav style={styles.nav}>
        {visibleItems.map((item) => {
          const active = pathname === item.path
          const Icon = item.icon
          const btnStyle = {
            ...styles.navBtn,
            ...(active ? styles.navBtnActive : {}),
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '9px 14px',
            gap: collapsed ? '0' : '10px',
          }
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              title={collapsed ? item.label : undefined}
              style={btnStyle}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = '#f0faf0'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ ...styles.iconWrap, ...(active ? styles.iconWrapActive : {}) }}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {!collapsed && <span style={styles.navLabel2}>{item.label}</span>}
              {!collapsed && active && <span style={styles.activePill} />}
            </button>
          )
        })}

        {user?.role === 'superuser' && (
          <SettingsMenu collapsed={collapsed} pathname={pathname} onNav={handleNavigation} />
        )}
      </nav>

      {/* Bottom */}
      <div style={styles.bottomSection}>
        {/* User card */}
        {!collapsed && user && (
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              <User size={14} color="#fff" />
            </div>
            <div style={styles.userMeta}>
              <span style={styles.username}>{user.username}</span>
              <span style={styles.userRole}>{user.role === 'superuser' ? 'Super User' : 'User'}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutBtn,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '9px 14px',
            gap: collapsed ? '0' : '10px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff0f0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={16} color="#e53e3e" />
          {!collapsed && <span style={styles.logoutText}>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 30,
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e8f5e9',
    transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '2px 0 12px rgba(84,180,91,0.06)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '64px',
    padding: '0 14px',
    borderBottom: '1px solid #e8f5e9',
    flexShrink: 0,
  },
  logoMark: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #54B45B, #3d9144)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  logoMarkBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #54B45B, #3d9144)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    border: 'none',
    cursor: 'pointer',
    color: '#ffffff',
  },
  logoImg: {
    width: '28px',
    height: '28px',
    objectFit: 'contain',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1,
  },
  appName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#1a2e1b',
    letterSpacing: '-0.3px',
  },
  appSub: {
    fontSize: '11px',
    color: '#54B45B',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '1px',
    padding: '16px 16px 6px',
    margin: 0,
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 14px',
    borderRadius: '9px',
    fontSize: '13.5px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    background: 'transparent',
    color: '#4b5563',
    whiteSpace: 'nowrap',
    position: 'relative',
    textAlign: 'left',
  },
  navBtnActive: {
    backgroundColor: '#f0fdf4',
    color: '#2d7a33',
    fontWeight: '600',
  },
  iconWrap: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '7px',
    color: '#6b7280',
    flexShrink: 0,
    transition: 'all 0.18s',
  },
  iconWrapActive: {
    backgroundColor: '#dcfce7',
    color: '#2d7a33',
  },
  navLabel2: {
    flex: 1,
  },
  activePill: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#54B45B',
  },
  bottomSection: {
    borderTop: '1px solid #e8f5e9',
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 10px',
    borderRadius: '9px',
    backgroundColor: '#f8fffe',
    marginBottom: '4px',
  },
  userAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #54B45B, #3d9144)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#1a2e1b',
  },
  userRole: {
    fontSize: '11px',
    color: '#54B45B',
    fontWeight: '500',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 14px',
    borderRadius: '9px',
    fontSize: '13.5px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    background: 'transparent',
    color: '#e53e3e',
    whiteSpace: 'nowrap',
  },
  logoutText: {
    color: '#e53e3e',
  },
}