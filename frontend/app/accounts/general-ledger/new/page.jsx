'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle } from 'lucide-react'
import AccountEntryPage, { accountEntryStyles as es } from '@/components/accounts/AccountEntryPage'

const DRAFT_KEY = 'accounts:general-ledger:new'
const todayISO = () => new Date().toISOString().slice(0, 10)

const blankRow = () => ({ account: '', debit: '', credit: '' })

export default function GeneralLedgerNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [date, setDate] = useState(todayISO())
  const [narration, setNarration] = useState('')
  const [rows, setRows] = useState([blankRow(), blankRow()])

  const totalDebit = useMemo(() => rows.reduce((sum, row) => sum + (Number(row.debit) || 0), 0), [rows])
  const totalCredit = useMemo(() => rows.reduce((sum, row) => sum + (Number(row.credit) || 0), 0), [rows])
  const balanced = totalDebit > 0 && totalDebit === totalCredit

  const setRow = (index, key, value) => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, [key]: value } : row)))
  }

  const addRow = () => setRows((prev) => [...prev, blankRow()])

  const validate = () => {
    const next = {}
    if (!date) next.date = 'Date is required'
    if (!narration.trim()) next.narration = 'Narration is required'
    const validRows = rows.filter((row) => row.account.trim() && (Number(row.debit) > 0 || Number(row.credit) > 0))
    if (validRows.length < 2) next.rows = 'Enter at least two ledger rows with account and amount'
    if (!balanced) next.balance = 'Debit and credit totals must match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const draft = {
      date,
      narration: narration.trim(),
      rows: rows
        .filter((row) => row.account.trim() && (Number(row.debit) > 0 || Number(row.credit) > 0))
        .map((row) => ({
          account: row.account.trim(),
          debit: Number(row.debit) || 0,
          credit: Number(row.credit) || 0,
        })),
    }

    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    router.push('/accounts/general-ledger')
  }

  return (
    <AccountEntryPage
      title="New Journal Entry"
      subtitle="Create a balanced double-entry journal"
      backHref="/accounts/general-ledger"
      onSave={handleSave}
      saveLabel="Post Entry"
      saveDisabled={!balanced}
      saving={saving}
    >
      <div style={es.row2}>
        <div style={es.fieldWrap}>
          <label style={es.label}>Date *</label>
          <input type="date" style={{ ...es.input, ...(errors.date ? es.inputError : {}) }} value={date} onChange={(e) => setDate(e.target.value)} />
          {errors.date ? <span style={es.errorText}>{errors.date}</span> : null}
        </div>

        <div style={es.fieldWrap}>
          <label style={es.label}>Narration *</label>
          <input style={{ ...es.input, ...(errors.narration ? es.inputError : {}) }} value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Describe this journal entry" />
          {errors.narration ? <span style={es.errorText}>{errors.narration}</span> : null}
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Account</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Debit</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Credit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td style={s.td}>
                  <input style={es.input} value={row.account} onChange={(e) => setRow(index, 'account', e.target.value)} placeholder="Account name or code" />
                </td>
                <td style={s.td}>
                  <input type="number" min="0" step="0.01" style={{ ...es.input, textAlign: 'right' }} value={row.debit} onChange={(e) => setRow(index, 'debit', e.target.value)} placeholder="0" />
                </td>
                <td style={s.td}>
                  <input type="number" min="0" step="0.01" style={{ ...es.input, textAlign: 'right' }} value={row.credit} onChange={(e) => setRow(index, 'credit', e.target.value)} placeholder="0" />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ ...s.td, fontWeight: 700 }}>Total</td>
              <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>{totalDebit.toLocaleString()}</td>
              <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>{totalCredit.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button type="button" style={s.addRowBtn} onClick={addRow}>+ Add Row</button>

      <div style={{ ...s.balanceBar, ...(balanced ? s.okBar : s.badBar) }}>
        {balanced ? <CheckCircle size={16} color="#16a34a" /> : <AlertCircle size={16} color="#dc2626" />}
        <span style={{ ...s.balanceText, color: balanced ? '#166534' : '#b91c1c' }}>
          {balanced ? 'Balanced and ready to post' : 'Unbalanced: debit must equal credit'}
        </span>
      </div>

      {errors.rows ? <p style={es.errorText}>{errors.rows}</p> : null}
      {errors.balance ? <p style={es.errorText}>{errors.balance}</p> : null}
    </AccountEntryPage>
  )
}

const s = {
  tableWrap: {
    border: '1px solid #e2e8e2',
    borderRadius: 14,
    overflow: 'hidden',
    background: '#ffffff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 12px',
    background: '#e8eee8',
    color: '#415443',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    textAlign: 'left',
  },
  td: {
    padding: '8px 10px',
    borderTop: '1px solid #e2e8e2',
  },
  addRowBtn: {
    marginTop: 10,
    border: '1px dashed #c5d4c5',
    borderRadius: 999,
    background: '#ffffff',
    color: '#2d7a33',
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  balanceBar: {
    marginTop: 12,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    border: '1px solid',
  },
  okBar: {
    background: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  badBar: {
    background: '#fef2f2',
    borderColor: '#fecaca',
  },
  balanceText: {
    fontSize: 13,
    fontWeight: 600,
  },
}
