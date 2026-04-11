'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AccountLayout from '@/components/accounts/AccountLayout'
import { Settings, Lock, Users, Shield, Calendar, ChevronRight, AlertTriangle } from 'lucide-react'

const PERIODS = [
  { month: 'March 2026',    status: 'Closed', closedBy: 'Admin', closedOn: '2026-04-01' },
  { month: 'February 2026', status: 'Closed', closedBy: 'Admin', closedOn: '2026-03-02' },
  { month: 'January 2026',  status: 'Closed', closedBy: 'Admin', closedOn: '2026-02-01' },
]

const ROLES = [
  { role: 'Admin',      canEdit: true,  canDelete: false, canApprove: true,  canViewReports: true,  canClose: true  },
  { role: 'Accountant', canEdit: true,  canDelete: false, canApprove: false, canViewReports: true,  canClose: false },
  { role: 'Manager',    canEdit: false, canDelete: false, canApprove: true,  canViewReports: true,  canClose: false },
  { role: 'Viewer',     canEdit: false, canDelete: false, canApprove: false, canViewReports: true,  canClose: false },
]

const AUDIT_LOG = [
  { action: 'Journal Entry Posted', user: 'Admin', time: '2026-04-08 14:32', detail: 'JV-006 — Sales Revenue' },
  { action: 'Expense Approved',     user: 'Admin', time: '2026-04-07 11:15', detail: 'EXP-002 — WAPDA Utility Bill' },
  { action: 'Supplier Bill Created',user: 'Admin', time: '2026-04-07 10:02', detail: 'BILL-003 — Ali Traders' },
  { action: 'Period Closed',        user: 'Admin', time: '2026-04-01 09:00', detail: 'March 2026 closed successfully' },
  { action: 'Invoice Created',      user: 'Accountant', time: '2026-04-01 08:45', detail: 'INV-001 — Khan & Sons' },
]

const Tick  = ({ on }) => <span style={{ color: on ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: 16 }}>{on ? '✓' : '✗'}</span>

const CLOSE_KEY = 'accounts:settings:close-period'

export default function AccountsSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const [tab, setTab] = useState('period')
  const [periods, setPeriods] = useState(PERIODS)
  const [currentPeriod, setCurrentPeriod] = useState('April 2026')
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  useEffect(() => {
    const raw = sessionStorage.getItem(CLOSE_KEY)
    if (!raw) return
    sessionStorage.removeItem(CLOSE_KEY)
    try {
      const closed = JSON.parse(raw)
      setPeriods((prev) => [closed, ...prev.filter((entry) => entry.month !== closed.month)])
      if (closed.month === 'April 2026') {
        setCurrentPeriod('May 2026')
      }
    } catch {}
  }, [])
  const [fiscalYear, setFiscalYear] = useState('2025–2026')
  const [currency, setCurrency] = useState('PKR (₨)')

  if (!isSuperuser) {
    return (
      <AccountLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
          <Shield size={48} color="#d4dfd4" />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1a3d1f' }}>Settings Access Restricted</p>
          <p style={{ fontSize: 14, color: '#7a8a7a' }}>Only Super Users can access Accounts Settings.</p>
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout>
      <div style={s.page}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroIcon}><Settings size={22} color="#2d7a33" /></div>
            <div>
              <h1 style={s.title}>Accounts Settings</h1>
              <p style={s.subtitle}>Period closing, user roles, audit trail and system configuration</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { id: 'period',  label: '📅 Period Closing' },
            { id: 'roles',   label: '👤 User Roles' },
            { id: 'audit',   label: '🔍 Audit Trail' },
            { id: 'general', label: '⚙️ General' },
          ].map(t => (
            <button key={t.id} style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Period Closing */}
        {tab === 'period' && (
          <div style={s.card}>
            <div style={s.cardHead}>
              <div>
                <h3 style={s.cardTitle}>Accounting Period Control</h3>
                <p style={s.cardSub}>Close monthly periods to lock entries. Opening balances carry forward automatically.</p>
              </div>
              <button style={s.dangerBtn} onClick={() => router.push('/accounts/settings/close-period')}>
                <Lock size={14} /> Close April 2026
              </button>
            </div>

            <div style={s.currentPeriod}>
              <div style={s.periodInfo}>
                <Calendar size={20} color="#2d7a33" />
                <div>
                  <p style={s.periodLabel}>Current Open Period</p>
                  <p style={s.periodVal}>{currentPeriod}</p>
                </div>
              </div>
              <span style={s.openBadge}>● Open</span>
            </div>

            <h4 style={s.subTitle}>Closed Periods</h4>
            <div style={s.tableCard}>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  <th style={s.th}>Period</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Closed By</th>
                  <th style={s.th}>Closed On</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Re-open</th>
                </tr></thead>
                <tbody>
                  {periods.map(p => (
                    <tr key={p.month} style={s.trow}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{p.month}</td>
                      <td style={s.td}><span style={s.closedBadge}>🔒 {p.status}</span></td>
                      <td style={s.td}>{p.closedBy}</td>
                      <td style={{ ...s.td, color: '#7a8a7a' }}>{p.closedOn}</td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <button style={s.linkBtn} title="Requires Admin approval">Request Re-open</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Roles */}
        {tab === 'roles' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>Role Permissions Matrix</h3>
            <p style={s.cardSub}>Permissions apply only to the Accounts Panel. Store panel permissions are managed separately.</p>
            <div style={s.tableCard}>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  <th style={s.th}>Role</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Edit Entries</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Delete</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Approve</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>View Reports</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Close Period</th>
                </tr></thead>
                <tbody>
                  {ROLES.map(r => (
                    <tr key={r.role} style={s.trow}>
                      <td style={{ ...s.td, fontWeight: 700 }}>
                        <span style={s.roleBadge}>{r.role}</span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}><Tick on={r.canEdit} /></td>
                      <td style={{ ...s.td, textAlign: 'center' }}><Tick on={r.canDelete} /></td>
                      <td style={{ ...s.td, textAlign: 'center' }}><Tick on={r.canApprove} /></td>
                      <td style={{ ...s.td, textAlign: 'center' }}><Tick on={r.canViewReports} /></td>
                      <td style={{ ...s.td, textAlign: 'center' }}><Tick on={r.canClose} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={s.noteBox}>
              <AlertTriangle size={16} color="#b45309" />
              <p style={s.noteText}>Deletion of posted transactions is <strong>not allowed</strong>. Only reversal journal entries are permitted to maintain audit integrity.</p>
            </div>
          </div>
        )}

        {/* Audit Trail */}
        {tab === 'audit' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>Full Audit Trail</h3>
            <p style={s.cardSub}>Every action is recorded with user, timestamp, and details. Immutable log.</p>
            <div style={s.tableCard}>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  <th style={s.th}>Action</th>
                  <th style={s.th}>Performed By</th>
                  <th style={s.th}>Timestamp</th>
                  <th style={s.th}>Detail</th>
                </tr></thead>
                <tbody>
                  {AUDIT_LOG.map((log, i) => (
                    <tr key={i} style={s.trow}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{log.action}</td>
                      <td style={s.td}><span style={s.userBadge}>{log.user}</span></td>
                      <td style={{ ...s.td, color: '#7a8a7a', fontSize: 12 }}>{log.time}</td>
                      <td style={{ ...s.td, color: '#415443' }}>{log.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* General */}
        {tab === 'general' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>General Configuration</h3>
            <p style={s.cardSub}>System-wide accounting settings. Changes affect the entire accounts module.</p>
            <div style={s.settingsGrid}>
              <div style={s.settingRow}>
                <div><p style={s.settingLabel}>Fiscal Year</p><p style={s.settingDesc}>Set the financial year for your organization</p></div>
                <select style={s.settingInput} value={fiscalYear} onChange={e => setFiscalYear(e.target.value)}>
                  <option>2025–2026</option>
                  <option>2024–2025</option>
                </select>
              </div>
              <div style={s.settingRow}>
                <div><p style={s.settingLabel}>Base Currency</p><p style={s.settingDesc}>Primary currency for all financial records</p></div>
                <select style={s.settingInput} value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option>PKR (₨)</option>
                  <option>USD ($)</option>
                  <option>AED (د.إ)</option>
                </select>
              </div>
              <div style={s.settingRow}>
                <div><p style={s.settingLabel}>Approval Workflow</p><p style={s.settingDesc}>Require manager approval for expenses over ₨ 10,000</p></div>
                <label style={s.toggle}>
                  <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                  <span style={{ ...s.toggleSlider, background: '#2d7a33' }}>●</span>
                </label>
              </div>
              <div style={s.settingRow}>
                <div><p style={s.settingLabel}>Auto-numbering</p><p style={s.settingDesc}>Automatically number vouchers and journal entries</p></div>
                <label style={s.toggle}>
                  <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                  <span style={{ ...s.toggleSlider, background: '#2d7a33' }}>●</span>
                </label>
              </div>
            </div>
            <button style={s.saveSettingsBtn}>Save Configuration</button>
          </div>
        )}

        {/* Close Period Modal */}
        {showCloseModal && (
          <div style={s.modalOverlay} onClick={() => setShowCloseModal(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalWarnHeader}>
                <AlertTriangle size={28} color="#b45309" />
                <h3 style={s.modalTitle}>Close Period — April 2026</h3>
              </div>
              <p style={s.modalDesc}>This action will <strong>lock all entries</strong> for April 2026. No further edits or new entries will be allowed for this period. Opening balances will carry forward to May 2026.</p>
              <div style={s.field}>
                <label style={s.label}>Type <strong>CLOSE APRIL</strong> to confirm</label>
                <input style={s.input} placeholder="CLOSE APRIL" value={confirmText} onChange={e => setConfirmText(e.target.value)} />
              </div>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setShowCloseModal(false)}>Cancel</button>
                <button style={{ ...s.closeBtn, opacity: confirmText === 'CLOSE APRIL' ? 1 : 0.4, cursor: confirmText === 'CLOSE APRIL' ? 'pointer' : 'not-allowed' }}
                  disabled={confirmText !== 'CLOSE APRIL'} onClick={() => setShowCloseModal(false)}>
                  🔒 Confirm Close
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
  hero: { display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgb(26, 61, 31) 0%, rgb(45, 122, 51) 100%)', borderRadius: 28, padding: '24px 28px' },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#d4dfd4' },
  tabs: { display: 'flex', gap: 0, background: '#e8eee8', borderRadius: 40, padding: 4, width: 'fit-content', flexWrap: 'wrap' },
  tab: { padding: '9px 22px', borderRadius: 999, border: 'none', background: 'transparent', color: '#7a8a7a', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: '#2d7a33', color: '#fff' },
  card: { background: '#f2f4f2', border: '1px solid #e2e8e2', borderRadius: 24, padding: 24 },
  cardHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  cardTitle: { margin: 0, fontSize: 17, fontWeight: 800, color: '#1a3d1f' },
  cardSub: { margin: '6px 0 0', fontSize: 13, color: '#7a8a7a' },
  dangerBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '999px', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  currentPeriod: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e8eee8', border: '1px solid #d4dfd4', borderRadius: 16, padding: '14px 20px', marginBottom: 20 },
  periodInfo: { display: 'flex', alignItems: 'center', gap: 14 },
  periodLabel: { margin: 0, fontSize: 11, fontWeight: 700, color: '#7a8a7a', textTransform: 'uppercase' },
  periodVal: { margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#2a6f31' },
  openBadge: { color: '#16a34a', fontWeight: 700, fontSize: 14 },
  subTitle: { margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1a3d1f' },
  tableCard: { background: '#fff', border: '1px solid #e2e8e2', borderRadius: 16, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#e8eee8' },
  th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#415443', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' },
  trow: { borderTop: '1px solid #e2e8e2' },
  td: { padding: '12px 16px', fontSize: 13, color: '#1a3d1f' },
  closedBadge: { color: '#7a8a7a', fontWeight: 600, fontSize: 12 },
  roleBadge: { background: '#e8eee8', color: '#2d7a33', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 },
  userBadge: { background: '#eef2ee', color: '#2a6f31', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 },
  linkBtn: { background: '#fff', border: '1px solid #e2e8e2', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#2d7a33', cursor: 'pointer' },
  noteBox: { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '12px 16px', marginTop: 16 },
  noteText: { margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.5 },
  settingsGrid: { display: 'flex', flexDirection: 'column', gap: 0 },
  settingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '16px 0', borderBottom: '1px solid #e2e8e2' },
  settingLabel: { margin: 0, fontSize: 14, fontWeight: 700, color: '#1a3d1f' },
  settingDesc: { margin: '4px 0 0', fontSize: 12, color: '#7a8a7a' },
  settingInput: { padding: '8px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit', minWidth: 150 },
  toggle: { cursor: 'pointer' },
  toggleSlider: { display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: 44, height: 24, borderRadius: 999, padding: '0 4px', fontSize: 16, cursor: 'pointer' },
  saveSettingsBtn: { marginTop: 20, padding: '11px 28px', border: 'none', background: '#2d7a33', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalWarnHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: '#1a3d1f' },
  modalDesc: { fontSize: 13, color: '#415443', lineHeight: 1.6, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: '#7a8a7a' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: 12, fontSize: 13, color: '#1a3d1f', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: { padding: '10px 22px', borderRadius: 999, border: '1px solid #e2e8e2', background: '#f2f4f2', color: '#415443', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  closeBtn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700 },
}

