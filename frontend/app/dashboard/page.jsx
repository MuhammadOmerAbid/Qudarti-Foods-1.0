'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboardlayout'
import {
  ArrowDownToLine, ArrowUpFromLine, ClipboardList,
  Factory, Package, ArrowUpRight, Plus, Video,
} from 'lucide-react'

const STATS = [
  { label: 'Total Operations', value: '24', sub: 'Increased from last month', dark: true },
  { label: 'Ended',            value: '10', sub: 'Increased from last month', dark: false },
  { label: 'Running',          value: '12', sub: 'Increased from last month', dark: false },
  { label: 'Pending',          value: '2',  sub: 'On Discuss',               dark: false },
]

const CARDS = [
  {
    id: 'gate-inward', title: 'Gate Inward', subtitle: "Today's incoming materials",
    icon: ArrowDownToLine, accent: '#2d7a33', lightBg: '#e8f0e8', borderColor: '#d4e0d4',
    fields: [{ label: 'Category', value: '-' }, { label: 'Name', value: '-' }, { label: 'Quantity', value: '-' }],
    path: '/gate-inward',
  },
  {
    id: 'goods-requisition', title: 'Goods Requisition', subtitle: "Today's requisitions",
    icon: ClipboardList, accent: '#3f8f47', lightBg: '#e8f0e8', borderColor: '#d4e0d4',
    fields: [{ label: 'Receiver', value: '-' }, { label: 'Product', value: '-' }, { label: 'Qty', value: '-' }],
    path: '/requisition',
  },
  {
    id: 'daily-production', title: 'Daily Production', subtitle: "Today's production",
    icon: Factory, accent: '#56a35e', lightBg: '#e8f0e8', borderColor: '#d4e0d4',
    fields: [{ label: 'Product', value: '-' }, { label: 'Time (hrs)', value: '-' }, { label: 'Workers', value: '-' }],
    path: '/daily-production',
  },
  {
    id: 'finished-goods', title: 'Finished Goods', subtitle: "Today's finished products",
    icon: Package, accent: '#245d2b', lightBg: '#e8f0e8', borderColor: '#d4e0d4',
    fields: [{ label: 'Brand', value: '-' }, { label: 'Product', value: '-' }, { label: 'Cartons', value: '-' }],
    path: '/finished-goods',
  },
  {
    id: 'gate-outward', title: 'Gate Outward', subtitle: "Today's outgoing shipments",
    icon: ArrowUpFromLine, accent: '#6bb572', lightBg: '#e8f0e8', borderColor: '#d4e0d4',
    fields: [{ label: 'Product', value: '-' }, { label: 'Brand', value: '-' }, { label: 'Qty', value: '-' }],
    path: '/gate-outward',
  },
]

const WEEK = [
  { day: 'S', val: 30 }, { day: 'M', val: 65 }, { day: 'T', val: 75 },
  { day: 'W', val: 100 }, { day: 'T', val: 45 }, { day: 'F', val: 38 }, { day: 'S', val: 22 },
]

const TEAM = [
  { name: 'Alexandra Deff',      task: 'Github Project Repository',          status: 'Completed',   color: '#f87171' },
  { name: 'Edwin Adenike',       task: 'Integrate User Authentication System', status: 'In Progress', color: '#4ade80' },
  { name: 'Isaac Oluwatemilorun', task: 'Develop Search and Filter Functionality', status: 'Pending',  color: '#93c5fd' },
  { name: 'David Oshodi',        task: 'Responsive Layout for Homepage',      status: 'In Progress', color: '#fbbf24' },
]

const PROJECTS = [
  { name: 'Develop API Endpoints',  due: 'Nov 26, 2024', dot: '#2d7a33' },
  { name: 'Onboarding Flow',        due: 'Nov 28, 2024', dot: '#54B45B' },
  { name: 'Build Dashboard',        due: 'Nov 30, 2024', dot: '#1f5a26' },
  { name: 'Optimize Page Load',     due: 'Dec 5, 2024',  dot: '#78c47f' },
  { name: 'Cross-Browser Testing',  due: 'Dec 6, 2024',  dot: '#3f8f47' },
]

const statusStyle = {
  'Completed':   { bg: '#e8f0e8', color: '#16a34a', border: '#d4e0d4' },
  'In Progress': { bg: '#fefce8', color: '#d97706', border: '#fef3c7' },
  'Pending':     { bg: '#fef2f2', color: '#dc2626', border: '#fee2e2' },
}

export default function DashboardPage() {
  const { user, hasPermission } = useAuthStore()
  const router = useRouter()

  const visibleCards = CARDS.filter(card => {
    if (user?.role === 'superuser') return true
    return hasPermission(card.id)
  })

  return (
    <DashboardLayout>
      <div style={s.wrapper}>

        <div style={s.titleRow}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSub}>Plan, prioritize, and accomplish your tasks with ease.</p>
          </div>
          <div style={s.titleActions}>
            <button style={s.btnPrimary}>
              <Plus size={15} /> Add Entry
            </button>
            <button style={s.btnOutline}>Import Data</button>
          </div>
        </div>

        <div style={s.statsRow}>
          {STATS.map((st, i) => (
            <div key={st.label} style={{ ...s.statCard, ...(st.dark ? s.statCardDark : {}), animationDelay: `${i*55}ms` }}>
              <div style={s.statTop}>
                <span style={{ ...s.statLabel, color: st.dark ? 'rgba(255,255,255,0.75)' : '#7a8a7a' }}>{st.label}</span>
                <span style={{ ...s.statArrow, background: st.dark ? 'rgba(255,255,255,0.15)' : '#e8eee8' }}>
                  <ArrowUpRight size={13} color={st.dark ? '#fff' : '#7a8a7a'} />
                </span>
              </div>
              <p style={{ ...s.statVal, color: st.dark ? '#fff' : '#1a3d1f' }}>{st.value}</p>
              <p style={{ ...s.statSub, color: st.dark ? 'rgba(255,255,255,0.55)' : '#7a8a7a' }}>
                {!st.dark && <span style={s.subDot} />}{st.sub}
              </p>
            </div>
          ))}
        </div>

        <div style={s.mainGrid}>
          <div style={s.leftCol}>
            <div style={s.card}>
              <p style={s.cardTitle}>Project Analytics</p>
              <div style={s.chartRow}>
                {WEEK.map((bar, i) => {
                  const isCurrent = i === 3
                  const isLight   = i === 2
                  const fillColor = isCurrent ? '#1a3d1f' : isLight ? '#54B45B' : 'transparent'
                  const border    = (!isCurrent && !isLight) ? '2px dashed #d4dfd4' : 'none'
                  const pct = bar.val / 100
                  const h = Math.max(24, pct * 100)
                  return (
                    <div key={i} style={s.barWrap}>
                      {isCurrent && <span style={s.barLabel}>34%</span>}
                      <div style={{
                        ...s.bar,
                        height: `${h}px`,
                        backgroundColor: fillColor,
                        border,
                        backgroundImage: (!isCurrent && !isLight)
                          ? `repeating-linear-gradient(135deg, transparent, transparent 4px, #d4dfd4 4px, #d4dfd4 5px)`
                          : 'none',
                      }} />
                      <span style={s.barDay}>{bar.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardHeaderRow}>
                <p style={s.cardTitle}>Team Collaboration</p>
                <button style={s.outlinePill}>
                  <Plus size={12} /> Add Member
                </button>
              </div>
              <div style={s.teamList}>
                {TEAM.map((m, i) => {
                  const st2 = statusStyle[m.status]
                  return (
                    <div key={i} style={s.teamRow}>
                      <div style={{ ...s.teamAvatar, backgroundColor: m.color }}>
                        {m.name[0]}
                      </div>
                      <div style={s.teamMeta}>
                        <p style={s.teamName}>{m.name}</p>
                        <p style={s.teamTask}>Working on <em>{m.task}</em></p>
                      </div>
                      <span style={{ ...s.statusBadge, backgroundColor: st2.bg, color: st2.color, borderColor: st2.border }}>
                        {m.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={s.sectionHeading}>
              <h2 style={s.sectionTitle}>Today's Operations</h2>
              <p style={s.sectionSub}>Real-time activity across all modules</p>
            </div>
            <div style={s.cardGrid}>
              {visibleCards.map((card, i) => {
                const Icon = card.icon
                return (
                  <div key={card.id} style={{ ...s.opCard, animationDelay: `${i*60+200}ms` }}>
                    <div style={{ ...s.opAccent, backgroundColor: card.accent }} />
                    <div style={s.opInner}>
                      <div style={s.opHeader}>
                        <div style={{ ...s.opIcon, backgroundColor: card.lightBg, border: `1px solid ${card.borderColor}` }}>
                          <Icon size={16} color={card.accent} strokeWidth={2} />
                        </div>
                        <div>
                          <p style={s.opTitle}>{card.title}</p>
                          <p style={s.opSub}>{card.subtitle}</p>
                        </div>
                      </div>
                      <div style={s.opDivider} />
                      {card.fields.map(f => (
                        <div key={f.label} style={s.opField}>
                          <span style={s.opFieldLabel}>{f.label}</span>
                          <span style={s.opFieldVal}>{f.value}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => router.push(card.path)}
                        style={{ ...s.opBtn, color: card.accent, borderColor: card.borderColor }}
                      >
                        View Details {'->'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={s.rightCol}>
            <div style={s.card}>
              <p style={s.cardTitle}>Reminders</p>
              <p style={s.reminderTitle}>Meeting with Arc Company</p>
              <p style={s.reminderTime}>Time: 02:00 pm - 04:00 pm</p>
              <button style={s.meetingBtn}>
                <Video size={14} /> Start Meeting
              </button>
            </div>

            <div style={s.card}>
              <div style={s.cardHeaderRow}>
                <p style={s.cardTitle}>Project</p>
                <button style={s.outlinePill}><Plus size={12} /> New</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {PROJECTS.map((p, i) => (
                  <div key={i} style={s.projectRow}>
                    <div style={{ ...s.projectDot, backgroundColor: p.dot }} />
                    <div>
                      <p style={s.projectName}>{p.name}</p>
                      <p style={s.projectDue}>Due date: {p.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <p style={s.cardTitle}>Project Progress</p>
              <div style={s.gaugeWrap}>
                <svg width="160" height="90" viewBox="0 0 160 90" style={{ overflow: 'visible' }}>
                  <path d="M 10 80 A 70 70 0 0 1 150 80" stroke="#d4dfd4" strokeWidth="14" fill="none" strokeLinecap="round" />
                  <path d="M 10 80 A 70 70 0 0 1 150 80" stroke="#1a3d1f" strokeWidth="14" fill="none" strokeLinecap="round"
                    strokeDasharray="220" strokeDashoffset="130" />
                  <path d="M 10 80 A 70 70 0 0 1 150 80" stroke="#54B45B" strokeWidth="14" fill="none" strokeLinecap="round"
                    strokeDasharray="220" strokeDashoffset="175" style={{ opacity: 0.8 }} />
                  <path d="M 10 80 A 70 70 0 0 1 150 80" stroke="url(#stripe)" strokeWidth="14" fill="none" strokeLinecap="round"
                    strokeDasharray="220" strokeDashoffset="200" style={{ opacity: 0.4 }} />
                  <defs>
                    <pattern id="stripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#c8d4c8" strokeWidth="3" />
                    </pattern>
                  </defs>
                </svg>
                <div style={s.gaugePct}>
                  <p style={s.gaugePctNum}>41%</p>
                  <p style={s.gaugePctLabel}>Project Ended</p>
                </div>
              </div>
              <div style={s.gaugeLegend}>
                <span style={s.legendItem}><span style={{ ...s.legendDot, backgroundColor: '#1a3d1f' }} />Completed</span>
                <span style={s.legendItem}><span style={{ ...s.legendDot, backgroundColor: '#54B45B' }} />In Progress</span>
                <span style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: 'repeating-linear-gradient(45deg,#c8d4c8,#c8d4c8 2px,transparent 2px,transparent 5px)' }} />Pending
                </span>
              </div>
            </div>

            <div style={s.timerCard}>
              <p style={s.timerLabel}>Time Tracker</p>
              <p style={s.timerVal}>01:24:08</p>
              <div style={s.timerBtns}>
                <button style={s.timerBtn}><span style={{ fontSize: 18 }}>||</span></button>
                <button style={{ ...s.timerBtn, ...s.timerBtnRed }}><span style={{ fontSize: 18 }}>[]</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

const RADIUS = 20

const s = {
  wrapper: { width: '100%' },

  titleRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 22,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: { fontSize: 30, fontWeight: 800, color: '#1a3d1f', letterSpacing: '-0.6px', margin: '0 0 4px' },
  pageSub: { fontSize: 13.5, color: '#7a8a7a', margin: 0 },
  titleActions: { display: 'flex', gap: 10 },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '11px 22px',
    borderRadius: '40px',
    border: 'none',
    backgroundColor: '#1a3d1f',
    color: '#fff',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '11px 22px',
    borderRadius: '40px',
    border: '1.5px solid #d4dfd4',
    backgroundColor: '#ffffff',
    color: '#2d7a33',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 22,
  },
  statCard: {
    backgroundColor: '#f2f4f2',
    borderRadius: RADIUS,
    padding: '20px 22px',
    border: '1px solid #e2e8e2',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    animation: 'fadeUp 0.35s ease both',
  },
  statCardDark: {
    background: 'linear-gradient(135deg, #1a3d1f 0%, #2d7a33 100%)',
    border: 'none',
  },
  statTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 12, fontWeight: 600, letterSpacing: '0.1px' },
  statArrow: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: { fontSize: 38, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, marginBottom: 8 },
  statSub: { fontSize: 11.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, margin: 0 },
  subDot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: '#54B45B', display: 'inline-block', flexShrink: 0 },

  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' },
  leftCol:  { display: 'flex', flexDirection: 'column', gap: 20 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 20 },

  card: {
    backgroundColor: '#f2f4f2',
    borderRadius: RADIUS,
    padding: '20px 22px',
    border: '1px solid #e2e8e2',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  cardTitle: { fontSize: 14.5, fontWeight: 700, color: '#1a3d1f', margin: '0 0 14px' },
  cardHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },

  chartRow: { display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 },
  barWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, position: 'relative' },
  bar: { width: '100%', maxWidth: 34, borderRadius: 999, transition: 'height 0.4s ease' },
  barLabel: {
    position: 'absolute',
    top: -20,
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#1a3d1f',
    padding: '1px 5px',
    borderRadius: 4,
  },
  barDay: { fontSize: 11, color: '#7a8a7a', fontWeight: 500 },

  outlinePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 12px',
    borderRadius: '40px',
    border: '1px solid #d4dfd4',
    backgroundColor: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    color: '#2d7a33',
    cursor: 'pointer',
  },

  teamList: { display: 'flex', flexDirection: 'column', gap: 12 },
  teamRow: { display: 'flex', alignItems: 'center', gap: 10 },
  teamAvatar: {
    width: 34,
    height: 34,
    borderRadius: '12px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
  },
  teamMeta: { flex: 1, minWidth: 0 },
  teamName: { fontSize: 13, fontWeight: 700, color: '#1a3d1f', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  teamTask: { fontSize: 11.5, color: '#7a8a7a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  statusBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: '40px',
    border: '1px solid',
    flexShrink: 0,
  },

  sectionHeading: { marginBottom: -4 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1a3d1f', margin: '0 0 2px' },
  sectionSub: { fontSize: 13, color: '#7a8a7a', margin: 0 },

  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 14,
  },
  opCard: {
    backgroundColor: '#f2f4f2',
    borderRadius: RADIUS,
    border: '1px solid #e2e8e2',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    animation: 'fadeUp 0.35s ease both',
  },
  opAccent: { height: 3, width: '100%' },
  opInner: { padding: '16px 18px' },
  opHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  opIcon: { width: 38, height: 38, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  opTitle: { fontSize: 13.5, fontWeight: 700, color: '#1a3d1f', margin: '0 0 2px' },
  opSub: { fontSize: 11, color: '#7a8a7a', margin: 0 },
  opDivider: { height: 1, backgroundColor: '#e2e8e2', margin: '0 0 10px' },
  opField: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  opFieldLabel: { fontSize: 11.5, color: '#7a8a7a', fontWeight: 500 },
  opFieldVal: { fontSize: 12, fontWeight: 600, color: '#2d7a33', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '40px', border: '1px solid #e2e8e2' },
  opBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    marginTop: 12,
    fontSize: 12.5,
    fontWeight: 600,
    background: 'transparent',
    border: '1px solid',
    borderRadius: '40px',
    padding: '8px 0',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },

  reminderTitle: { fontSize: 20, fontWeight: 800, color: '#1a3d1f', lineHeight: 1.3, margin: '0 0 6px' },
  reminderTime: { fontSize: 12.5, color: '#7a8a7a', margin: '0 0 16px' },
  meetingBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '12px 0',
    borderRadius: '40px',
    border: 'none',
    backgroundColor: '#1a3d1f',
    color: '#fff',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    justifyContent: 'center',
  },

  projectRow: { display: 'flex', alignItems: 'center', gap: 10 },
  projectDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  projectName: { fontSize: 13, fontWeight: 600, color: '#1a3d1f', margin: '0 0 1px' },
  projectDue: { fontSize: 11, color: '#7a8a7a', margin: 0 },

  gaugeWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0 10px', position: 'relative' },
  gaugePct: { textAlign: 'center', marginTop: -10 },
  gaugePctNum: { fontSize: 28, fontWeight: 800, color: '#1a3d1f', margin: 0, letterSpacing: '-0.5px' },
  gaugePctLabel: { fontSize: 12, color: '#7a8a7a', margin: 0 },
  gaugeLegend: { display: 'flex', justifyContent: 'center', gap: 12 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#7a8a7a', fontWeight: 500 },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0, display: 'inline-block' },

  timerCard: {
    background: 'linear-gradient(135deg, #0f2a13 0%, #1c4a22 100%)',
    borderRadius: RADIUS,
    padding: '20px 22px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
  timerLabel: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' },
  timerVal: {
    fontSize: 36,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-1px',
    margin: '0 0 16px',
    textAlign: 'center',
  },
  timerBtns: { display: 'flex', justifyContent: 'center', gap: 12 },
  timerBtn: {
    width: 44,
    height: 44,
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 16,
  },
  timerBtnRed: { backgroundColor: '#ef4444' },
}