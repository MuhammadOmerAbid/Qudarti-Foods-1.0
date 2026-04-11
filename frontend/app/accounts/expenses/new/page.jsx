'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:expenses:new'
const CATEGORIES = ['Utilities', 'Salaries', 'Maintenance', 'Office Supplies', 'Fuel & Transport', 'Rent', 'Marketing', 'Miscellaneous']

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function ExpensesNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    date: todayISO(),
    category: 'Utilities',
    description: '',
    amount: '',
    account: '',
  })

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.date) next.date = 'Date is required'
    if (!form.description.trim()) next.description = 'Description is required'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Amount must be greater than zero'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      amount: Number(form.amount),
      account: form.account.trim(),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/expenses')
  }

  return (
    <AccountEntryPage
      title="Record Expense"
      subtitle="Create a new expense entry in full-page form"
      backHref="/accounts/expenses"
      onSave={handleSave}
      saveLabel="Save Expense"
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Date *</label>
          <input type="date" style={{ ...es.input, ...(errors.date ? es.inputError : {}) }} value={form.date} onChange={(e) => setField('date', e.target.value)} />
          {errors.date ? <span style={es.errorText}>{errors.date}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Category *</label>
          <select style={es.input} value={form.category} onChange={(e) => setField('category', e.target.value)}>
            {CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Amount *</label>
          <input type="number" min="0" step="0.01" style={{ ...es.input, ...(errors.amount ? es.inputError : {}) }} value={form.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0" />
          {errors.amount ? <span style={es.errorText}>{errors.amount}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Account Code</label>
          <input style={es.input} value={form.account} onChange={(e) => setField('account', e.target.value)} placeholder="e.g. 5200 - Utilities" />
        </div>
      </div>

      <div style={es.fieldWrap}>
        <label style={es.label}>Description *</label>
        <input style={{ ...es.input, ...(errors.description ? es.inputError : {}) }} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Expense details" />
        {errors.description ? <span style={es.errorText}>{errors.description}</span> : null}
      </div>
    </AccountEntryPage>
  )
}
