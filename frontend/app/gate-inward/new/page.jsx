'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { ArrowDownToLine, Plus, X, ArrowLeft, Save } from 'lucide-react'

/* ─── Replace with API calls in production ─── */
const SUPPLIERS = [
  { id: 1, name: 'Soghat Enterprises', address: 'Plot 12, Industrial Area, Lahore' },
  { id: 2, name: 'Al-Faisal Trading', address: 'Shop 5, Main Market, Karachi' },
  { id: 3, name: 'Hassan & Sons', address: 'Block C, Gulberg III, Lahore' },
]

const BRANDS = [
  { id: 1, name: 'Soghat' },
  { id: 2, name: 'General' },
  { id: 3, name: 'Premium' },
]

const CATEGORIES = [
  { id: 1, brandId: 2, name: 'Seal' },
  { id: 2, brandId: 1, name: 'Bottle' },
  { id: 3, brandId: 1, name: 'Sticker' },
  { id: 4, brandId: 3, name: 'Carton' },
]

const PRODUCTS = [
  { id: 1, categoryId: 1, name: '69 mm Seal' },
  { id: 2, categoryId: 1, name: '72 MM Seal' },
  { id: 3, categoryId: 2, name: '500ml Bottle' },
  { id: 4, categoryId: 2, name: '1L Bottle' },
  { id: 5, categoryId: 3, name: 'Front Sticker' },
  { id: 6, categoryId: 4, name: 'Standard Carton' },
]

const UNITS = ['Unit', 'Bags', 'Carton', 'Dozen', 'KG', 'Litre']

/* Auto-generate GR number */
const getNextGR = () => `QUD${Math.floor(Math.random() * 900) + 100}`

/* Today in YYYY-MM-DD for date input */
const todayISO = () => new Date().toISOString().split('T')[0]

/* Fresh blank item row */
const blankItem = () => ({
  key: Date.now() + Math.random(),
  brandId: '', brandName: '',
  categoryId: '', categoryName: '',
  productId: '', productName: '',
  quantity: '', unit: 'Unit',
})

export default function GateInwardNewPage() {
  const router = useRouter()

  const [grNo] = useState(getNextGR())
  const [receiveDate, setReceiveDate] = useState(todayISO())
  const [supplierId, setSupplierId] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState([blankItem()])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  /* ── Supplier selected ── */
  const handleSupplierChange = (e) => {
    const id = Number(e.target.value)
    setSupplierId(id)
    const sup = SUPPLIERS.find(s => s.id === id)
    setAddress(sup?.address || '')
    setErrors(err => ({ ...err, supplier: undefined }))
  }

  /* ── Item row update ── */
  const updateItem = (key, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.key !== key) return item
      const updated = { ...item, [field]: value }
      if (field === 'brandId') {
        const brand = BRANDS.find(b => b.id === Number(value))
        updated.brandName = brand?.name || ''
        updated.categoryId = ''; updated.categoryName = ''
        updated.productId = ''; updated.productName = ''
      }
      if (field === 'categoryId') {
        const cat = CATEGORIES.find(c => c.id === Number(value))
        updated.categoryName = cat?.name || ''
        updated.productId = ''; updated.productName = ''
      }
      if (field === 'productId') {
        const prod = PRODUCTS.find(p => p.id === Number(value))
        updated.productName = prod?.name || ''
      }
      return updated
    }))
    setErrors(err => ({ ...err, items: undefined }))
  }

  const addItem = () => setItems(prev => [...prev, blankItem()])
  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key))

  /* ── Validate ── */
  const validate = () => {
    const e = {}
    if (!supplierId) e.supplier = 'Please select a supplier'
    const incomplete = items.some(i => !i.brandId || !i.categoryId || !i.productId || !i.quantity)
    if (incomplete) e.items = 'Please complete all item fields'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Save ── */
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      // TODO: replace with real API call
      await new Promise(r => setTimeout(r, 800))
      router.push('/gate-inward')
    } catch {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={s.wrapper}>

        {/* Page Header */}
        <div style={s.pageHeader}>
          <div style={s.headerLeft}>
            <button style={s.backBtn} onClick={() => router.push('/gate-inward')}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 style={s.pageTitle}><ArrowDownToLine size={20} color="#54B45B" style={{ marginRight: 8 }} />Gate Inward</h1>
              <p style={s.pageSubtitle}>Add new entry</p>
            </div>
          </div>
          <button style={saving ? s.saveBtnDisabled : s.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'SAVE'}
          </button>
        </div>

        {/* Form Card */}
        <div style={s.card}>

          {/* Top Row: GR, Date, Supplier */}
          <div style={s.topRow}>
            {/* GR Number (read-only, auto) */}
            <div style={s.fieldGroup}>
              <label style={s.label}>GR Number:</label>
              <div style={s.readonlyInput}>{grNo}</div>
            </div>

            {/* Receive Date (auto today, changeable) */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Receive Date:</label>
              <input
                type="date"
                style={s.input}
                value={receiveDate}
                onChange={e => setReceiveDate(e.target.value)}
              />
            </div>

            {/* Supplier dropdown */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Supplier Name:</label>
              <select
                style={{ ...s.input, ...(errors.supplier ? s.inputError : {}) }}
                value={supplierId}
                onChange={handleSupplierChange}
              >
                <option value="">-- Select Supplier --</option>
                {SUPPLIERS.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
              {errors.supplier && <span style={s.errorText}>{errors.supplier}</span>}
            </div>
          </div>

          {/* Address & Note */}
          <div style={s.midRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Address*:</label>
              <textarea
                style={{ ...s.input, ...s.textarea }}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Auto-filled from supplier selection"
                readOnly={!!supplierId}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Note*:</label>
              <textarea
                style={{ ...s.input, ...s.textarea }}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note..."
              />
            </div>
          </div>

          {/* Add item button */}
          <div style={s.itemsHeader}>
            <button style={s.addItemBtn} onClick={addItem}>
              <Plus size={15} />
            </button>
          </div>

          <div style={s.divider} />

          {/* Item Rows */}
          {errors.items && <div style={s.itemsError}>{errors.items}</div>}

          {items.map((item, idx) => {
            const brandCats = CATEGORIES.filter(c => c.brandId === Number(item.brandId))
            const catProds = PRODUCTS.filter(p => p.categoryId === Number(item.categoryId))

            return (
              <div key={item.key} style={s.itemRow}>
                {/* Brand */}
                <div style={s.itemField}>
                  {idx === 0 && <label style={s.label}>Select Brand</label>}
                  <select style={s.input} value={item.brandId} onChange={e => updateItem(item.key, 'brandId', e.target.value)}>
                    <option value="">Select Brand</option>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                {/* Category (brand-filtered) */}
                <div style={s.itemField}>
                  {idx === 0 && <label style={s.label}>Select Category</label>}
                  <select style={s.input} value={item.categoryId} onChange={e => updateItem(item.key, 'categoryId', e.target.value)} disabled={!item.brandId}>
                    <option value="">Select Category</option>
                    {brandCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Product (category-filtered) */}
                <div style={s.itemField}>
                  {idx === 0 && <label style={s.label}>Select Product</label>}
                  <select style={s.input} value={item.productId} onChange={e => updateItem(item.key, 'productId', e.target.value)} disabled={!item.categoryId}>
                    <option value="">Select Product</option>
                    {catProds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {/* Quantity */}
                <div style={{ ...s.itemField, flex: '0 0 120px' }}>
                  {idx === 0 && <label style={s.label}>Quantity</label>}
                  <input
                    style={s.input}
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={e => updateItem(item.key, 'quantity', e.target.value)}
                  />
                </div>

                {/* Unit */}
                <div style={{ ...s.itemField, flex: '0 0 120px' }}>
                  {idx === 0 && <label style={s.label}>Select Unit</label>}
                  <select style={s.input} value={item.unit} onChange={e => updateItem(item.key, 'unit', e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>

                {/* Remove */}
                <div style={{ ...s.itemField, flex: '0 0 36px', alignSelf: 'flex-end' }}>
                  {items.length > 1 && (
                    <button style={s.removeBtn} onClick={() => removeItem(item.key)} title="Remove item">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Bottom Save Button */}
          <div style={s.formFooter}>
            <button style={s.cancelBtn} onClick={() => router.push('/gate-inward')}>Cancel</button>
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
  midRow: { display: 'flex', gap: 20, marginBottom: 20 },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  itemField: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },

  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  inputError: { borderColor: '#fca5a5', background: '#fff5f5' },
  readonlyInput: { background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#374151', fontWeight: 600 },
  textarea: { height: 80, resize: 'vertical', fontFamily: 'inherit' },

  errorText: { fontSize: 11.5, color: '#ef4444', marginTop: 2 },
  itemsError: { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#ef4444', marginBottom: 12 },

  itemsHeader: { display: 'flex', justifyContent: 'flex-end', marginBottom: 12 },
  addItemBtn: { background: '#54B45B', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', boxShadow: '0 2px 8px rgba(84,180,91,0.35)' },

  divider: { height: 1, background: '#f3f4f6', marginBottom: 16 },

  itemRow: { display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' },

  removeBtn: { background: '#fff5f5', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 6, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 36 },

  formFooter: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' },
}