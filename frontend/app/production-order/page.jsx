'use client'

import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { ProductionOrderPage } from '@/components/store/StorePages'
import { useAuthStore } from '@/store/authStore'

export default function ProductionOrderRoutePage() {
  const { canDelete } = useAuthStore()

  return (
    <DashboardLayout>
      <ProductionOrderPage isSuperUser={canDelete()} />
    </DashboardLayout>
  )
}
