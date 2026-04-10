'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { Tag, Grid3X3, Package, Users, BookOpen, ChevronRight, Shield } from 'lucide-react'

const SETTING_CARDS = [
  {
    id: 'brands',
    label: 'Brands',
    description: 'Manage product brands and labels',
    icon: Tag,
    path: '/settings/brands',
    color: '#54B45B',
    bg: '#f0fdf4',
  },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Organize products by categories',
    icon: Grid3X3,
    path: '/settings/categories',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Add and manage products',
    icon: Package,
    path: '/settings/products',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Manage customer accounts',
    icon: Users,
    path: '/settings/customers',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    id: 'recipe',
    label: 'Recipe',
    description: 'Define product recipes and ingredients',
    icon: BookOpen,
    path: '/settings/recipe',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    id: 'users',
    label: 'Users & Permissions',
    description: 'Manage team access and roles',
    icon: Shield,
    path: '/settings/users',
    color: '#ef4444',
    bg: '#fef2f2',
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'

  if (!isSuperuser) {
    return (
      <DashboardLayout>
        <div style={styles.denied}>
          <Shield size={48} color="#d1d5db" />
          <h2 style={styles.deniedTitle}>Access Restricted</h2>
          <p style={styles.deniedText}>Only super users can access Settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Settings</h1>
            <p style={styles.subtitle}>Manage your application configuration</p>
          </div>
        </div>

        <div style={styles.grid}>
          {SETTING_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.id}
                onClick={() => router.push(card.path)}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ ...styles.iconBox, background: card.bg }}>
                  <Icon size={22} color={card.color} />
                </div>
                <div style={styles.cardBody}>
                  <span style={styles.cardTitle}>{card.label}</span>
                  <span style={styles.cardDesc}>{card.description}</span>
                </div>
                <ChevronRight size={16} color="#9ca3af" />
              </button>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

const styles = {
  page: { maxWidth: 900, margin: '0 auto' },
  header: {
    marginBottom: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' },
  subtitle: { margin: '4px 0 0', fontSize: 13.5, color: '#6b7280' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: 14,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 20px',
    background: '#fff',
    border: '1px solid #e8f5e9',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    textAlign: 'left',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  cardTitle: { fontSize: 14.5, fontWeight: 700, color: '#111827' },
  cardDesc: { fontSize: 12.5, color: '#6b7280' },
  denied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
    gap: 12,
    textAlign: 'center',
  },
  deniedTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: '#374151' },
  deniedText: { margin: 0, fontSize: 14, color: '#6b7280' },
}