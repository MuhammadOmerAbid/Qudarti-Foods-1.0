'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { Stamp, Plus, Search, Printer } from 'lucide-react'

const VOUCHER_TYPES = ['Payment Voucher', 'Receipt Voucher', 'Journal Voucher']

const SEED_VOUCHERS = [
  { id: 'PV-001', type: 'Payment Voucher',  date: '2026-04-02', amount: 350000, account: 'HBL Current Account', party: 'Staff Salaries',    narration: 'April 2026 payroll disbursement', status: 'Posted' },
  { id: 'PV-002', type: 'Payment Voucher',  date: '2026-04-05', amount: 12500,  account: 'Cash in Hand',        party: 'WAPDA',              narration: 'Electricity bill April',          status: 'Posted' },
  { id: 'RV-001', type: 'Receipt Voucher',  date: '2026-04-01', amount: 88000,  account: 'HBL Current Account', party: 'Khan & Sons',        narration: 'Invoice INV-001 partial payment', status: 'Posted' },
  { id: 'RV-002', type: 'Receipt Voucher',  date: '2026-04-08', amount: 300000, account: 'HBL Current Account', party: 'City Distributors',  narration: 'Invoice settlement',              status: 'Posted' },
  { id: 'JV-001', type: 'Journal Voucher',  date: '2026-04-03', amount: 75000,  account: 'Multiple',            party: 'Adjustment',         narration: 'Depreciation adjustment Q1',      status: 'Posted' },
  { id: 'PV-003', type: 'Payment Voucher',  date: '2026-04-07', amount: 8000,   account: 'Petty Cash',          party: 'Office Supplies',    narration: 'Stationery and misc items',       status: 'Draft' },
]

const VOUCHER_COLORS = {
  'Payment Voucher': { bg: '#fef2f2', color: '#dc2626', tag: '#fecaca' },
  'Receipt Voucher': { bg: '#f0fdf4', color: '#16a34a', tag: '#bbf7d0' },
  'Journal Voucher': { bg: '#eef2ee', color: '#2a6f31', tag: '#d4dfd4' },
}

const DRAFT_KEY = 'accounts:vouchers:new'
const PRINT_KEY = 'accounts:vouchers:print'

export default function VouchersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [vouchers, setVouchers] = useState(SEED_VOUCHERS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [printVoucher, setPrintVoucher] = useState(null)
  const [form, setForm] = useState({ type: 'Payment Voucher', date: '', amount: '', account: '', party: '', narration: '' })

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setVouchers((prev) => {
        const prefix = draft.type === 'Payment Voucher' ? 'PV' : draft.type === 'Receipt Voucher' ? 'RV' : 'JV'
        const count = prev.filter((voucher) => voucher.type === draft.type).length + 1
        return [
          ...prev,
          {
            id: `${prefix}-${String(count).padStart(3, '0')}`,
            ...draft,
            amount: Number(draft.amount) || 0,
            status: 'Draft',
          },
        ]
      })
    } catch {}
  }, [])

  const filtered = vouchers.filter(v => {
    const matchSearch = v.party.toLowerCase().includes(search.toLowerCase()) || v.id.includes(search) || v.narration.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'All' || v.type === filterType
    return matchSearch && matchType
  })

  const handleSave = () => {
    if (!form.date || !form.amount || !form.party) return
    const prefix = form.type === 'Payment Voucher' ? 'PV' : form.type === 'Receipt Voucher' ? 'RV' : 'JV'
    const count = vouchers.filter(v => v.type === form.type).length + 1
    const newV = { id: `${prefix}-${String(count).padStart(3,'0')}`, ...form, amount: Number(form.amount), status: 'Draft' }
    setVouchers(prev => [...prev, newV])
    setForm({ type: 'Payment Voucher', date: '', amount: '', account: '', party: '', narration: '' })
    setShowModal(false)
  }

  const fmt = n => '₨ ' + n.toLocaleString()

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><Stamp size={22} color="#2a6f31" /></div>
            <div>
              <h1 style={s.title}>Voucher Management</h1>
              <p style={s.subtitle}>Payment, Receipt and Journal vouchers with printable format</p>
            </div>
          </div>
          {isSuperuser && (
            <button style={s.addBtn} onClick={() => router.push('/accounts/vouchers/new')}>
              <Plus size={15} /> New Voucher
            </button>
          )}
        </section>

        {/* Summary */}
        <div style={s.summaryGrid}>
          {VOUCHER_TYPES.map(type => {
            const c = VOUCHER_COLORS[type]
            const total = vouchers.filter(v => v.type === type).reduce((s,v) => s + v.amount, 0)
            const count = vouchers.filter(v => v.type === type).length
            return (
              <div key={type} style={{ ...s.sumCard, background: c.bg, border: `1px solid ${c.tag}` }}>
                <p style={{ ...s.sumLabel, color: c.color }}>{type}</p>
                <p style={{ ...s.sumVal, color: c.color }}>{fmt(total)}</p>
                <p style={{ ...s.sumSub, color: c.color + 'aa' }}>{count} vouchers</p>
              </div>
            )
          })}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.tabs}>
            {['All', ...VOUCHER_TYPES].map(t => (
              <button key={t} style={{ ...s.tab, ...(filterType === t ? s.tabActive : {}) }} onClick={() => setFilterType(t)}>
                {t === 'All' ? 'All Vouchers' : t}
              </button>
            ))}
          </div>
          <div style={s.searchWrap}>
            <Search size={14} color="#7a8a7a" />
            <input style={s.searchInput} placeholder="Search vouchers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr style={s.thead}>
              <th style={s.th}>Voucher #</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Party / Description</th>
              <th style={s.th}>Account</th>
              <th style={s.th}>Narration</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Print</th>
            </tr></thead>
            <tbody>
              {filtered.map(v => {
                const c = VOUCHER_COLORS[v.type]
                return (
                  <tr key={v.id} style={s.trow}>
                    <td style={s.td}><span style={{ ...s.vTag, background: c.tag, color: c.color }}>{v.id}</span></td>
                    <td style={s.td}><span style={{ ...s.typeBadge, background: c.bg, color: c.color }}>{v.type.replace(' Voucher','')}</span></td>
                    <td style={{ ...s.td, color: '#7a8a7a' }}>{v.date}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{v.party}</td>
                    <td style={{ ...s.td, color: '#7a8a7a', fontSize: 12 }}>{v.account}</td>
                    <td style={{ ...s.td, color: '#415443', maxWidth: 200 }}><span style={s.narrationClamp}>{v.narration}</span></td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: c.color }}>{fmt(v.amount)}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.badge, background: v.status === 'Posted' ? '#f0fdf4' : '#fffbeb', color: v.status === 'Posted' ? '#16a34a' : '#b45309' }}>{v.status}</span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <button
                        style={s.printBtn}
                        onClick={() => {
                          sessionStorage.setItem(PRINT_KEY, JSON.stringify(v))
                          router.push(`/accounts/vouchers/print?id=${encodeURIComponent(v.id)}`)
                        }}
                        title="Print Voucher"
                      >
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={s.empty}>No vouchers found.</p>}
        </div>

        {/* New Voucher Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>Create New Voucher</h3>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Voucher Type *</label>
                  <select style={s.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {VOUCHER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Date *</label><input type="date" style={s.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Party / Description *</label><input style={s.input} placeholder="e.g. Supplier name, Staff" value={form.party} onChange={e => setForm({...form, party: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Amount (₨) *</label><input type="number" style={s.input} placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Account</label><input style={s.input} placeholder="e.g. HBL Current Account" value={form.account} onChange={e => setForm({...form, account: e.target.value})} /></div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}><label style={s.label}>Narration</label><input style={s.input} placeholder="Purpose of this voucher..." value={form.narration} onChange={e => setForm({...form, narration: e.target.value})} /></div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleSave}>Save Voucher</button>
              </div>
            </div>
          </div>
        )}

        {/* Print Preview Modal */}
        {printVoucher && (
          <div style={s.modalOverlay} onClick={() => setPrintVoucher(null)}>
            <div style={s.printModal} onClick={e => e.stopPropagation()}>
              <div style={s.printHeader}>
                <h2 style={s.printCompany}>Qudrati Foods</h2>
                <h3 style={s.printVoucherType}>{printVoucher.type}</h3>
                <p style={s.printVoucherNo}>Voucher # {printVoucher.id}</p>
              </div>
              <div style={s.printBody}>
                <div style={s.printRow}><span style={s.printLabel}>Date</span><span style={s.printVal}>{printVoucher.date}</span></div>
                <div style={s.printRow}><span style={s.printLabel}>Party</span><span style={s.printVal}>{printVoucher.party}</span></div>
                <div style={s.printRow}><span style={s.printLabel}>Account</span><span style={s.printVal}>{printVoucher.account}</span></div>
                <div style={s.printRow}><span style={s.printLabel}>Narration</span><span style={s.printVal}>{printVoucher.narration}</span></div>
                <div style={s.printRow}><span style={s.printLabel}>Amount</span><span style={{ ...s.printVal, fontSize: 18, fontWeight: 800, color: '#1a3d1f' }}>{fmt(printVoucher.amount)}</span></div>
              </div>
              <div style={s.printSigs}>
                <div style={s.sigBox}><div style={s.sigLine} /><p style={s.sigLabel}>Prepared By</p></div>
                <div style={s.sigBox}><div style={s.sigLine} /><p style={s.sigLabel}>Approved By</p></div>
                <div style={s.sigBox}><div style={s.sigLine} /><p style={s.sigLabel}>Received By</p></div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setPrintVoucher(null)}>Close</button>
                <button style={s.saveBtn} onClick={() => window.print()}>🖨️ Print</button>
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
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 },
  sumCard: { borderRadius: 20, padding: '16px 20px' },
  sumLabel: { margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
  sumVal: { margin: '6px 0 0', fontSize: 22, fontWeight: 800 },
  sumSub: { margin: '4px 0 0', fontSize: 11 },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  tabs: { display: 'flex', gap: 0, background: '#e8eee8', borderRadius: 40, padding: 4, flexWrap: 'wrap' },
  tab: { padding: '7px 16px', borderRadius: 999, border: 'none', background: 'transparent', color: '#7a8a7a', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: '#2a6f31', color: '#fff' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 40, padding: '8px 16px', flex: '0 1 240px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1a3d1f', flex: 1, fontFamily: 'inherit' },
  tableCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#eef2ee' },
  th: { padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '11px 14px', fontSize: 13, color: '#1a3d1f' },
  vTag: { borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  typeBadge: { borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 },
  badge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  narrationClamp: { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  printBtn: { background: '#eef2ee', border: '1px solid #d4dfd4', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#2a6f31', display: 'inline-flex', alignItems: 'center' },
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
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#2a6f31', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  printModal: { background: '#fff', borderRadius: 24, padding: 36, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  printHeader: { textAlign: 'center', borderBottom: '2px solid #e2e8e2', paddingBottom: 20, marginBottom: 20 },
  printCompany: { margin: 0, fontSize: 22, fontWeight: 800, color: '#1a3d1f' },
  printVoucherType: { margin: '6px 0 0', fontSize: 16, fontWeight: 700, color: '#2a6f31' },
  printVoucherNo: { margin: '4px 0 0', fontSize: 13, color: '#7a8a7a' },
  printBody: { display: 'flex', flexDirection: 'column', gap: 14 },
  printRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8eee8' },
  printLabel: { fontSize: 13, color: '#7a8a7a', fontWeight: 600 },
  printVal: { fontSize: 13, fontWeight: 500, color: '#1a3d1f' },
  printSigs: { display: 'flex', gap: 20, marginTop: 32 },
  sigBox: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  sigLine: { width: '100%', height: 1, background: '#1a3d1f' },
  sigLabel: { margin: 0, fontSize: 11, color: '#7a8a7a', fontWeight: 600 },
}

