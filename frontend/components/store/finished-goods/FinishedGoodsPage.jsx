'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, FileText, Pencil, Trash2, ChevronDown, RefreshCw, X } from 'lucide-react'
import {
  BRANDS,
  CATEGORIES,
  PRODUCTS,
  PACKINGS,
  FINISHED_INITIAL,
  formatDate,
  getWordCount,
  Checkbox,
  AppButton,
  TableShell,
  CommentEditorModal,
  ReportModal,
  SectionHeader,
  ui,
} from '@/components/store/shared/StoreShared'
export default function FinishedGoodsPage({ isSuperUser = true }) {
  const [entries, setEntries] = useState(FINISHED_INITIAL)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [expanded, setExpanded] = useState({})
  const [showEditor, setShowEditor] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [commentEdit, setCommentEdit] = useState(null)

  const [draftBrand, setDraftBrand] = useState('')
  const [draftDate, setDraftDate] = useState(new Date().toISOString().slice(0, 10))
  const [draftProducts, setDraftProducts] = useState([{ product: '', packing: '', cartons: '', comment: '' }])

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter((entry) => [entry.brand, ...entry.products.map((product) => `${product.product} ${product.packing}`)].join(' ').toLowerCase().includes(q))
  }, [entries, search])

  const reportRows = useMemo(
    () =>
      entries.flatMap((entry) =>
        entry.products.map((product) => ({
          brand: entry.brand,
          date: entry.date,
          product: product.product,
          packing: product.packing,
          cartons: product.cartons,
          comment: product.comment,
        }))
      ),
    [entries]
  )

  const totalCartons = (entry) => entry.products.reduce((sum, product) => sum + (Number(product.cartons) || 0), 0)

  const resetDraft = () => {
    setDraftBrand('')
    setDraftDate(new Date().toISOString().slice(0, 10))
    setDraftProducts([{ product: '', packing: '', cartons: '', comment: '' }])
  }

  return (
    <div style={ui.pageWrap}>
      <SectionHeader
        title="Finished Goods"
        subtitle="Manage finished goods entries and carton totals"
        actions={(
          <>
            <AppButton onClick={() => setEntries([...FINISHED_INITIAL])}>
              <RefreshCw size={14} />
            </AppButton>
            <AppButton onClick={() => setShowReport(true)}>
              <FileText size={14} /> View Report
            </AppButton>
            <AppButton
              type="primary"
              onClick={() => {
                resetDraft()
                setShowEditor(true)
              }}
            >
              <Plus size={14} /> Add Entry
            </AppButton>
          </>
        )}
      />

      <div style={ui.searchWrap}>
        <Search size={15} color="#94a3b8" />
        <input
          style={ui.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by brand, product or packing"
        />
      </div>

      <TableShell
        columns={[
          {
            key: 'select',
            label: (
              <Checkbox
                checked={selected.length === filtered.length && filtered.length > 0}
                onChange={() => setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((entry) => entry.id)))}
              />
            ),
          },
          { key: 'brand', label: 'Brand' },
          { key: 'product', label: 'Product' },
          { key: 'packing', label: 'Packing' },
          { key: 'date', label: 'Date' },
          { key: 'cartons', label: 'Cartons' },
          { key: 'comment', label: 'Comment' },
          { key: 'detail', label: 'Details' },
          { key: 'action', label: 'Actions', align: 'right' },
        ]}
        emptyColSpan={filtered.length === 0 ? 9 : null}
        emptyText="No finished goods found"
      >
        {filtered.flatMap((entry) => {
          const rows = []
          rows.push(
            <tr key={`${entry.id}-summary`} style={{ background: '#fbfcfd' }}>
              <td style={ui.td}><Checkbox checked={selected.includes(entry.id)} onChange={() => setSelected((prev) => (prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id]))} /></td>
              <td style={ui.brandPrimary}>{entry.brand}</td>
              <td style={ui.td}>{entry.products.length} product(s)</td>
              <td style={ui.td}>-</td>
              <td style={ui.td}>{formatDate(entry.date)}</td>
              <td style={{ ...ui.td, fontWeight: 700 }}>{totalCartons(entry).toLocaleString()} total</td>
              <td style={ui.td}>-</td>
              <td style={ui.td}>
                <button
                  type="button"
                  style={ui.iconButton}
                  onClick={() => setExpanded((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                >
                  <ChevronDown size={14} style={{ transform: expanded[entry.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s ease' }} />
                </button>
              </td>
              <td style={{ ...ui.td, textAlign: 'right' }}>
                {isSuperUser ? (
                  <button type="button" style={ui.iconDangerButton} onClick={() => setEntries((prev) => prev.filter((item) => item.id !== entry.id))}>
                    <Trash2 size={13} />
                  </button>
                ) : null}
              </td>
            </tr>
          )

          if (expanded[entry.id]) {
            entry.products.forEach((product, index) => {
              rows.push(
                <tr key={`${entry.id}-product-${index}`} style={{ background: '#f7faf8' }}>
                  <td style={ui.td} />
                  <td style={ui.td} />
                  <td style={{ ...ui.td, fontWeight: 600, color: '#334155' }}>- {product.product}</td>
                  <td style={ui.td}>{product.packing}</td>
                  <td style={ui.td} />
                  <td style={{ ...ui.td, fontWeight: 700 }}>{Number(product.cartons || 0).toLocaleString()}</td>
                  <td style={ui.td}>
                    <div style={ui.inlineActionsLeft}>
                      <span style={ui.smallMuted}>{product.comment ? `${product.comment.slice(0, 32)}${product.comment.length > 32 ? '...' : ''}` : '-'}</span>
                      <button type="button" style={ui.iconButton} onClick={() => setCommentEdit({ id: entry.id, pidx: index, comment: product.comment })}>
                        <Pencil size={13} />
                      </button>
                    </div>
                  </td>
                  <td style={ui.td} />
                  <td style={ui.td} />
                </tr>
              )
            })
          }

          return rows
        })}
      </TableShell>

      {showEditor ? (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <div style={ui.modalHeaderTop}>
              <div>
                <h3 style={ui.modalTitle}>Add Finished Goods Entry</h3>
                <p style={ui.modalSub}>Create a brand-wise entry with one or more products</p>
              </div>
              <AppButton onClick={() => setShowEditor(false)} style={ui.iconBtnOnly}>
                <X size={16} />
              </AppButton>
            </div>

            <div style={ui.formRow}>
              <div style={ui.formCol}>
                <label style={ui.label}>Brand</label>
                <select style={ui.select} value={draftBrand} onChange={(e) => setDraftBrand(e.target.value)}>
                  <option value="">Select brand</option>
                  {BRANDS.map((entry) => (
                    <option key={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div style={{ ...ui.formCol, maxWidth: 220 }}>
                <label style={ui.label}>Date</label>
                <input type="date" style={ui.input} value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
              </div>
            </div>

            <hr style={ui.divider} />

            {draftProducts.map((product, idx) => (
              <div key={`draft-product-${idx}`} style={ui.itemRow}>
                <div style={ui.itemRowTop}>
                  <span style={ui.itemTitle}>Product {idx + 1}</span>
                  {idx > 0 ? (
                    <button type="button" style={ui.iconDangerButton} onClick={() => setDraftProducts((prev) => prev.filter((_, index) => index !== idx))}>
                      <X size={13} />
                    </button>
                  ) : null}
                </div>

                <div style={ui.formRow}>
                  <div style={ui.formCol}>
                    <label style={ui.label}>Product</label>
                    <select
                      style={ui.select}
                      value={product.product}
                      onChange={(e) =>
                        setDraftProducts((prev) => prev.map((entry, index) => (index === idx ? { ...entry, product: e.target.value } : entry)))
                      }
                    >
                      <option value="">Select product</option>
                      {(CATEGORIES[draftBrand] || []).flatMap((categoryName) => PRODUCTS[categoryName] || []).map((entry) => (
                        <option key={entry}>{entry}</option>
                      ))}
                    </select>
                  </div>
                  <div style={ui.formCol}>
                    <label style={ui.label}>Packing</label>
                    <select
                      style={ui.select}
                      value={product.packing}
                      onChange={(e) =>
                        setDraftProducts((prev) => prev.map((entry, index) => (index === idx ? { ...entry, packing: e.target.value } : entry)))
                      }
                    >
                      <option value="">Select packing</option>
                      {PACKINGS.map((entry) => (
                        <option key={entry}>{entry}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ ...ui.formCol, maxWidth: 140 }}>
                    <label style={ui.label}>Cartons</label>
                    <input
                      type="number"
                      min={0}
                      style={ui.input}
                      value={product.cartons}
                      onChange={(e) =>
                        setDraftProducts((prev) => prev.map((entry, index) => (index === idx ? { ...entry, cartons: e.target.value } : entry)))
                      }
                    />
                  </div>
                </div>

                <label style={ui.label}>Comment</label>
                <textarea
                  rows={3}
                  style={ui.textarea}
                  value={product.comment}
                  onChange={(e) => {
                    const next = e.target.value
                    if (getWordCount(next) <= 500) {
                      setDraftProducts((prev) => prev.map((entry, index) => (index === idx ? { ...entry, comment: next } : entry)))
                    }
                  }}
                />
                <p style={ui.charCounter}>{getWordCount(product.comment)} / 500 words</p>
              </div>
            ))}

            <AppButton
              onClick={() => setDraftProducts((prev) => [...prev, { product: '', packing: '', cartons: '', comment: '' }])}
              style={ui.addLineButton}
            >
              <Plus size={14} /> Add Product
            </AppButton>

            <div style={ui.modalActionsCenter}>
              <AppButton
                type="primary"
                onClick={() => {
                  const cleanProducts = draftProducts
                    .map((entry) => ({ ...entry, cartons: Number(entry.cartons) || 0 }))
                    .filter((entry) => entry.product && entry.packing)

                  if (!draftBrand || !cleanProducts.length) return

                  setEntries((prev) => [{ id: Date.now(), brand: draftBrand, date: draftDate, products: cleanProducts }, ...prev])
                  setShowEditor(false)
                  resetDraft()
                }}
                style={ui.saveBtn}
              >
                Save Entry
              </AppButton>
            </div>
          </div>
        </div>
      ) : null}

      {commentEdit ? (
        <CommentEditorModal
          value={commentEdit.comment}
          onCancel={() => setCommentEdit(null)}
          onSave={(comment) => {
            setEntries((prev) =>
              prev.map((entry) =>
                entry.id === commentEdit.id
                  ? {
                      ...entry,
                      products: entry.products.map((product, index) =>
                        index === commentEdit.pidx ? { ...product, comment } : product
                      ),
                    }
                  : entry
              )
            )
            setCommentEdit(null)
          }}
        />
      ) : null}

      {showReport ? (
        <ReportModal
          title="Finished Goods"
          data={reportRows}
          dateKey="date"
          columns={[
            { key: 'brand', label: 'Brand' },
            { key: 'date', label: 'Date' },
            { key: 'product', label: 'Product' },
            { key: 'packing', label: 'Packing' },
            { key: 'cartons', label: 'Cartons' },
            { key: 'comment', label: 'Comment' },
          ]}
          onClose={() => setShowReport(false)}
        />
      ) : null}
    </div>
  )
}

