'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:vouchers:new'
const VOUCHER_TYPES = ['Payment Voucher', 'Receipt Voucher', 'Journal Voucher']
const todayISO = () => new Date().toISOString().slice(0, 10)

export default function VouchersNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    type: 'Payment Voucher',
    date: todayISO(),
    amount: '',
    account: '',
    party: '',
    narration: '',
  })

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.date) next.date = 'Date is required'
    if (!form.party.trim()) next.party = 'Party is required'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Amount must be greater than zero'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      type: form.type,
      date: form.date,
      amount: Number(form.amount),
      account: form.account.trim(),
      party: form.party.trim(),
      narration: form.narration.trim(),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/vouchers')
  }

  return (
    <AccountEntryPage
      title="Create Voucher"
      subtitle="Add payment, receipt, or journal voucher in full-page mode"
      backHref="/accounts/vouchers"
      onSave={handleSave}
      saveLabel="Save Voucher"
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Voucher Type *</label>
          <select style={es.input} value={form.type} onChange={(e) => setField('type', e.target.value)}>
            {VOUCHER_TYPES.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Date *</label>
          <input type="date" style={{ ...es.input, ...(errors.date ? es.inputError : {}) }} value={form.date} onChange={(e) => setField('date', e.target.value)} />
          {errors.date ? <span style={es.errorText}>{errors.date}</span> : null}
        </div>
      </div>

      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Party / Description *</label>
          <input style={{ ...es.input, ...(errors.party ? es.inputError : {}) }} value={form.party} onChange={(e) => setField('party', e.target.value)} placeholder="e.g. Supplier name, staff" />
          {errors.party ? <span style={es.errorText}>{errors.party}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Amount *</label>
          <input type="number" min="0" step="0.01" style={{ ...es.input, ...(errors.amount ? es.inputError : {}) }} value={form.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0" />
          {errors.amount ? <span style={es.errorText}>{errors.amount}</span> : null}
        </div>
      </div>

      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Account</label>
          <input style={es.input} value={form.account} onChange={(e) => setField('account', e.target.value)} placeholder="e.g. HBL Current Account" />
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Narration</label>
          <input style={es.input} value={form.narration} onChange={(e) => setField('narration', e.target.value)} placeholder="Purpose of this voucher" />
        </div>
      </div>
    </AccountEntryPage>
  )
}
