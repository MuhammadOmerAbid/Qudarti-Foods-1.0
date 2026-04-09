'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { Factory, ArrowLeft, Save, Plus, X } from 'lucide-react'

const todayISO = () => new Date().toISOString().split('T')[0]

const blankEntry = () => ({
  key: Date.now() + Math.random(),
  product: '',
  startTime: '',
  endTime: '',
  noOfLabour: '',
})

function calcHours(start, end) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function DailyProductionNewPage() {
  const router = useRouter()

  const [date, setDate]       = useState(todayISO())
  const [note, setNote]       = useState('')
  const [entries, setEntries] = useState([blankEntry()])
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})

  const updateEntry = (key, field, value) => {
    setEntries(prev => prev.map(e => e.key === key ? { ...e, [field]: value } : e))
    setErrors(er => ({ ...er, entries: undefined }))
  }
  const addEntry    = () => setEntries(prev => [...prev, blankEntry()])
  const removeEntry = (key) => setEntries(prev => prev.filter(e => e.key !== key))

  const validate = () => {
    const e = {}
    const incomplete = entries.some(en => !en.product.trim() || !en.startTime || !en.endTime || !en.noOfLabour)
    if (incomplete) e.entries = 'Please complete all fields in every entry row'
    const timeError = entries.some(en => {
      if (!en.startTime || !en.endTime) return false
      const [sh, sm] = en.startTime.split(':').map(Number)
      const [eh, em] = en.endTime.split(':').map(Number)
      return (eh * 60 + em) <= (sh * 60 + sm)
    })
    if (timeError) e.time = 'End time must be after start time'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 700)) // replace with real API
      router.push('/daily-production')
    } catch { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div style={s.wrapper}>

        {/* Page Header */}
        <div style={s.pageHeader}>
          <div style={s.headerLeft}>
            <button style={s.backBtn} onClick={() => router.push('/daily-production')}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 style={s.pageTitle}><Factory size={20} color="#f59e0b" style={{ marginRight: 8 }} />Add Production Entry</h1>
              <p style={s.pageSubtitle}>Record daily production activity</p>
            </div>
          </div>
          <button style={saving ? s.saveBtnDis : s.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'SAVE'}
          </button>
        </div>

        <div style={s.card}>

          {/* Date — top full width */}
          <div style={s.dateRow}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Date</label>
              <input type="date" style={s.input} value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {/* Error banners */}
          {errors.entries && <div style={s.errBanner}>{errors.entries}</div>}
          {errors.time    && <div style={s.errBanner}>{errors.time}</div>}

          {/* Entry Rows */}
          <div style={s.entriesHeader}>
            <p style={s.entriesTitle}>Production Entries</p>
            <button style={s.addEntryBtn} onClick={addEntry}><Plus size={14} /> Add Entry</button>
          </div>

          {entries.map((entry, idx) => {
            const hours = calcHours(entry.startTime, entry.endTime)
            return (
              <div key={entry.key} style={s.entryBlock}>
                {/* Entry number tag */}
                <div style={s.entryTag}>#{idx + 1}</div>

                <div style={s.entryFields}>
                  {/* Product - manual text input */}
                  <div style={{ ...s.fieldGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Product Name</label>
                    <input
                      style={s.input}
                      placeholder="Enter product name manually..."
                      value={entry.product}
                      onChange={e => updateEntry(entry.key, 'product', e.target.value)}
                    />
                  </div>

                  {/* Start Time */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Start Time</label>
                    <input
                      type="time"
                      style={s.input}
                      value={entry.startTime}
                      onChange={e => updateEntry(entry.key, 'startTime', e.target.value)}
                    />
                  </div>

                  {/* End Time */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>End Time</label>
                    <input
                      type="time"
                      style={s.input}
                      value={entry.endTime}
                      onChange={e => updateEntry(entry.key, 'endTime', e.target.value)}
                    />
                  </div>

                  {/* Total Hours (auto) */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Total Hours</label>
                    <div style={s.hoursDisplay}>
                      {hours
                        ? <span style={s.hoursBadge}>{hours}</span>
                        : <span style={s.hoursPlaceholder}>Auto-calculated</span>}
                    </div>
                  </div>

                  {/* No of Labour */}
                  <div style={s.fieldGroup}>
                    <label style={s.label}>No of Labour</label>
                    <input
                      style={s.input}
                      type="number"
                      min="1"
                      placeholder="0"
                      value={entry.noOfLabour}
                      onChange={e => updateEntry(entry.key, 'noOfLabour', e.target.value)}
                    />
                  </div>
                </div>

                {/* Remove entry */}
                {entries.length > 1 && (
                  <button style={s.removeEntryBtn} onClick={() => removeEntry(entry.key)} title="Remove entry">
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}

          {/* Add another (bottom dashed) */}
          <button style={s.addEntryDashed} onClick={addEntry}>
            <Plus size={14} /> Add Another Entry
          </button>

          {/* Note */}
          <div style={s.noteSection}>
            <label style={s.label}>Note</label>
            <textarea
              style={s.noteInput}
              placeholder="Any additional notes for this production session..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Footer */}
          <div style={s.formFooter}>
            <button style={s.cancelBtn} onClick={() => router.push('/daily-production')}>Cancel</button>
            <button style={saving ? s.saveBtnDis : s.saveBtn} onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

const s = {
  wrapper: { maxWidth: 860, margin: '0 auto' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex' },
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#1a2e1b', margin: '0 0 2px', display: 'flex', alignItems: 'center' },
  pageSubtitle: { fontSize: 13, color: '#9ca3af', margin: 0 },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', border: 'none', borderRadius: 8, padding: '9px 28px', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.5px' },
  saveBtnDis: { display: 'flex', alignItems: 'center', gap: 6, background: '#a7f3d0', border: 'none', borderRadius: 8, padding: '9px 28px', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'not-allowed' },
  cancelBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer' },

  card: { background: '#fff', borderRadius: 14, border: '1px solid #e8f5e9', padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },

  dateRow: { marginBottom: 20, maxWidth: 280 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },

  errBanner: { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#ef4444', marginBottom: 14 },

  entriesHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  entriesTitle: { fontSize: 14, fontWeight: 700, color: '#374151', margin: 0 },
  addEntryBtn: { display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #86efac', color: '#2d7a33', borderRadius: 7, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' },

  entryBlock: { position: 'relative', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 12, padding: '18px 20px 16px', marginBottom: 12 },
  entryTag: { position: 'absolute', top: -10, left: 16, background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px' },
  entryFields: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' },

  hoursDisplay: { height: 40, display: 'flex', alignItems: 'center' },
  hoursBadge: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#d97706' },
  hoursPlaceholder: { fontSize: 12.5, color: '#d1d5db', fontStyle: 'italic' },

  removeEntryBtn: { position: 'absolute', top: 12, right: 12, background: '#fff5f5', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', display: 'flex' },

  addEntryDashed: { display: 'flex', alignItems: 'center', gap: 6, background: '#fafafa', border: '1px dashed #d1d5db', color: '#9ca3af', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', justifyContent: 'center', marginBottom: 20 },

  noteSection: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 },
  noteInput: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 },

  formFooter: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' },
}