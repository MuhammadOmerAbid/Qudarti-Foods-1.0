'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AccountLayout from '@/components/accounts/AccountLayout'
import { BarChart3, Download, Calendar, FileText } from 'lucide-react'

const REPORT_TYPES = [
  { id: 'trial-balance',  label: 'Trial Balance',         icon: '⚖️' },
  { id: 'pl',             label: 'Profit & Loss',         icon: '📈' },
  { id: 'balance-sheet',  label: 'Balance Sheet',         icon: '🏦' },
  { id: 'cash-flow',      label: 'Cash Flow Statement',   icon: '💧' },
  { id: 'ledger',         label: 'General Ledger Report', icon: '📒' },
  { id: 'daybook',        label: 'Day Book',              icon: '📅' },
  { id: 'supplier-ledger',label: 'Supplier Ledger',       icon: '🏭' },
  { id: 'customer-ledger',label: 'Customer Ledger',       icon: '🤝' },
]

const TRIAL_BALANCE = [
  { account: '1110 - Cash in Hand',        debit: 25000,   credit: 0 },
  { account: '1120 - Bank Account - HBL',  debit: 2800000, credit: 0 },
  { account: '1200 - Fixed Assets',        debit: 1800000, credit: 0 },
  { account: '2100 - Accounts Payable',    debit: 0,       credit: 2100000 },
  { account: '3000 - Owner Equity',        debit: 0,       credit: 2900000 },
  { account: '4100 - Sales Revenue',       debit: 0,       credit: 8500000 },
  { account: '5100 - Salaries Expense',    debit: 3500000, credit: 0 },
  { account: '5200 - Utilities Expense',   debit: 450000,  credit: 0 },
  { account: '5300 - Maintenance',         debit: 250000,  credit: 0 },
  { account: '5600 - Rent Expense',        debit: 675000,  credit: 0 },
]

const PL_DATA = {
  revenue: [
    { label: 'Sales Revenue', amount: 8500000 },
  ],
  expenses: [
    { label: 'Salaries Expense',  amount: 3500000 },
    { label: 'Utilities Expense', amount: 450000 },
    { label: 'Maintenance',       amount: 250000 },
    { label: 'Rent Expense',      amount: 675000 },
    { label: 'Other Expenses',    amount: 875000 },
  ],
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('trial-balance')
  const [dateFrom, setDateFrom] = useState('2026-04-01')
  const [dateTo, setDateTo] = useState('2026-04-30')

  const fmt = n => '₨ ' + n.toLocaleString()
  const totalDr = TRIAL_BALANCE.reduce((s, r) => s + r.debit, 0)
  const totalCr = TRIAL_BALANCE.reduce((s, r) => s + r.credit, 0)
  const totalRev = PL_DATA.revenue.reduce((s, r) => s + r.amount, 0)
  const totalExp = PL_DATA.expenses.reduce((s, r) => s + r.amount, 0)
  const netProfit = totalRev - totalExp

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><BarChart3 size={22} color="#0e7490" /></div>
            <div>
              <h1 style={s.title}>Financial Reports</h1>
              <p style={s.subtitle}>Trial Balance, P&L, Balance Sheet, Cash Flow and more — with date filtering</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.exportBtn}><Download size={14} /> Export PDF</button>
            <button style={s.exportBtnXls}><Download size={14} /> Export Excel</button>
          </div>
        </section>

        <div style={s.layout}>
          {/* Left: Report Selector */}
          <div style={s.sidebar}>
            <p style={s.sidebarTitle}>Report Type</p>
            {REPORT_TYPES.map(r => (
              <button key={r.id} style={{ ...s.reportBtn, ...(activeReport === r.id ? s.reportBtnActive : {}) }} onClick={() => setActiveReport(r.id)}>
                <span>{r.icon}</span> {r.label}
              </button>
            ))}

            <div style={s.dateSection}>
              <p style={s.sidebarTitle}>Date Range</p>
              <div style={s.field}><label style={s.label}>From</label><input type="date" style={s.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>To</label><input type="date" style={s.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
              <button style={s.generateBtn}>Generate Report</button>
            </div>
          </div>

          {/* Right: Report Content */}
          <div style={s.reportArea}>
            {/* Report Header */}
            <div style={s.reportHeader}>
              <div>
                <h2 style={s.reportTitle}>{REPORT_TYPES.find(r => r.id === activeReport)?.label}</h2>
                <p style={s.reportPeriod}><Calendar size={13} /> Period: {dateFrom} to {dateTo}</p>
              </div>
              <p style={s.companyName}>Qudrati Foods — Accounts Panel</p>
            </div>

            {/* Trial Balance */}
            {activeReport === 'trial-balance' && (
              <div style={s.tableCard}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>
                    <th style={s.th}>Account</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Debit (₨)</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Credit (₨)</th>
                  </tr></thead>
                  <tbody>
                    {TRIAL_BALANCE.map(r => (
                      <tr key={r.account} style={s.trow}>
                        <td style={s.td}>{r.account}</td>
                        <td style={{ ...s.td, textAlign: 'right', color: r.debit > 0 ? '#2d7a33' : '#d4dfd4', fontWeight: r.debit > 0 ? 600 : 400 }}>{r.debit > 0 ? fmt(r.debit) : '—'}</td>
                        <td style={{ ...s.td, textAlign: 'right', color: r.credit > 0 ? '#2a6f31' : '#d4dfd4', fontWeight: r.credit > 0 ? 600 : 400 }}>{r.credit > 0 ? fmt(r.credit) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#e8eee8', borderTop: '2px solid #d4dfd4' }}>
                      <td style={{ ...s.td, fontWeight: 800, color: '#1a3d1f' }}>TOTAL</td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 800, color: '#2d7a33' }}>{fmt(totalDr)}</td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 800, color: '#2a6f31' }}>{fmt(totalCr)}</td>
                    </tr>
                    <tr style={{ background: totalDr === totalCr ? '#f0fdf4' : '#fef2f2' }}>
                      <td colSpan={3} style={{ ...s.td, textAlign: 'center', fontWeight: 700, color: totalDr === totalCr ? '#16a34a' : '#dc2626', fontSize: 13 }}>
                        {totalDr === totalCr ? '✓ Balanced — Debit equals Credit' : '⚠ Unbalanced — Review entries'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* P&L */}
            {activeReport === 'pl' && (
              <div style={s.plCard}>
                <div style={s.plSection}>
                  <h3 style={s.plSectionTitle}>Revenue</h3>
                  {PL_DATA.revenue.map(r => (
                    <div key={r.label} style={s.plRow}>
                      <span style={s.plLabel}>{r.label}</span>
                      <span style={{ ...s.plAmt, color: '#16a34a' }}>{fmt(r.amount)}</span>
                    </div>
                  ))}
                  <div style={{ ...s.plRow, ...s.plTotal, borderColor: '#bbf7d0' }}>
                    <span>Total Revenue</span>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>{fmt(totalRev)}</span>
                  </div>
                </div>
                <div style={s.plSection}>
                  <h3 style={s.plSectionTitle}>Expenses</h3>
                  {PL_DATA.expenses.map(r => (
                    <div key={r.label} style={s.plRow}>
                      <span style={s.plLabel}>{r.label}</span>
                      <span style={{ ...s.plAmt, color: '#dc2626' }}>{fmt(r.amount)}</span>
                    </div>
                  ))}
                  <div style={{ ...s.plRow, ...s.plTotal, borderColor: '#fecaca' }}>
                    <span>Total Expenses</span>
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>{fmt(totalExp)}</span>
                  </div>
                </div>
                <div style={{ ...s.plRow, ...s.plNetProfit, background: netProfit > 0 ? '#f0fdf4' : '#fef2f2', border: `2px solid ${netProfit > 0 ? '#bbf7d0' : '#fecaca'}` }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>Net {netProfit > 0 ? 'Profit' : 'Loss'}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: netProfit > 0 ? '#16a34a' : '#dc2626' }}>{fmt(Math.abs(netProfit))}</span>
                </div>
              </div>
            )}

            {/* Balance Sheet */}
            {activeReport === 'balance-sheet' && (
              <div style={s.bsGrid}>
                <div style={s.bsCard}>
                  <h3 style={s.bsTitle}>Assets</h3>
                  <div style={s.plRow}><span style={s.plLabel}>Cash in Hand</span><span style={s.plAmt}>{fmt(25000)}</span></div>
                  <div style={s.plRow}><span style={s.plLabel}>Bank Accounts</span><span style={s.plAmt}>{fmt(3250000)}</span></div>
                  <div style={s.plRow}><span style={s.plLabel}>Accounts Receivable</span><span style={s.plAmt}>{fmt(658000)}</span></div>
                  <div style={s.plRow}><span style={s.plLabel}>Fixed Assets</span><span style={s.plAmt}>{fmt(1800000)}</span></div>
                  <div style={{ ...s.plRow, ...s.plTotal }}><span>Total Assets</span><span style={{ color: '#2d7a33', fontWeight: 800 }}>{fmt(5733000)}</span></div>
                </div>
                <div style={s.bsCard}>
                  <h3 style={s.bsTitle}>Liabilities & Equity</h3>
                  <div style={s.plRow}><span style={s.plLabel}>Accounts Payable</span><span style={s.plAmt}>{fmt(2100000)}</span></div>
                  <div style={s.plRow}><span style={s.plLabel}>Other Liabilities</span><span style={s.plAmt}>{fmt(0)}</span></div>
                  <div style={{ ...s.plRow, ...s.plTotal }}><span>Total Liabilities</span><span style={{ color: '#2a6f31', fontWeight: 800 }}>{fmt(2100000)}</span></div>
                  <div style={{ height: 12 }} />
                  <div style={s.plRow}><span style={s.plLabel}>Owner Equity</span><span style={s.plAmt}>{fmt(2900000)}</span></div>
                  <div style={s.plRow}><span style={s.plLabel}>Retained Earnings</span><span style={s.plAmt}>{fmt(733000)}</span></div>
                  <div style={{ ...s.plRow, ...s.plTotal }}><span>Total Equity</span><span style={{ color: '#0f766e', fontWeight: 800 }}>{fmt(3633000)}</span></div>
                  <div style={{ ...s.plRow, marginTop: 12, background: '#e8eee8', borderRadius: 12, padding: '10px 14px' }}>
                    <span style={{ fontWeight: 800 }}>Liabilities + Equity</span>
                    <span style={{ color: '#2d7a33', fontWeight: 800 }}>{fmt(5733000)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other Reports - Placeholder */}
            {!['trial-balance', 'pl', 'balance-sheet'].includes(activeReport) && (
              <div style={s.placeholderCard}>
                <FileText size={40} color="#d4dfd4" />
                <p style={s.placeholderTitle}>{REPORT_TYPES.find(r => r.id === activeReport)?.label}</p>
                <p style={s.placeholderSub}>Select a date range and click <strong>Generate Report</strong> to view this report. Export to PDF or Excel is available once generated.</p>
                <button style={s.generateBtn2}>Generate Report</button>
              </div>
            )}
          </div>
        </div>
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
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#a5f3fc' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', color: '#0e7490', border: 'none', borderRadius: '999px', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  exportBtnXls: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '999px', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' },
  sidebar: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 },
  sidebarTitle: { margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8aa88a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  reportBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#415443', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' },
  reportBtnActive: { background: '#e8eee8', color: '#2a6f31', fontWeight: 700 },
  dateSection: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 10, fontWeight: 700, color: '#8aa88a', textTransform: 'uppercase' },
  dateInput: { padding: '8px 12px', border: '1.5px solid #e2e8e2', borderRadius: 10, fontSize: 12, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit' },
  generateBtn: { marginTop: 4, padding: '9px 0', border: 'none', background: '#0e7490', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  reportArea: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  reportHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  reportTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1a3d1f' },
  reportPeriod: { display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0 0', fontSize: 13, color: '#7a8a7a' },
  companyName: { margin: 0, fontSize: 12, color: '#8aa88a', fontStyle: 'italic' },
  tableCard: { background: '#fff', border: '1px solid #e2e8e2', borderRadius: 20, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#e8eee8' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '11px 16px', fontSize: 13, color: '#1a3d1f' },
  plCard: { display: 'flex', flexDirection: 'column', gap: 16 },
  plSection: { background: '#fff', border: '1px solid #e2e8e2', borderRadius: 20, padding: 20 },
  plSectionTitle: { margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#1a3d1f', textTransform: 'uppercase', letterSpacing: '0.5px' },
  plRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e8eee8' },
  plLabel: { fontSize: 13, color: '#415443' },
  plAmt: { fontSize: 13, fontWeight: 600, color: '#1a3d1f' },
  plTotal: { borderTop: '2px solid #e2e8e2', borderBottom: 'none', marginTop: 8, paddingTop: 12, fontWeight: 700, fontSize: 14, color: '#1a3d1f' },
  plNetProfit: { borderRadius: 16, padding: '16px 20px', marginTop: 8 },
  bsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  bsCard: { background: '#fff', border: '1px solid #e2e8e2', borderRadius: 20, padding: 20 },
  bsTitle: { margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#1a3d1f', textTransform: 'uppercase' },
  placeholderCard: { background: '#fff', border: '1px dashed #d4dfd4', borderRadius: 20, padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' },
  placeholderTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  placeholderSub: { margin: 0, fontSize: 13, color: '#7a8a7a', maxWidth: 380, lineHeight: 1.6 },
  generateBtn2: { padding: '11px 28px', border: 'none', background: '#0e7490', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}

