'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const CLOSE_KEY = 'accounts:settings:close-period'
const CONFIRM_PHRASE = 'CLOSE APRIL'

export default function ClosePeriodPage() {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (confirmText !== CONFIRM_PHRASE) return
    setSaving(true)
    sessionStorage.setItem(
      CLOSE_KEY,
      JSON.stringify({
        month: 'April 2026',
        status: 'Closed',
        closedBy: 'Admin',
        closedOn: new Date().toISOString().slice(0, 10),
      })
    )
    router.push('/accounts/settings')
  }

  return (
    <AccountEntryPage
      title="Close Period"
      subtitle="Lock all entries for April 2026"
      backHref="/accounts/settings"
      onSave={handleSave}
      saveLabel="Confirm Close"
      saveDisabled={confirmText !== CONFIRM_PHRASE}
      saving={saving}
    >
      <div style={s.warnBox}>
        This action will lock all entries for April 2026. No edits or new entries will be allowed for this period.
      </div>

      <div style={es.fieldWrap}>
        <label style={es.label}>Type CLOSE APRIL to confirm</label>
        <input
          style={es.input}
          placeholder={CONFIRM_PHRASE}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
      </div>
    </AccountEntryPage>
  )
}

const s = {
  warnBox: {
    marginBottom: 12,
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 12,
    padding: '12px 14px',
    color: '#92400e',
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 500,
  },
}
