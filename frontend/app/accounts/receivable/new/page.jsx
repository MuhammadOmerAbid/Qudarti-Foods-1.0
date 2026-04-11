'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:receivable:new'
const CUSTOMERS = ['Khan & Sons', 'Rehman Traders', 'City Distributors', 'Metro Wholesale']

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function ReceivableNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    customer: '',
    date: todayISO(),
    dueDate: '',
    amount: '',
    description: '',
  })

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.customer) next.customer = 'Customer is required'
    if (!form.date) next.date = 'Invoice date is required'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Amount must be greater than zero'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      customer: form.customer,
      date: form.date,
      dueDate: form.dueDate,
      amount: Number(form.amount),
      description: form.description.trim(),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/receivable')
  }

  return (
    <AccountEntryPage
      title="New Sales Invoice"
      subtitle="Create customer invoice in full-page entry mode"
      backHref="/accounts/receivable"
      onSave={handleSave}
      saveLabel="Save Invoice"
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Customer *</label>
          <select style={{ ...es.input, ...(errors.customer ? es.inputError : {}) }} value={form.customer} onChange={(e) => setField('customer', e.target.value)}>
            <option value="">Select customer</option>
            {CUSTOMERS.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
          {errors.customer ? <span style={es.errorText}>{errors.customer}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Invoice Date *</label>
          <input type="date" style={{ ...es.input, ...(errors.date ? es.inputError : {}) }} value={form.date} onChange={(e) => setField('date', e.target.value)} />
          {errors.date ? <span style={es.errorText}>{errors.date}</span> : null}
        </div>
      </div>

      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Due Date</label>
          <input type="date" style={es.input} value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Amount *</label>
          <input type="number" min="0" step="0.01" style={{ ...es.input, ...(errors.amount ? es.inputError : {}) }} value={form.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0" />
          {errors.amount ? <span style={es.errorText}>{errors.amount}</span> : null}
        </div>
      </div>

      <div style={es.fieldWrap}>
        <label style={es.label}>Description</label>
        <input style={es.input} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Invoice details" />
      </div>
    </AccountEntryPage>
  )
}
