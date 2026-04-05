'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import AppSidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  const { user, panel } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else if (!panel) {
      router.push('/panel-selection')
    }
  }, [user, panel, router])

  if (!user || !panel) return null

  return (
    <div style={styles.layout}>
      <AppSidebar />
      <main style={styles.main}>
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="bgImage"
          priority
          quality={100}
          style={styles.bgImage}
        />
        <div style={styles.overlay} />
        <div style={{ ...styles.orb, ...styles.o1 }} />
        <div style={{ ...styles.orb, ...styles.o2 }} />
        <div style={{ ...styles.orb, ...styles.o3 }} />
        <div style={styles.grain} />
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
    backgroundColor: '#0b0f19',
    padding: '24px',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    minHeight: '100%',
  },
  bgImage: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
    filter: 'blur(4px)',
    transform: 'scale(1.02)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    background: 'rgba(0, 0, 0, 0.55)',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(120px)',
    pointerEvents: 'none',
    zIndex: 0,
    animation: 'subtleFloat 20s ease-in-out infinite',
  },
  o1: {
    width: '500px',
    height: '500px',
    top: '-200px',
    left: '-150px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 70%)',
  },
  o2: {
    width: '450px',
    height: '450px',
    bottom: '-150px',
    right: '-120px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%)',
    animationDelay: '8s',
  },
  o3: {
    width: '300px',
    height: '300px',
    top: '50%',
    left: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent 70%)',
    animationDelay: '14s',
    transform: 'translate(-50%, -50%)',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    opacity: 0.02,
    pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
    backgroundSize: '256px 256px',
  },
}

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    @keyframes subtleFloat {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
      50% { transform: translate(20px, -15px) scale(1.05); opacity: 0.6; }
    }
  `
  document.head.appendChild(styleSheet)
}
