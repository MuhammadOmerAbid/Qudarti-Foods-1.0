'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { Receipt, Plus, Search, CheckCircle, Clock, XCircle } from 'lucide-react'

const CATEGORIES = ['Utilities', 'Salaries', 'Maintenance', 'Office Supplies', 'Fuel & Transport', 'Rent', 'Marketing', 'Miscellaneous']

const SEED_EXPENSES = [
  { id: 'EXP-001', date: '2026-04-01', category: 'Salaries',        description: 'April payroll',          amount: 350000, account: '5100 - Salaries Expense',  status: 'Approved',  approvedBy: 'Admin' },
  { id: 'EXP-002', date: '2026-04-05', category: 'Utilities',       description: 'WAPDA electricity bill',  amount: 12500,  account: '5200 - Utilities Expense', status: 'Approved',  approvedBy: 'Admin' },
  { id: 'EXP-003', date: '2026-04-07', category: 'Office Supplies', description: 'Stationery and printing', amount: 3500,   account: '5400 - Office Expense',    status: 'Pending',   approvedBy: '—' },
  { id: 'EXP-004', date: '2026-04-08', category: 'Maintenance',     description: 'Machine repair parts',    amount: 28000,  account: '5300 - Maintenance',       status: 'Pending',   approvedBy: '—' },
  { id: 'EXP-005', date: '2026-03-28', category: 'Fuel & Transport', description: 'Delivery vehicle fuel',  amount: 8500,   account: '5500 - Transport Expense', status: 'Approved',  approvedBy: 'Admin' },
  { id: 'EXP-006', date: '2026-03-25', category: 'Rent',            description: 'Factory premises rent',   amount: 75000,  account: '5600 - Rent Expense',      status: 'Approved',  approvedBy: 'Admin' },
]

const STATUS_COLORS = {
  Approved: { bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle },
  Pending:  { bg: '#fffbeb', color: '#b45309', icon: Clock },
  Rejected: { bg: '#fef2f2', color: '#dc2626', icon: XCircle },
}

const DRAFT_KEY = 'accounts:expenses:new'

export default function ExpensesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [expenses, setExpenses] = useState(SEED_EXPENSES)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ date: '', category: 'Utilities', description: '', amount: '', account: '' })

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setExpenses((prev) => [
        ...prev,
        {
          id: `EXP-${String(prev.length + 1).padStart(3, '0')}`,
          ...draft,
          amount: Number(draft.amount) || 0,
          status: 'Pending',
          approvedBy: '-',
        },
      ])
    } catch {}
  }, [])

  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
    const matchCat = filterCat === 'All' || e.category === filterCat
    return matchSearch && matchCat
  })

  const approve = (id) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'Approved', approvedBy: user?.username || 'Admin' } : e))
  const reject  = (id) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'Rejected' } : e))

  const fmt = n => '₨ ' + n.toLocaleString()
  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s,e) => s + e.amount, 0)
  const totalPending  = expenses.filter(e => e.status === 'Pending').reduce((s,e) => s + e.amount, 0)

  const handleAdd = () => {
    if (!form.date || !form.description || !form.amount) return
    const newExp = { id: `EXP-${String(expenses.length + 1).padStart(3,'0')}`, ...form, amount: Number(form.amount), status: 'Pending', approvedBy: '—' }
    setExpenses(prev => [...prev, newExp])
    setForm({ date: '', category: 'Utilities', description: '', amount: '', account: '' })
    setShowModal(false)
  }

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><Receipt size={22} color="#b45309" /></div>
            <div>
              <h1 style={s.title}>Expense Management</h1>
              <p style={s.subtitle}>Factory and office expenses, categorized and approval-controlled</p>
            </div>
          </div>
          {isSuperuser && (
            <button style={s.addBtn} onClick={() => router.push('/accounts/expenses/new')}>
              <Plus size={15} /> Record Expense
            </button>
          )}
        </section>

        {/* Summary */}
        <div style={s.summaryGrid}>
          <div style={s.sumCard}><p style={s.sumLabel}>Total Expenses</p><p style={s.sumVal}>{fmt(expenses.reduce((s,e) => s + e.amount, 0))}</p></div>
          <div style={{ ...s.sumCard, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ ...s.sumLabel, color: '#16a34a' }}>Approved</p>
            <p style={{ ...s.sumVal, color: '#16a34a' }}>{fmt(totalApproved)}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p style={{ ...s.sumLabel, color: '#b45309' }}>Pending Approval</p>
            <p style={{ ...s.sumVal, color: '#b45309' }}>{fmt(totalPending)}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ ...s.sumLabel, color: '#dc2626' }}>This Month</p>
            <p style={{ ...s.sumVal, color: '#dc2626' }}>{fmt(expenses.filter(e => e.date.startsWith('2026-04')).reduce((s,e) => s + e.amount, 0))}</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div style={s.catGrid}>
          {CATEGORIES.map(cat => {
            const total = expenses.filter(e => e.category === cat).reduce((s,e) => s + e.amount, 0)
            if (!total) return null
            return (
              <div key={cat} style={s.catCard}>
                <p style={s.catName}>{cat}</p>
                <p style={s.catAmt}>{fmt(total)}</p>
              </div>
            )
          })}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <Search size={14} color="#7a8a7a" />
            <input style={s.searchInput} placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={s.filterGroup}>
            {['All', ...CATEGORIES].map(c => (
              <button key={c} style={{ ...s.filterBtn, ...(filterCat === c ? s.filterBtnActive : {}) }} onClick={() => setFilterCat(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              <th style={s.th}>Exp #</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Description</th>
              <th style={s.th}>Account</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
              {isSuperuser && <th style={{ ...s.th, textAlign: 'center' }}>Actions</th>}
            </tr></thead>
            <tbody>
              {filtered.map(e => {
                const sc = STATUS_COLORS[e.status]
                return (
                  <tr key={e.id} style={s.trow}>
                    <td style={s.td}><span style={s.expTag}>{e.id}</span></td>
                    <td style={{ ...s.td, color: '#7a8a7a' }}>{e.date}</td>
                    <td style={s.td}><span style={s.catBadge}>{e.category}</span></td>
                    <td style={{ ...s.td, color: '#415443' }}>{e.description}</td>
                    <td style={{ ...s.td, color: '#7a8a7a', fontSize: 12 }}>{e.account}</td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>{fmt(e.amount)}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>{e.status}</span>
                    </td>
                    {isSuperuser && (
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        {e.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button style={s.approveBtn} onClick={() => approve(e.id)}>✓ Approve</button>
                            <button style={s.rejectBtn} onClick={() => reject(e.id)}>✗</button>
                          </div>
                        ) : <span style={{ color: '#8aa88a', fontSize: 12 }}>{e.approvedBy}</span>}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={s.empty}>No expenses found.</p>}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>Record Expense</h3>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Date *</label><input type="date" style={s.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Category *</label>
                  <select style={s.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}><label style={s.label}>Description *</label><input style={s.input} placeholder="Expense details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Amount (₨) *</label><input type="number" style={s.input} placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Account Code</label><input style={s.input} placeholder="e.g. 5200 - Utilities" value={form.account} onChange={e => setForm({...form, account: e.target.value})} /></div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleAdd}>Save Expense</button>
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
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#fde68a' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#92400e', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  sumCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 20, padding: '16px 20px' },
  sumLabel: { margin: 0, fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sumVal: { margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: '#1a3d1f' },
  catGrid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  catCard: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '10px 16px', minWidth: 140 },
  catName: { margin: 0, fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase' },
  catAmt: { margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: '#b45309' },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 40, padding: '8px 16px', flex: '0 1 260px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1a3d1f', flex: 1, fontFamily: 'inherit' },
  filterGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  filterBtnActive: { background: '#b45309', color: '#fff', border: '1px solid #b45309' },
  tableCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#fffbeb' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1a3d1f' },
  expTag: { background: '#fffbeb', color: '#b45309', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  catBadge: { background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 },
  badge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  approveBtn: { padding: '4px 12px', borderRadius: 999, border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  rejectBtn: { padding: '4px 10px', borderRadius: 999, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  empty: { textAlign: 'center', padding: 32, color: '#8aa88a', fontSize: 14 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#b45309', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

