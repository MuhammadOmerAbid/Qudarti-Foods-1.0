'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { suppliersApi } from '@/lib/api/endpoints'
import {
  SettingsPageShell, SettingsTable, Toggle,
  ActionButtons, ConfirmDelete, Toast, settingsTheme,
} from '@/components/settings/SettingsShared'
import { Check, X } from 'lucide-react'

export default function FinishedGoodProductsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const canEdit = isSuperuser || user?.permissions?.includes('suppliers_edit')
  const canDelete = isSuperuser || user?.permissions?.includes('suppliers_delete')

  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', contact: '', address: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await suppliersApi.list()
      setItems(Array.isArray(data) ? data : data?.results || [])
    } catch {
      showToast('Failed to load finished good products', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (item) => {
    setEditId(item.id)
    setEditForm({
      name: item.name || '',
      contact: item.contact || '',
      address: item.address || '',
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm({ name: '', contact: '', address: '' })
  }

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    try {
      await suppliersApi.update(editId, {
        name: editForm.name.trim(),
        contact: editForm.contact.trim(),
        address: editForm.address.trim(),
      })
      showToast('Entry updated')
      cancelEdit()
      load()
    } catch {
      showToast('Failed to save entry', 'error')
    }
  }

  const handleToggle = async (item) => {
    if (!canEdit) return
    try {
      await suppliersApi.update(item.id, { status: !item.status })
      load()
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await suppliersApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      showToast('Entry deleted')
      load()
    } catch {
      showToast('Failed to delete entry', 'error')
    }
  }

  const filtered = items.filter((entry) => {
    if (filter === 'active') return !!entry.status
    if (filter === 'inactive') return !entry.status
    return true
  })

  const td = { padding: '12px 20px', textAlign: 'center', fontSize: 14, color: '#425343' }

  const rows = filtered.map((item) => {
    const isEditing = editId === item.id
    return (
      <tr
        key={item.id}
        style={{ borderBottom: `1px solid ${settingsTheme.borderSoft}` }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f8f3' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <td style={td}>
          {isEditing ? (
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              style={s.cellInput}
              placeholder="Name"
            />
          ) : item.name}
        </td>
        <td style={{ ...td, color: settingsTheme.textMuted }}>
          {isEditing ? (
            <input
              value={editForm.contact}
              onChange={(e) => setEditForm((prev) => ({ ...prev, contact: e.target.value }))}
              style={s.cellInput}
              placeholder="Code / Contact"
            />
          ) : (item.contact || '—')}
        </td>
        <td style={{ ...td, color: settingsTheme.textMuted }}>
          {isEditing ? (
            <input
              value={editForm.address}
              onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
              style={s.cellInput}
              placeholder="Description"
            />
          ) : (item.address || '—')}
        </td>
        <td style={td}>
          <Toggle
            checked={!!item.status}
            disabled={!canEdit || isEditing}
            onChange={() => handleToggle(item)}
          />
        </td>
        <td style={td}>
          {isEditing ? (
            <div style={s.editActions}>
              <button type="button" onClick={saveEdit} style={s.saveBtn} title="Save">
                <Check size={14} color="#fff" />
              </button>
              <button type="button" onClick={cancelEdit} style={s.cancelBtn} title="Cancel">
                <X size={14} color={settingsTheme.textMuted} />
              </button>
            </div>
          ) : (
            <ActionButtons
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={() => startEdit(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
        </td>
      </tr>
    )
  })

  return (
    <DashboardLayout>
      <SettingsPageShell
        title="Finished Good Products"
        subtitle="Manage finished good product entries"
        onAdd={() => router.push('/settings/finished-good-products/new')}
        onRefresh={load}
        filterValue={filter}
        onFilterChange={setFilter}
        addLabel="Add Finished Good Product"
        canEdit={canEdit}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: settingsTheme.textSubtle }}>Loading...</div>
        ) : (
          <SettingsTable
            columns={[
              { key: 'name', label: 'Name', align: 'center' },
              { key: 'contact', label: 'Code / Contact', align: 'center' },
              { key: 'address', label: 'Description', align: 'center' },
              { key: 'status', label: 'Status', align: 'center' },
              { key: 'actions', label: 'Actions', align: 'center' },
            ]}
            rows={rows}
            emptyMsg="No entries found."
          />
        )}
      </SettingsPageShell>

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

const s = {
  cellInput: {
    width: '100%',
    border: `1px solid ${settingsTheme.border}`,
    borderRadius: 9,
    padding: '7px 10px',
    fontSize: 13,
    color: settingsTheme.text,
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  editActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  saveBtn: {
    width: 30,
    height: 30,
    border: 'none',
    borderRadius: 8,
    background: settingsTheme.primarySoft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  cancelBtn: {
    width: 30,
    height: 30,
    border: `1px solid ${settingsTheme.border}`,
    borderRadius: 8,
    background: '#f8faf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}
