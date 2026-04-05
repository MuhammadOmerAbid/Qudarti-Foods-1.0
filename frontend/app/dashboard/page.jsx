'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Factory,
  Package,
  ArrowRight,
} from 'lucide-react'

const CARDS = [
  {
    id: 'gate-inward',
    title: 'Gate Inward',
    subtitle: "Today's incoming materials",
    icon: ArrowDownToLine,
    accent: '#54B45B',
    lightBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    fields: [
      { label: 'Category', value: '-' },
      { label: 'Name', value: '-' },
      { label: 'Quantity', value: '-' },
    ],
    path: '/gate-inward',
  },
  {
    id: 'goods-requisition',
    title: 'Goods Requisition',
    subtitle: "Today's requisition requests",
    icon: ClipboardList,
    accent: '#3b82f6',
    lightBg: '#eff6ff',
    borderColor: '#bfdbfe',
    fields: [
      { label: 'Receiver Name', value: '-' },
      { label: 'Product Name', value: '-' },
      { label: 'Quantity', value: '-' },
    ],
    path: '/goods-requisition',
  },
  {
    id: 'daily-production',
    title: 'Daily Production',
    subtitle: "Today's production activity",
    icon: Factory,
    accent: '#f59e0b',
    lightBg: '#fffbeb',
    borderColor: '#fde68a',
    fields: [
      { label: 'Product Name', value: '-' },
      { label: 'Total Time (hrs)', value: '-' },
      { label: 'No. of Workers', value: '-' },
    ],
    path: '/daily-production',
  },
  {
    id: 'finished-goods',
    title: 'Finished Goods',
    subtitle: "Today's finished products",
    icon: Package,
    accent: '#8b5cf6',
    lightBg: '#f5f3ff',
    borderColor: '#ddd6fe',
    fields: [
      { label: 'Brand', value: '-' },
      { label: 'Product', value: '-' },
      { label: 'Carton Number', value: '-' },
    ],
    path: '/finished-goods',
  },
  {
    id: 'gate-outward',
    title: 'Gate Outward',
    subtitle: "Today's outgoing shipments",
    icon: ArrowUpFromLine,
    accent: '#ef4444',
    lightBg: '#fef2f2',
    borderColor: '#fecaca',
    fields: [
      { label: 'Product Name', value: '-' },
      { label: 'Brand', value: '-' },
      { label: 'Quantity', value: '-' },
    ],
    path: '/gate-outward',
  },
]

export default function DashboardPage() {
  const { user, hasPermission } = useAuthStore()
  const router = useRouter()

  const visibleCards = CARDS.filter((card) => {
    if (user?.role === 'superuser') return true
    return hasPermission(card.id)
  })

  return (
    <DashboardLayout>
      <div style={styles.wrapper}>

        {/* Hero Banner */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>Store Operations Panel</p>
            <h1 style={styles.heroTitle}>
              Welcome back, <span style={styles.heroName}>{user?.username || 'User'}</span> 👋
            </h1>
            <p style={styles.heroDesc}>
              Monitor your daily operations, manage inventory, and track production — all from one place.
            </p>
          </div>
          <div style={styles.heroIllustration}>
            <div style={styles.heroOrb1} />
            <div style={styles.heroOrb2} />
            <div style={styles.heroPattern} />
          </div>
        </div>

        {/* Section Header */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Today's Activity</h2>
          <p style={styles.sectionSub}>Real-time overview of all operations</p>
        </div>

        {/* Cards Grid */}
        <div style={styles.grid}>
          {visibleCards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={card.id}
                style={{
                  ...styles.card,
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {/* Card Top Accent */}
                <div style={{ ...styles.cardAccentBar, backgroundColor: card.accent }} />

                <div style={styles.cardInner}>
                  {/* Header */}
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.cardIconWrap, backgroundColor: card.lightBg, border: `1px solid ${card.borderColor}` }}>
                      <Icon size={18} color={card.accent} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 style={styles.cardTitle}>{card.title}</h3>
                      <p style={styles.cardSubtitle}>{card.subtitle}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={styles.divider} />

                  {/* Fields */}
                  <div style={styles.fields}>
                    {card.fields.map((field) => (
                      <div key={field.label} style={styles.fieldRow}>
                        <span style={styles.fieldLabel}>{field.label}</span>
                        <span style={styles.fieldValue}>{field.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <button
                    onClick={() => router.push(card.path)}
                    style={{ ...styles.viewBtn, color: card.accent }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = card.lightBg
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    View Details
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-card {
          animation: fadeSlideUp 0.35s ease both;
        }
      `}</style>
    </DashboardLayout>
  )
}

const styles = {
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  /* Hero */
  hero: {
    background: 'linear-gradient(120deg, #1a3d1f 0%, #2d6a32 50%, #3d8f43 100%)',
    borderRadius: '16px',
    padding: '32px 36px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    minHeight: '150px',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '560px',
  },
  heroEyebrow: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#86efac',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
    margin: '0 0 8px',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px',
    lineHeight: 1.2,
    letterSpacing: '-0.3px',
  },
  heroName: {
    color: '#86efac',
  },
  heroDesc: {
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.72)',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: '420px',
  },
  heroIllustration: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '45%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(134,239,172,0.18), transparent 70%)',
    top: '-60px',
    right: '-40px',
  },
  heroOrb2: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)',
    bottom: '-30px',
    right: '80px',
  },
  heroPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '40px 40px',
  },

  /* Section Header */
  sectionHeader: {
    marginBottom: '18px',
  },
  sectionTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a2e1b',
    margin: '0 0 3px',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },

  /* Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
  },

  /* Card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8f5e9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    overflow: 'hidden',
    animation: 'fadeSlideUp 0.35s ease both',
    cursor: 'default',
  },
  cardAccentBar: {
    height: '3px',
    width: '100%',
  },
  cardInner: {
    padding: '18px 20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '14px',
  },
  cardIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a2e1b',
    margin: '0 0 3px',
  },
  cardSubtitle: {
    fontSize: '11.5px',
    color: '#9ca3af',
    margin: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: '#f3f4f6',
    marginBottom: '14px',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
    marginBottom: '16px',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#f9fafb',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #f3f4f6',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    fontSize: '12.5px',
    fontWeight: '600',
    background: 'transparent',
    border: '1px solid currentColor',
    borderRadius: '8px',
    padding: '8px 0',
    cursor: 'pointer',
    transition: 'background 0.18s ease',
    opacity: 0.85,
  },
}
