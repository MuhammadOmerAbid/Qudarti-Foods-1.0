'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { Plus, X, ArrowLeft, Save, ChevronDown } from 'lucide-react'

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

function DropdownField({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  hasError = false,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const selected = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  )

  useEffect(() => {
    const handleOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={rootRef} style={s.dropdownWrap}>
      <button
        type="button"
        style={{
          ...s.dropdownTrigger,
          ...(disabled ? s.dropdownDisabled : {}),
          ...(hasError ? s.inputError : {}),
        }}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span style={selected ? s.dropdownValue : s.dropdownPlaceholder}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{ ...s.dropdownChevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && !disabled ? (
        <div style={s.dropdownMenu}>
          {options.map((option) => {
            const active = String(option.value) === String(value)
            return (
              <button
                key={String(option.value)}
                type="button"
                style={{ ...s.dropdownItem, ...(active ? s.dropdownItemActive : {}) }}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

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
  const handleSupplierChange = (nextValue) => {
    if (nextValue === '') {
      setSupplierId('')
      setAddress('')
      setErrors(err => ({ ...err, supplier: undefined }))
      return
    }

    const id = Number(nextValue)
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
              <h1 style={s.pageTitle}>Gate Inward</h1>
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
              <DropdownField
                value={supplierId}
                onChange={handleSupplierChange}
                hasError={Boolean(errors.supplier)}
                placeholder="-- Select Supplier --"
                options={[
                  { value: '', label: '-- Select Supplier --' },
                  ...SUPPLIERS.map((sup) => ({ value: sup.id, label: sup.name })),
                ]}
              />
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
                  <DropdownField
                    value={item.brandId}
                    onChange={(next) => updateItem(item.key, 'brandId', String(next))}
                    placeholder="Select Brand"
                    options={[
                      { value: '', label: 'Select Brand' },
                      ...BRANDS.map((b) => ({ value: b.id, label: b.name })),
                    ]}
                  />
                </div>

                {/* Category (brand-filtered) */}
                <div style={s.itemField}>
                  {idx === 0 && <label style={s.label}>Select Category</label>}
                  <DropdownField
                    value={item.categoryId}
                    onChange={(next) => updateItem(item.key, 'categoryId', String(next))}
                    disabled={!item.brandId}
                    placeholder="Select Category"
                    options={[
                      { value: '', label: 'Select Category' },
                      ...brandCats.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                  />
                </div>

                {/* Product (category-filtered) */}
                <div style={s.itemField}>
                  {idx === 0 && <label style={s.label}>Select Product</label>}
                  <DropdownField
                    value={item.productId}
                    onChange={(next) => updateItem(item.key, 'productId', String(next))}
                    disabled={!item.categoryId}
                    placeholder="Select Product"
                    options={[
                      { value: '', label: 'Select Product' },
                      ...catProds.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                  />
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
                  <DropdownField
                    value={item.unit}
                    onChange={(next) => updateItem(item.key, 'unit', String(next))}
                    placeholder="Select Unit"
                    options={UNITS.map((u) => ({ value: u, label: u }))}
                  />
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
  pageHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 40,
    border: '1.5px solid #d4dfd4',
    background: '#ffffff',
    color: '#2d7a33',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  pageTitle: { fontSize: 30, fontWeight: 800, color: '#1a3d1f', margin: '0 0 4px', display: 'flex', alignItems: 'center', letterSpacing: '-0.6px', lineHeight: 1.2 },
  pageSubtitle: { fontSize: 13.5, color: '#7a8a7a', margin: 0, fontWeight: 500 },
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#1a3d1f',
    border: 'none',
    borderRadius: 40,
    padding: '11px 20px',
    fontSize: 13.5,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
  },
  saveBtnDisabled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#9eb7a1',
    border: 'none',
    borderRadius: 40,
    padding: '11px 20px',
    fontSize: 13.5,
    fontWeight: 700,
    color: '#fff',
    cursor: 'not-allowed',
  },
  cancelBtn: {
    border: '1.5px solid #d4dfd4',
    borderRadius: 40,
    padding: '11px 20px',
    fontSize: 13.5,
    fontWeight: 600,
    color: '#2d7a33',
    background: '#ffffff',
    cursor: 'pointer',
  },
  card: { background: '#f2f4f2', borderRadius: 20, border: '1px solid #e2e8e2', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  topRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 },
  midRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  itemField: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 130 },
  label: { fontSize: 12, fontWeight: 700, color: '#607062' },
  input: {
    background: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d4dfd4',
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 13,
    color: '#1f2f21',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  dropdownWrap: {
    position: 'relative',
    width: '100%',
  },
  dropdownTrigger: {
    width: '100%',
    minHeight: 40,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d4dfd4',
    borderRadius: 10,
    background: '#ffffff',
    color: '#1f2f21',
    padding: '9px 12px',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    cursor: 'pointer',
    textAlign: 'left',
  },
  dropdownValue: {
    color: '#1f2f21',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dropdownPlaceholder: {
    color: '#8a9a8a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dropdownChevron: {
    color: '#607062',
    transition: 'transform 0.18s ease',
    flexShrink: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 40,
    border: '1px solid #d4dfd4',
    borderRadius: 10,
    background: '#ffffff',
    boxShadow: '0 12px 28px rgba(26, 61, 31, 0.12)',
    overflow: 'auto',
    maxHeight: 220,
    padding: 4,
  },
  dropdownItem: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12.5,
    color: '#1f2f21',
    textAlign: 'left',
    cursor: 'pointer',
  },
  dropdownItemActive: {
    background: '#e8f0e8',
    color: '#1f7a2b',
    fontWeight: 700,
  },
  dropdownDisabled: {
    background: '#f4f6f4',
    color: '#9aa69a',
    cursor: 'not-allowed',
  },
  inputError: { borderColor: '#fca5a5', background: '#fff1f2' },
  readonlyInput: { background: '#ffffff', border: '1px solid #d4dfd4', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#374151', fontWeight: 700 },
  textarea: { height: 84, resize: 'vertical', fontFamily: 'inherit' },
  errorText: { fontSize: 12, color: '#b91c1c', marginTop: 2 },
  itemsError: { background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', fontSize: 12.5, color: '#b91c1c', marginBottom: 12 },
  itemsHeader: { display: 'flex', justifyContent: 'flex-end', marginBottom: 10 },
  addItemBtn: { background: '#1a3d1f', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' },
  divider: { height: 1, background: '#d4dfd4', marginBottom: 12 },
  itemRow: { display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end', flexWrap: 'wrap', border: '1px solid #d4dfd4', borderRadius: 12, background: '#ffffff', padding: 10 },
  removeBtn: { background: '#fff1f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 36 },
  formFooter: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid #d4dfd4', flexWrap: 'wrap' },
}
