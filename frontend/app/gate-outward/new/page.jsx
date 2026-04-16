'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { ArrowUpFromLine, Plus, X, ArrowLeft, Save } from 'lucide-react'
import { StoreThemeDatePicker, StoreThemeDropdown } from '@/components/store/shared/StoreThemeControls'
import {
  CUSTOMERS,
  GATE_OUTWARD_STORAGE_KEY,
  INITIAL_GATE_OUTWARD_RECORDS,
  PRODUCTS,
  SOURCES,
  UNITS,
} from '@/lib/gateOutwardMock'

const todayISO = () => new Date().toISOString().split('T')[0]

const blankItem = () => ({
  key: Date.now() + Math.random(),
  source: '',
  productId: '',
  quantity: '',
  unit: 'Unit',
  error: '',
})

function loadRecords() {
  if (typeof window === 'undefined') return INITIAL_GATE_OUTWARD_RECORDS
  try {
    const raw = window.localStorage.getItem(GATE_OUTWARD_STORAGE_KEY)
    if (!raw) return INITIAL_GATE_OUTWARD_RECORDS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_GATE_OUTWARD_RECORDS
  } catch {
    return INITIAL_GATE_OUTWARD_RECORDS
  }
}

function saveRecords(next) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GATE_OUTWARD_STORAGE_KEY, JSON.stringify(next))
}

function nextGoNo(records) {
  const maxNum = records.reduce((max, r) => {
    const n = Number(String(r.goNo || '').replace(/\D/g, ''))
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  return `QUD${maxNum + 1}`
}

function toDMY(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}

export default function GateOutwardNewPage() {
  const router = useRouter()

  const [goNo, setGoNo] = useState('QUD1')
  const [date, setDate] = useState(todayISO())
  const [customerId, setCustomerId] = useState('')
  const [address, setAddress] = useState('')

  const [vehicleNo, setVehicleNo] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverCnic, setDriverCnic] = useState('')

  const [note, setNote] = useState('')
  const [numbering, setNumbering] = useState('')
  const [batchNumber, setBatchNumber] = useState('')

  const [items, setItems] = useState([blankItem()])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const records = loadRecords()
    setGoNo(nextGoNo(records))
  }, [])

  const customer = useMemo(() => CUSTOMERS.find((c) => c.id === Number(customerId)) || null, [customerId])

  const updateItem = (key, field, value) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row
        const updated = { ...row, [field]: value, error: '' }

        if (field === 'productId') {
          const product = PRODUCTS.find((p) => p.id === Number(value))
          updated.unit = product?.unit || row.unit
          if (updated.quantity && product && Number(updated.quantity) > product.available) {
            updated.quantity = String(product.available)
            updated.error = `Quantity cannot be over ${product.available} ${product.unit}`
          }
        }

        if (field === 'quantity') {
          const product = PRODUCTS.find((p) => p.id === Number(updated.productId))
          if (product && Number(value) > product.available) {
            updated.quantity = String(product.available)
            updated.error = `Quantity cannot be over ${product.available} ${product.unit}`
          }
        }

        return updated
      })
    )

    setErrors((prev) => ({ ...prev, items: undefined }))
  }

  const addItem = () => setItems((prev) => [...prev, blankItem()])
  const removeItem = (key) => setItems((prev) => (prev.length > 1 ? prev.filter((x) => x.key !== key) : prev))

  const validate = () => {
    const nextErrors = {}

    if (!date) nextErrors.date = 'Please select a date'
    if (!customerId) nextErrors.customer = 'Please select a customer'

    const missing = items.some((row) => !row.source || !row.productId || !row.quantity || Number(row.quantity) <= 0)
    if (missing) nextErrors.items = 'Please complete source, product, and quantity for all rows'

    const overLimitRow = items.find((row) => {
      const p = PRODUCTS.find((x) => x.id === Number(row.productId))
      if (!p) return false
      return Number(row.quantity) > p.available
    })

    if (overLimitRow) nextErrors.items = 'Quantity cannot be over available stock'

    const totalByProduct = items.reduce((acc, row) => {
      const productIdNum = Number(row.productId)
      if (!productIdNum) return acc
      acc[productIdNum] = (acc[productIdNum] || 0) + Number(row.quantity || 0)
      return acc
    }, {})

    const productOverTotal = Object.entries(totalByProduct).find(([id, total]) => {
      const p = PRODUCTS.find((x) => x.id === Number(id))
      return p && total > p.available
    })

    if (productOverTotal) {
      const p = PRODUCTS.find((x) => x.id === Number(productOverTotal[0]))
      nextErrors.items = `${p.name}: total quantity cannot be over ${p.available} ${p.unit}`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    try {
      const existing = loadRecords()

      const record = {
        id: Date.now(),
        goNo,
        date: toDMY(date),
        vehicleNo,
        driverName,
        driverPhone,
        driverCnic,
        customerName: customer?.name || '',
        address,
        note,
        numbering,
        batchNumber,
        items: items.map((row) => {
          const p = PRODUCTS.find((x) => x.id === Number(row.productId))
          return {
            source: row.source,
            productId: p?.id,
            productName: p?.name || '',
            brand: p?.brand || '',
            quantity: Number(row.quantity),
            unit: row.unit || p?.unit || 'Unit',
          }
        }),
      }

      const next = [record, ...existing]
      saveRecords(next)
      router.push('/gate-outward')
    } catch {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={s.wrapper}>
        <div style={s.pageHeader}>
          <div style={s.headerLeft}>
            <button style={s.backBtn} onClick={() => router.push('/gate-outward')}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 style={s.pageTitle}><ArrowUpFromLine size={20} color="#54B45B" style={{ marginRight: 8 }} />Gate Outward</h1>
              <p style={s.pageSubtitle}>Add new entry</p>
            </div>
          </div>
          <button style={saving ? s.saveBtnDisabled : s.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'SAVE'}
          </button>
        </div>

        <div style={s.card}>
          <div style={s.topRow}>
            <div style={s.fieldGroup}>
              <label style={s.label}>GO Number:</label>
              <div style={s.readonlyInput}>{goNo}</div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Date:</label>
              <StoreThemeDatePicker
                value={date}
                onChange={setDate}
                placeholder="Select date"
                variant="input"
                triggerStyle={errors.date ? s.inputError : {}}
              />
              {errors.date && <span style={s.errorText}>{errors.date}</span>}
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Customer:</label>
              <StoreThemeDropdown
                value={customerId}
                onChange={(nextCustomerId) => {
                  const id = String(nextCustomerId)
                  setCustomerId(id)
                  const picked = CUSTOMERS.find((c) => c.id === Number(id))
                  setAddress(picked?.address || '')
                  setErrors((prev) => ({ ...prev, customer: undefined }))
                }}
                hasError={Boolean(errors.customer)}
                variant="input"
                placeholder="Select Customer"
                options={[
                  { value: '', label: 'Select Customer' },
                  ...CUSTOMERS.map((c) => ({ value: String(c.id), label: c.name })),
                ]}
              />
              {errors.customer && <span style={s.errorText}>{errors.customer}</span>}
            </div>
          </div>

          <div style={s.midRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Address:</label>
              <textarea
                style={{ ...s.input, ...s.textarea }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Auto-filled from customer selection"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Note:</label>
              <textarea style={{ ...s.input, ...s.textarea }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note..." />
            </div>
          </div>

          <div style={s.extraRow}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Numbering:</label>
              <textarea style={{ ...s.input, ...s.textareaSmall }} value={numbering} onChange={(e) => setNumbering(e.target.value)} placeholder="Add numbering comment" />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Batch Number:</label>
              <textarea style={{ ...s.input, ...s.textareaSmall }} value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="Add batch number comment" />
            </div>
          </div>

          <div style={s.driverRow}>
            <input style={s.input} placeholder="Vehicle No." value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            <input style={s.input} placeholder="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            <input style={s.input} placeholder="Driver Phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
            <input style={s.input} placeholder="Driver CNIC" value={driverCnic} onChange={(e) => setDriverCnic(e.target.value)} />
          </div>

          <div style={s.itemsHeader}>
            <button style={s.addItemBtn} onClick={addItem}>
              <Plus size={15} />
            </button>
          </div>

          <div style={s.divider} />

          {errors.items && <div style={s.itemsError}>{errors.items}</div>}

          {items.map((item, idx) => {
            const product = PRODUCTS.find((p) => p.id === Number(item.productId))
            const availableText = product ? `Available: ${product.available} ${product.unit}` : 'Select product to view available stock'

            return (
              <div key={item.key} style={s.itemBlock}>
                <div style={s.itemRow}>
                  <div style={s.itemField}>
                    {idx === 0 && <label style={s.label}>Source</label>}
                    <StoreThemeDropdown
                      value={item.source}
                      onChange={(nextSource) => updateItem(item.key, 'source', nextSource)}
                      variant="input"
                      placeholder="Source"
                      options={[
                        { value: '', label: 'Source' },
                        ...SOURCES.map((src) => ({ value: src, label: src })),
                      ]}
                    />
                  </div>

                  <div style={s.itemField}>
                    {idx === 0 && <label style={s.label}>Select Product</label>}
                    <StoreThemeDropdown
                      value={item.productId}
                      onChange={(nextProductId) => updateItem(item.key, 'productId', String(nextProductId))}
                      variant="input"
                      placeholder="Select Product"
                      options={[
                        { value: '', label: 'Select Product' },
                        ...PRODUCTS.map((p) => ({
                          value: String(p.id),
                          label: `${p.name} (${p.brand})`,
                        })),
                      ]}
                    />
                  </div>

                  <div style={{ ...s.itemField, flex: '0 0 120px' }}>
                    {idx === 0 && <label style={s.label}>Quantity</label>}
                    <input
                      style={s.input}
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, 'quantity', e.target.value)}
                    />
                  </div>

                  <div style={{ ...s.itemField, flex: '0 0 120px' }}>
                    {idx === 0 && <label style={s.label}>Unit</label>}
                    <StoreThemeDropdown
                      value={item.unit}
                      onChange={(nextUnit) => updateItem(item.key, 'unit', nextUnit)}
                      variant="input"
                      options={UNITS.map((u) => ({ value: u, label: u }))}
                    />
                  </div>

                  <div style={{ ...s.itemField, flex: '0 0 36px', alignSelf: 'flex-end' }}>
                    {items.length > 1 && (
                      <button style={s.removeBtn} onClick={() => removeItem(item.key)} title="Remove item">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ ...s.stockHint, color: item.error ? '#ef4444' : '#6b7280' }}>{item.error || availableText}</p>
              </div>
            )
          })}

          <div style={s.formFooter}>
            <button style={s.cancelBtn} onClick={() => router.push('/gate-outward')}>Cancel</button>
            <button style={saving ? s.saveBtnDisabled : s.saveBtn} onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

const s = {
  wrapper: { maxWidth: 1100, margin: '0 auto' },

  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex' },
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#1a2e1b', margin: '0 0 2px', display: 'flex', alignItems: 'center' },
  pageSubtitle: { fontSize: 13, color: '#9ca3af', margin: 0 },

  saveBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', border: 'none', borderRadius: 8, padding: '9px 28px', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.5px' },
  saveBtnDisabled: { display: 'flex', alignItems: 'center', gap: 6, background: '#a7f3d0', border: 'none', borderRadius: 8, padding: '9px 28px', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'not-allowed', letterSpacing: '0.5px' },
  cancelBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer' },

  card: { background: '#fff', borderRadius: 14, border: '1px solid #e8f5e9', padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },

  topRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 },
  midRow: { display: 'flex', gap: 20, marginBottom: 14 },
  extraRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 14 },
  driverRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  itemField: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },

  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  inputError: { borderColor: '#fca5a5', background: '#fff5f5' },
  readonlyInput: { background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#374151', fontWeight: 600 },

  textarea: { height: 80, resize: 'vertical', fontFamily: 'inherit' },
  textareaSmall: { height: 60, resize: 'vertical', fontFamily: 'inherit' },

  errorText: { fontSize: 11.5, color: '#ef4444', marginTop: 2 },
  itemsError: { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#ef4444', marginBottom: 12 },

  itemsHeader: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 },
  addItemBtn: { background: '#54B45B', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', boxShadow: '0 2px 8px rgba(84,180,91,0.35)' },

  divider: { height: 1, background: '#f3f4f6', marginBottom: 16 },
  itemBlock: { marginBottom: 10 },
  itemRow: { display: 'flex', gap: 12, alignItems: 'flex-end' },
  stockHint: { margin: '4px 0 0', fontSize: 11.5, paddingLeft: 2 },

  removeBtn: { background: '#fff5f5', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 6, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 36 },

  formFooter: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' },
}

