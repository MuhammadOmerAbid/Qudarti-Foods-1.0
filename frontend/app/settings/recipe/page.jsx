'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { recipesApi } from '@/lib/api/endpoints'
import {
  ConfirmDelete,
  Toast,
  ActionButtons,
  settingsTheme,
} from '@/components/settings/SettingsShared'
import { X, Plus, Trash2, RefreshCw } from 'lucide-react'

const UNITS = ['Gram', 'Kg', 'Litre', 'ml', 'Piece']

function RecipeModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: '', for_quantity: '', for_unit: 'Kg', items: [] })

  useEffect(() => {
    if (open) {
      setForm(initial?.id
        ? {
            name: initial.name,
            for_quantity: initial.for_quantity,
            for_unit: initial.for_unit || 'Kg',
            items: initial.items || [],
          }
        : { name: '', for_quantity: '', for_unit: 'Kg', items: [] })
    }
  }, [open, initial])

  if (!open) return null

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ingredient: '', quantity: '', unit: 'Gram' }] }))
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const setItem = (idx, key, value) => setForm((f) => {
    const items = [...f.items]
    items[idx] = { ...items[idx], [key]: value }
    return { ...f, items }
  })

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={modalHeader}>
          <h3 style={modalTitle}>{initial?.id ? 'Edit Recipe' : 'Add Recipe'}</h3>
          <button onClick={onClose} style={closeBtn} type="button">
            <X size={18} color={settingsTheme.textMuted} />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Recipe Name</label>
          <input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="e.g. Tea" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>For Quantity</label>
            <input
              value={form.for_quantity}
              onChange={(e) => setF('for_quantity', e.target.value)}
              placeholder="e.g. 1"
              type="number"
              style={inputStyle}
            />
          </div>
          <div style={{ width: 110 }}>
            <label style={labelStyle}>Unit</label>
            <select value={form.for_unit} onChange={(e) => setF('for_unit', e.target.value)} style={inputStyle}>
              {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={labelStyle}>Ingredients</label>
            <button onClick={addItem} style={smallAddBtn} type="button">
              <Plus size={13} /> Add Item
            </button>
          </div>

          {form.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                value={item.ingredient}
                onChange={(e) => setItem(idx, 'ingredient', e.target.value)}
                placeholder="Ingredient"
                style={{ ...inputStyle, flex: 2 }}
              />
              <input
                value={item.quantity}
                onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                placeholder="Qty"
                type="number"
                style={{ ...inputStyle, width: 76 }}
              />
              <select value={item.unit} onChange={(e) => setItem(idx, 'unit', e.target.value)} style={{ ...inputStyle, width: 96 }}>
                {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
              <button onClick={() => removeItem(idx)} style={removeBtn} type="button">
                <Trash2 size={14} color={settingsTheme.danger} />
              </button>
            </div>
          ))}
        </div>

        <div style={modalActions}>
          <button onClick={onClose} style={secondaryBtn} type="button">Cancel</button>
          <button onClick={() => onSave(form)} style={primaryBtn} type="button">
            {initial?.id ? 'Update' : 'Add Recipe'}
          </button>
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
    setResult({ recipe, scaled })
  }

  return (
    <div style={calcCard}>
      <div style={calcHeader}>
        <h3 style={calcTitle}>Recipe Calculator</h3>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Select Recipe</label>
          <select value={selected} onChange={(e) => { setSelected(e.target.value); setResult(null) }} style={inputStyle}>
            <option value="">Select recipe</option>
            {recipes.map((r) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
          </select>
        </div>

        {selected && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>
                Desired Quantity ({recipes.find((r) => String(r.id) === selected)?.for_unit || ''})
              </label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="Enter quantity" style={inputStyle} />
            </div>
            <button onClick={calculate} style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }} type="button">
              Calculate
            </button>
          </>
        )}

        {result && (
          <div style={calcResult}>
            <p style={calcResultTitle}>
              Ingredients for {qty} {result.recipe.for_unit}:
            </p>
            {result.scaled.map((item, idx) => (
              <div key={idx} style={calcRow}>
                <span style={{ color: '#425343' }}>{item.ingredient}</span>
                <span style={{ fontWeight: 700, color: settingsTheme.primary }}>{item.scaled_qty} {item.unit}</span>
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
    } catch {
      showToast('Failed to load recipes', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    try {
      if (modal?.id) {
        await recipesApi.update(modal.id, form)
        showToast('Recipe updated')
      } else {
        await recipesApi.create(form)
        showToast('Recipe added')
      }
      setModal(null)
      load()
    } catch {
      showToast('Failed to save recipe', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await recipesApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Recipe deleted')
      load()
    } catch {
      showToast('Failed to delete recipe', 'error')
    }
  }

  const filtered = recipes.filter((recipe) => {
    if (filter === 'active') return recipe.status === 'active' || recipe.status === true
    if (filter === 'inactive') return recipe.status !== 'active' && recipe.status !== true
    return true
  })

  const td = { padding: '12px 20px', fontSize: 14, color: '#425343', textAlign: 'center', verticalAlign: 'top' }

  return (
    <DashboardLayout>
      <div style={pageShell}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 20, alignItems: 'start' }}>
          <div>
            <div style={pageHeader}>
              <div>
                <h1 style={pageTitle}>Recipe</h1>
                <p style={pageSubtitle}>Manage your recipes</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={load} style={iconBtn} type="button" title="Refresh">
                  <RefreshCw size={16} color={settingsTheme.textMuted} />
                </button>
                {canEdit && (
                  <button onClick={() => setModal({})} style={primaryBtn} type="button">
                    <Plus size={15} /> Add Recipe
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={tableShell}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: settingsTheme.textSubtle }}>Loading...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Recipe Name', 'For Quantity', 'Items', 'Status', 'Actions'].map((header) => (
                        <th key={header} style={tableHead}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: settingsTheme.textSubtle }}>No recipes found.</td></tr>
                    ) : filtered.map((recipe) => (
                      <tr
                        key={recipe.id}
                        style={{ borderBottom: `1px solid ${settingsTheme.borderSoft}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f8f3' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={td}>{recipe.name}</td>
                        <td style={td}>{recipe.for_quantity} {recipe.for_unit}</td>
                        <td style={{ ...td, textAlign: 'left' }}>
                          {(recipe.items || []).map((item, idx) => (
                            <div key={idx} style={{ fontSize: 13, color: settingsTheme.textMuted }}>
                              {item.ingredient} - {item.quantity} {item.unit}
                            </div>
                          ))}
                        </td>
                        <td style={td}>{recipe.status === 'active' || recipe.status === true ? 'Active' : 'Inactive'}</td>
                        <td style={td}>
                          <ActionButtons
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onEdit={() => setModal(recipe)}
                            onDelete={() => setDeleteTarget(recipe)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <RecipeCalculator recipes={recipes} />
        </div>
      </div>

      <RecipeModal open={modal !== null} onClose={() => setModal(null)} onSave={handleSave} initial={modal} />
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
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 18,
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

const tableShell = {
  background: '#fff',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 14,
  overflow: 'hidden',
}

const tableHead = {
  padding: '12px 20px',
  background: '#eef2ee',
  fontSize: 13,
  fontWeight: 700,
  color: '#455645',
  borderBottom: `1px solid ${settingsTheme.border}`,
  textAlign: 'center',
}

const calcCard = {
  background: '#fff',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 14,
  overflow: 'hidden',
}

const calcHeader = {
  background: '#edf8ef',
  borderBottom: `1px solid ${settingsTheme.border}`,
  padding: '14px 20px',
}

const calcTitle = {
  margin: 0,
  color: settingsTheme.text,
  fontSize: 15,
  fontWeight: 700,
}

const calcResult = {
  marginTop: 16,
  padding: 14,
  background: '#edf8ef',
  borderRadius: 10,
  border: `1px solid ${settingsTheme.border}`,
}

const calcResultTitle = {
  margin: '0 0 10px',
  fontSize: 13,
  fontWeight: 700,
  color: settingsTheme.primary,
}

const calcRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '5px 0',
  borderBottom: `1px solid ${settingsTheme.border}`,
  fontSize: 13,
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
  width: 500,
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

const removeBtn = {
  border: '1px solid #fecaca',
  background: settingsTheme.dangerBg,
  borderRadius: 8,
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const modalActions = {
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-end',
  marginTop: 10,
}

const iconBtn = {
  width: 36,
  height: 36,
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 10,
  background: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  minWidth: 130,
}

const primaryBtn = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: 10,
  background: settingsTheme.primarySoft,
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const smallAddBtn = {
  background: '#edf8ef',
  border: `1px solid ${settingsTheme.border}`,
  borderRadius: 8,
  padding: '5px 10px',
  fontSize: 12.5,
  fontWeight: 700,
  color: settingsTheme.primary,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
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
