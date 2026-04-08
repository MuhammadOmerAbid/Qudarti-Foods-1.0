'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import {
  Factory, Plus, RotateCcw, Eye, Trash2, Search, X,
  CheckSquare, Square, FileSpreadsheet, Download, FileText,
  ChevronDown, ChevronUp, Calendar
} from 'lucide-react'

const INITIAL_RECORDS = [
  { id: 1, product: 'Seal Packing Line A', startTime: '08:00', endTime: '14:00', noOfLabour: 12, date: '27/05/2025', note: 'Morning shift, full capacity run.' },
  { id: 2, product: 'Bottle Filling Unit', startTime: '09:00', endTime: '13:30', noOfLabour: 8,  date: '27/05/2025', note: '' },
  { id: 3, product: 'Sticker Application', startTime: '10:00', endTime: '16:00', noOfLabour: 5,  date: '27/05/2025', note: 'Machine maintenance at 12:00 — 30 min stop.' },
  { id: 4, product: 'Seal Packing Line B', startTime: '07:30', endTime: '15:30', noOfLabour: 10, date: '03/06/2025', note: '' },
  { id: 5, product: 'Carton Assembly',     startTime: '08:00', endTime: '12:00', noOfLabour: 6,  date: '03/06/2025', note: 'Short run — material shortage.' },
  { id: 6, product: 'Bottle Filling Unit', startTime: '13:00', endTime: '18:00', noOfLabour: 9,  date: '08/04/2026', note: '' },
]

function parseDMY(str) {
  const [d, m, y] = str.split('/')
  return new Date(`${y}-${m}-${d}`)
}

function calcHours(start, end) {
  if (!start || !end) return '—'
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return '—'
  const h = Math.floor(mins / 60), m2 = mins % 60
  return m2 > 0 ? `${h}h ${m2}m` : `${h}h`
}

export default function DailyProductionPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState([])
  const [viewRecord, setViewRecord] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [collapsedDates, setCollapsedDates] = useState({})

  /* ── Search filter ── */
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      [r.product, r.startTime, r.endTime, r.noOfLabour, r.date, r.note]
        .join(' ').toLowerCase().includes(q)
    )
  }, [records, search])

  /* ── Group by date ── */
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r)
    })
    // Sort dates descending
    return Object.entries(map).sort((a, b) => parseDMY(b[0]) - parseDMY(a[0]))
  }, [filtered])

  /* ── Selection ── */
  const toggleSelect  = (id)  => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll     = ()    => setSelected(s => s.length === filtered.length ? [] : filtered.map(r => r.id))
  const toggleDate    = (date) => setCollapsedDates(p => ({ ...p, [date]: !p[date] }))

  /* ── Delete ── */
  const handleDelete = (id) => { if (window.confirm('Delete this record?')) setRecords(r => r.filter(x => x.id !== id)) }
  const handleBulkDelete = () => {
    if (!selected.length) return
    if (window.confirm(`Delete ${selected.length} records?`)) { setRecords(r => r.filter(x => !selected.includes(x.id))); setSelected([]) }
  }

  /* ── Export ── */
  const exportRows = selected.length > 0 ? records.filter(r => selected.includes(r.id)) : filtered

  const exportCSV = (rows) => {
    const headers = ['Product', 'Start Time', 'End Time', 'Hours', 'No of Labour', 'Date', 'Note']
    const lines = rows.map(r => [r.product, r.startTime, r.endTime, calcHours(r.startTime, r.endTime), r.noOfLabour, r.date, r.note].map(v => `"${v}"`).join(','))
    const csv = [headers.join(','), ...lines].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'daily-production.csv'; a.click()
  }

  const exportPDF = (rows) => {
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Daily Production Report</title><style>body{font-family:Arial;padding:20px;font-size:12px}h2{color:#2d7a33}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f0fdf4;color:#1a2e1b;padding:8px;text-align:left;border-bottom:2px solid #bbf7d0}td{padding:7px 8px;border-bottom:1px solid #e5e7eb}.date-row{background:#f9fafb;font-weight:700;color:#374151;padding:8px;font-size:13px}</style></head><body><h2>Daily Production Report</h2><p style="color:#6b7280">Generated: ${new Date().toLocaleDateString('en-PK')}</p><table><tr><th>Product</th><th>Start</th><th>End</th><th>Hours</th><th>Labour</th><th>Date</th><th>Note</th></tr>${rows.map(r => `<tr><td>${r.product}</td><td>${r.startTime}</td><td>${r.endTime}</td><td>${calcHours(r.startTime, r.endTime)}</td><td>${r.noOfLabour}</td><td>${r.date}</td><td>${r.note || '—'}</td></tr>`).join('')}</table></body></html>`)
    win.document.close(); win.print()
  }

  return (
    <DashboardLayout>
      <div style={s.wrapper}>

        {/* Page Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}><Factory size={20} color="#f59e0b" style={{ marginRight: 8 }} />Daily Production</h1>
            <p style={s.pageSubtitle}>View and manage Productions</p>
          </div>
          <div style={s.headerActions}>
            <button style={s.iconBtn} title="Reset" onClick={() => { setSearch(''); setSelected([]) }}><RotateCcw size={16} /></button>
            <button style={s.reportBtn} onClick={() => setShowReport(v => !v)}><Eye size={15} /> View Report</button>
            <button style={s.addBtn} onClick={() => router.push('/daily-production/new')}><Plus size={16} /> Add New Entry</button>
          </div>
        </div>

        {/* Report Panel */}
        {showReport && (
          <div style={s.reportPanel}>
            <div style={s.reportRow}>
              <span style={s.reportLabel}><FileText size={14} color="#d97706" />Export {selected.length > 0 ? `${selected.length} selected` : `all ${filtered.length} filtered`} records:</span>
              <div style={s.reportBtns}>
                <button style={s.csvBtn} onClick={() => exportCSV(exportRows)}><FileSpreadsheet size={14} /> Export CSV</button>
                <button style={s.pdfBtn} onClick={() => exportPDF(exportRows)}><Download size={14} /> Export PDF</button>
                {selected.length > 0 && <button style={s.deleteSelBtn} onClick={handleBulkDelete}><Trash2 size={14} /> Delete ({selected.length})</button>}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={s.searchWrap}>
          <Search size={15} color="#9ca3af" />
          <input style={s.searchInput} placeholder="Search by product..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button style={s.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
        </div>

        {/* Table */}
        <div style={s.tableWrap}>

          {/* Global table header */}
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: 40 }}>
                  <button style={s.checkBtn} onClick={toggleAll}>
                    {selected.length === filtered.length && filtered.length > 0
                      ? <CheckSquare size={15} color="#f59e0b" />
                      : <Square size={15} color="#9ca3af" />}
                  </button>
                </th>
                <th style={s.th}>Product</th>
                <th style={s.th}>Start Time</th>
                <th style={s.th}>End Time</th>
                <th style={s.th}>Total Hours</th>
                <th style={s.th}>No of Labour</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
          </table>

          {/* Date-grouped sections */}
          {grouped.length === 0 ? (
            <div style={s.emptyState}>
              <Factory size={32} color="#d1d5db" />
              <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 14 }}>No records found</p>
            </div>
          ) : grouped.map(([date, dateRecords]) => {
            const isCollapsed = collapsedDates[date]
            const totalLabour = dateRecords.reduce((sum, r) => sum + Number(r.noOfLabour), 0)
            const dateSelected = dateRecords.filter(r => selected.includes(r.id)).length

            return (
              <div key={date} style={s.dateGroup}>
                {/* Date Section Header */}
                <button style={s.dateSectionBtn} onClick={() => toggleDate(date)}>
                  <div style={s.dateSectionLeft}>
                    <Calendar size={14} color="#f59e0b" />
                    <span style={s.dateSectionLabel}>{date}</span>
                    <span style={s.dateSectionCount}>{dateRecords.length} {dateRecords.length === 1 ? 'entry' : 'entries'}</span>
                    <span style={s.dateSectionLabour}>· {totalLabour} total labour</span>
                  </div>
                  <div style={s.dateSectionRight}>
                    {dateSelected > 0 && <span style={s.dateSelBadge}>{dateSelected} selected</span>}
                    {isCollapsed ? <ChevronDown size={15} color="#9ca3af" /> : <ChevronUp size={15} color="#9ca3af" />}
                  </div>
                </button>

                {/* Rows */}
                {!isCollapsed && (
                  <table style={{ ...s.table, borderTop: 'none' }}>
                    <tbody>
                      {dateRecords.map(r => (
                        <tr key={r.id}
                          style={{ ...s.tr, backgroundColor: selected.includes(r.id) ? '#fffbeb' : '#fff' }}
                          onMouseEnter={e => { if (!selected.includes(r.id)) e.currentTarget.style.backgroundColor = '#fafafa' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = selected.includes(r.id) ? '#fffbeb' : '#fff' }}
                        >
                          <td style={{ ...s.td, width: 40 }}>
                            <button style={s.checkBtn} onClick={() => toggleSelect(r.id)}>
                              {selected.includes(r.id) ? <CheckSquare size={15} color="#f59e0b" /> : <Square size={15} color="#9ca3af" />}
                            </button>
                          </td>
                          <td style={{ ...s.td, fontWeight: 600, color: '#1a2e1b' }}>{r.product}</td>
                          <td style={s.td}><span style={s.timeBadge}>{r.startTime || '—'}</span></td>
                          <td style={s.td}><span style={s.timeBadge}>{r.endTime || '—'}</span></td>
                          <td style={s.td}><span style={s.hoursBadge}>{calcHours(r.startTime, r.endTime)}</span></td>
                          <td style={s.td}>{r.noOfLabour}</td>
                          <td style={{ ...s.td, textAlign: 'right' }}>
                            <div style={s.actionBtns}>
                              <button style={s.viewBtn} title="View" onClick={() => setViewRecord(r)}><Eye size={14} /></button>
                              <button style={s.delBtn} title="Delete" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>

        <div style={s.tableFooter}>
          <span style={s.footerText}>
            {filtered.length} entries across {grouped.length} dates
            {selected.length > 0 && <span style={s.selCount}> · {selected.length} selected</span>}
          </span>
        </div>
      </div>

      {viewRecord && <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} />}
    </DashboardLayout>
  )
}

function ViewModal({ record, onClose }) {
  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div>
            <h2 style={s.modalTitle}>{record.product}</h2>
            <p style={s.modalSub}>{record.date}</p>
          </div>
          <button style={s.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={s.modalBody}>
          <div style={s.detailGrid}>
            {[['Start Time', record.startTime || '—'], ['End Time', record.endTime || '—'], ['Total Hours', calcHours(record.startTime, record.endTime)], ['No of Labour', record.noOfLabour], ['Date', record.date]].map(([l, v]) => (
              <div key={l}><p style={s.detailLabel}>{l}</p><p style={s.detailValue}>{v}</p></div>
            ))}
          </div>
          {record.note && (
            <div style={s.noteBox}>
              <p style={s.noteLabel}>Note</p>
              <p style={s.noteText}>{record.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  wrapper: { maxWidth: 1200, margin: '0 auto' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#1a2e1b', margin: '0 0 4px', display: 'flex', alignItems: 'center' },
  pageSubtitle: { fontSize: 13, color: '#9ca3af', margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  iconBtn: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' },
  reportBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13.5, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  reportPanel: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 18px', marginBottom: 16 },
  reportRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  reportLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#1a2e1b' },
  reportBtns: { display: 'flex', gap: 8 },
  csvBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #fcd34d', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#d97706', cursor: 'pointer' },
  pdfBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#d97706', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  deleteSelBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #fca5a5', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#ef4444', cursor: 'pointer' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 14px', marginBottom: 16 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#374151', background: 'transparent' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 },
  tableWrap: { background: '#fff', borderRadius: 12, border: '1px solid #e8f5e9', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '11px 14px', fontSize: 12.5, fontWeight: 700, color: '#374151', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  tr: { transition: 'background 0.15s' },
  td: { padding: '11px 14px', fontSize: 13, color: '#4b5563', borderBottom: '1px solid #f3f4f6' },
  timeBadge: { background: '#f3f4f6', borderRadius: 6, padding: '2px 8px', fontSize: 12.5, fontWeight: 600, color: '#374151', fontFamily: 'monospace' },
  hoursBadge: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '2px 8px', fontSize: 12.5, fontWeight: 700, color: '#d97706' },
  actionBtns: { display: 'flex', gap: 6, justifyContent: 'flex-end' },
  viewBtn: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#2d7a33', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex' },
  delBtn: { background: '#fff5f5', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },

  dateGroup: { borderBottom: '1px solid #f3f4f6' },
  dateSectionBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fafafa', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  dateSectionLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  dateSectionLabel: { fontSize: 13.5, fontWeight: 700, color: '#1a2e1b' },
  dateSectionCount: { fontSize: 12, color: '#fff', background: '#f59e0b', borderRadius: 20, padding: '1px 8px', fontWeight: 600 },
  dateSectionLabour: { fontSize: 12, color: '#9ca3af' },
  dateSectionRight: { display: 'flex', alignItems: 'center', gap: 8 },
  dateSelBadge: { fontSize: 11.5, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '1px 8px', fontWeight: 600 },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' },
  tableFooter: { padding: '10px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa' },
  footerText: { fontSize: 12.5, color: '#9ca3af' },
  selCount: { color: '#f59e0b', fontWeight: 600 },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6' },
  modalTitle: { fontSize: 17, fontWeight: 800, color: '#1a2e1b', margin: 0 },
  modalSub: { fontSize: 12.5, color: '#9ca3af', margin: '4px 0 0' },
  modalClose: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280', display: 'flex' },
  modalBody: { padding: '20px 24px', overflowY: 'auto', flex: 1 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 16 },
  detailLabel: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 4px' },
  detailValue: { fontSize: 14, color: '#1a2e1b', fontWeight: 600, margin: 0, padding: '6px 10px', background: '#f9fafb', borderRadius: 6, border: '1px solid #f3f4f6' },
  noteBox: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px' },
  noteLabel: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px' },
  noteText: { fontSize: 13.5, color: '#374151', margin: 0, lineHeight: 1.6 },
}