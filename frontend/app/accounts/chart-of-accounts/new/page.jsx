'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:chart-of-accounts:new'
const ACCOUNT_TYPES = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']

export default function ChartOfAccountsNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'Assets',
    parentCode: '',
    openingBalance: '',
  })

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.code.trim()) next.code = 'Account code is required'
    if (!form.name.trim()) next.name = 'Account name is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      parentCode: form.parentCode.trim(),
      openingBalance: Number(form.openingBalance) || 0,
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/chart-of-accounts')
  }

  return (
    <AccountEntryPage
      title="Add Account"
      subtitle="Create a new account in the chart hierarchy"
      backHref="/accounts/chart-of-accounts"
      onSave={handleSave}
      saveLabel="Save Account"
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Account Code *</label>
          <input style={{ ...es.input, ...(errors.code ? es.inputError : {}) }} value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="e.g. 1130" />
          {errors.code ? <span style={es.errorText}>{errors.code}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Account Name *</label>
          <input style={{ ...es.input, ...(errors.name ? es.inputError : {}) }} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Petty Cash" />
          {errors.name ? <span style={es.errorText}>{errors.name}</span> : null}
        </div>
      </div>

      <div style={es.row3}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Type</label>
          <select style={es.input} value={form.type} onChange={(e) => setField('type', e.target.value)}>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Parent Account Code</label>
          <input style={es.input} value={form.parentCode} onChange={(e) => setField('parentCode', e.target.value)} placeholder="Optional" />
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Opening Balance</label>
          <input type="number" min="0" step="0.01" style={es.input} value={form.openingBalance} onChange={(e) => setField('openingBalance', e.target.value)} placeholder="0" />
        </div>
      </div>
    </AccountEntryPage>
  )
}
