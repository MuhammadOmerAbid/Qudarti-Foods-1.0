'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { ClipboardList, ArrowLeft, Save, Plus, X, ChevronDown } from 'lucide-react'

/* ─── Mock Data — replace with real API calls ─── */
const PRODUCTS = [
  { id: 1, name: '69 mm Seal',      category: 'Seal',    subCategory: '69mm',     unit: 'Unit' },
  { id: 2, name: '72 MM Seal',      category: 'Seal',    subCategory: '72mm',     unit: 'Unit' },
  { id: 3, name: '500ml Bottle',    category: 'Bottle',  subCategory: '500ml',    unit: 'Unit' },
  { id: 4, name: '1L Bottle',       category: 'Bottle',  subCategory: '1L',       unit: 'Unit' },
  { id: 5, name: 'Front Sticker',   category: 'Sticker', subCategory: 'Front',    unit: 'Unit' },
  { id: 6, name: 'Standard Carton', category: 'Carton',  subCategory: 'Standard', unit: 'Unit' },
]

const todayISO = () => new Date().toISOString().split('T')[0]
const blankItem = () => ({ key: Date.now() + Math.random(), productId: '', quantity: '' })

export default function RequisitionNewPage() {
  const router = useRouter()

  const [receiverName, setReceiverName] = useState('')
  const [date, setDate]                 = useState(todayISO())
  const [comment, setComment]           = useState('')
  const [items, setItems]               = useState([blankItem()])
  const [saving, setSaving]             = useState(false)
  const [errors, setErrors]             = useState({})

  const COMMENT_LIMIT = 500

  const getProduct = (id) => PRODUCTS.find(p => p.id === Number(id))
  const selectedIds = items.map(i => Number(i.productId)).filter(Boolean)

  const updateItem = (key, field, value) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i))
    setErrors(e => ({ ...e, items: undefined }))
  }
  const addItem    = () => setItems(prev => [...prev, blankItem()])
  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key))

  const validate = () => {
    const e = {}
    if (!receiverName.trim()) e.receiverName = 'Receiver name is required'
    const incomplete = items.some(i => !i.productId || !i.quantity || Number(i.quantity) <= 0)
    if (incomplete) e.items = 'Please complete all product rows'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 700))
      router.push('/requisition')
    } catch { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div style={s.wrapper}>

        {/* Page Header */}
        <div style={s.pageHeader}>
          <div style={s.headerLeft}>
            <button style={s.backBtn} onClick={() => router.push('/requisition')}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 style={s.pageTitle}>
                <ClipboardList size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                Add Goods Requisition
              </h1>
              <p style={s.pageSubtitle}>Create a new goods requisition entry</p>
            </div>
          </div>
          <button style={saving ? s.saveBtnDis : s.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'SAVE'}
          </button>
        </div>

        {/* Form Card */}
        <div style={s.card}>

          {/* Row 1: Receiver Name + Date */}
          <div style={s.topRow}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Receiver Name:</label>
              <input
                style={{ ...s.input, ...(errors.receiverName ? s.inputError : {}) }}
                placeholder="Enter receiver name"
                value={receiverName}
                onChange={e => { setReceiverName(e.target.value); setErrors(er => ({ ...er, receiverName: undefined })) }}
              />
              {errors.receiverName && <span style={s.errorText}>{errors.receiverName}</span>}
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Date:</label>
              <input type="date" style={s.input} value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {/* Product Section Header */}
          <div style={s.sectionHeader}>
            <label style={s.label}>Select Product:</label>
          </div>

          {errors.items && <div style={s.itemsError}>{errors.items}</div>}

          {/* Column Headers */}
          <div style={s.colHeaderRow}>
            <div style={{ flex: 2 }}><span style={s.subLabel}>Product</span></div>
            <div style={{ flex: 1 }}><span style={s.subLabel}>Sub-Category / Type</span></div>
            <div style={{ flex: 1 }}><span style={s.subLabel}>Category</span></div>
            <div style={{ flex: '0 0 110px' }}><span style={s.subLabel}>Quantity</span></div>
            <div style={{ flex: '0 0 80px' }}><span style={s.subLabel}>Unit</span></div>
            <div style={{ flex: '0 0 36px' }} />
          </div>

          {/* Product Rows */}
          {items.map((item) => {
            const prod = getProduct(item.productId)
            const availableProducts = PRODUCTS.filter(
              p => !selectedIds.includes(p.id) || p.id === Number(item.productId)
            )

            return (
              <div key={item.key} style={s.productRow}>

                {/* Product dropdown */}
                <div style={{ ...s.itemField, flex: 2 }}>
                  <div style={s.selectWrap}>
                    <select
                      style={s.select}
                      value={item.productId}
                      onChange={e => updateItem(item.key, 'productId', e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {availableProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} style={s.chevron} />
                  </div>
                </div>

                {/* Sub-Category / Type (auto from product) */}
                <div style={{ ...s.itemField, flex: 1 }}>
                  <div style={s.typeDisplay}>
                    {prod
                      ? <span style={s.subCatBadge}>{prod.subCategory}</span>
                      : <span style={s.typePlaceholder}>—</span>}
                  </div>
                </div>

                {/* Category (auto from product) */}
                <div style={{ ...s.itemField, flex: 1 }}>
                  <div style={s.typeDisplay}>
                    {prod
                      ? <span style={s.catBadge}>{prod.category}</span>
                      : <span style={s.typePlaceholder}>—</span>}
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ ...s.itemField, flex: '0 0 110px' }}>
                  <input
                    style={s.input}
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => updateItem(item.key, 'quantity', e.target.value)}
                  />
                </div>

                {/* Unit (read-only from product) */}
                <div style={{ ...s.itemField, flex: '0 0 80px' }}>
                  <div style={s.unitDisplay}>{prod?.unit || '—'}</div>
                </div>

                {/* Remove Button */}
                <div style={{ ...s.itemField, flex: '0 0 36px', alignSelf: 'center' }}>
                  {items.length > 1 && (
                    <button style={s.removeBtn} onClick={() => removeItem(item.key)} title="Remove">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Selected Products Summary */}
          <div style={s.selectedSection}>
            <p style={s.selectedTitle}>Selected Products</p>
            {items.filter(i => i.productId && i.quantity).length === 0 ? (
              <p style={s.noSelected}>No products selected.</p>
            ) : (
              <div style={s.selectedList}>
                {items.filter(i => i.productId && i.quantity).map(item => {
                  const prod = getProduct(item.productId)
                  return prod ? (
                    <div key={item.key} style={s.selectedChip}>
                      <span style={s.chipName}>{prod.name}</span>
                      <span style={s.chipSubCat}>{prod.subCategory}</span>
                      <span style={s.chipCat}>{prod.category}</span>
                      <span style={s.chipQty}>{item.quantity} {prod.unit}</span>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Add Another Product Button */}
          <button style={s.addProductBtn} onClick={addItem}>
            <Plus size={14} /> Add Another Product
          </button>

          {/* Comment Box */}
          <div style={s.commentSection}>
            <div style={s.commentLabelRow}>
              <label style={s.label}>Comment</label>
              <span style={{
                ...s.charCount,
                color: comment.length >= COMMENT_LIMIT ? '#ef4444' : comment.length > 400 ? '#f59e0b' : '#9ca3af'
              }}>
                {comment.length} / {COMMENT_LIMIT}
              </span>
            </div>
            <textarea
              style={s.commentInput}
              placeholder="Add any additional notes or instructions (optional)..."
              value={comment}
              maxLength={COMMENT_LIMIT}
              onChange={e => setComment(e.target.value)}
              rows={4}
            />
            {comment.length >= COMMENT_LIMIT && (
              <span style={s.limitWarning}>Character limit of {COMMENT_LIMIT} reached</span>
            )}
          </div>

          {/* Footer */}
          <div style={s.formFooter}>
            <button style={s.cancelBtn} onClick={() => router.push('/requisition')}>Cancel</button>
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
  wrapper: { maxWidth: 960, margin: '0 auto' },

  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex' },
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#1a2e1b', margin: '0 0 2px', display: 'flex', alignItems: 'center' },
  pageSubtitle: { fontSize: 13, color: '#9ca3af', margin: 0 },

  saveBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', border: 'none', borderRadius: 8, padding: '9px 28px', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.5px' },
  saveBtnDis: { display: 'flex', alignItems: 'center', gap: 6, background: '#a7f3d0', border: 'none', borderRadius: 8, padding: '9px 28px', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'not-allowed' },
  cancelBtn: { background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, color: '#374151', cursor: 'pointer' },

  card: { background: '#fff', borderRadius: 14, border: '1px solid #e8f5e9', padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },

  topRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  sectionHeader: { marginBottom: 8 },

  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  subLabel: { fontSize: 11.5, fontWeight: 600, color: '#9ca3af', display: 'block' },

  input: { background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  inputError: { borderColor: '#fca5a5', background: '#fff5f5' },
  errorText: { fontSize: 11.5, color: '#ef4444', marginTop: 2 },

  itemsError: { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#ef4444', marginBottom: 12 },

  colHeaderRow: { display: 'flex', gap: 10, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f3f4f6' },
  productRow: { display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' },
  itemField: { display: 'flex', flexDirection: 'column', flex: 1 },

  selectWrap: { position: 'relative' },
  select: { appearance: 'none', WebkitAppearance: 'none', background: '#f0faf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '9px 30px 9px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit' },
  chevron: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' },

  typeDisplay: { display: 'flex', alignItems: 'center', height: 40, paddingLeft: 4 },
  subCatBadge: { display: 'inline-block', background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  catBadge: { display: 'inline-block', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  typePlaceholder: { color: '#d1d5db', fontSize: 13 },
  unitDisplay: { height: 40, display: 'flex', alignItems: 'center', fontSize: 13, color: '#6b7280', fontWeight: 500, paddingLeft: 4 },

  removeBtn: { background: '#fff5f5', border: '1px solid #fecaca', color: '#ef4444', borderRadius: 6, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 38 },

  selectedSection: { background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6', padding: '14px 16px', margin: '18px 0 12px' },
  selectedTitle: { fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px' },
  noSelected: { fontSize: 13, color: '#9ca3af', margin: 0 },
  selectedList: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  selectedChip: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 12px' },
  chipName: { fontSize: 13, fontWeight: 600, color: '#1a2e1b' },
  chipSubCat: { fontSize: 11, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 4, padding: '1px 6px', fontWeight: 600 },
  chipCat: { fontSize: 11, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 4, padding: '1px 6px', fontWeight: 600 },
  chipQty: { fontSize: 12.5, color: '#2d7a33', fontWeight: 700 },

  addProductBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px dashed #86efac', color: '#2d7a33', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' },

  commentSection: { marginTop: 24 },
  commentLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  charCount: { fontSize: 12, fontWeight: 500, transition: 'color 0.2s' },
  commentInput: { width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, color: '#1a2e1b', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 },
  limitWarning: { fontSize: 11.5, color: '#ef4444', marginTop: 4, display: 'block' },

  formFooter: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' },
}