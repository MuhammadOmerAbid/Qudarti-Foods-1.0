'use client'

import DashboardLayout from '@/components/dashboard/dashboardlayout'

export default function CategoriesSettingsPage() {
  return (
    <DashboardLayout>
      <section style={styles.container}>
        <h1 style={styles.title}>Categories Settings</h1>
        <p style={styles.subtitle}>
          This page is ready for your categories management UI.
        </p>
      </section>
    </DashboardLayout>
  )
}

const styles = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 800,
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: '#6b7280',
  },
}
