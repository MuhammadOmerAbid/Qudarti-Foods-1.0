'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { Plus, Search, ChevronRight, ChevronDown, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react'

const ACCOUNT_TYPES = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']

const SEED_ACCOUNTS = [
  { id: 1, code: '1000', name: 'Assets',              type: 'Assets',      level: 0, balance: 5000000, active: true },
  { id: 2, code: '1100', name: 'Current Assets',      type: 'Assets',      level: 1, balance: 3200000, active: true },
  { id: 3, code: '1110', name: 'Cash in Hand',        type: 'Assets',      level: 2, balance: 30000,   active: true },
  { id: 4, code: '1120', name: 'Bank Account - HBL',  type: 'Assets',      level: 2, balance: 2800000, active: true },
  { id: 5, code: '1200', name: 'Fixed Assets',        type: 'Assets',      level: 1, balance: 1800000, active: true },
  { id: 6, code: '2000', name: 'Liabilities',         type: 'Liabilities', level: 0, balance: 2100000, active: true },
  { id: 7, code: '2100', name: 'Accounts Payable',    type: 'Liabilities', level: 1, balance: 2100000, active: true },
  { id: 8, code: '3000', name: 'Equity',              type: 'Equity',      level: 0, balance: 2900000, active: true },
  { id: 9, code: '4000', name: 'Revenue',             type: 'Revenue',     level: 0, balance: 8500000, active: true },
  { id: 10, code: '4100', name: 'Sales Revenue',      type: 'Revenue',     level: 1, balance: 8500000, active: true },
  { id: 11, code: '5000', name: 'Expenses',           type: 'Expenses',    level: 0, balance: 6200000, active: true },
  { id: 12, code: '5100', name: 'Salaries Expense',   type: 'Expenses',    level: 1, balance: 3500000, active: true },
  { id: 13, code: '5200', name: 'Utilities Expense',  type: 'Expenses',    level: 1, balance: 450000,  active: true },
  { id: 14, code: '5300', name: 'Maintenance',        type: 'Expenses',    level: 1, balance: 250000,  active: false },
]

const TYPE_COLORS = {
  Assets:      { accent: '#2d7a33', bg: '#e8eee8' },
  Liabilities: { accent: '#2a6f31', bg: '#eef2ee' },
  Equity:      { accent: '#0f766e', bg: '#f0fdfa' },
  Revenue:     { accent: '#16a34a', bg: '#f0fdf4' },
  Expenses:    { accent: '#b45309', bg: '#fffbeb' },
}

const DRAFT_KEY = 'accounts:chart-of-accounts:new'

export default function ChartOfAccountsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', type: 'Assets', parentCode: '', openingBalance: '' })

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setAccounts((prev) => [
        ...prev,
        {
          id: Date.now(),
          code: draft.code,
          name: draft.name,
          type: draft.type,
          level: draft.parentCode ? 1 : 0,
          balance: Number(draft.openingBalance) || 0,
          active: true,
        },
      ])
    } catch {}
  }, [])

  const filtered = accounts.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
    const matchType = filterType === 'All' || a.type === filterType
    return matchSearch && matchType
  })

  const toggleActive = (id) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const handleAdd = () => {
    if (!form.code || !form.name) return
    const newAcc = {
      id: Date.now(), code: form.code, name: form.name, type: form.type,
      level: form.parentCode ? 1 : 0, balance: Number(form.openingBalance) || 0, active: true,
    }
    setAccounts(prev => [...prev, newAcc])
    setForm({ code: '', name: '', type: 'Assets', parentCode: '', openingBalance: '' })
    setShowModal(false)
  }

  const fmt = (n) => '₨ ' + n.toLocaleString()

  return (
    <AccountLayout>
      <div style={s.page}>
        {/* Header */}
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><BookOpen size={22} color="#2d7a33" /></div>
            <div>
              <h1 style={s.title}>Chart of Accounts</h1>
              <p style={s.subtitle}>Structured account hierarchy — Assets, Liabilities, Equity, Revenue, Expenses</p>
            </div>
          </div>
          {isSuperuser && (
            <button style={s.addBtn} onClick={() => router.push('/accounts/chart-of-accounts/new')}>
              <Plus size={15} /> Add Account
            </button>
          )}
        </section>

        {/* Filters */}
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <Search size={14} color="#7a8a7a" />
            <input style={s.searchInput} placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={s.filterGroup}>
            {['All', ...ACCOUNT_TYPES].map(t => (
              <button key={t} style={{ ...s.filterBtn, ...(filterType === t ? s.filterBtnActive : {}) }} onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={s.summaryGrid}>
          {ACCOUNT_TYPES.map(type => {
            const total = accounts.filter(a => a.type === type).reduce((sum, a) => sum + a.balance, 0)
            const c = TYPE_COLORS[type]
            return (
              <div key={type} style={{ ...s.summaryCard, background: c.bg, border: `1px solid ${c.accent}22` }}>
                <p style={{ ...s.summaryLabel, color: c.accent }}>{type}</p>
                <p style={{ ...s.summaryVal, color: c.accent }}>{fmt(total)}</p>
              </div>
            )
          })}
        </div>

        {/* Accounts Table */}
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Code</th>
                <th style={s.th}>Account Name</th>
                <th style={s.th}>Type</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Balance</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                {isSuperuser && <th style={{ ...s.th, textAlign: 'center' }}>Toggle</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(acc => {
                const c = TYPE_COLORS[acc.type]
                return (
                  <tr key={acc.id} style={s.trow}>
                    <td style={s.td}>
                      <span style={s.codeTag}>{acc.code}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ paddingLeft: acc.level * 20, display: 'inline-block', fontWeight: acc.level === 0 ? 700 : 500, color: acc.level === 0 ? '#1a3d1f' : '#415443' }}>
                        {acc.level > 0 && <span style={{ color: '#d4dfd4', marginRight: 6 }}>└</span>}
                        {acc.name}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.typeBadge, background: c.bg, color: c.accent }}>{acc.type}</span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 600, color: '#1a3d1f' }}>
                      {fmt(acc.balance)}
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.statusBadge, background: acc.active ? '#f0fdf4' : '#fef2f2', color: acc.active ? '#16a34a' : '#dc2626' }}>
                        {acc.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    {isSuperuser && (
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <button style={s.toggleBtn} onClick={() => toggleActive(acc.id)}>
                          {acc.active
                            ? <ToggleRight size={20} color="#2d7a33" />
                            : <ToggleLeft size={20} color="#8aa88a" />}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={s.empty}>No accounts match your search.</p>}
        </div>

        {/* Add Account Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>Add New Account</h3>
              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>Account Code *</label>
                  <input style={s.input} placeholder="e.g. 1130" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Account Name *</label>
                  <input style={s.input} placeholder="e.g. Petty Cash" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Type</label>
                  <select style={s.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Parent Account Code</label>
                  <input style={s.input} placeholder="e.g. 1100 (optional)" value={form.parentCode} onChange={e => setForm({ ...form, parentCode: e.target.value })} />
                </div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                  <label style={s.label}>Opening Balance (₨)</label>
                  <input style={s.input} type="number" placeholder="0" value={form.openingBalance} onChange={e => setForm({ ...form, openingBalance: e.target.value })} />
                </div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleAdd}>Save Account</button>
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
  hero: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    background: 'linear-gradient(135deg, rgb(26, 61, 31) 0%, rgb(45, 122, 51) 100%)',
    borderRadius: 28, padding: '24px 28px',
  },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#d4dfd4' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#1a5c22',
    border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 40,
    padding: '8px 16px', flex: '0 1 280px',
  },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1a3d1f', flex: 1, fontFamily: 'inherit' },
  filterGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterBtn: {
    padding: '7px 16px', borderRadius: 999, border: '1px solid #e2e8e2',
    background: '#f2f4f2', color: '#415443', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  filterBtnActive: { background: '#2d7a33', color: '#fff', border: '1px solid #2d7a33' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  summaryCard: { borderRadius: 20, padding: '14px 18px' },
  summaryLabel: { margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' },
  summaryVal: { margin: '6px 0 0', fontSize: 18, fontWeight: 800 },
  tableCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#e8eee8' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2', transition: '0.15s' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1a3d1f' },
  codeTag: { background: '#e8eee8', color: '#2d7a33', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  typeBadge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  statusBadge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  toggleBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  empty: { textAlign: 'center', padding: 32, color: '#8aa88a', fontSize: 14 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#2d7a33', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

