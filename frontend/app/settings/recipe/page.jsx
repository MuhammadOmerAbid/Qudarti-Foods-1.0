'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { recipesApi } from '@/lib/api/endpoints'
import { ConfirmDelete, Toast, Toggle } from '@/components/settings/SettingsShared'
import { X, Plus, Trash2 } from 'lucide-react'

function RecipeModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: '', for_quantity: '', for_unit: 'Kg', items: [] })
  useEffect(() => {
    if (open) setForm(initial?.id
      ? { name: initial.name, for_quantity: initial.for_quantity, for_unit: initial.for_unit || 'Kg', items: initial.items || [] }
      : { name: '', for_quantity: '', for_unit: 'Kg', items: [] })
  }, [open, initial])
  if (!open) return null

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ingredient: '', quantity: '', unit: 'Gram' }] }))
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const setItem = (i, k, v) => setForm((f) => {
    const items = [...f.items]
    items[i] = { ...items[i], [k]: v }
    return { ...f, items }
  })

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{initial?.id ? 'Edit Recipe' : 'Add Recipe'}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} color="#6b7280" /></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Recipe Name</label>
          <input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="e.g. Tea" style={inp} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>For Quantity</label>
            <input value={form.for_quantity} onChange={(e) => setF('for_quantity', e.target.value)} placeholder="e.g. 1" type="number" style={inp} />
          </div>
          <div style={{ width: 100 }}>
            <label style={lbl}>Unit</label>
            <select value={form.for_unit} onChange={(e) => setF('for_unit', e.target.value)} style={inp}>
              {['Gram', 'Kg', 'Litre', 'ml', 'Piece'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={lbl}>Ingredients</label>
            <button onClick={addItem} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '4px 10px', fontSize: 12.5, fontWeight: 600, color: '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={13} /> Add Item
            </button>
          </div>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input value={item.ingredient} onChange={(e) => setItem(i, 'ingredient', e.target.value)}
                placeholder="Ingredient" style={{ ...inp, flex: 2 }} />
              <input value={item.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)}
                placeholder="Qty" type="number" style={{ ...inp, width: 70 }} />
              <select value={item.unit} onChange={(e) => setItem(i, 'unit', e.target.value)} style={{ ...inp, width: 90 }}>
                {['Gram', 'Kg', 'Litre', 'ml', 'Piece'].map((u) => <option key={u}>{u}</option>)}
              </select>
              <button onClick={() => removeItem(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                <Trash2 size={14} color="#ef4444" />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={() => onSave(form)} style={saveBtn}>{initial?.id ? 'Update' : 'Add Recipe'}</button>
        </div>
      </div>
    </div>
  )
}

function RecipeCalculator({ recipes }) {
  const [selected, setSelected] = useState('')
  const [qty, setQty] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const recipe = recipes.find((r) => String(r.id) === selected)
    if (!recipe || !qty) return
    const ratio = parseFloat(qty) / parseFloat(recipe.for_quantity || 1)
    const scaled = (recipe.items || []).map((item) => ({
      ...item,
      scaled_qty: (parseFloat(item.quantity || 0) * ratio).toFixed(3),
    }))
    setResult({ recipe, scaled, ratio })
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8f5e9', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#54B45B', padding: '14px 20px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: 15, fontWeight: 700 }}>Recipe Calculator</h3>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Select Recipe</label>
          <select value={selected} onChange={(e) => { setSelected(e.target.value); setResult(null) }} style={inp}>
            <option value="">-- Select a recipe --</option>
            {recipes.map((r) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
          </select>
        </div>
        {selected && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>
                Desired Quantity ({recipes.find((r) => String(r.id) === selected)?.for_unit || ''})
              </label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} type="number"
                placeholder="Enter quantity" style={inp} />
            </div>
            <button onClick={calculate} style={{ ...saveBtn, width: '100%', justifyContent: 'center' }}>
              Calculate
            </button>
          </>
        )}
        {result && (
          <div style={{ marginTop: 16, padding: 14, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#166534' }}>
              Ingredients for {qty} {result.recipe.for_unit}:
            </p>
            {result.scaled.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #dcfce7', fontSize: 13 }}>
                <span style={{ color: '#374151' }}>{item.ingredient}</span>
                <span style={{ fontWeight: 600, color: '#166534' }}>{item.scaled_qty} {item.unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecipePage() {
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const canEdit = isSuperuser || user?.permissions?.includes('recipe_edit')
  const canDelete = isSuperuser || user?.permissions?.includes('recipe_delete')

  const [recipes, setRecipes] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await recipesApi.list()
      setRecipes(Array.isArray(data) ? data : data?.results || [])
    } catch { showToast('Failed to load', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    try {
      if (modal?.id) { await recipesApi.update(modal.id, form); showToast('Recipe updated') }
      else { await recipesApi.create(form); showToast('Recipe added') }
      setModal(null); load()
    } catch { showToast('Failed to save', 'error') }
  }

  const handleDelete = async () => {
    try {
      await recipesApi.delete(deleteTarget.id)
      setDeleteTarget(null); showToast('Recipe deleted'); load()
    } catch { showToast('Failed to delete', 'error') }
  }

  const filtered = recipes.filter((r) => {
    if (filter === 'active') return r.status === 'active' || r.status === true
    if (filter === 'inactive') return r.status !== 'active' && r.status !== true
    return true
  })

  const td = { padding: '12px 20px', fontSize: 14, color: '#374151', textAlign: 'center', verticalAlign: 'top' }

  return (
    <DashboardLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Main Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Recipe</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Manage your recipes</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={load} style={iconBtn}>↻</button>
              {canEdit && <button onClick={() => setModal({})} style={saveBtn}>+ Add Recipe</button>}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={inp}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8f5e9', borderRadius: 12, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Recipe Name', 'For Quantity', 'Items', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 20px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e8f5e9', textAlign: 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No recipes found.</td></tr>
                    : filtered.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f0f9f0' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fafffe'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={td}>{r.name}</td>
                        <td style={td}>{r.for_quantity} {r.for_unit}</td>
                        <td style={{ ...td, textAlign: 'left' }}>
                          {(r.items || []).map((item, i) => (
                            <div key={i} style={{ fontSize: 13, color: '#6b7280' }}>
                              {item.ingredient} - {item.quantity} {item.unit}
                            </div>
                          ))}
                        </td>
                        <td style={td}>{r.status === 'active' || r.status === true ? 'Active' : 'Inactive'}</td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {canEdit && (
                              <button onClick={() => setModal(r)} style={actBtn}><span style={{ fontSize: 13 }}>✏️</span></button>
                            )}
                            {canDelete && (
                              <button onClick={() => setDeleteTarget(r)} style={{ ...actBtn, background: '#fff5f5', border: '1px solid #fecaca' }}>
                                <Trash2 size={13} color="#ef4444" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Calculator */}
        <RecipeCalculator recipes={recipes} />
      </div>

      <RecipeModal open={modal !== null} onClose={() => setModal(null)} onSave={handleSave} initial={modal} />
      <ConfirmDelete open={!!deleteTarget} name={deleteTarget?.name}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </DashboardLayout>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }
const modal = { background: '#fff', borderRadius: 14, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }
const lbl = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inp = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#111827', outline: 'none', boxSizing: 'border-box' }
const cancelBtn = { padding: '8px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#374151' }
const saveBtn = { padding: '8px 16px', border: 'none', borderRadius: 8, background: '#54B45B', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }
const iconBtn = { width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16 }
const actBtn = { width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }