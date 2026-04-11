'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { Users, Plus, Search, ChevronRight } from 'lucide-react'

const SEED_SUPPLIERS = [
  { id: 1, name: 'Ali Traders',       contact: '0300-1234567', totalBills: 450000, paid: 405000, outstanding: 45000, advance: 0,     aging: '30 days' },
  { id: 2, name: 'Khan Supplies',     contact: '0312-9876543', totalBills: 280000, paid: 140000, outstanding: 140000, advance: 5000, aging: '60 days' },
  { id: 3, name: 'Punjab Chemicals',  contact: '0333-5556677', totalBills: 890000, paid: 890000, outstanding: 0,      advance: 0,     aging: 'Clear' },
  { id: 4, name: 'National Packers',  contact: '0321-4445566', totalBills: 195000, paid: 100000, outstanding: 95000,  advance: 10000, aging: '90+ days' },
]

const SEED_BILLS = [
  { id: 'BILL-001', supplier: 'Ali Traders',      date: '2026-03-12', amount: 45000,  paid: 45000,  status: 'Paid' },
  { id: 'BILL-002', supplier: 'Khan Supplies',    date: '2026-03-20', amount: 140000, paid: 0,      status: 'Unpaid' },
  { id: 'BILL-003', supplier: 'Ali Traders',      date: '2026-04-01', amount: 45000,  paid: 0,      status: 'Unpaid' },
  { id: 'BILL-004', supplier: 'National Packers', date: '2026-01-15', amount: 95000,  paid: 0,      status: 'Overdue' },
]

const AGING_COLORS = { 'Clear': '#16a34a', '30 days': '#2d7a33', '60 days': '#b45309', '90+ days': '#dc2626' }
const DRAFT_KEY = 'accounts:payable:new'

export default function AccountsPayablePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [tab, setTab] = useState('suppliers')
  const [search, setSearch] = useState('')
  const [bills, setBills] = useState(SEED_BILLS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ supplier: '', date: '', amount: '', description: '' })

  const filteredSuppliers = SEED_SUPPLIERS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const filteredBills = bills.filter(b => b.supplier.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search))

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setBills((prev) => [
        ...prev,
        {
          id: `BILL-${String(prev.length + 1).padStart(3, '0')}`,
          supplier: draft.supplier,
          date: draft.date,
          amount: Number(draft.amount) || 0,
          paid: 0,
          status: 'Unpaid',
        },
      ])
    } catch {}
  }, [])

  const totalOutstanding = SEED_SUPPLIERS.reduce((s, x) => s + x.outstanding, 0)
  const totalAdvance = SEED_SUPPLIERS.reduce((s, x) => s + x.advance, 0)
  const fmt = n => '₨ ' + n.toLocaleString()

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><Users size={22} color="#2a6f31" /></div>
            <div>
              <h1 style={s.title}>Accounts Payable</h1>
              <p style={s.subtitle}>Supplier bills, outstanding payables, aging reports and advance payments</p>
            </div>
          </div>
          {isSuperuser && (
            <button style={s.addBtn} onClick={() => router.push('/accounts/payable/new')}>
              <Plus size={15} /> Record Bill
            </button>
          )}
        </section>

        {/* Summary */}
        <div style={s.summaryGrid}>
          <div style={s.sumCard}><p style={s.sumLabel}>Total Payables</p><p style={s.sumVal}>{fmt(SEED_SUPPLIERS.reduce((s,x) => s + x.totalBills, 0))}</p></div>
          <div style={{ ...s.sumCard, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ ...s.sumLabel, color: '#dc2626' }}>Outstanding</p>
            <p style={{ ...s.sumVal, color: '#dc2626' }}>{fmt(totalOutstanding)}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ ...s.sumLabel, color: '#16a34a' }}>Paid</p>
            <p style={{ ...s.sumVal, color: '#16a34a' }}>{fmt(SEED_SUPPLIERS.reduce((s,x) => s + x.paid, 0))}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p style={{ ...s.sumLabel, color: '#b45309' }}>Advances</p>
            <p style={{ ...s.sumVal, color: '#b45309' }}>{fmt(totalAdvance)}</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div style={s.toolbar}>
          <div style={s.tabs}>
            <button style={{ ...s.tab, ...(tab === 'suppliers' ? s.tabActive : {}) }} onClick={() => setTab('suppliers')}>Supplier Master</button>
            <button style={{ ...s.tab, ...(tab === 'bills' ? s.tabActive : {}) }} onClick={() => setTab('bills')}>Purchase Bills</button>
          </div>
          <div style={s.searchWrap}>
            <Search size={14} color="#7a8a7a" />
            <input style={s.searchInput} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Supplier Table */}
        {tab === 'suppliers' && (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Supplier</th>
                <th style={s.th}>Contact</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Total Bills</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Outstanding</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Advance</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Aging</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Statement</th>
              </tr></thead>
              <tbody>
                {filteredSuppliers.map(sup => (
                  <tr key={sup.id} style={s.trow}>
                    <td style={{ ...s.td, fontWeight: 700 }}>{sup.name}</td>
                    <td style={{ ...s.td, color: '#7a8a7a' }}>{sup.contact}</td>
                    <td style={{ ...s.td, textAlign: 'right' }}>{fmt(sup.totalBills)}</td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: sup.outstanding > 0 ? '#dc2626' : '#16a34a' }}>{fmt(sup.outstanding)}</td>
                    <td style={{ ...s.td, textAlign: 'right', color: '#b45309' }}>{fmt(sup.advance)}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.badge, color: AGING_COLORS[sup.aging] || '#415443', background: `${AGING_COLORS[sup.aging]}18` }}>{sup.aging}</span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <button style={s.linkBtn}>View <ChevronRight size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bills Table */}
        {tab === 'bills' && (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Bill #</th>
                <th style={s.th}>Supplier</th>
                <th style={s.th}>Date</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Paid</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
              </tr></thead>
              <tbody>
                {filteredBills.map(b => {
                  const statusColors = { Paid: { bg: '#f0fdf4', color: '#16a34a' }, Unpaid: { bg: '#e8eee8', color: '#2d7a33' }, Overdue: { bg: '#fef2f2', color: '#dc2626' } }
                  const sc = statusColors[b.status]
                  return (
                    <tr key={b.id} style={s.trow}>
                      <td style={s.td}><span style={s.voucherTag}>{b.id}</span></td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{b.supplier}</td>
                      <td style={{ ...s.td, color: '#7a8a7a' }}>{b.date}</td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>{fmt(b.amount)}</td>
                      <td style={{ ...s.td, textAlign: 'right', color: '#16a34a' }}>{fmt(b.paid)}</td>
                      <td style={{ ...s.td, textAlign: 'center' }}><span style={{ ...s.badge, ...sc }}>{b.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Bill Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>Record Purchase Bill</h3>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Supplier *</label>
                  <select style={s.input} value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}>
                    <option value="">Select supplier...</option>
                    {SEED_SUPPLIERS.map(s => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Date *</label><input type="date" style={s.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Amount (₨) *</label><input type="number" style={s.input} placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}><label style={s.label}>Description</label><input style={s.input} placeholder="Bill details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn}>Save Bill</button>
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
  addBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#5b21b6', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  sumCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 20, padding: '16px 20px' },
  sumLabel: { margin: 0, fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sumVal: { margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: '#1a3d1f' },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  tabs: { display: 'flex', gap: 0, background: '#e8eee8', borderRadius: 40, padding: 4 },
  tab: { padding: '8px 20px', borderRadius: 999, border: 'none', background: 'transparent', color: '#7a8a7a', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: '#2d7a33', color: '#fff' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 40, padding: '8px 16px', flex: '0 1 240px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1a3d1f', flex: 1, fontFamily: 'inherit' },
  tableCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#e8eee8' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1a3d1f' },
  badge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  voucherTag: { background: '#eef2ee', color: '#2a6f31', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  linkBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e8eee8', color: '#2d7a33', border: '1px solid #d4dfd4', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#2a6f31', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

