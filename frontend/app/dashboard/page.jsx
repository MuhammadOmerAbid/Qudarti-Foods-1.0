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
  Eye,
} from 'lucide-react'

const CARDS = [
  {
    id: 'gate-inward',
    title: "Today's Gate Inward",
    icon: ArrowDownToLine,
    bgColor: '#FEE2E2',
    fgColor: '#991B1B',
    fields: ['Category', 'Name', 'Quantity'],
    path: '/gate-inward',
  },
  {
    id: 'goods-requisition',
    title: "Today's Goods Requisition",
    icon: ClipboardList,
    bgColor: '#F3E8FF',
    fgColor: '#6B21A5',
    fields: ['Receiver Name', 'Product Name', 'Quantity'],
    path: '/goods-requisition',
  },
  {
    id: 'daily-production',
    title: "Today's Production",
    icon: Factory,
    bgColor: '#CFFAFE',
    fgColor: '#155E75',
    fields: ['Product Name', 'Total Time (Hours)', 'No. of Workers'],
    path: '/daily-production',
  },
  {
    id: 'finished-goods',
    title: "Today's Finished Goods",
    icon: Package,
    bgColor: '#DBEAFE',
    fgColor: '#1E40AF',
    fields: ['Brand', 'Product', 'Carton Number'],
    path: '/finished-goods',
  },
  {
    id: 'gate-outward',
    title: "Today's Gate Outward",
    icon: ArrowUpFromLine,
    bgColor: '#FEF3C7',
    fgColor: '#92400E',
    fields: ['Product Name', 'Brand', 'Quantity'],
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

  const handleCardClick = (path) => {
    router.push(path)
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>Store Panel Dashboard</h1>

          <div style={styles.grid}>
            {visibleCards.map((card) => (
              <div
                key={card.id}
                style={{
                  ...styles.card,
                  borderColor: card.bgColor,
                }}
              >
                <div style={styles.cardHeader}>
                  <card.icon size={22} style={{ color: card.fgColor }} />
                  <h2 style={{ ...styles.cardTitle, color: card.fgColor }}>
                    {card.title}
                  </h2>
                </div>

                <div style={styles.fieldsContainer}>
                  {card.fields.map((field) => (
                    <div key={field} style={styles.fieldRow}>
                      <span style={{ ...styles.fieldLabel, color: card.fgColor }}>
                        {field}
                      </span>
                      <span style={{ ...styles.fieldValue, color: card.fgColor }}>
                        -
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCardClick(card.path)}
                  style={{
                    ...styles.viewButton,
                    color: card.fgColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

const styles = {
  container: {
    minHeight: '100%',
  },
  content: {
    padding: '24px 8px 40px 8px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#F9FAFB',
    letterSpacing: '0.2px',
  },
  grid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  },
  card: {
    borderRadius: '16px',
    padding: '20px',
    animation: 'fadeIn 0.3s ease-in',
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    margin: 0,
  },
  fieldsContainer: {
    marginBottom: '16px',
    spaceY: '8px',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  fieldLabel: {
    fontSize: '12px',
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: '12px',
    fontWeight: '500',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s ease',
  },
}

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    div[style*="border-radius: 16px"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 40px rgba(0,0,0,0.2);
    }
  `
  document.head.appendChild(styleSheet)
}
