'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { Banknote, Search, ArrowDownLeft, ArrowUpRight, RefreshCcw } from 'lucide-react'

const ACCOUNTS = [
  { id: 1, name: 'Cash in Hand',        type: 'Cash', balance: 25000,   accountNo: '—',           bank: '—' },
  { id: 2, name: 'Petty Cash',           type: 'Cash', balance: 5000,    accountNo: '—',           bank: '—' },
  { id: 3, name: 'HBL Current Account', type: 'Bank', balance: 2800000, accountNo: '0123-456789', bank: 'HBL' },
  { id: 4, name: 'MCB Savings Account', type: 'Bank', balance: 450000,  accountNo: '9876-543210', bank: 'MCB' },
]

const SEED_TXN = [
  { id: 'TXN-001', date: '2026-04-01', account: 'HBL Current Account', type: 'Credit', amount: 88000,  description: 'Customer payment - Khan & Sons',  balance: 2888000 },
  { id: 'TXN-002', date: '2026-04-02', account: 'HBL Current Account', type: 'Debit',  amount: 350000, description: 'Salary disbursement April',        balance: 2538000 },
  { id: 'TXN-003', date: '2026-04-05', account: 'Cash in Hand',        type: 'Debit',  amount: 12500,  description: 'Utility bill - WAPDA',             balance: 12500 },
  { id: 'TXN-004', date: '2026-04-07', account: 'Petty Cash',          type: 'Debit',  amount: 2000,   description: 'Office supplies',                  balance: 3000 },
  { id: 'TXN-005', date: '2026-04-08', account: 'HBL Current Account', type: 'Credit', amount: 300000, description: 'Customer payment - City Distributors', balance: 2838000 },
]

const DRAFT_KEY = 'accounts:cash-bank:new'

export default function CashBankPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [tab, setTab] = useState('accounts')
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState(SEED_TXN)
  const [showModal, setShowModal] = useState(false)
  const [txnType, setTxnType] = useState('receipt')
  const [form, setForm] = useState({ account: '', amount: '', date: '', description: '' })

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw)
      setTransactions((prev) => {
        const nextId = `TXN-${String(prev.length + 1).padStart(3, '0')}`
        const lastBalance = prev.length ? prev[prev.length - 1].balance : 0
        const amount = Number(draft.amount) || 0
        const newBalance = draft.type === 'Credit' ? lastBalance + amount : Math.max(0, lastBalance - amount)
        return [
          ...prev,
          {
            id: nextId,
            date: draft.date,
            account: draft.account,
            type: draft.type,
            amount,
            description: draft.description || '',
            balance: newBalance,
          },
        ]
      })
    } catch {}
  }, [])

  const fmt = n => '₨ ' + n.toLocaleString()
  const totalCash = ACCOUNTS.filter(a => a.type === 'Cash').reduce((s,a) => s + a.balance, 0)
  const totalBank = ACCOUNTS.filter(a => a.type === 'Bank').reduce((s,a) => s + a.balance, 0)
  const filteredTxn = transactions.filter(t => t.account.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><Banknote size={22} color="#0f766e" /></div>
            <div>
              <h1 style={s.title}>Cash & Bank Management</h1>
              <p style={s.subtitle}>Multiple cash accounts, bank accounts, petty cash and reconciliation</p>
            </div>
          </div>
          {isSuperuser && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.addBtnGreen} onClick={() => router.push('/accounts/cash-bank/new?type=receipt')}>
                <ArrowDownLeft size={15} /> Receipt
              </button>
              <button style={s.addBtnRed} onClick={() => router.push('/accounts/cash-bank/new?type=payment')}>
                <ArrowUpRight size={15} /> Payment
              </button>
            </div>
          )}
        </section>

        {/* Summary */}
        <div style={s.summaryGrid}>
          <div style={{ ...s.sumCard, background: '#f0fdfa', border: '1px solid #99f6e4' }}>
            <p style={{ ...s.sumLabel, color: '#0f766e' }}>Total Cash</p>
            <p style={{ ...s.sumVal, color: '#0f766e' }}>{fmt(totalCash)}</p>
            <p style={s.sumSub}>{ACCOUNTS.filter(a => a.type === 'Cash').length} cash accounts</p>
          </div>
          <div style={{ ...s.sumCard, background: '#e8eee8', border: '1px solid #d4dfd4' }}>
            <p style={{ ...s.sumLabel, color: '#2a6f31' }}>Total Bank</p>
            <p style={{ ...s.sumVal, color: '#2a6f31' }}>{fmt(totalBank)}</p>
            <p style={s.sumSub}>{ACCOUNTS.filter(a => a.type === 'Bank').length} bank accounts</p>
          </div>
          <div style={s.sumCard}>
            <p style={s.sumLabel}>Total Balance</p>
            <p style={s.sumVal}>{fmt(totalCash + totalBank)}</p>
            <p style={s.sumSub}>All accounts combined</p>
          </div>
          <div style={{ ...s.sumCard, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p style={{ ...s.sumLabel, color: '#b45309' }}>Petty Cash</p>
            <p style={{ ...s.sumVal, color: '#b45309' }}>{fmt(ACCOUNTS.find(a => a.name === 'Petty Cash')?.balance || 0)}</p>
            <p style={s.sumSub}>Office petty fund</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.toolbar}>
          <div style={s.tabs}>
            <button style={{ ...s.tab, ...(tab === 'accounts' ? s.tabActive : {}) }} onClick={() => setTab('accounts')}>Accounts</button>
            <button style={{ ...s.tab, ...(tab === 'transactions' ? s.tabActive : {}) }} onClick={() => setTab('transactions')}>Transactions</button>
            <button style={{ ...s.tab, ...(tab === 'reconcile' ? s.tabActive : {}) }} onClick={() => setTab('reconcile')}>Reconciliation</button>
          </div>
          {tab === 'transactions' && (
            <div style={s.searchWrap}>
              <Search size={14} color="#7a8a7a" />
              <input style={s.searchInput} placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {/* Accounts Tab */}
        {tab === 'accounts' && (
          <div style={s.acctGrid}>
            {ACCOUNTS.map(acc => (
              <div key={acc.id} style={{ ...s.acctCard, border: `1px solid ${acc.type === 'Bank' ? '#d4dfd4' : '#99f6e4'}` }}>
                <div style={s.acctTop}>
                  <span style={{ ...s.acctTypeBadge, background: acc.type === 'Bank' ? '#e8eee8' : '#f0fdfa', color: acc.type === 'Bank' ? '#2a6f31' : '#0f766e' }}>{acc.type}</span>
                  <Banknote size={18} color={acc.type === 'Bank' ? '#2a6f31' : '#0f766e'} />
                </div>
                <p style={s.acctName}>{acc.name}</p>
                {acc.bank !== '—' && <p style={s.acctSub}>{acc.bank} · {acc.accountNo}</p>}
                <p style={{ ...s.acctBalance, color: acc.type === 'Bank' ? '#2a6f31' : '#0f766e' }}>{fmt(acc.balance)}</p>
                <button style={{ ...s.acctBtn, color: acc.type === 'Bank' ? '#2a6f31' : '#0f766e' }}>View Ledger</button>
              </div>
            ))}
          </div>
        )}

        {/* Transactions Tab */}
        {tab === 'transactions' && (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Txn #</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Account</th>
                <th style={s.th}>Description</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Type</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Balance</th>
              </tr></thead>
              <tbody>
                {filteredTxn.map(t => (
                  <tr key={t.id} style={s.trow}>
                    <td style={s.td}><span style={s.txnTag}>{t.id}</span></td>
                    <td style={{ ...s.td, color: '#7a8a7a' }}>{t.date}</td>
                    <td style={{ ...s.td, fontWeight: 500 }}>{t.account}</td>
                    <td style={{ ...s.td, color: '#7a8a7a' }}>{t.description}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.badge, background: t.type === 'Credit' ? '#f0fdf4' : '#fef2f2', color: t.type === 'Credit' ? '#16a34a' : '#dc2626' }}>
                        {t.type === 'Credit' ? '↓ ' : '↑ '}{t.type}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: t.type === 'Credit' ? '#16a34a' : '#dc2626' }}>{fmt(t.amount)}</td>
                    <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>{fmt(t.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reconciliation Tab */}
        {tab === 'reconcile' && (
          <div style={s.reconcileCard}>
            <div style={s.reconcileHead}>
              <RefreshCcw size={20} color="#0f766e" />
              <h3 style={s.reconcileTitle}>Bank Reconciliation</h3>
            </div>
            <p style={s.reconcileSub}>Match your bank statement with system records to identify discrepancies.</p>
            <div style={s.reconcileGrid}>
              <div style={s.reconcileBox}>
                <p style={s.rBoxLabel}>Book Balance (System)</p>
                <p style={s.rBoxVal}>{fmt(totalBank)}</p>
              </div>
              <div style={s.reconcileBox}>
                <p style={s.rBoxLabel}>Bank Statement Balance</p>
                <input style={s.reconcileInput} type="number" placeholder="Enter bank balance..." />
              </div>
            </div>
            <div style={s.reconcileActions}>
              <button style={s.uploadBtn}>📄 Upload Bank Statement (CSV)</button>
              <button style={s.reconcileBtn}>Start Reconciliation</button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>{txnType === 'receipt' ? 'Cash / Bank Receipt' : 'Cash / Bank Payment'}</h3>
              <div style={s.formGrid}>
                <div style={s.field}><label style={s.label}>Account *</label>
                  <select style={s.input} value={form.account} onChange={e => setForm({...form, account: e.target.value})}>
                    <option value="">Select account...</option>
                    {ACCOUNTS.map(a => <option key={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div style={s.field}><label style={s.label}>Date *</label><input type="date" style={s.input} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div style={s.field}><label style={s.label}>Amount (₨) *</label><input type="number" style={s.input} placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}><label style={s.label}>Description</label><input style={s.input} placeholder="Transaction details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={{ ...s.saveBtn, background: txnType === 'receipt' ? '#16a34a' : '#dc2626' }}>Save {txnType === 'receipt' ? 'Receipt' : 'Payment'}</button>
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
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#ccfbf1' },
  addBtnGreen: { display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#0f766e', border: 'none', borderRadius: '999px', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  addBtnRed: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '999px', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  sumCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 20, padding: '16px 20px' },
  sumLabel: { margin: 0, fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sumVal: { margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: '#1a3d1f' },
  sumSub: { margin: '4px 0 0', fontSize: 11, color: '#8aa88a' },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  tabs: { display: 'flex', gap: 0, background: '#e8eee8', borderRadius: 40, padding: 4 },
  tab: { padding: '8px 20px', borderRadius: 999, border: 'none', background: 'transparent', color: '#7a8a7a', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: '#0f766e', color: '#fff' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 40, padding: '8px 16px', flex: '0 1 240px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1a3d1f', flex: 1, fontFamily: 'inherit' },
  acctGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  acctCard: { background: '#f2f4f2', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 },
  acctTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  acctTypeBadge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 },
  acctName: { margin: 0, fontSize: 15, fontWeight: 800, color: '#1a3d1f' },
  acctSub: { margin: 0, fontSize: 12, color: '#7a8a7a' },
  acctBalance: { margin: '4px 0 0', fontSize: 24, fontWeight: 800 },
  acctBtn: { marginTop: 4, background: '#fff', border: '1px solid #e2e8e2', borderRadius: 999, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
  tableCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f0fdfa' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1a3d1f' },
  txnTag: { background: '#f0fdfa', color: '#0f766e', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
  badge: { borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 },
  reconcileCard: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, padding: 28 },
  reconcileHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  reconcileTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  reconcileSub: { margin: '0 0 24px', fontSize: 13, color: '#7a8a7a' },
  reconcileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  reconcileBox: { background: '#fff', border: '1px solid #e2e8e2', borderRadius: 16, padding: '16px 20px' },
  rBoxLabel: { margin: 0, fontSize: 12, fontWeight: 600, color: '#7a8a7a', textTransform: 'uppercase' },
  rBoxVal: { margin: '8px 0 0', fontSize: 22, fontWeight: 800, color: '#0f766e' },
  reconcileInput: { marginTop: 8, width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  reconcileActions: { display: 'flex', gap: 12 },
  uploadBtn: { padding: '10px 22px', borderRadius: 999, border: '1px dashed #d4dfd4', background: 'transparent', color: '#2d7a33', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  reconcileBtn: { padding: '10px 28px', borderRadius: 999, border: 'none', background: '#0f766e', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

