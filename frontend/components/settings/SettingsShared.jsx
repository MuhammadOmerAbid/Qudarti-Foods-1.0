'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Pencil, Trash2, Search, X, Check } from 'lucide-react'

// ─── Toggle Switch ──────────────────────────────────────────
export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: checked ? '#54B45B' : '#d1d5db',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }}
      />
    </button>
  )
}

// ─── Inline Edit Input ──────────────────────────────────────
export function InlineInput({ value, onChange, onSave, onCancel, placeholder }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onCancel()
        }}
        style={{
          border: '1.5px solid #54B45B',
          borderRadius: 7,
          padding: '5px 10px',
          fontSize: 13.5,
          outline: 'none',
          width: 220,
          color: '#111827',
        }}
      />
      <button
        onClick={onSave}
        style={{
          background: '#54B45B', border: 'none', borderRadius: 7,
          width: 28, height: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <Check size={14} color="#fff" />
      </button>
      <button
        onClick={onCancel}
        style={{
          background: '#f3f4f6', border: 'none', borderRadius: 7,
          width: 28, height: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <X size={14} color="#6b7280" />
      </button>
    </div>
  )
}

// ─── Page Shell ─────────────────────────────────────────────
export function SettingsPageShell({
  title,
  subtitle,
  onAdd,
  onRefresh,
  filterValue,
  onFilterChange,
  addLabel = '+ Add',
  canEdit = true,
  children,
}) {
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={onRefresh} style={styles.iconBtn} title="Refresh">
            <RefreshCw size={16} color="#6b7280" />
          </button>
          {canEdit && (
            <button onClick={onAdd} style={styles.addBtn}>
              <Plus size={15} />
              {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>{children}</div>
    </div>
  )
}

// ─── Data Table Shell ───────────────────────────────────────
export function SettingsTable({ columns, rows, emptyMsg = 'No records found.' }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={{ ...styles.th, textAlign: col.align || 'center' }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={styles.empty}>{emptyMsg}</td>
          </tr>
        ) : rows}
      </tbody>
    </table>
  )
}

// ─── Action Buttons ─────────────────────────────────────────
export function ActionButtons({ onEdit, onDelete, canEdit, canDelete }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {canEdit && (
        <button onClick={onEdit} style={styles.actionBtn} title="Edit">
          <Pencil size={14} color="#6b7280" />
        </button>
      )}
      {canDelete && (
        <button onClick={onDelete} style={{ ...styles.actionBtn, ...styles.deleteBtn }} title="Delete">
          <Trash2 size={14} color="#ef4444" />
        </button>
      )}
    </div>
  )
}

// ─── Confirm Dialog ─────────────────────────────────────────
export function ConfirmDelete({ open, name, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h3 style={styles.dialogTitle}>Delete Confirmation</h3>
        <p style={styles.dialogText}>
          Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
        </p>
        <div style={styles.dialogActions}>
          <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={styles.confirmBtn}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ──────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      ...styles.toast,
      background: type === 'success' ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
      color: type === 'success' ? '#166534' : '#dc2626',
    }}>
      {message}
    </div>
  )
}

const styles = {
  page: {},
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#6b7280' },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  iconBtn: {
    width: 36, height: 36, border: '1px solid #e5e7eb',
    borderRadius: 8, background: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#54B45B', color: '#fff', border: 'none',
    borderRadius: 8, padding: '8px 16px', fontSize: 13.5,
    fontWeight: 600, cursor: 'pointer',
  },
  filterBar: { marginBottom: 16 },
  filterGroup: { display: 'flex', gap: 10 },
  select: {
    border: '1px solid #e5e7eb', borderRadius: 8,
    padding: '6px 12px', fontSize: 13.5, color: '#374151',
    background: '#fff', cursor: 'pointer', outline: 'none',
    minWidth: 120,
  },
  tableWrap: {
    background: '#fff',
    border: '1px solid #e8f5e9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 20px',
    background: '#f9fafb',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    borderBottom: '1px solid #e8f5e9',
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
  actionBtn: {
    width: 30, height: 30, border: '1px solid #e5e7eb',
    borderRadius: 7, background: '#f9fafb',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer',
  },
  deleteBtn: { background: '#fff5f5', border: '1px solid #fecaca' },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  dialog: {
    background: '#fff', borderRadius: 14,
    padding: 28, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },
  dialogTitle: { margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#111827' },
  dialogText: { margin: '0 0 20px', fontSize: 13.5, color: '#6b7280', lineHeight: 1.5 },
  dialogActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '8px 18px', border: '1px solid #e5e7eb',
    borderRadius: 8, background: '#fff', fontSize: 13.5,
    fontWeight: 600, cursor: 'pointer', color: '#374151',
  },
  confirmBtn: {
    padding: '8px 18px', border: 'none',
    borderRadius: 8, background: '#ef4444', fontSize: 13.5,
    fontWeight: 600, cursor: 'pointer', color: '#fff',
  },
  toast: {
    position: 'fixed', bottom: 24, right: 24,
    padding: '12px 20px', borderRadius: 10,
    fontSize: 13.5, fontWeight: 600,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    zIndex: 9999, animation: 'fadeSlideUp 0.2s ease',
  },
}