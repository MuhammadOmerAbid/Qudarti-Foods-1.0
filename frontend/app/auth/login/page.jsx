'use client'
// ============================================================
// QUDARTI — Login Page
// Split-screen | Keyboard-first | Auto-focus | Enter navigation
// ============================================================
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/endpoints'
import { setTokens } from '@/lib/api/client'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  // Auto-focus username on load
  useEffect(() => { 
    usernameRef.current?.focus() 
  }, [])

  const handleUsernameKeyDown = (e) => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      passwordRef.current?.focus() 
    }
  }

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      handleSubmit() 
    }
  }

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const { access, refresh, user } = await authApi.login(username, password)
      setTokens(access, refresh)
      setUser(user)
      router.push('/store/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: "'Plus Jakarta Sans', sans-serif" 
    }}>

      {/* ── Left: Form panel ── */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 60px',
        background: '#f5f5f5',
        overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          marginBottom: 'auto' 
        }}>
          <div style={{
            width: 40, 
            height: 40, 
            borderRadius: 10,
            background: '#54B45B',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 700, 
            fontSize: 18, 
            color: 'white',
          }}>Q</div>
          <span style={{ 
            fontSize: 22, 
            fontWeight: 700, 
            color: '#1a2e1b' 
          }}>QUDARTI</span>
        </div>

        {/* Form centered */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          maxWidth: 400, 
          margin: '0 auto', 
          width: '100%' 
        }}>

          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 700, 
            color: '#1a2e1b', 
            marginBottom: 32, 
            letterSpacing: '-0.5px' 
          }}>
            LOGIN
          </h1>

          {/* Error popup */}
          {error && (
            <div style={{
              background: '#fef2f2', 
              border: '1px solid #fca5a5',
              borderRadius: 10, 
              padding: '12px 16px', 
              marginBottom: 20,
              color: '#7f1d1d', 
              fontSize: 14, 
              fontWeight: 500,
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠</span>
              {error}
            </div>
          )}

          {/* Username field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 13, 
              fontWeight: 600, 
              color: '#4a6b4c', 
              marginBottom: 6 
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ 
                position: 'absolute', 
                left: 14, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#7a9a7c', 
                fontSize: 14 
              }}>
                👤
              </span>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleUsernameKeyDown}
                placeholder="Enter your username"
                style={{
                  width: '100%', 
                  padding: '12px 14px 12px 40px',
                  fontSize: 15, 
                  fontFamily: 'inherit',
                  background: 'white',
                  border: '1.5px solid rgba(84,180,91,0.2)',
                  borderRadius: 50,
                  outline: 'none',
                  color: '#1a2e1b',
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#54B45B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(84,180,91,0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(84,180,91,0.2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 13, 
              fontWeight: 600, 
              color: '#4a6b4c', 
              marginBottom: 6 
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ 
                position: 'absolute', 
                left: 14, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#7a9a7c', 
                fontSize: 14 
              }}>
                🔒
              </span>
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                placeholder="Enter your password"
                style={{
                  width: '100%', 
                  padding: '12px 44px 12px 40px',
                  fontSize: 15, 
                  fontFamily: 'inherit',
                  background: 'white',
                  border: '1.5px solid rgba(84,180,91,0.2)',
                  borderRadius: 50,
                  outline: 'none',
                  color: '#1a2e1b',
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#54B45B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(84,180,91,0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(84,180,91,0.2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', 
                  right: 14, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: '#7a9a7c', 
                  fontSize: 14,
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%', 
              padding: '13px 0',
              background: isLoading ? '#a5d6a7' : '#54B45B',
              color: 'white', 
              border: 'none',
              borderRadius: 50, 
              fontSize: 15,
              fontWeight: 700, 
              fontFamily: 'inherit',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 150ms',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
            }}
            onMouseEnter={(e) => { 
              if (!isLoading) e.target.style.background = '#3d8f43' 
            }}
            onMouseLeave={(e) => { 
              if (!isLoading) e.target.style.background = '#54B45B' 
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: 16, 
                  height: 16, 
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', 
                  borderRadius: '50%',
                  animation: 'spin 700ms linear infinite',
                }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: 'auto', 
          paddingTop: 24 
        }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>© 2025 Posive</span>
          <a href="#" style={{ 
            fontSize: 12, 
            color: '#9ca3af', 
            textDecoration: 'none' 
          }}>Terms & Conditions</a>
        </div>
      </div>

      {/* ── Right: Hero image ── */}
      <div style={{
        flex: '0 0 50%',
        position: 'relative',
        overflow: 'hidden',
        background: '#1a2e1b',
      }}>
        {/* Overlay content */}
        <div style={{
          position: 'absolute', 
          inset: 0, 
          zIndex: 2,
          background: 'linear-gradient(135deg, rgba(26,46,27,0.6) 0%, rgba(84,180,91,0.15) 100%)',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start', 
          justifyContent: 'flex-end',
          padding: '48px',
        }}>
          <p style={{ 
            fontSize: 13, 
            fontWeight: 600, 
            letterSpacing: '0.1em', 
            color: 'rgba(255,255,255,0.6)', 
            marginBottom: 10, 
            textTransform: 'uppercase' 
          }}>
            Industrial Management
          </p>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            color: 'white', 
            lineHeight: 1.2, 
            marginBottom: 12, 
            maxWidth: 360 
          }}>
            Built for speed. Designed for industry.
          </h2>
          <p style={{ 
            fontSize: 15, 
            color: 'rgba(255,255,255,0.65)', 
            maxWidth: 320 
          }}>
            Manage gate operations, inventory, production, and more — all from one platform.
          </p>
        </div>

        {/* Hero image — swap via HERO_IMAGE env var or config */}
        <img
          src={process.env.NEXT_PUBLIC_LOGIN_HERO || '/images/hero-default.jpg'}
          alt="Qudarti hero"
          style={{
            position: 'absolute', 
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)',
          }}
          loading="lazy"
        />
      </div>

      <style jsx>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  )
}