'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:payable:new'
const SUPPLIERS = ['Ali Traders', 'Khan Supplies', 'Punjab Chemicals', 'National Packers']

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function PayableNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    supplier: '',
    date: todayISO(),
    amount: '',
    description: '',
  })

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.supplier) next.supplier = 'Supplier is required'
    if (!form.date) next.date = 'Date is required'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Amount must be greater than zero'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      supplier: form.supplier,
      date: form.date,
      amount: Number(form.amount),
      description: form.description.trim(),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/payable')
  }

  return (
    <AccountEntryPage
      title="Record Purchase Bill"
      subtitle="Create a new supplier bill in full-page entry mode"
      backHref="/accounts/payable"
      onSave={handleSave}
      saveLabel="Save Bill"
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Supplier *</label>
          <select style={{ ...es.input, ...(errors.supplier ? es.inputError : {}) }} value={form.supplier} onChange={(e) => setField('supplier', e.target.value)}>
            <option value="">Select supplier</option>
            {SUPPLIERS.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
          {errors.supplier ? <span style={es.errorText}>{errors.supplier}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Date *</label>
          <input type="date" style={{ ...es.input, ...(errors.date ? es.inputError : {}) }} value={form.date} onChange={(e) => setField('date', e.target.value)} />
          {errors.date ? <span style={es.errorText}>{errors.date}</span> : null}
        </div>
      </div>

      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Amount *</label>
          <input type="number" min="0" step="0.01" style={{ ...es.input, ...(errors.amount ? es.inputError : {}) }} value={form.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0" />
          {errors.amount ? <span style={es.errorText}>{errors.amount}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Description</label>
          <input style={es.input} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Bill details" />
        </div>
      </div>
    </AccountEntryPage>
  )
}
