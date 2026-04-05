'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import s from './LoginPage.module.css'

// ─── Global brand config — update here to change across the whole project ────
const BRAND = {
  name:        'QUDRATI FOODS',
  tagline:     'Industrial OS',
  logoSrc:     '/qudarti.png',
  heroSrc:     '/LoginPage.jpeg',   // ← swap for 6-month refresh cycle
  heroAlt:     'Qudrati Fresh Products',
  badgeNum:    '10,000+',
  badgeSub:    'Fresh Products',
  taglineMain: 'Pure. Natural. Qudrati.',
  taglineSub:  '400+ categories of fresh goodness',
}
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm]         = useState({ username: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [remember, setRemember] = useState(false)
  const [focused, setFocused]   = useState('')
  const [mounted, setMounted]   = useState(false)

  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  useEffect(() => {
    // Reset body — prevent any layout/scroll bleed
    const h = document.documentElement
    const b = document.body
    h.style.cssText = 'margin:0;padding:0;height:100%;overflow:hidden;'
    b.style.cssText = 'margin:0;padding:0;height:100%;overflow:hidden;'
    setMounted(true)
    // Instant-on: focus username immediately
    requestAnimationFrame(() => usernameRef.current?.focus())
    return () => { h.style.cssText = ''; b.style.cssText = '' }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim()) {
      setError('Username is required'); usernameRef.current?.focus(); return
    }
    if (!form.password.trim()) {
      setError('Password is required'); passwordRef.current?.focus(); return
    }
    setLoading(true); setError('')
    try {
      // ── Wire your real API here ──────────────────────────────────────────
      // const res  = await fetch('/api/auth/login', { method:'POST',
      //   headers: { 'Content-Type':'application/json' },
      //   body: JSON.stringify({ username: form.username, password: form.password }) })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.message || 'Invalid credentials')
      // localStorage.setItem('token', data.token)
      // localStorage.setItem('user',  JSON.stringify(data.user))
      // const dest = data.user.role === 'super_user' ? '/panel-selection' : '/panel-selection'
      // router.push(dest)
      // ─────────────────────────────────────────────────────────────────────
      await new Promise(r => setTimeout(r, 1000))  // demo delay — remove
      localStorage.setItem('user', JSON.stringify({ username: form.username, role: 'super_user' }))
      router.push('/panel-selection')
    } catch (err) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  // Mouseless: Enter on username → jump to password
  const onUsernameKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus() }
  }

  return (
    <div className={s.root}>
      {/* Background */}
      <div className={s.bg} />
      <div className={`${s.orb} ${s.o1}`} />
      <div className={`${s.orb} ${s.o2}`} />
      <div className={`${s.orb} ${s.o3}`} />
      <div className={s.grain} />

      {/* Card */}
      <div className={`${s.wrap} ${mounted ? s.wrapIn : ''}`}>
        <div className={s.card}>

          {/* ══ LEFT: Form ══ */}
          <div className={s.formPanel}>

            {/* Logo — bare, no box wrapper */}
            <div className={s.logoRow}>
              <Image
                src={BRAND.logoSrc}
                alt={BRAND.name}
                width={38}
                height={38}
                className={s.logoImg}
                priority
              />
              <div className={s.brandBlock}>
                <span className={s.brandName}>{BRAND.name}</span>
                <span className={s.brandSub}>{BRAND.tagline}</span>
              </div>
            </div>

            {/* Heading */}
            <div className={s.heading}>
              <div className={s.eyebrow}>
                <span className={s.eyebrowLine} />
                <span className={s.eyebrowText}>Login</span>
              </div>
              <h1 className={s.title}>Welcome back</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={s.form} noValidate>

              {error && (
                <div className={s.err} role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8"  x2="12"    y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Username */}
              <div className={`${s.field} ${focused === 'u' ? s.fieldFoc : ''}`}>
                <label htmlFor="username" className={s.label}>Username</label>
                <div className={s.shell}>
                  <span className={s.icon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    ref={usernameRef}
                    id="username"
                    type="text"
                    className={s.input}
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError('') }}
                    onFocus={() => setFocused('u')}
                    onBlur={() => setFocused('')}
                    onKeyDown={onUsernameKey}
                    disabled={loading}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`${s.field} ${focused === 'p' ? s.fieldFoc : ''}`}>
                <label htmlFor="password" className={s.label}>Password</label>
                <div className={s.shell}>
                  <span className={s.icon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    ref={passwordRef}
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className={s.input}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
                    onFocus={() => setFocused('p')}
                    onBlur={() => setFocused('')}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={s.eye}
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me only */}
              <div className={s.metaRow}>
                <div
                  className={s.remLabel}
                  role="checkbox"
                  aria-checked={remember}
                  tabIndex={0}
                  onClick={() => setRemember(v => !v)}
                  onKeyDown={e => e.key === ' ' && setRemember(v => !v)}
                >
                  <div className={`${s.chk} ${remember ? s.chkOn : ''}`}>
                    {remember && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"
                        stroke="white" strokeWidth="2.5">
                        <polyline points="2,6 5,9 10,3"/>
                      </svg>
                    )}
                  </div>
                  <span>Remember me</span>
                </div>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                className={s.btn}
                disabled={loading}
                aria-busy={loading}
              >
                <span className={s.shimmer} />
                {loading ? (
                  <span className={s.dots}><span /><span /><span /></span>
                ) : (
                  <span className={s.btnInner}>
                    Sign In
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12,5 19,12 12,19"/>
                    </svg>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* ══ RIGHT: Image ══ */}
          <div className={s.imgPanel}>
            <Image
              src={BRAND.heroSrc}
              alt={BRAND.heroAlt}
              fill
              style={{ objectFit: 'cover', objectPosition: '60% center' }}
              loading="lazy"
            />
            <div className={s.imgOverlay} />

            <div className={s.badge}>
              <span className={s.dot} />
              <div>
                <p className={s.badgeNum}>{BRAND.badgeNum}</p>
                <p className={s.badgeSub}>{BRAND.badgeSub}</p>
              </div>
            </div>

            <div className={s.tagline}>
              <p className={s.tagMain}>{BRAND.taglineMain}</p>
              <p className={s.tagSub}>{BRAND.taglineSub}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
