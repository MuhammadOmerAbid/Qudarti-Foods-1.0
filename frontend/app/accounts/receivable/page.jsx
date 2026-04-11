'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { UserCheck, Plus, Search, ChevronRight } from 'lucide-react'

const SEED_CUSTOMERS = [
  { id: 1, name: 'Khan & Sons',       contact: '0300-1112233', totalInvoices: 880000, received: 792000, outstanding: 88000,  creditLimit: 200000, aging: '30 days' },
  { id: 2, name: 'Rehman Traders',    contact: '0312-4445566', totalInvoices: 450000, received: 450000, outstanding: 0,      creditLimit: 100000, aging: 'Clear' },
  { id: 3, name: 'City Distributors', contact: '0333-7778899', totalInvoices: 1200000,received: 900000, outstanding: 300000, creditLimit: 350000, aging: '60 days' },
  { id: 4, name: 'Metro Wholesale',   contact: '0321-0001122', totalInvoices: 670000, received: 400000, outstanding: 270000, creditLimit: 150000, aging: '90+ days' },
]

const SEED_INVOICES = [
  { id: 'INV-001', customer: 'Khan & Sons',       date: '2026-03-15', dueDate: '2026-04-15', amount: 88000,  received: 0,      status: 'Unpaid' },
  { id: 'INV-002', customer: 'Rehman Traders',    date: '2026-03-01', dueDate: '2026-03-31', amount: 450000, received: 450000, status: 'Paid' },
  { id: 'INV-003', customer: 'City Distributors', date: '2026-02-10', dueDate: '2026-03-10', amount: 300000, received: 0,      status: 'Overdue' },
  { id: 'INV-004', customer: 'Metro Wholesale',   date: '2026-01-20', dueDate: '2026-02-20', amount: 270000, received: 0,      status: 'Overdue' },
]

const AGING_COLORS = { 'Clear': '#16a34a', '30 days': '#2d7a33', '60 days': '#b45309', '90+ days': '#dc2626' }
const DRAFT_KEY = 'accounts:receivable:new'

export default function AccountsReceivablePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [tab, setTab] = useState('customers')
  const [search, setSearch] = useState('')
  const [invoices, setInvoices] = useState(SEED_INVOICES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer: '', date: '', dueDate: '', amount: '', description: '' })

  const filteredCustomers = SEED_CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const filteredInvoices = invoices.filter(i => i.customer.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search))

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setInvoices((prev) => [
        ...prev,
        {
          id: `INV-${String(prev.length + 1).padStart(3, '0')}`,
          customer: draft.customer,
          date: draft.date,
          dueDate: draft.dueDate || draft.date,
          amount: Number(draft.amount) || 0,
          received: 0,
          status: 'Unpaid',
        },
      ])
    } catch {}
  }, [])

  const fmt = n => '₨ ' + n.toLocaleString()
  const totalOutstanding = SEED_CUSTOMERS.reduce((s, c) => s + c.outstanding, 0)
  const totalReceived = SEED_CUSTOMERS.reduce((s, c) => s + c.received, 0)

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><UserCheck size={22} color="#2d7a33" /></div>
            <div>
              <h1 style={s.title}>Accounts Receivable</h1>
              <p style={s.subtitle}>Customer invoices, collections, credit limits and aging reports</p>
            </div>
          </div>
          {isSuperuser && (
            <button style={s.addBtn} onClick={() => router.push('/accounts/receivable/new')}>
              <Plus size={15} /> New Invoice
            </button>
          )}
        </section>

        {/* Summary */}
        <div style={s.summaryGrid}>
          <div style={s.sumCard}><p style={s.sumLabel}>Total Invoiced</p><p style={s.sumVal}>{fmt(SEED_CUSTOMERS.reduce((s,c) => s + c.totalInvoices, 0))}</p></div>
          <div style={{ ...s.sumCard, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ ...s.sumLabel, color: '#16a34a' }}>Received</p>
            <p style={{ ...s.sumVal, color: '#16a34a' }}>{fmt(totalReceived)}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ ...s.sumLabel, color: '#dc2626' }}>Outstanding</p>
            <p style={{ ...s.sumVal, color: '#dc2626' }}>{fmt(totalOutstanding)}</p>
          </div>
          <div style={{ ...s.sumCard, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <p style={{ ...s.sumLabel, color: '#2d7a33' }}>Overdue</p>
            <p style={{ ...s.sumVal, color: '#2d7a33' }}>{fmt(SEED_CUSTOMERS.filter(c => c.aging === '90+ days').reduce((s,c) => s + c.outstanding, 0))}</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div style={s.toolbar}>
          <div style={s.tabs}>
            <button style={{ ...s.tab, ...(tab === 'customers' ? s.tabActive : {}) }} onClick={() => setTab('customers')}>Customer Master</button>
            <button style={{ ...s.tab, ...(tab === 'invoices' ? s.tabActive : {}) }} onClick={() => setTab('invoices')}>Sales Invoices</button>
          </div>
          <div style={s.searchWrap}>
            <Search size={14} color="#7a8a7a" />
            <input style={s.searchInput} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Customer Table */}
        {tab === 'customers' && (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Contact</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Total Invoiced</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Outstanding</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Credit Limit</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Aging</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Statement</th>
              </tr></thead>
              <tbody>
                {filteredCustomers.map(c => {
                  const overLimit = c.outstanding > c.creditLimit
                  return (
                    <tr key={c.id} style={s.trow}>
                      <td style={{ ...s.td, fontWeight: 700 }}>{c.name}</td>
                      <td style={{ ...s.td, color: '#7a8a7a' }}>{c.contact}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>{fmt(c.totalInvoices)}</td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: c.outstanding > 0 ? '#dc2626' : '#16a34a' }}>{fmt(c.outstanding)}</td>
                      <td style={{ ...s.td, textAlign: 'right', color: overLimit ? '#dc2626' : '#415443' }}>{fmt(c.creditLimit)}{overLimit && ' ⚠️'}</td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={{ ...s.badge, color: AGING_COLORS[c.aging] || '#415443', background: `${AGING_COLORS[c.aging]}18` }}>{c.aging}</span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <button style={s.linkBtn}>View <ChevronRight size={12} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoices Table */}
        {tab === 'invoices' && (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Invoice #</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Due Date</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Received</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
              </tr></thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const statusColors = { Paid: { bg: '#f0fdf4', color: '#16a34a' }, Unpaid: { bg: '#e8eee8', color: '#2d7a33' }, Overdue: { bg: '#fef2f2', color: '#dc2626' } }
                  const sc = statusColors[inv.status]
                  return (
                    <tr key={inv.id} style={s.trow}>
                      <td style={s.td}><span style={s.invTag}>{inv.id}</span></td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{inv.customer}</td>
                      <td style={{ ...s.td, color: '#7a8a7a' }}>{inv.date}</td>
                      <td style={{ ...s.td, color: inv.status === 'Overdue' ? '#dc2626' : '#7a8a7a' }}>{inv.dueDate}</td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>{fmt(inv.amount)}</td>
                      <td style={{ ...s.td, textAlign: 'right', color: '#16a34a' }}>{fmt(inv.received)}</td>
                      <td style={{ ...s.td, textAlign: 'center' }}><span style={{ ...s.badge, ...sc }}>{inv.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>New Sales Invoice</h3>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Customer *</label>
                  <select style={s.input} value={form.customer} onChange={e => setForm({...form, customer: e.target.value})}>
                    <option value="">Select customer...</option>
                    {SEED_CUSTOMERS.map(c => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Invoice Date *</label><input type="date" style={s.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Due Date</label><input type="date" style={s.input} value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Amount (₨) *</label><input type="number" style={s.input} placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}><label style={s.label}>Description</label><input style={s.input} placeholder="Invoice details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn}>Save Invoice</button>
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
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#bae6fd' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#075985', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
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
  thead: { background: '#f0f9ff' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1a3d1f' },
  badge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  invTag: { background: '#f0f9ff', color: '#2d7a33', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  linkBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f9ff', color: '#2d7a33', border: '1px solid #bae6fd', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#2d7a33', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

