'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import { Plus, Trash2, Calculator, RotateCcw, Package } from 'lucide-react'

// CBM formula:
// CBM per carton = (L_inch × W_inch × H_inch) / 1728 * 0.0283168
// Total CBM = CBM per carton × quantity
// 40ft container total CBM available ≈ 66 CBM

const CONTAINER_CBM = 66.00
const CONTAINER_WEIGHT_KG = 26500 // max payload for 40ft

const UNITS = ['Inch', 'CM', 'MM']
const WEIGHT_UNITS = ['Kg', 'Gram', 'Lb']

function toCM(value, unit) {
  const v = parseFloat(value) || 0
  if (unit === 'Inch') return v * 2.54
  if (unit === 'MM') return v / 10
  return v // CM
}

function calcCBM(length, width, height, unit) {
  const l = toCM(length, unit) / 100
  const w = toCM(width, unit) / 100
  const h = toCM(height, unit) / 100
  return l * w * h
}

function toKg(value, unit) {
  const v = parseFloat(value) || 0
  if (unit === 'Gram') return v / 1000
  if (unit === 'Lb') return v * 0.453592
  return v
}

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  item: '',
  length: '',
  width: '',
  height: '',
  dimUnit: 'Inch',
  quantity: '',
  weightPerCarton: '',
  weightUnit: 'Kg',
})

// Prefilled sample rows from Excel
const SAMPLE_ROWS = [
  { id: 1, item: '12 PC Big Round Jar',   length: '12.4', width: '9.5',  height: '6.6',  dimUnit: 'Inch', quantity: '260', weightPerCarton: '',  weightUnit: 'Kg' },
  { id: 2, item: '54 PC Small Round Jar', length: '17.5', width: '9.3',  height: '12.2', dimUnit: 'Inch', quantity: '130', weightPerCarton: '',  weightUnit: 'Kg' },
  { id: 3, item: '96 PC Carton',          length: '16.3', width: '16.3', height: '12.3', dimUnit: 'Inch', quantity: '240', weightPerCarton: '',  weightUnit: 'Kg' },
  { id: 4, item: '110 ML Oil',            length: '18.4', width: '13.2', height: '6.5',  dimUnit: 'Inch', quantity: '45',  weightPerCarton: '',  weightUnit: 'Kg' },
  { id: 5, item: '100 ML Oil',            length: '17.1', width: '13.1', height: '7.5',  dimUnit: 'Inch', quantity: '25',  weightPerCarton: '',  weightUnit: 'Kg' },
  { id: 6, item: 'Old Big Jar',           length: '13.1', width: '9.7',  height: '5.9',  dimUnit: 'Inch', quantity: '100', weightPerCarton: '',  weightUnit: 'Kg' },
  { id: 7, item: 'Milky Jar',             length: '12.1', width: '9.0',  height: '5.7',  dimUnit: 'Inch', quantity: '80',  weightPerCarton: '',  weightUnit: 'Kg' },
]

export default function CBMCalculatorPage() {
  const [rows, setRows] = useState([emptyRow()])
  const [containerType, setContainerType] = useState('40ft')
  const [tab, setTab] = useState('calculator') // 'calculator' | 'sample'

  const containerCBM = containerType === '40ft' ? 66 : 33
  const containerWeight = containerType === '40ft' ? 26500 : 13500

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }

  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id))
  const resetRows = () => setRows([emptyRow()])
  const loadSample = () => setRows(SAMPLE_ROWS.map((r) => ({ ...r, id: Date.now() + Math.random() })))

  // Compute per-row
  const computed = rows.map((r) => {
    const qty = parseFloat(r.quantity) || 0
    const cbmPerCarton = calcCBM(r.length, r.width, r.height, r.dimUnit)
    const totalCBM = cbmPerCarton * qty
    const weightKg = toKg(r.weightPerCarton, r.weightUnit)
    const totalWeight = weightKg * qty
    return { ...r, cbmPerCarton, totalCBM, totalWeight }
  })

  const totalCBMUsed = computed.reduce((s, r) => s + r.totalCBM, 0)
  const totalWeightUsed = computed.reduce((s, r) => s + r.totalWeight, 0)
  const cbmRemaining = containerCBM - totalCBMUsed
  const cbmPct = Math.min((totalCBMUsed / containerCBM) * 100, 100)
  const weightPct = totalWeightUsed > 0 ? Math.min((totalWeightUsed / containerWeight) * 100, 100) : 0

  const inp = (style = {}) => ({
    border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 8px',
    fontSize: 12.5, color: '#111827', outline: 'none',
    width: '100%', boxSizing: 'border-box', ...style,
  })

  const sel = (style = {}) => ({
    border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 6px',
    fontSize: 12, color: '#374151', background: '#fff', outline: 'none',
    width: '100%', boxSizing: 'border-box', ...style,
  })

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calculator size={22} color="#54B45B" />
              CBM + Weight Calculator
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              Calculate cubic meters and shipping weight for container loading
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select value={containerType} onChange={(e) => setContainerType(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', fontWeight: 600 }}>
              <option value="40ft">40 Feet Container</option>
              <option value="20ft">20 Feet Container</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            {
              label: 'Total CBM Used',
              value: totalCBMUsed.toFixed(4),
              unit: 'm³',
              color: totalCBMUsed > containerCBM ? '#ef4444' : '#54B45B',
              bg: totalCBMUsed > containerCBM ? '#fef2f2' : '#f0fdf4',
              border: totalCBMUsed > containerCBM ? '#fecaca' : '#bbf7d0',
            },
            {
              label: 'CBM Available',
              value: cbmRemaining.toFixed(4),
              unit: 'm³',
              color: cbmRemaining < 0 ? '#ef4444' : '#3b82f6',
              bg: '#eff6ff', border: '#bfdbfe',
            },
            {
              label: 'Container Capacity',
              value: containerCBM.toFixed(2),
              unit: 'm³',
              color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb',
            },
            {
              label: 'Total Weight',
              value: totalWeightUsed > 0 ? totalWeightUsed.toFixed(2) : '—',
              unit: totalWeightUsed > 0 ? 'Kg' : '',
              color: totalWeightUsed > containerWeight ? '#ef4444' : '#f59e0b',
              bg: '#fffbeb', border: '#fde68a',
            },
          ].map(({ label, value, unit, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color }}>
                {value} <span style={{ fontSize: 13, fontWeight: 500 }}>{unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: `CBM Used: ${totalCBMUsed.toFixed(3)} / ${containerCBM} m³`, pct: cbmPct, color: cbmPct > 90 ? '#ef4444' : cbmPct > 70 ? '#f59e0b' : '#54B45B' },
            { label: `Weight: ${totalWeightUsed > 0 ? totalWeightUsed.toFixed(1) + ' / ' + containerWeight + ' Kg' : 'Enter weight per carton'}`, pct: weightPct, color: weightPct > 90 ? '#ef4444' : '#3b82f6' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8f5e9', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, color: '#6b7280', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
          <button onClick={addRow} style={greenBtn}>
            <Plus size={14} /> Add Row
          </button>
          <button onClick={loadSample} style={outlineBtn}>
            <Package size={14} /> Load Sample Data
          </button>
          <button onClick={resetRows} style={{ ...outlineBtn, color: '#ef4444', borderColor: '#fecaca' }}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #e8f5e9', borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e8f5e9' }}>
                <th style={th}>SR.NO</th>
                <th style={{ ...th, textAlign: 'left' }}>Item</th>
                <th style={th} colSpan={3}>Carton Dimensions</th>
                <th style={th}>Unit</th>
                <th style={th}>Quantity</th>
                <th style={th}>Wt/Carton</th>
                <th style={th}>Wt Unit</th>
                <th style={th}>CBM/Carton</th>
                <th style={{ ...th, color: '#54B45B' }}>Total CBM</th>
                <th style={{ ...th, color: '#3b82f6' }}>Total Wt (Kg)</th>
                <th style={th}>Action</th>
              </tr>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e8f5e9' }}>
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh}>L</th>
                <th style={subTh}>W</th>
                <th style={subTh}>H</th>
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh} />
                <th style={subTh} />
              </tr>
            </thead>
            <tbody>
              {computed.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fafffe'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...td, color: '#9ca3af', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ ...td, minWidth: 160 }}>
                    <input value={row.item} onChange={(e) => updateRow(row.id, 'item', e.target.value)}
                      placeholder="Item name" style={inp()} />
                  </td>
                  <td style={td}>
                    <input value={row.length} onChange={(e) => updateRow(row.id, 'length', e.target.value)}
                      placeholder="L" type="number" style={inp({ width: 68 })} />
                  </td>
                  <td style={td}>
                    <input value={row.width} onChange={(e) => updateRow(row.id, 'width', e.target.value)}
                      placeholder="W" type="number" style={inp({ width: 68 })} />
                  </td>
                  <td style={td}>
                    <input value={row.height} onChange={(e) => updateRow(row.id, 'height', e.target.value)}
                      placeholder="H" type="number" style={inp({ width: 68 })} />
                  </td>
                  <td style={td}>
                    <select value={row.dimUnit} onChange={(e) => updateRow(row.id, 'dimUnit', e.target.value)} style={sel({ width: 72 })}>
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={td}>
                    <input value={row.quantity} onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                      placeholder="0" type="number" style={inp({ width: 72 })} />
                  </td>
                  <td style={td}>
                    <input value={row.weightPerCarton} onChange={(e) => updateRow(row.id, 'weightPerCarton', e.target.value)}
                      placeholder="0" type="number" style={inp({ width: 72 })} />
                  </td>
                  <td style={td}>
                    <select value={row.weightUnit} onChange={(e) => updateRow(row.id, 'weightUnit', e.target.value)} style={sel({ width: 72 })}>
                      {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={{ ...td, color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>
                    {row.cbmPerCarton > 0 ? row.cbmPerCarton.toFixed(6) : '—'}
                  </td>
                  <td style={{ ...td, fontWeight: 700, color: '#54B45B', fontFamily: 'monospace' }}>
                    {row.totalCBM > 0 ? row.totalCBM.toFixed(6) : '—'}
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace' }}>
                    {row.totalWeight > 0 ? row.totalWeight.toFixed(2) : '—'}
                  </td>
                  <td style={td}>
                    {computed.length > 1 && (
                      <button onClick={() => removeRow(row.id)}
                        style={{ border: 'none', background: '#fff5f5', borderRadius: 7, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals footer */}
            <tfoot>
              <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                <td colSpan={10} style={{ padding: '11px 20px', fontSize: 13, fontWeight: 700, color: '#166534', textAlign: 'right' }}>
                  TOTAL:
                </td>
                <td style={{ padding: '11px 12px', fontWeight: 800, color: totalCBMUsed > containerCBM ? '#ef4444' : '#54B45B', fontSize: 14, fontFamily: 'monospace' }}>
                  {totalCBMUsed.toFixed(6)}
                </td>
                <td style={{ padding: '11px 12px', fontWeight: 800, color: '#3b82f6', fontSize: 14, fontFamily: 'monospace' }}>
                  {totalWeightUsed > 0 ? totalWeightUsed.toFixed(2) : '—'}
                </td>
                <td />
              </tr>
              <tr style={{ background: '#eff6ff', borderTop: '1px solid #bfdbfe' }}>
                <td colSpan={10} style={{ padding: '9px 20px', fontSize: 12.5, fontWeight: 700, color: '#1d4ed8', textAlign: 'right' }}>
                  CBM REMAINING ({containerType.toUpperCase()} — {containerCBM} m³):
                </td>
                <td style={{ padding: '9px 12px', fontWeight: 800, color: cbmRemaining < 0 ? '#ef4444' : '#1d4ed8', fontSize: 14, fontFamily: 'monospace' }}>
                  {cbmRemaining.toFixed(6)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Formula note */}
        <div style={{ marginTop: 14, padding: '10px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
            <strong>Formula:</strong> CBM per carton = (L × W × H converted to meters). Supports Inch, CM, and MM inputs.
            1 Inch = 2.54 CM · Total CBM = CBM/carton × Quantity · 40ft container ≈ 66 m³ · 20ft container ≈ 33 m³
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

const th = { padding: '11px 10px', fontSize: 12, fontWeight: 700, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }
const subTh = { padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textAlign: 'center' }
const td = { padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle' }
const greenBtn = { display: 'flex', alignItems: 'center', gap: 6, background: '#54B45B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const outlineBtn = { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }