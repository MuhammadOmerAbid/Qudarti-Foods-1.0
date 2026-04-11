'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { FileText, Plus, Search, CheckCircle, AlertCircle, Paperclip } from 'lucide-react'

const SEED_ENTRIES = [
  { id: 'JV-001', date: '2026-04-01', narration: 'Opening cash balance', debit: 30000,  credit: 0,     account: '1110 - Cash in Hand',       status: 'Posted' },
  { id: 'JV-002', date: '2026-04-02', narration: 'Salary expense April', debit: 0,      credit: 350000, account: '5100 - Salaries Expense',   status: 'Posted' },
  { id: 'JV-003', date: '2026-04-02', narration: 'Salary expense April', debit: 350000, credit: 0,      account: '1120 - Bank Account - HBL', status: 'Posted' },
  { id: 'JV-004', date: '2026-04-05', narration: 'Utility bill payment', debit: 0,      credit: 12500, account: '5200 - Utilities Expense',   status: 'Posted' },
  { id: 'JV-005', date: '2026-04-05', narration: 'Utility bill payment', debit: 12500,  credit: 0,     account: '1110 - Cash in Hand',        status: 'Posted' },
  { id: 'JV-006', date: '2026-04-08', narration: 'Sales revenue received',debit: 88000, credit: 0,     account: '1120 - Bank Account - HBL',  status: 'Draft' },
]

const DRAFT_KEY = 'accounts:general-ledger:new'

export default function GeneralLedgerPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [entries, setEntries] = useState(SEED_ENTRIES)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [rows, setRows] = useState([
    { account: '', debit: '', credit: '' },
    { account: '', debit: '', credit: '' },
  ])
  const [narration, setNarration] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setEntries((prev) => {
        const start = prev.length + 1
        const newEntries = (draft.rows || []).map((row, index) => ({
          id: `JV-${String(start + index).padStart(3, '0')}`,
          date: draft.date,
          narration: draft.narration,
          account: row.account,
          debit: Number(row.debit) || 0,
          credit: Number(row.credit) || 0,
          status: 'Posted',
        }))
        return [...prev, ...newEntries]
      })
    } catch {}
  }, [])

  const filtered = entries.filter(e =>
    e.narration.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.account.toLowerCase().includes(search.toLowerCase())
  )

  const totalDebit = rows.reduce((s, r) => s + (Number(r.debit) || 0), 0)
  const totalCredit = rows.reduce((s, r) => s + (Number(r.credit) || 0), 0)
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit

  const addRow = () => setRows(prev => [...prev, { account: '', debit: '', credit: '' }])
  const updateRow = (i, field, val) => setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const handlePost = () => {
    if (!isBalanced || !narration) return
    const newEntries = rows
      .filter(r => r.account && (Number(r.debit) || Number(r.credit)))
      .map((r, i) => ({
        id: `JV-${String(entries.length + i + 1).padStart(3, '0')}`,
        date, narration, account: r.account,
        debit: Number(r.debit) || 0, credit: Number(r.credit) || 0, status: 'Posted',
      }))
    setEntries(prev => [...prev, ...newEntries])
    setRows([{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }])
    setNarration('')
    setShowModal(false)
  }

  const fmt = n => n > 0 ? '₨ ' + n.toLocaleString() : '—'

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><FileText size={22} color="#2d7a33" /></div>
            <div>
              <h1 style={s.title}>General Ledger</h1>
              <p style={s.subtitle}>All transactions — auto-balance validated (Debit = Credit)</p>
            </div>
          </div>
          {isSuperuser && (
            <button style={s.addBtn} onClick={() => router.push('/accounts/general-ledger/new')}>
              <Plus size={15} /> New Journal Entry
            </button>
          )}
        </section>

        {/* Summary */}
        <div style={s.summaryRow}>
          <div style={s.sumCard}>
            <p style={s.sumLabel}>Total Debits</p>
            <p style={s.sumVal}>₨ {entries.reduce((s,e) => s + e.debit, 0).toLocaleString()}</p>
          </div>
          <div style={s.sumCard}>
            <p style={s.sumLabel}>Total Credits</p>
            <p style={s.sumVal}>₨ {entries.reduce((s,e) => s + e.credit, 0).toLocaleString()}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ ...s.sumLabel, color: '#16a34a' }}>Status</p>
            <p style={{ ...s.sumVal, color: '#16a34a', fontSize: 16 }}>Balanced ✓</p>
          </div>
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <Search size={14} color="#7a8a7a" />
            <input style={s.searchInput} placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={s.select}>
            <option>All Accounts</option>
            <option>1110 - Cash in Hand</option>
            <option>1120 - Bank Account - HBL</option>
            <option>5100 - Salaries Expense</option>
          </select>
          <input type="date" style={s.dateInput} defaultValue="2026-04-01" />
          <input type="date" style={s.dateInput} defaultValue="2026-04-30" />
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Voucher #</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Account</th>
                <th style={s.th}>Narration</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Debit</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Credit</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={s.trow}>
                  <td style={s.td}><span style={s.voucherTag}>{e.id}</span></td>
                  <td style={s.td}>{e.date}</td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{e.account}</td>
                  <td style={{ ...s.td, color: '#7a8a7a' }}>{e.narration}</td>
                  <td style={{ ...s.td, textAlign: 'right', color: '#2d7a33', fontWeight: 600 }}>{fmt(e.debit)}</td>
                  <td style={{ ...s.td, textAlign: 'right', color: '#2a6f31', fontWeight: 600 }}>{fmt(e.credit)}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={{ ...s.badge, background: e.status === 'Posted' ? '#f0fdf4' : '#fffbeb', color: e.status === 'Posted' ? '#16a34a' : '#b45309' }}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={s.empty}>No entries found.</p>}
        </div>

        {/* Journal Entry Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>New Journal Entry</h3>

              <div style={s.modalRow}>
                <div style={s.field}><label style={s.label}>Date</label><input type="date" style={s.input} value={date} onChange={e => setDate(e.target.value)} /></div>
                <div style={{ ...s.field, flex: 2 }}>
                  <label style={s.label}>Narration / Description</label>
                  <input style={s.input} placeholder="Describe this journal entry" value={narration} onChange={e => setNarration(e.target.value)} />
                </div>
              </div>

              <table style={{ ...s.table, marginTop: 16 }}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Account</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Debit (₨)</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Credit (₨)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={s.trow}>
                      <td style={s.td}><input style={{ ...s.input, width: '100%' }} placeholder="Account name or code" value={r.account} onChange={e => updateRow(i, 'account', e.target.value)} /></td>
                      <td style={s.td}><input style={{ ...s.input, textAlign: 'right' }} type="number" placeholder="0" value={r.debit} onChange={e => updateRow(i, 'debit', e.target.value)} /></td>
                      <td style={s.td}><input style={{ ...s.input, textAlign: 'right' }} type="number" placeholder="0" value={r.credit} onChange={e => updateRow(i, 'credit', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ ...s.td, fontWeight: 700 }}>Total</td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#2d7a33' }}>₨ {totalDebit.toLocaleString()}</td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#2a6f31' }}>₨ {totalCredit.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>

              <button style={s.addRowBtn} onClick={addRow}>+ Add Row</button>

              <div style={{ ...s.balanceBar, background: isBalanced ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isBalanced ? '#bbf7d0' : '#fecaca'}` }}>
                {isBalanced
                  ? <><CheckCircle size={16} color="#16a34a" /> <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>Balanced — ready to post</span></>
                  : <><AlertCircle size={16} color="#dc2626" /> <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 13 }}>Unbalanced — Debit must equal Credit</span></>}
              </div>

              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={{ ...s.saveBtn, opacity: isBalanced && narration ? 1 : 0.5, cursor: isBalanced && narration ? 'pointer' : 'not-allowed' }} onClick={handlePost} disabled={!isBalanced || !narration}>
                  Post Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}

const s = {
  page: { width: '100%', display: 'flex', flexDirection: 'column', gap: 20 },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'linear-gradient(135deg, rgb(26, 61, 31) 0%, rgb(45, 122, 51) 100%)', borderRadius: 28, padding: '24px 28px' },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#d4dfd4' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#1a5c22', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 },
  sumCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 20, padding: '16px 20px' },
  sumLabel: { margin: 0, fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sumVal: { margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: '#1a3d1f' },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 40, padding: '8px 16px', flex: '0 1 260px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1a3d1f', flex: 1, fontFamily: 'inherit' },
  select: { padding: '8px 14px', border: '1.5px solid #e2e8e2', borderRadius: 40, fontSize: 13, color: '#415443', background: '#f2f4f2', outline: 'none', fontFamily: 'inherit' },
  dateInput: { padding: '8px 14px', border: '1.5px solid #e2e8e2', borderRadius: 40, fontSize: 13, color: '#415443', background: '#f2f4f2', outline: 'none', fontFamily: 'inherit' },
  tableCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#e8eee8' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '11px 16px', fontSize: 13, color: '#1a3d1f' },
  voucherTag: { background: '#e8eee8', color: '#2d7a33', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  badge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  empty: { textAlign: 'center', padding: 32, color: '#8aa88a', fontSize: 14 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 680, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  modalRow: { display: 'flex', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  label: { fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  addRowBtn: { marginTop: 10, padding: '7px 18px', border: '1px dashed #d4dfd4', borderRadius: 999, background: 'transparent', color: '#2d7a33', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  balanceBar: { display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '10px 16px', marginTop: 14 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#2d7a33', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

