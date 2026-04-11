'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountEntryPage from '@/components/accounts/AccountEntryPage'

const PRINT_KEY = 'accounts:vouchers:print'

const SEED_VOUCHERS = [
  { id: 'PV-001', type: 'Payment Voucher', date: '2026-04-02', amount: 350000, account: 'HBL Current Account', party: 'Staff Salaries', narration: 'April 2026 payroll disbursement', status: 'Posted' },
  { id: 'PV-002', type: 'Payment Voucher', date: '2026-04-05', amount: 12500, account: 'Cash in Hand', party: 'WAPDA', narration: 'Electricity bill April', status: 'Posted' },
  { id: 'RV-001', type: 'Receipt Voucher', date: '2026-04-01', amount: 88000, account: 'HBL Current Account', party: 'Khan & Sons', narration: 'Invoice INV-001 partial payment', status: 'Posted' },
  { id: 'RV-002', type: 'Receipt Voucher', date: '2026-04-08', amount: 300000, account: 'HBL Current Account', party: 'City Distributors', narration: 'Invoice settlement', status: 'Posted' },
  { id: 'JV-001', type: 'Journal Voucher', date: '2026-04-03', amount: 75000, account: 'Multiple', party: 'Adjustment', narration: 'Depreciation adjustment Q1', status: 'Posted' },
]

const fmt = (amount) => `PKR ${Number(amount || 0).toLocaleString()}`

export default function VoucherPrintPage() {
  const router = useRouter()
  const [voucherId, setVoucherId] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setVoucherId(params.get('id') || '')
  }, [])

  useEffect(() => {
    const fromSession = sessionStorage.getItem(PRINT_KEY)
    if (fromSession) {
      try {
        setSelected(JSON.parse(fromSession))
        return
      } catch {}
    }
    if (voucherId) {
      const match = SEED_VOUCHERS.find((voucher) => voucher.id === voucherId)
      if (match) setSelected(match)
    }
  }, [voucherId])

  const content = useMemo(() => {
    if (!selected) {
      return (
        <div style={s.emptyWrap}>
          <p style={s.emptyTitle}>No voucher selected</p>
          <p style={s.emptySub}>Open print from the vouchers list to preview a voucher.</p>
          <button type="button" style={s.secondaryBtn} onClick={() => router.push('/accounts/vouchers')}>Back to Vouchers</button>
        </div>
      )
    }

    return (
      <>
        <div style={s.header}>
          <h2 style={s.company}>Qudrati Foods</h2>
          <p style={s.vType}>{selected.type}</p>
          <p style={s.vNo}>Voucher # {selected.id}</p>
        </div>

        <div style={s.rows}>
          <div style={s.row}><span style={s.k}>Date</span><span style={s.v}>{selected.date}</span></div>
          <div style={s.row}><span style={s.k}>Party</span><span style={s.v}>{selected.party || '-'}</span></div>
          <div style={s.row}><span style={s.k}>Account</span><span style={s.v}>{selected.account || '-'}</span></div>
          <div style={s.row}><span style={s.k}>Narration</span><span style={s.v}>{selected.narration || '-'}</span></div>
          <div style={s.row}><span style={s.k}>Amount</span><span style={s.amount}>{fmt(selected.amount)}</span></div>
        </div>

        <div style={s.signatures}>
          <div style={s.sig}><div style={s.sigLine} /><p style={s.sigText}>Prepared By</p></div>
          <div style={s.sig}><div style={s.sigLine} /><p style={s.sigText}>Approved By</p></div>
          <div style={s.sig}><div style={s.sigLine} /><p style={s.sigText}>Received By</p></div>
        </div>

        <div style={s.actions}>
          <button type="button" style={s.secondaryBtn} onClick={() => router.push('/accounts/vouchers')}>Back</button>
          <button type="button" style={s.primaryBtn} onClick={() => window.print()}>Print</button>
        </div>
      </>
    )
  }, [router, selected])

  return (
    <AccountEntryPage
      title="Print Voucher"
      subtitle="Preview and print selected voucher"
      backHref="/accounts/vouchers"
      hideSave
    >
      {content}
    </AccountEntryPage>
  )
}

const s = {
  header: {
    textAlign: 'center',
    borderBottom: '2px solid #e2e8e2',
    paddingBottom: 18,
    marginBottom: 16,
  },
  company: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: '#1a3d1f',
  },
  vType: {
    margin: '6px 0 0',
    fontSize: 16,
    fontWeight: 700,
    color: '#2d7a33',
  },
  vNo: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#7a8a7a',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e8eee8',
    paddingBottom: 8,
    gap: 12,
  },
  k: {
    fontSize: 13,
    color: '#6d7d6d',
    fontWeight: 600,
  },
  v: {
    fontSize: 13,
    color: '#1f2f1f',
    fontWeight: 500,
    textAlign: 'right',
  },
  amount: {
    fontSize: 18,
    fontWeight: 800,
    color: '#1a3d1f',
  },
  signatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 16,
    marginTop: 28,
  },
  sig: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  sigLine: {
    width: '100%',
    height: 1,
    background: '#1a3d1f',
  },
  sigText: {
    margin: 0,
    fontSize: 11,
    color: '#7a8a7a',
    fontWeight: 600,
  },
  actions: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  primaryBtn: {
    border: 'none',
    borderRadius: 999,
    padding: '10px 16px',
    background: 'linear-gradient(135deg, rgb(26, 61, 31) 0%, rgb(45, 122, 51) 100%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #d4dfd4',
    borderRadius: 999,
    padding: '10px 16px',
    background: '#ffffff',
    color: '#335a36',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  emptyWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '20px 0',
  },
  emptyTitle: {
    margin: 0,
    fontSize: 18,
    color: '#1a3d1f',
    fontWeight: 800,
  },
  emptySub: {
    margin: 0,
    fontSize: 13,
    color: '#7a8a7a',
  },
}
