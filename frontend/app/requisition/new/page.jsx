'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import {
  ClipboardList, Plus, RotateCcw, Eye, Trash2,
  Search, X, ChevronDown, ChevronUp, CheckSquare,
  Square, CornerUpLeft, FileSpreadsheet, Download, FileText
} from 'lucide-react'

/* ─── Mock Data ─── */
const PRODUCTS = [
  { id: 1, name: '69 mm Seal',      category: 'Seal',    subCategory: '69mm',     unit: 'Unit' },
  { id: 2, name: '72 MM Seal',      category: 'Seal',    subCategory: '72mm',     unit: 'Unit' },
  { id: 3, name: '500ml Bottle',    category: 'Bottle',  subCategory: '500ml',    unit: 'Unit' },
  { id: 4, name: '1L Bottle',       category: 'Bottle',  subCategory: '1L',       unit: 'Unit' },
  { id: 5, name: 'Front Sticker',   category: 'Sticker', subCategory: 'Front',    unit: 'Unit' },
  { id: 6, name: 'Standard Carton', category: 'Carton',  subCategory: 'Standard', unit: 'Unit' },
]

const INITIAL_RECORDS = [
  {
    id: 1, receiverName: 'SAJJAD', entryBy: 'Demo Account', entryDate: '22/05/2025',
    comment: '',
    items: [{ productId: 1, productName: '69 mm seal', subCategory: '69mm', category: 'Seal', quantity: 1000, unit: 'Unit', returned: 0 }],
  },
  {
    id: 2, receiverName: 'HAMID', entryBy: 'Demo Account', entryDate: '27/05/2025',
    comment: 'Urgent requirement for production line.',
    items: [{ productId: 1, productName: '69 mm seal', subCategory: '69mm', category: 'Seal', quantity: 2000, unit: 'Unit', returned: 200 }],
  },
  {
    id: 3, receiverName: 'GULFAM', entryBy: 'Demo Account', entryDate: '27/05/2025',
    comment: '',
    items: [{ productId: 2, productName: '72 MM Seal', subCategory: '72mm', category: 'Seal', quantity: 1100, unit: 'Unit', returned: 0 }],
  },
  {
    id: 4, receiverName: 'xyz', entryBy: 'Demo Account', entryDate: '28/05/2025',
    comment: 'Mixed order for two departments. Please ensure careful handling.',
    items: [
      { productId: 1, productName: '69 mm seal', subCategory: '69mm', category: 'Seal', quantity: 100, unit: 'Unit', returned: 100 },
      { productId: 2, productName: '72 MM Seal', subCategory: '72mm', category: 'Seal', quantity: 100, unit: 'Unit', returned: 0 },
    ],
  },
  {
    id: 5, receiverName: 'ADNAN', entryBy: 'Demo Account', entryDate: '03/06/2025',
    comment: '',
    items: [
      { productId: 2, productName: '72 MM Seal', subCategory: '72mm', category: 'Seal', quantity: 500, unit: 'Unit', returned: 50 },
      { productId: 1, productName: '69 mm seal', subCategory: '69mm', category: 'Seal', quantity: 500, unit: 'Unit', returned: 0 },
    ],
  },
]

export default function RequisitionPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [records, setRecords]             = useState(INITIAL_RECORDS)
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState([])
  const [expandedComment, setExpandedComment] = useState(null)
  const [returnModal, setReturnModal]     = useState(null)   // { record, itemIdx }
  const [viewRecord, setViewRecord]       = useState(null)
  const [showReport, setShowReport]       = useState(false)

  /* ── Keyword Filtering ── */
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      [
        r.receiverName, r.entryBy, r.entryDate, r.comment,
        ...r.items.flatMap(i => [i.productName, i.subCategory, i.category, String(i.quantity), i.unit, String(i.returned), String(i.quantity - i.returned)])
      ].join(' ').toLowerCase().includes(q)
    )
  }, [records, search])

  /* ── Selection ── */
  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll    = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(r => r.id))

  /* ── Delete ── */
  const handleDelete = (id) => {
    if (window.confirm('Delete this record?')) setRecords(r => r.filter(x => x.id !== id))
  }
  const handleBulkDelete = () => {
    if (!selected.length) return
    if (window.confirm(`Delete ${selected.length} records?`)) {
      setRecords(r => r.filter(x => !selected.includes(x.id)))
      setSelected([])
    }
  }

  /* ── Return — adds back to stock (subtracts from net) ── */
  const handleReturn = (recordId, itemIdx, returnQty) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r
      const items = r.items.map((item, i) => {
        if (i !== itemIdx) return item
        const newReturned = Math.min(item.returned + returnQty, item.quantity)
        return { ...item, returned: newReturned }
      })
      return { ...r, items }
    }))
    setReturnModal(null)
  }

  /* ── Export ── */
  const exportRows = selected.length > 0 ? records.filter(r => selected.includes(r.id)) : filtered

  const exportCSV = (rows) => {
    const headers = ['Receiver Name', 'Entry By', 'Entry Date', 'Product', 'Sub-Category', 'Category', 'Issued Qty', 'Returned Qty', 'Net Qty', 'Unit', 'Comment']
    const lines = rows.flatMap(r =>
      r.items.map(item => [
        r.receiverName, r.entryBy, r.entryDate,
        item.productName, item.subCategory, item.category,
        item.quantity, item.returned, item.quantity - item.returned,
        item.unit, r.comment
      ].map(v => `"${v}"`).join(','))
    )
    const csv = [headers.join(','), ...lines].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'goods-requisition.csv'; a.click()
  }

  const exportPDF = (rows) => {
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Goods Requisition Report</title>
    <style>body{font-family:Arial;padding:20px;font-size:12px}h2{color:#2d7a33}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f0fdf4;color:#1a2e1b;padding:8px;text-align:left;border-bottom:2px solid #bbf7d0}td{padding:7px 8px;border-bottom:1px solid #e5e7eb}</style>
    </head><body><h2>Goods Requisition Report</h2>
    <p style="color:#6b7280">Generated: ${new Date().toLocaleDateString('en-PK')}</p>
    <table><tr><th>Receiver</th><th>Entry By</th><th>Date</th><th>Product</th><th>Sub-Category</th><th>Category</th><th>Issued</th><th>Returned</th><th>Net</th><th>Comment</th></tr>
    ${rows.flatMap(r => r.items.map(item => `<tr><td>${r.receiverName}</td><td>${r.entryBy}</td><td>${r.entryDate}</td><td>${item.productName}</td><td>${item.subCategory}</td><td>${item.category}</td><td>${item.quantity} ${item.unit}</td><td>${item.returned} ${item.unit}</td><td>${item.quantity - item.returned} ${item.unit}</td><td>${r.comment || '-'}</td></tr>`)).join('')}
    </table></body></html>`)
    win.document.close(); win.print()
  }

  return (
    <DashboardLayout>
      <div style={s.wrapper}>

        {/* Page Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>
              <ClipboardList size={20} color="#3b82f6" style={{ marginRight: 8 }} />
              Goods Requisition
            </h1>
            <p style={s.pageSubtitle}>Add New Entry</p>
          </div>
          <div style={s.headerActions}>
            <button style={s.iconBtn} title="Reset" onClick={() => { setSearch(''); setSelected([]) }}>
              <RotateCcw size={16} />
            </button>
            <button style={s.reportBtn} onClick={() => setShowReport(v => !v)}>
              <Eye size={15} /> View Report
            </button>
            <button style={s.addBtn} onClick={() => router.push('/requisition/new')}>
              <Plus size={16} /> Add New Entry
            </button>
          </div>
        </div>

        {/* Report Panel */}
        {showReport && (
          <div style={s.reportPanel}>
            <div style={s.reportRow}>
              <span style={s.reportLabel}>
                <FileText size={14} color="#3b82f6" />
                Export {selected.length > 0 ? `${selected.length} selected` : `all ${filtered.length} filtered`} records:
              </span>
              <div style={s.reportBtns}>
                <button style={s.csvBtn} onClick={() => exportCSV(exportRows)}><FileSpreadsheet size={14} /> Export CSV</button>
                <button style={s.pdfBtn} onClick={() => exportPDF(exportRows)}><Download size={14} /> Export PDF</button>
                {selected.length > 0 && (
                  <button style={s.deleteSelBtn} onClick={handleBulkDelete}><Trash2 size={14} /> Delete ({selected.length})</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Keyword Search */}
        <div style={s.searchWrap}>
          <Search size={15} color="#9ca3af" />
          <input
            style={s.searchInput}
            placeholder="Search by receiver / entry by / date / product / sub-category / category / comment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={s.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: 40 }}>
                  <button style={s.checkBtn} onClick={toggleAll}>
                    {selected.length === filtered.length && filtered.length > 0
                      ? <CheckSquare size={15} color="#3b82f6" />
                      : <Square size={15} color="#9ca3af" />}
                  </button>
                </th>
                <th style={s.th}>Receiver Name</th>
                <th style={s.th}>Entry By</th>
                <th style={s.th}>Entry Date</th>
                <th style={s.th}>Product</th>
                <th style={s.th}>Sub-Category</th>
                <th style={s.th}>Qty / Returned / Net</th>
                <th style={s.th}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Comment <ChevronDown size={12} color="#9ca3af" />
                  </div>
                </th>
                <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={s.emptyCell}>
                  <div style={s.emptyState}>
                    <ClipboardList size={32} color="#d1d5db" />
                    <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 14 }}>No records found</p>
                  </div>
                </td></tr>
              ) : filtered.map(r => (
                r.items.map((item, idx) => (
                  <tr key={`${r.id}-${idx}`}
                    style={{ ...s.tr, backgroundColor: selected.includes(r.id) ? '#eff6ff' : '#fff' }}
                    onMouseEnter={e => { if (!selected.includes(r.id)) e.currentTarget.style.backgroundColor = '#fafafa' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = selected.includes(r.id) ? '#eff6ff' : '#fff' }}
                  >
                    {/* Checkbox — first row only */}
                    <td style={s.td}>
                      {idx === 0 && (
                        <button style={s.checkBtn} onClick={() => toggleSelect(r.id)}>
                          {selected.includes(r.id)
                            ? <CheckSquare size={15} color="#3b82f6" />
                            : <Square size={15} color="#9ca3af" />}
                        </button>
                      )}
                    </td>

                    {/* Receiver Name — first row only */}
                    <td style={{ ...s.td, fontWeight: idx === 0 ? 600 : 400, color: '#1a2e1b' }}>
                      {idx === 0 ? r.receiverName : ''}
                    </td>

                    {/* Entry By — first row only */}
                    <td style={s.td}>{idx === 0 ? r.entryBy : ''}</td>

                    {/* Date — first row only */}
                    <td style={s.td}>{idx === 0 ? r.entryDate : ''}</td>

                    {/* Product */}
                    <td style={s.td}>
                      <span style={s.productName}>{item.productName}</span>
                    </td>

                    {/* Sub-Category */}
                    <td style={s.td}>
                      <span style={s.subCatBadge}>{item.subCategory}</span>
                    </td>

                    {/* Qty / Returned / Net */}
                    <td style={s.td}>
                      <div style={s.qtyGroup}>
                        <span style={s.qtyIssued} title="Issued">{item.quantity} {item.unit}</span>
                        <span style={s.qtySep}>›</span>
                        <span style={s.qtyReturned} title="Returned">-{item.returned} {item.unit}</span>
                        <span style={s.qtySep}>›</span>
                        <span style={s.qtyNet} title="Net (in use)">{item.quantity - item.returned} {item.unit}</span>
                      </div>
                    </td>

                    {/* Comment — first row only, with expand dropdown arrow */}
                    <td style={s.td}>
                      {idx === 0 ? (
                        r.comment ? (
                          <div style={s.commentCell}>
                            <span style={s.commentText}>
                              {expandedComment === r.id
                                ? r.comment
                                : r.comment.length > 45 ? r.comment.slice(0, 45) + '…' : r.comment}
                            </span>
                            {r.comment.length > 45 && (
                              <button
                                style={s.commentToggle}
                                title={expandedComment === r.id ? 'Collapse' : 'Expand comment'}
                                onClick={() => setExpandedComment(expandedComment === r.id ? null : r.id)}
                              >
                                {expandedComment === r.id
                                  ? <ChevronUp size={12} />
                                  : <ChevronDown size={12} />}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                        )
                      ) : ''}
                    </td>

                    {/* Actions */}
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      {idx === 0 && (
                        <div style={s.actionBtns}>
                          <button
                            style={s.returnBtn}
                            title="Return goods"
                            onClick={() => setReturnModal({ record: r, itemIdx: 0 })}
                          >
                            <CornerUpLeft size={14} />
                          </button>
                          <button style={s.viewBtn} title="View" onClick={() => setViewRecord(r)}>
                            <Eye size={14} />
                          </button>
                          <button style={s.delBtn} title="Delete" onClick={() => handleDelete(r.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      {idx > 0 && (
                        <div style={s.actionBtns}>
                          <button
                            style={s.returnBtn}
                            title="Return this item"
                            onClick={() => setReturnModal({ record: r, itemIdx: idx })}
                          >
                            <CornerUpLeft size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.tableFooter}>
          <span style={s.footerText}>
            Showing {filtered.length} of {records.length} entries
            {selected.length > 0 && <span style={s.selCount}> · {selected.length} selected</span>}
          </span>
        </div>
      </div>

      {/* View Modal */}
      {viewRecord && <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} />}

      {/* Return Modal */}
      {returnModal && (
        <ReturnModal
          record={returnModal.record}
          itemIdx={returnModal.itemIdx}
          onClose={() => setReturnModal(null)}
          onReturn={handleReturn}
        />
      )}
    </DashboardLayout>
  )
}

/* ─── View Modal ─── */
function ViewModal({ record, onClose }) {
  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div>
            <h2 style={s.modalTitle}>Requisition — {record.receiverName}</h2>
            <p style={s.modalSub}>{record.entryDate} · {record.entryBy}</p>
          </div>
          <button style={s.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={s.modalBody}>
          {record.comment && (
            <div style={s.commentBox}>
              <p style={s.commentBoxLabel}>Comment</p>
              <p style={s.commentBoxText}>{record.comment}</p>
            </div>
          )}
          <p style={s.itemsTitle}>Items ({record.items.length})</p>
          <table style={s.innerTable}>
            <thead>
              <tr>
                {['Product', 'Sub-Category', 'Category', 'Issued', 'Returned', 'Net'].map(h => (
                  <th key={h} style={s.innerTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {record.items.map((item, i) => (
                <tr key={i}>
                  <td style={s.innerTd}>{item.productName}</td>
                  <td style={s.innerTd}><span style={s.subCatBadge}>{item.subCategory}</span></td>
                  <td style={s.innerTd}>{item.category}</td>
                  <td style={s.innerTd}>{item.quantity} {item.unit}</td>
                  <td style={{ ...s.innerTd, color: '#ef4444' }}>-{item.returned} {item.unit}</td>
                  <td style={{ ...s.innerTd, fontWeight: 700, color: '#2d7a33' }}>{item.quantity - item.returned} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Return Modal ─── */
function ReturnModal({ record, itemIdx, onClose, onReturn }) {
  const item = record.items[itemIdx]
  const maxReturn = item.quantity - item.returned
  const [qty, setQty]     = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const n = Number(qty)
    if (!qty || isNaN(n) || n <= 0) { setError('Enter a valid quantity'); return }
    if (n > maxReturn) { setError(`Max returnable: ${maxReturn} ${item.unit}`); return }
    onReturn(record.id, itemIdx, n)
  }

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={{ ...s.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div>
            <h2 style={s.modalTitle}>Return Goods</h2>
            <p style={s.modalSub}>{record.receiverName} · {item.productName}</p>
          </div>
          <button style={s.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={s.modalBody}>
          <div style={s.returnInfo}>
            <div style={s.returnInfoRow}><span style={s.returnInfoLabel}>Product</span><span style={s.returnInfoVal}>{item.productName} ({item.subCategory})</span></div>
            <div style={s.returnInfoRow}><span style={s.returnInfoLabel}>Category</span><span style={s.returnInfoVal}>{item.category}</span></div>
            <div style={s.returnInfoRow}><span style={s.returnInfoLabel}>Issued</span><span style={s.returnInfoVal}>{item.quantity} {item.unit}</span></div>
            <div style={s.returnInfoRow}><span style={s.returnInfoLabel}>Already Returned</span><span style={{ ...s.returnInfoVal, color: '#ef4444' }}>{item.returned} {item.unit}</span></div>
            <div style={s.returnInfoRow}><span style={s.returnInfoLabel}>Max Returnable</span><span style={{ ...s.returnInfoVal, color: '#2d7a33', fontWeight: 700 }}>{maxReturn} {item.unit}</span></div>
          </div>
          <label style={s.label}>Return Quantity</label>
          <input
            style={{ ...s.input, ...(error ? { borderColor: '#fca5a5' } : {}) }}
            type="number" min="1" max={maxReturn}
            placeholder={`Max ${maxReturn}`}
            value={qty}
            onChange={e => { setQty(e.target.value); setError('') }}
          />
          {error && <p style={s.errorText}>{error}</p>}
          <p style={s.returnNote}>
            Returning will add goods back to stock and reduce the net consumed quantity.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={s.confirmReturnBtn} onClick={handleSubmit}>
              <CornerUpLeft size={14} /> Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrapper: { maxWidth: 1280, margin: '0 auto' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#1a2e1b', margin: '0 0 4px', display: 'flex', alignItems: 'center' },
  pageSubtitle: { fontSize: 13, color: '#9ca3af', margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  iconBtn: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' },
  reportBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13.5, fontWeight: 600, color: '#fff', cursor: 'pointer' },

  reportPanel: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 18px', marginBottom: 16 },
  reportRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  reportLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#1a2e1b' },
  reportBtns: { display: 'flex', gap: 8 },
  csvBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #93c5fd', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#2563eb', cursor: 'pointer' },
  pdfBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#2563eb', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  deleteSelBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #fca5a5', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#ef4444', cursor: 'pointer' },

  searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 14px', marginBottom: 16 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#374151', background: 'transparent' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 },

  tableWrap: { background: '#fff', borderRadius: 12, border: '1px solid #e8f5e9', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '11px 14px', fontSize: 12.5, fontWeight: 700, color: '#374151', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  tr: { transition: 'background 0.15s' },
  td: { padding: '10px 14px', fontSize: 13, color: '#4b5563', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' },

  productName: { fontSize: 13, fontWeight: 600, color: '#1a2e1b' },
  subCatBadge: { display: 'inline-block', background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', borderRadius: 6, padding: '2px 8px', fontSize: 11.5, fontWeight: 600 },

  qtyGroup: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  qtyIssued: { fontSize: 12.5, color: '#374151', fontWeight: 500 },
  qtySep: { fontSize: 11, color: '#d1d5db' },
  qtyReturned: { fontSize: 12.5, color: '#ef4444', fontWeight: 500 },
  qtyNet: { fontSize: 12.5, color: '#2d7a33', fontWeight: 700 },

  commentCell: { display: 'flex', alignItems: 'flex-start', gap: 4, maxWidth: 200 },
  commentText: { fontSize: 12.5, color: '#6b7280', lineHeight: 1.4, flex: 1 },
  commentToggle: { background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', color: '#9ca3af', display: 'flex', flexShrink: 0, marginTop: 1 },

  actionBtns: { display: 'flex', gap: 6, justifyContent: 'flex-end' },
  returnBtn: { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex' },
  viewBtn: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#2d7a33', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex' },
  delBtn: { background: '#fff5f5', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },

  emptyCell: { textAlign: 'center', padding: '48px 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  tableFooter: { padding: '10px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa' },
  footerText: { fontSize: 12.5, color: '#9ca3af' },
  selCount: { color: '#3b82f6', fontWeight: 600 },

  /* Modals */
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 620, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6' },
  modalTitle: { fontSize: 17, fontWeight: 800, color: '#1a2e1b', margin: 0 },
  modalSub: { fontSize: 12.5, color: '#9ca3af', margin: '4px 0 0' },
  modalClose: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280', display: 'flex' },
  modalBody: { padding: '20px 24px', overflowY: 'auto', flex: 1 },

  commentBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 18 },
  commentBoxLabel: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px' },
  commentBoxText: { fontSize: 13.5, color: '#374151', margin: 0, lineHeight: 1.6 },

  itemsTitle: { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 },
  innerTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  innerTh: { padding: '8px 10px', background: '#f0fdf4', color: '#2d7a33', fontWeight: 700, fontSize: 11.5, textAlign: 'left', borderBottom: '1px solid #bbf7d0' },
  innerTd: { padding: '8px 10px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' },

  returnInfo: { background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  returnInfoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  returnInfoLabel: { fontSize: 12, color: '#9ca3af', fontWeight: 600 },
  returnInfoVal: { fontSize: 13.5, color: '#374151', fontWeight: 500 },
  returnNote: { fontSize: 12, color: '#6b7280', marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0', lineHeight: 1.5 },

  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 },
  input: { width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', boxSizing: 'border-box' },
  errorText: { fontSize: 12, color: '#ef4444', margin: '4px 0 0' },
  cancelBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  confirmReturnBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#ea580c', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, color: '#fff', cursor: 'pointer' },
}