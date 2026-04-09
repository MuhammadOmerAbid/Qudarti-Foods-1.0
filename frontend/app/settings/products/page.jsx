'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { productsApi, brandsApi, categoriesApi } from '@/lib/api/endpoints'
import {
  SettingsPageShell, SettingsTable, Toggle,
  ActionButtons, ConfirmDelete, Toast,
} from '@/components/settings/SettingsShared'
import { X } from 'lucide-react'

function ProductModal({ open, onClose, onSave, brands, categories, initial }) {
  const [form, setForm] = useState({ name: '', brand: '', category: '' })
  useEffect(() => {
    if (open) setForm(initial || { name: '', brand: '', category: '' })
  }, [open, initial])

  if (!open) return null
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
            {initial?.id ? 'Edit Product' : 'Add Product'}
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>
        {[
          { label: 'Product Name', key: 'name', type: 'input', placeholder: 'Enter product name' },
        ].map(({ label, key, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <input value={form[key]} onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder} style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Brand</label>
          <select value={form.brand} onChange={(e) => set('brand', e.target.value)} style={inputStyle}>
            <option value="">Select Brand</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inputStyle}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={() => onSave(form)} style={saveBtn}>
            {initial?.id ? 'Update' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const canEdit = isSuperuser || user?.permissions?.includes('products_edit')
  const canDelete = isSuperuser || user?.permissions?.includes('products_delete')

  const [items, setItems] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, b, c] = await Promise.all([
        productsApi.list({ status: filter !== 'all' ? filter : undefined }),
        brandsApi.list(),
        categoriesApi.list(),
      ])
      setItems(Array.isArray(p) ? p : p?.results || [])
      setBrands(Array.isArray(b) ? b : b?.results || [])
      setCategories(Array.isArray(c) ? c : c?.results || [])
    } catch { showToast('Failed to load', 'error') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    try {
      if (modal?.id) {
        await productsApi.update(modal.id, { name: form.name, brand: form.brand, category: form.category })
        showToast('Product updated')
      } else {
        await productsApi.create({ name: form.name, brand: form.brand, category: form.category })
        showToast('Product added')
      }
      setModal(null); load()
    } catch { showToast('Failed to save', 'error') }
  }

  const handleToggle = async (item) => {
    if (!canEdit) return
    try { await productsApi.toggleStatus(item.id, !item.status); load() }
    catch { showToast('Failed to update status', 'error') }
  }

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteTarget.id)
      setDeleteTarget(null); showToast('Product deleted'); load()
    } catch { showToast('Failed to delete', 'error') }
  }

  const filtered = items.filter((p) => {
    const statusOk = filter === 'all' || (filter === 'active' ? !!p.status : !p.status)
    const brandOk = !brandFilter || String(p.brand) === brandFilter || p.brand_name === brandFilter
    const catOk = !catFilter || String(p.category) === catFilter || p.category_name === catFilter
    return statusOk && brandOk && catOk
  })

  const td = { padding: '12px 20px', textAlign: 'center', fontSize: 14, color: '#374151' }

  const rows = filtered.map((item) => (
    <tr key={item.id} style={{ borderBottom: '1px solid #f0f9f0' }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#fafffe'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <td style={td}>{item.name}</td>
      <td style={td}>{item.brand_name || brands.find((b) => b.id === item.brand)?.name || '-'}</td>
      <td style={td}>{item.category_name || categories.find((c) => c.id === item.category)?.name || '-'}</td>
      <td style={td}>
        <Toggle checked={!!item.status} onChange={() => handleToggle(item)} disabled={!canEdit} />
      </td>
      <td style={td}>
        <ActionButtons canEdit={canEdit} canDelete={canDelete}
          onEdit={() => setModal({ ...item, brand: String(item.brand || ''), category: String(item.category || '') })}
          onDelete={() => setDeleteTarget(item)} />
      </td>
    </tr>
  ))

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Product</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Manage your products</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={load} style={iconBtn} title="Refresh">↻</button>
            {canEdit && (
              <button onClick={() => setModal({})} style={addBtn}>+ Add Product</button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { value: filter, onChange: setFilter, options: [['all','Active'],['active','Active'],['inactive','Inactive']] },
          ].map((_, i) => null)}
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={sel}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={sel}>
            <option value="">Select Brand</option>
            {brands.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
          </select>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={sel}>
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8f5e9', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Product', 'Brand', 'Category', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 20px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e8f5e9', textAlign: 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No products found.</td></tr>
                  : rows}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ProductModal open={modal !== null} onClose={() => setModal(null)}
        onSave={handleSave} brands={brands} categories={categories} initial={modal} />
      <ConfirmDelete open={!!deleteTarget} name={deleteTarget?.name}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </DashboardLayout>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }
const modal = { background: '#fff', borderRadius: 14, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }
const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#111827', outline: 'none', boxSizing: 'border-box' }
const cancelBtn = { padding: '8px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#374151' }
const saveBtn = { padding: '8px 18px', border: 'none', borderRadius: 8, background: '#54B45B', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#fff' }
const iconBtn = { width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16 }
const addBtn = { background: '#54B45B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }
const sel = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 13.5, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none' }