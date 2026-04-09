'use client'

import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { FinishedGoodsPage } from '@/components/store/StorePages'
import { useAuthStore } from '@/store/authStore'

export default function FinishedGoodsRoutePage() {
  const { canDelete } = useAuthStore()

  return (
    <DashboardLayout>
      <FinishedGoodsPage isSuperUser={canDelete()} />
    </DashboardLayout>
  )
}
