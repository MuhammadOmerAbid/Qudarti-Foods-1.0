'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { recipesApi } from '@/lib/api/endpoints'
import {
  ConfirmDelete,
  Toast,
  ActionButtons,
  SettingsSelect,
  settingsTheme,
} from '@/components/settings/SettingsShared'
import { Plus, RefreshCw } from 'lucide-react'

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
          <SettingsSelect
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value)
              setResult(null)
            }}
            wrapperStyle={{ width: '100%' }}
            selectStyle={selectInputStyle}
          >
            <option value="">Select recipe</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={String(recipe.id)}>{recipe.name}</option>
            ))}
          </SettingsSelect>
        </div>

        {selected ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>
                Desired Quantity ({recipes.find((r) => String(r.id) === selected)?.for_unit || ''})
              </label>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                type="number"
                placeholder="Enter quantity"
                style={inputStyle}
              />
            </div>

            <button onClick={calculate} style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }} type="button">
              Calculate
            </button>
          </>
        ) : null}

        {result ? (
          <div style={calcResult}>
            <p style={calcResultTitle}>Ingredients for {qty} {result.recipe.for_unit}:</p>
            {result.scaled.map((item, idx) => (
              <div key={idx} style={calcRow}>
                <span style={{ color: '#425343' }}>{item.ingredient}</span>
                <span style={{ fontWeight: 700, color: settingsTheme.primary }}>{item.scaled_qty} {item.unit}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function RecipePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const isSuperuser = user?.role === 'superuser'
  const canEdit = isSuperuser || user?.permissions?.includes('recipe_edit')
  const canDelete = isSuperuser || user?.permissions?.includes('recipe_delete')

  const [recipes, setRecipes] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    load()
  }, [load])

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

  const td = {
    padding: '12px 20px',
    fontSize: 14,
    color: '#425343',
    textAlign: 'center',
    verticalAlign: 'top',
  }

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

                {canEdit ? (
                  <button onClick={() => router.push('/settings/recipe/new')} style={primaryBtn} type="button">
                    <Plus size={15} /> Add Recipe
                  </button>
                ) : null}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <SettingsSelect value={filter} onChange={(e) => setFilter(e.target.value)} wrapperStyle={{ minWidth: 130 }} selectStyle={selectStyle}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SettingsSelect>
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
                      <tr>
                        <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: settingsTheme.textSubtle }}>No recipes found.</td>
                      </tr>
                    ) : (
                      filtered.map((recipe) => (
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
                              onEdit={() => router.push(`/settings/recipe/new?id=${recipe.id}`)}
                              onDelete={() => setDeleteTarget(recipe)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <RecipeCalculator recipes={recipes} />
        </div>
      </div>

      <ConfirmDelete
        open={!!deleteTarget}
        name={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
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

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#425343',
  marginBottom: 5,
}

const inputStyle = {
  width: '100%',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: settingsTheme.border,
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13.5,
  color: settingsTheme.text,
  outline: 'none',
  boxSizing: 'border-box',
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
  borderRadius: 40,
  padding: '8px 30px 8px 12px',
  fontSize: 13.5,
  color: settingsTheme.text,
  background: '#fff',
  cursor: 'pointer',
  outline: 'none',
}

const selectInputStyle = {
  borderRadius: 10,
  padding: '8px 30px 8px 12px',
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
