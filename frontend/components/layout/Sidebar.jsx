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
} from "lucide-react"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "gate-inward", label: "Gate Inward", icon: ArrowDownToLine, path: "/gate-inward" },
  { id: "goods-requisition", label: "Goods Requisition", icon: ClipboardList, path: "/goods-requisition" },
  { id: "daily-production", label: "Daily Production", icon: Factory, path: "/daily-production" },
  { id: "finished-goods", label: "Finished Goods", icon: Package, path: "/finished-goods" },
  { id: "gate-outward", label: "Gate Outward", icon: ArrowUpFromLine, path: "/gate-outward" },
  { id: "production-order", label: "Production Order", icon: BoxIcon, path: "/production-order" },
  { id: "inventory", label: "Inventory", icon: Warehouse, path: "/inventory" },
]

const BRANDING = {
  logoIcon: "/qudartinew.png",
  appName: "Qudrati Foods"
}

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.id === "dashboard") return true
    if (user?.role === "superuser") return true
    return user?.permissions?.includes(item.id)
  })

  const handleNavigation = (path) => {
    router.push(path)
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: collapsed ? '64px' : '240px',
      }}
    >
      {/* Logo Section */}
      <div style={styles.logoSection}>
        <img 
          src={BRANDING.logoIcon} 
          alt="Q" 
          style={styles.logoIcon}
        />
        {!collapsed && (
          <span style={styles.appName}>
            {BRANDING.appName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {visibleItems.map((item) => {
          const active = pathname === item.path
          const IconComponent = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                ...styles.navButton,
                ...(active ? styles.navButtonActive : styles.navButtonInactive),
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <IconComponent size={20} style={styles.navIcon} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}

        {/* Settings (Superuser only) */}
        {user?.role === "superuser" && (
          <button
            onClick={() => handleNavigation("/settings")}
            title={collapsed ? "Settings" : undefined}
            style={{
              ...styles.navButton,
              ...(pathname?.startsWith("/settings") ? styles.navButtonActive : styles.navButtonInactive),
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={(e) => {
              if (!pathname?.startsWith("/settings")) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname?.startsWith("/settings")) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Settings size={20} style={styles.navIcon} />
            {!collapsed && <span>Settings</span>}
          </button>
        )}
      </nav>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={styles.bottomButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={styles.bottomButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User Info */}
        {!collapsed && user && (
          <div style={styles.userInfo}>
            <div style={styles.username}>{user.username}</div>
            <div style={styles.userRole}>
              {user.role === "superuser" ? "Super User" : "User"}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1F2937',
    borderRight: '1px solid #374151',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '64px',
    padding: '0 16px',
    borderBottom: '1px solid #374151',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
  },
  appName: {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '-0.5px',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
    color: '#D1D5DB',
    whiteSpace: 'nowrap',
  },
  navButtonActive: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
  },
  navButtonInactive: {
    backgroundColor: 'transparent',
    color: '#D1D5DB',
  },
  navIcon: {
    flexShrink: 0,
  },
  bottomSection: {
    borderTop: '1px solid #374151',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  bottomButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
    color: '#D1D5DB',
    whiteSpace: 'nowrap',
  },
  userInfo: {
    padding: '12px',
    marginTop: '4px',
  },
  username: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  userRole: {
    fontSize: '11px',
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
}

// Add any global styles if needed
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    /* Custom scrollbar for sidebar */
    div[style*="overflow-y: auto"]::-webkit-scrollbar {
      width: 4px;
    }
    
    div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
      background: #374151;
    }
    
    div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
      background: #6B7280;
      border-radius: 2px;
    }
    
    div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
      background: #9CA3AF;
    }
  `
  document.head.appendChild(styleSheet)
}
