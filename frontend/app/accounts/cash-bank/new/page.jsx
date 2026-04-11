'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:cash-bank:new'
const ACCOUNTS = ['Cash in Hand', 'Petty Cash', 'HBL Current Account', 'MCB Savings Account']

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function CashBankNewPage() {
  const router = useRouter()
  const [txnType, setTxnType] = useState('receipt')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    account: '',
    date: todayISO(),
    amount: '',
    description: '',
  })

  const pageTitle = useMemo(
    () => (txnType === 'payment' ? 'New Cash / Bank Payment' : 'New Cash / Bank Receipt'),
    [txnType]
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTxnType(params.get('type') === 'payment' ? 'payment' : 'receipt')
  }, [])

  const saveLabel = txnType === 'payment' ? 'Save Payment' : 'Save Receipt'

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.account) next.account = 'Account is required'
    if (!form.date) next.date = 'Date is required'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Amount must be greater than zero'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      type: txnType === 'payment' ? 'Debit' : 'Credit',
      account: form.account,
      date: form.date,
      amount: Number(form.amount),
      description: form.description.trim(),
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/cash-bank')
  }

  return (
    <AccountEntryPage
      title={pageTitle}
      subtitle="Add a cash or bank transaction in full-page entry mode"
      backHref="/accounts/cash-bank"
      onSave={handleSave}
      saveLabel={saveLabel}
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Account *</label>
          <select style={{ ...es.input, ...(errors.account ? es.inputError : {}) }} value={form.account} onChange={(e) => setField('account', e.target.value)}>
            <option value="">Select account</option>
            {ACCOUNTS.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
          {errors.account ? <span style={es.errorText}>{errors.account}</span> : null}
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
          <input style={es.input} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Transaction details" />
        </div>
      </div>
    </AccountEntryPage>
  )
}
