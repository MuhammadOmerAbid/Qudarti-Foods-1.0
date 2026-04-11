'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { productsApi, brandsApi, categoriesApi } from '@/lib/api/endpoints'
import {
  SettingsTable,
  Toggle,
  ActionButtons,
  ConfirmDelete,
  Toast,
  settingsTheme,
} from '@/components/settings/SettingsShared'
import { X, RefreshCw, Plus } from 'lucide-react'

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
        <div style={modalHeader}>
          <h3 style={modalTitle}>{initial?.id ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} style={closeBtn} type="button">
            <X size={18} color={settingsTheme.textMuted} />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Product Name</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Enter product name"
            style={inputStyle}
          />
        </div>

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

        <div style={modalActions}>
          <button onClick={onClose} style={secondaryBtn} type="button">Cancel</button>
          <button onClick={() => onSave(form)} style={primaryBtn} type="button">
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
    } catch {
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    try {
      const payload = { name: form.name, brand: form.brand, category: form.category }
      if (modal?.id) {
        await productsApi.update(modal.id, payload)
        showToast('Product updated')
      } else {
        await productsApi.create(payload)
        showToast('Product added')
      }
      setModal(null)
      load()
    } catch {
      showToast('Failed to save product', 'error')
    }
  }

  const handleToggle = async (item) => {
    if (!canEdit) return
    try {
      await productsApi.toggleStatus(item.id, !item.status)
      load()
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Product deleted')
      load()
    } catch {
      showToast('Failed to delete product', 'error')
    }
  }

  const filtered = items.filter((p) => {
    const statusOk = filter === 'all' || (filter === 'active' ? !!p.status : !p.status)
    const brandOk = !brandFilter || String(p.brand) === brandFilter || p.brand_name === brandFilter
    const catOk = !catFilter || String(p.category) === catFilter || p.category_name === catFilter
    return statusOk && brandOk && catOk
  })

  const td = { padding: '13px 20px', textAlign: 'center', fontSize: 14, color: '#425343' }
  const rows = filtered.map((item) => (
    <tr
      key={item.id}
      style={{ borderBottom: `1px solid ${settingsTheme.borderSoft}` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f8f3' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <td style={td}>{item.name}</td>
      <td style={td}>{item.brand_name || brands.find((b) => b.id === item.brand)?.name || '-'}</td>
      <td style={td}>{item.category_name || categories.find((c) => c.id === item.category)?.name || '-'}</td>
      <td style={td}>
        <Toggle checked={!!item.status} onChange={() => handleToggle(item)} disabled={!canEdit} />
      </td>
      <td style={td}>
        <ActionButtons
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={() => setModal({ ...item, brand: String(item.brand || ''), category: String(item.category || '') })}
          onDelete={() => setDeleteTarget(item)}
        />
      </td>
    </tr>
  ))

  return (
    <DashboardLayout>
      <div style={pageShell}>
        <div style={pageHeader}>
          <div>
            <h1 style={pageTitle}>Products</h1>
            <p style={pageSubtitle}>Manage your products</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={load} style={iconBtn} title="Refresh" type="button">
              <RefreshCw size={16} color={settingsTheme.textMuted} />
            </button>
            {canEdit && (
              <button onClick={() => setModal({})} style={primaryBtn} type="button">
                <Plus size={15} /> Add Product
              </button>
            )}
          </div>
        </div>

        <div style={filters}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={selectStyle}>
            <option value="">All Brands</option>
            {brands.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
          </select>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={selectStyle}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        </div>

        <div style={tableShell}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: settingsTheme.textSubtle }}>Loading...</div>
          ) : (
            <SettingsTable
              columns={[
                { key: 'product', label: 'Product', align: 'center' },
                { key: 'brand', label: 'Brand', align: 'center' },
                { key: 'category', label: 'Category', align: 'center' },
                { key: 'status', label: 'Status', align: 'center' },
                { key: 'actions', label: 'Actions', align: 'center' },
              ]}
              rows={rows}
              emptyMsg="No products found."
            />
          )}
        </div>
      </div>

      <ProductModal
        open={modal !== null}
        onClose={() => setModal(null)}
        onSave={handleSave}
        brands={brands}
        categories={categories}
        initial={modal}
      />
      <ConfirmDelete
        open={!!deleteTarget}
        name={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </DashboardLayout>
  )
}

const pageShell = {
  background: settingsTheme.pageTint,
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 20,
  padding: 22,
  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
}

const pageHeader = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 20,
}

const pageTitle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: settingsTheme.text,
}

const pageSubtitle = {
  margin: '4px 0 0',
  fontSize: 13,
  color: settingsTheme.textMuted,
}

const iconBtn = {
  width: 36,
  height: 36,
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 10,
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const primaryBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: settingsTheme.primarySoft,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '8px 16px',
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryBtn = {
  padding: '8px 18px',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 10,
  background: '#fff',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  color: '#425343',
}

const filters = {
  display: 'flex',
  gap: 10,
  marginBottom: 14,
  flexWrap: 'wrap',
}

const selectStyle = {
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 9,
  padding: '6px 12px',
  fontSize: 13.5,
  color: '#425343',
  background: '#fff',
  cursor: 'pointer',
  outline: 'none',
  minWidth: 140,
}

const tableShell = {
  background: '#fff',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 14,
  overflow: 'hidden',
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(26,46,27,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
}

const modal = {
  background: '#fff',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 16,
  padding: 28,
  width: 420,
  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
}

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
}

const modalTitle = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: settingsTheme.text,
}

const closeBtn = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
}

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#425343',
  marginBottom: 5,
}

const inputStyle = {
  width: '100%',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13.5,
  color: settingsTheme.text,
  outline: 'none',
  boxSizing: 'border-box',
}

const modalActions = {
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-end',
}
