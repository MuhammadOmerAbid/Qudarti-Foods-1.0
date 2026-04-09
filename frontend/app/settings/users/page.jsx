'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { useAuthStore } from '@/store/authStore'
import { usersApi } from '@/lib/api/endpoints'
import { ConfirmDelete, Toast } from '@/components/settings/SettingsShared'
import { X, Shield, Eye, Pencil, Trash2, User, Plus, ChevronDown, ChevronUp } from 'lucide-react'

// All sections a user can be granted access to
const ALL_SECTIONS = [
  { id: 'gate-inward',       label: 'Gate Inward' },
  { id: 'inventory',         label: 'Inventory' },
  { id: 'goods-requisition', label: 'Goods Requisition' },
  { id: 'daily-production',  label: 'Daily Production' },
  { id: 'finished-goods',    label: 'Finished Goods' },
  { id: 'production-order',  label: 'Production Order' },
  { id: 'gate-outward',      label: 'Gate Outward' },
]

// Per-section edit/delete toggles
const SECTION_ACTIONS = ['edit', 'delete']

function PermissionMatrix({ permissions = [], onChange }) {
  // permissions: array of section ids granted view access
  // edit/delete stored as "<section>_edit" / "<section>_delete"
  const has = (p) => permissions.includes(p)
  const toggle = (p) => {
    const next = has(p) ? permissions.filter((x) => x !== p) : [...permissions, p]
    onChange(next)
  }
  const toggleSection = (sectionId) => {
    const hasView = has(sectionId)
    if (hasView) {
      // remove view + edit + delete
      onChange(permissions.filter((p) => p !== sectionId && p !== `${sectionId}_edit` && p !== `${sectionId}_delete`))
    } else {
      onChange([...permissions, sectionId])
    }
  }

  return (
    <div style={{ border: '1px solid #e8f5e9', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', background: '#f9fafb', borderBottom: '1px solid #e8f5e9' }}>
        {['Section', 'View', 'Edit', 'Delete'].map((h) => (
          <div key={h} style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>{h}</div>
        ))}
      </div>
      {ALL_SECTIONS.map((section) => {
        const hasView = has(section.id)
        return (
          <div key={section.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
            <div style={{ padding: '9px 14px', fontSize: 13, fontWeight: 500, color: '#374151' }}>{section.label}</div>
            {/* View */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Checkbox checked={hasView} onChange={() => toggleSection(section.id)} color="#54B45B" />
            </div>
            {/* Edit */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Checkbox
                checked={has(`${section.id}_edit`)}
                disabled={!hasView}
                onChange={() => toggle(`${section.id}_edit`)}
                color="#3b82f6"
              />
            </div>
            {/* Delete */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Checkbox
                checked={has(`${section.id}_delete`)}
                disabled={!hasView}
                onChange={() => toggle(`${section.id}_delete`)}
                color="#ef4444"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Checkbox({ checked, onChange, disabled, color = '#54B45B' }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange()}
      disabled={disabled}
      style={{
        width: 20, height: 20, borderRadius: 5,
        border: `2px solid ${checked ? color : '#d1d5db'}`,
        background: checked ? color : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function UserModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', permissions: [] })
  const [showPerm, setShowPerm] = useState(true)

  useEffect(() => {
    if (open) {
      setForm(initial?.id
        ? { username: initial.username, email: initial.email || '', password: '', role: initial.role || 'user', permissions: initial.permissions || [] }
        : { username: '', email: '', password: '', role: 'user', permissions: [] })
      setShowPerm(true)
    }
  }, [open, initial])

  if (!open) return null
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
            {initial?.id ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        {/* Basic info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Username *</label>
            <input value={form.username} onChange={(e) => set('username', e.target.value)}
              placeholder="username" style={inp} />
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="email@example.com" type="email" style={inp} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={lbl}>{initial?.id ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••" type="password" style={inp} />
          </div>
          <div>
            <label style={lbl}>Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} style={inp}>
              <option value="user">User</option>
              <option value="superuser">Super User</option>
            </select>
          </div>
        </div>

        {/* Permissions — only for regular users */}
        {form.role !== 'superuser' && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowPerm((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', marginBottom: 10 }}
            >
              <Shield size={14} color="#166534" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', flex: 1, textAlign: 'left' }}>Section Permissions</span>
              {showPerm ? <ChevronUp size={14} color="#166534" /> : <ChevronDown size={14} color="#166534" />}
            </button>
            {showPerm && (
              <PermissionMatrix
                permissions={form.permissions}
                onChange={(p) => set('permissions', p)}
              />
            )}
          </div>
        )}

        {form.role === 'superuser' && (
          <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#92400e', fontWeight: 500 }}>
              ⚠️ Super users have full access to all sections including Settings. No permission configuration needed.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={() => onSave(form)} style={saveBtn}>{initial?.id ? 'Update User' : 'Create User'}</button>
        </div>
      </div>
    </div>
  )
}

function AccessBadge({ perm }) {
  const section = ALL_SECTIONS.find((s) => s.id === perm)
  if (!section) return null
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      background: '#f0fdf4', border: '1px solid #bbf7d0',
      fontSize: 11.5, fontWeight: 600, color: '#166534', margin: '2px 3px',
    }}>
      {section.label}
    </span>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const isSuperuser = currentUser?.role === 'superuser'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterAccess, setFilterAccess] = useState('all')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await usersApi.list()
      setUsers(Array.isArray(data) ? data : data?.results || [])
    } catch { showToast('Failed to load users', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    try {
      const payload = {
        username: form.username,
        email: form.email,
        role: form.role,
        permissions: form.role === 'superuser' ? [] : form.permissions,
      }
      if (form.password) payload.password = form.password

      if (modal?.id) {
        await usersApi.update(modal.id, payload)
        showToast('User updated successfully')
      } else {
        await usersApi.create(payload)
        showToast('User created successfully')
      }
      setModal(null); load()
    } catch { showToast('Failed to save user', 'error') }
  }

  const handleDelete = async () => {
    try {
      await usersApi.delete(deleteTarget.id)
      setDeleteTarget(null); showToast('User deleted'); load()
    } catch { showToast('Failed to delete user', 'error') }
  }

  const handleToggleStatus = async (u) => {
    try {
      await usersApi.update(u.id, { is_active: !u.is_active })
      load()
    } catch { showToast('Failed to update status', 'error') }
  }

  // Filter
  const filtered = users.filter((u) => {
    if (filterAccess === 'superuser') return u.role === 'superuser'
    if (filterAccess === 'user') return u.role !== 'superuser'
    return true
  })

  if (!isSuperuser) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 12, textAlign: 'center' }}>
          <Shield size={48} color="#d1d5db" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#374151' }}>Access Restricted</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Only super users can manage team members.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Team</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Manage your team</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={load} style={iconBtn} title="Refresh">↻</button>
            <button onClick={() => setModal({})} style={addBtn}>
              <Plus size={15} /> Add User
            </button>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select value={filterAccess} onChange={(e) => setFilterAccess(e.target.value)} style={sel}>
            <option value="all">All</option>
            <option value="superuser">Super Users</option>
            <option value="user">Regular Users</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e8f5e9', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['User', 'Access', 'Email', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 20px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e8f5e9', textAlign: 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No users found.</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f0f9f0' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafffe'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* User */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: u.role === 'superuser' ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#54B45B,#3d9144)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                            {(u.username || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{u.username}</div>
                          <div style={{ fontSize: 11.5, color: u.role === 'superuser' ? '#ef4444' : '#54B45B', fontWeight: 500 }}>
                            {u.role === 'superuser' ? 'Super User' : 'User'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Access */}
                    <td style={{ padding: '14px 20px', textAlign: 'center', maxWidth: 260 }}>
                      {u.role === 'superuser' ? (
                        <span style={{ padding: '3px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
                          All Access
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {(u.permissions || [])
                            .filter((p) => !p.includes('_edit') && !p.includes('_delete'))
                            .map((p) => <AccessBadge key={p} perm={p} />)
                          }
                          {(!u.permissions || u.permissions.length === 0) && (
                            <span style={{ fontSize: 12.5, color: '#9ca3af' }}>No access granted</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13.5, color: '#6b7280' }}>
                      {u.email || '—'}
                    </td>

                    {/* Status toggle */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{
                          width: 42, height: 24, borderRadius: 999,
                          background: u.is_active !== false ? '#54B45B' : '#d1d5db',
                          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 3,
                          left: u.is_active !== false ? 21 : 3,
                          width: 18, height: 18, borderRadius: '50%',
                          background: '#fff', transition: 'left 0.2s',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                        }} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => setModal(u)} style={actBtn} title="Edit">
                          <Pencil size={14} color="#6b7280" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button onClick={() => setDeleteTarget(u)} style={{ ...actBtn, background: '#fff5f5', border: '1px solid #fecaca' }} title="Delete">
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Permission legend */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Permission legend:</span>
          {[
            { color: '#54B45B', label: 'View' },
            { color: '#3b82f6', label: 'Edit' },
            { color: '#ef4444', label: 'Delete' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <UserModal open={modal !== null} onClose={() => setModal(null)} onSave={handleSave} initial={modal} />
      <ConfirmDelete open={!!deleteTarget} name={deleteTarget?.username}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </DashboardLayout>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }
const modal = { background: '#fff', borderRadius: 14, padding: 28, width: 540, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }
const lbl = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inp = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#111827', outline: 'none', boxSizing: 'border-box' }
const cancelBtn = { padding: '8px 18px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#374151' }
const saveBtn = { padding: '8px 18px', border: 'none', borderRadius: 8, background: '#54B45B', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#fff' }
const iconBtn = { width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16 }
const addBtn = { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }
const sel = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 13.5, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: 140 }
const actBtn = { width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }