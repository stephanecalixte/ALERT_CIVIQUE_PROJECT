import { useState, useRef, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { api } from '../services/api'
import { Lock, User, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react'

/* ── Étoiles canvas ────────────────────────────────────────────────── */
function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx    = canvas.getContext('2d')!
    let   raf: number
    const stars  = Array.from({ length: 320 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.1 + 0.15,
      a: Math.random(), spd: Math.random() * 0.003 + 0.0008,
      dir: Math.random() > 0.5 ? 1 : -1,
    }))
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        s.a += s.spd * s.dir
        if (s.a >= 1 || s.a <= 0.05) s.dir *= -1
        ctx.beginPath()
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160,200,255,${(s.a * 0.9).toFixed(2)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none z-0" />
}

/* ── Radar SVG ─────────────────────────────────────────────────────── */
function RadarScope() {
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#001820" stopOpacity="1" />
          <stop offset="100%" stopColor="#000a10" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="sweep" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00ffaa" stopOpacity="0" />
          <stop offset="75%"  stopColor="#00d4aa" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00ffcc" stopOpacity="0.35" />
        </radialGradient>
        <clipPath id="circle-clip">
          <circle cx="120" cy="120" r="108" />
        </clipPath>
      </defs>

      {/* Fond */}
      <circle cx="120" cy="120" r="116" fill="url(#rg)" stroke="rgba(0,220,180,0.2)" strokeWidth="1" />

      {/* Anneaux */}
      {[27, 54, 81, 108].map(r => (
        <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="rgba(0,200,160,0.15)" strokeWidth="0.6" />
      ))}

      {/* Réticule */}
      <line x1="12" y1="120" x2="228" y2="120" stroke="rgba(0,200,160,0.12)" strokeWidth="0.5" />
      <line x1="120" y1="12"  x2="120" y2="228" stroke="rgba(0,200,160,0.12)" strokeWidth="0.5" />
      <line x1="43"  y1="43"  x2="197" y2="197" stroke="rgba(0,200,160,0.07)" strokeWidth="0.4" />
      <line x1="197" y1="43"  x2="43"  y2="197" stroke="rgba(0,200,160,0.07)" strokeWidth="0.4" />

      {/* Sweep */}
      <g clipPath="url(#circle-clip)"
        style={{ transformOrigin: '120px 120px', animation: 'radarSpin 5s linear infinite' }}>
        <path d="M120 120 L228 120 A108 108 0 0 0 120 12 Z" fill="url(#sweep)" />
        <line x1="120" y1="120" x2="228" y2="120" stroke="rgba(0,255,180,0.6)" strokeWidth="1" />
      </g>

      {/* Blips contacts */}
      <circle cx="162" cy="78"  r="3"   fill="#00ffaa" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.2;0.95" dur="2.1s" repeatCount="indefinite" />
      </circle>
      <circle cx="80"  cy="152" r="2.5" fill="#00ffaa" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.15;0.8" dur="3.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="172" cy="138" r="2"   fill="#ff5050" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.7s" repeatCount="indefinite" />
      </circle>
      <circle cx="98"  cy="68"  r="1.8" fill="#00ffaa" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.1;0.7" dur="4.2s" repeatCount="indefinite" />
      </circle>

      {/* Bord lumineux */}
      <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(0,220,180,0.3)" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="116" fill="none" stroke="rgba(0,180,140,0.1)"  strokeWidth="0.5" />
    </svg>
  )
}

/* ── Coin décoratif ─────────────────────────────────────────────────── */
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 28
  const s: React.CSSProperties = {
    position: 'absolute', width: size, height: size, pointerEvents: 'none',
    borderColor: 'rgba(0,180,220,0.35)',
    borderStyle: 'solid',
    borderWidth: 0,
    ...(pos === 'tl' ? { top: 0, left: 0,   borderTopWidth: 1.5, borderLeftWidth:  1.5 } : {}),
    ...(pos === 'tr' ? { top: 0, right: 0,  borderTopWidth: 1.5, borderRightWidth: 1.5 } : {}),
    ...(pos === 'bl' ? { bottom: 0, left: 0,  borderBottomWidth: 1.5, borderLeftWidth:  1.5 } : {}),
    ...(pos === 'br' ? { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 } : {}),
  }
  return <div style={s} />
}

/* ── Ligne statut système ───────────────────────────────────────────── */
function SysRow({ label, value, ok = true }: { label: string; value: string; ok?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: '1px solid rgba(0,120,150,0.12)',
    }}>
      <span style={{ fontSize: 10, letterSpacing: '0.14em', color: '#2a6070' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.12em', color: ok ? '#00cc60' : '#e04444' }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: ok ? '#00cc60' : '#e04444',
          boxShadow: `0 0 5px ${ok ? '#00cc60' : '#e04444'}`,
          display: 'inline-block',
        }} />
        {value}
      </span>
    </div>
  )
}

/* ── Input field ────────────────────────────────────────────────────── */
function Field({
  label, icon, inputRef, type = 'text', value, onChange, placeholder, autoComplete, rightEl,
}: {
  label: string
  icon: React.ReactNode
  inputRef?: React.RefObject<HTMLInputElement>
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete?: string
  rightEl?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <div style={{
        fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' as const,
        color: focused ? '#3a90b0' : '#1e5568', marginBottom: 8,
        transition: 'color 0.2s',
      }}>
        ▸ {label}
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#2a90b0' : '#1a5060', transition: 'color 0.2s',
          display: 'flex', alignItems: 'center',
        }}>{icon}</span>
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box' as const,
            background: focused ? 'rgba(0,20,40,0.9)' : 'rgba(0,10,22,0.85)',
            border: `1px solid ${focused ? 'rgba(0,200,240,0.45)' : 'rgba(0,110,160,0.25)'}`,
            borderRadius: 3,
            color: '#9ad8f0',
            fontSize: 13,
            padding: `12px ${rightEl ? '40px' : '14px'} 12px 38px`,
            outline: 'none',
            letterSpacing: '0.05em',
            boxShadow: focused ? '0 0 0 3px rgba(0,180,240,0.06), inset 0 1px 0 rgba(255,255,255,0.02)' : 'none',
            transition: 'all 0.18s',
            fontFamily: 'inherit',
          }}
        />
        {rightEl && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center',
          }}>{rightEl}</span>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
export function LoginPage() {
  const { login, toast } = useApp()
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPwd,      setShowPwd]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [clock,        setClock]        = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
    const tick = () => {
      const d = new Date()
      const hh = d.getUTCHours().toString().padStart(2, '0')
      const mm = d.getUTCMinutes().toString().padStart(2, '0')
      const ss = d.getUTCSeconds().toString().padStart(2, '0')
      setClock(`${hh}:${mm}:${ss} UTC`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('IDENTIFIANT ET CODE D\'ACCÈS REQUIS'); return }
    setLoading(true)
    try {
      const data = await api.login(email, password)
      if (!data.isAdmin) { setError('HABILITATION INSUFFISANTE — ACCÈS REFUSÉ'); return }
      login(data)
      toast(`Session ouverte · ${data.firstname} ${data.lastname}`, 'success')
    } catch {
      setError('AUTHENTIFICATION ÉCHOUÉE — VÉRIFIEZ VOS IDENTIFIANTS')
    } finally {
      setLoading(false)
    }
  }

  /* ── Couleurs partagées ── */
  const C = {
    border:   'rgba(0,140,180,0.2)',
    panelBg:  'rgba(1,7,18,0.88)',
    headerBg: 'rgba(0,14,32,0.92)',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(ellipse at 25% 35%, #030f20 0%, #010509 55%, #000 100%)',
      fontFamily: "'Courier New', Courier, monospace",
      color: '#c0dce8',
      overflow: 'hidden',
      position: 'relative',
    }}>

      <StarCanvas />

      {/* Grille fine */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,140,200,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,140,200,0.04) 1px,transparent 1px)',
        backgroundSize: '56px 56px',
      }} />

      {/* Vignette bords */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* ══ BARRE SUPÉRIEURE ══════════════════════════════════════════ */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: C.headerBg,
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontSize: 9, letterSpacing: '0.22em', color: '#1e5060' }}>
          ALERT-CIVIQUE COMMAND NET · REV 2.4.1
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 9, letterSpacing: '0.18em', color: '#0d7040' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d060', display: 'inline-block', boxShadow: '0 0 6px #00d060', animation: 'blink 2s ease-in-out infinite' }} />
          ALL SYSTEMS NOMINAL
        </span>
        <span style={{ fontSize: 9, letterSpacing: '0.2em', color: '#1e5060', fontVariantNumeric: 'tabular-nums' }}>
          MET {clock}
        </span>
      </header>

      {/* ══ ZONE CENTRALE ════════════════════════════════════════════ */}
      <main style={{
        position: 'relative', zIndex: 5,
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 40px',
      }}>
      <div style={{
        display: 'flex', flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%', maxWidth: 1040,
        gap: 0,
      }}>

        {/* ── PANNEAU GAUCHE ─────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          gap: 32, paddingRight: 48,
          borderRight: `1px solid ${C.border}`,
        }}>

          {/* Radar */}
          <div style={{ position: 'relative', width: 220, height: 220, flexShrink: 0 }}>
            {/* Halo externe */}
            <div style={{
              position: 'absolute', inset: -8,
              borderRadius: '50%',
              boxShadow: '0 0 40px rgba(0,180,140,0.08), 0 0 80px rgba(0,100,100,0.06)',
            }} />
            <RadarScope />
            {/* Label */}
            <div style={{
              position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
              fontSize: 8, letterSpacing: '0.28em', color: '#1a4a50', whiteSpace: 'nowrap',
            }}>SURVEILLANCE RADAR — EN LIGNE</div>
          </div>

          {/* Statuts système */}
          <div style={{
            width: '100%', maxWidth: 300,
            background: 'rgba(0,10,22,0.6)',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${C.border}`,
              background: 'rgba(0,20,40,0.5)',
              fontSize: 8, letterSpacing: '0.22em', color: '#1a4a58',
            }}>
              // DIAGNOSTIC SYSTÈME
            </div>
            <div style={{ padding: '4px 16px 8px' }}>
              <SysRow label="RÉSEAU PRINCIPAL"    value="OPÉRATIONNEL" />
              <SysRow label="CHIFFREMENT AES-256"  value="ACTIF"        />
              <SysRow label="SERVEUR AUTH JWT"      value="EN LIGNE"     />
              <SysRow label="AUDIT &amp; LOGS"      value="ACTIVÉ"       />
              <SysRow label="CONNEXIONS ACTIVES"    value="3 / 128"      />
            </div>
          </div>

          {/* Badge classification */}
          <div style={{
            border: '1px solid rgba(0,120,150,0.2)',
            padding: '5px 20px',
            fontSize: 8, letterSpacing: '0.24em', color: '#0e3040',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: 'rgba(0,180,200,0.25)' }}>◆</span>
            CONFIDENTIEL — USAGE INTERNE UNIQUEMENT
            <span style={{ color: 'rgba(0,180,200,0.25)' }}>◆</span>
          </div>
        </div>

        {/* ── PANNEAU DROITE — FORMULAIRE ────────────────────────── */}
        <div style={{
          flex: '0 0 440px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 48,
        }}>

          {/* Logo orbital */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>

            {/* Orbite */}
            <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 16 }}>
              {/* Ring 1 */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1px solid rgba(0,180,220,0.22)',
                boxShadow: '0 0 18px rgba(0,140,200,0.1)',
                animation: 'orbitA 14s linear infinite',
              }} />
              {/* Ring 2 */}
              <div style={{
                position: 'absolute', inset: 10, borderRadius: '50%',
                border: '1px solid rgba(0,160,200,0.14)',
                animation: 'orbitB 9s linear infinite',
              }} />
              {/* Noyau */}
              <div style={{
                position: 'absolute', inset: 20,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, rgba(0,90,180,0.5), rgba(0,15,40,0.95))',
                border: '1px solid rgba(0,210,255,0.5)',
                boxShadow: '0 0 24px rgba(0,160,255,0.15), inset 0 0 12px rgba(0,80,180,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 900, letterSpacing: 3,
                  color: '#70d8ff',
                  textShadow: '0 0 12px rgba(0,200,255,0.6)',
                }}>AC</span>
              </div>
              {/* Satellite orbitant */}
              <div style={{
                position: 'absolute',
                top: -3, left: 'calc(50% - 3px)',
                width: 6, height: 6, borderRadius: '50%',
                background: '#00d8ff',
                boxShadow: '0 0 10px #00d8ff, 0 0 4px rgba(0,220,255,0.8)',
                transformOrigin: '3px 47px',
                animation: 'orbitA 14s linear infinite',
              }} />
            </div>

            <h1 style={{
              fontSize: 20, fontWeight: 900, letterSpacing: '0.38em',
              color: '#ffffff', margin: '0 0 5px',
              textShadow: '0 0 24px rgba(0,180,255,0.25)',
              textTransform: 'uppercase',
            }}>
              ALERT-CIVIQUE
            </h1>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', color: '#1e5870', margin: 0, textTransform: 'uppercase' }}>
              Centre de Commandement Opérationnel
            </p>

            {/* Séparateur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <div style={{ width: 48, height: 1, background: 'linear-gradient(to right, transparent, rgba(0,180,220,0.35))' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,200,240,0.4)', boxShadow: '0 0 6px rgba(0,200,240,0.4)' }} />
              <div style={{ width: 48, height: 1, background: 'linear-gradient(to left,  transparent, rgba(0,180,220,0.35))' }} />
            </div>
          </div>

          {/* ── Card formulaire ── */}
          <div style={{
            background: C.panelBg,
            border: `1px solid rgba(0,150,195,0.22)`,
            borderRadius: 5,
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,80,140,0.08)',
            overflow: 'hidden',
          }}>
            {/* En-tête card */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 20px',
              background: 'rgba(0,18,38,0.5)',
              borderBottom: `1px solid rgba(0,120,160,0.15)`,
            }}>
              <span style={{ fontSize: 9, letterSpacing: '0.2em', color: '#1a4f62' }}>
                // SECURE AUTH TERMINAL · ENCRYPTED
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['rgba(220,60,60,0.35)', 'rgba(220,160,0,0.35)', 'rgba(0,180,70,0.35)'].map((bg, i) => (
                  <span key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: bg,
                    border: `1px solid ${bg.replace('0.35', '0.5')}`,
                    display: 'block',
                  }} />
                ))}
              </div>
            </div>

            {/* Corps formulaire */}
            <form onSubmit={submit} style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Erreur */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '11px 14px',
                  background: 'rgba(80,0,0,0.28)',
                  border: '1px solid rgba(220,60,60,0.3)',
                  borderRadius: 3,
                  borderLeft: '3px solid rgba(220,60,60,0.6)',
                }}>
                  <AlertTriangle size={13} style={{ color: '#ff6060', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 10, letterSpacing: '0.1em', color: '#ff8888', lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              {/* Email */}
              <Field
                label="Identifiant opérateur"
                icon={<User size={13} />}
                inputRef={emailRef as React.RefObject<HTMLInputElement>}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="operateur@alert-civique.fr"
                autoComplete="username"
              />

              {/* Password */}
              <Field
                label="Code d'accès sécurisé"
                icon={<Lock size={13} />}
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="••••••••••••••••"
                autoComplete="current-password"
                rightEl={
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPwd(v => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#1e5060', display: 'flex' }}
                  >
                    {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                }
              />

              {/* Submit */}
              <SubmitButton loading={loading} />
            </form>

            {/* Pied card */}
            <div style={{
              padding: '10px 20px', textAlign: 'center',
              borderTop: `1px solid rgba(0,100,130,0.15)`,
              background: 'rgba(0,8,18,0.4)',
              fontSize: 8, letterSpacing: '0.16em', color: '#0d3040',
            }}>
              ACCÈS RÉSERVÉ AU PERSONNEL HABILITÉ · TOUTE TENTATIVE NON AUTORISÉE EST ENREGISTRÉE
            </div>
          </div>

          {/* Mention sous le card */}
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 8, letterSpacing: '0.22em', color: '#0a2030' }}>
            SYSTÈME DE GESTION DES INCIDENTS CIVILS · NIVEAU CONFIDENTIEL
          </div>
        </div>
      </div>
      </main>

      {/* ══ BARRE INFÉRIEURE ══════════════════════════════════════════ */}
      <footer style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: C.headerBg,
        borderTop: `1px solid ${C.border}`,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontSize: 8, letterSpacing: '0.18em', color: '#0e2e40' }}>
          © ALERT-CIVIQUE SYSTEMS — USAGE OFFICIEL UNIQUEMENT
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[['TLS 1.3', true], ['JWT HS256', true], ['AUDIT LOG', true]].map(([lbl]) => (
            <span key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8, letterSpacing: '0.14em', color: '#0a3826' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#007840', display: 'inline-block', boxShadow: '0 0 4px #007840' }} />
              {lbl as string}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 8, letterSpacing: '0.18em', color: '#0e2e40' }}>
          BUILD 2025.04.15 · REV 2.4.1
        </span>
      </footer>

      {/* ── Coins décoratifs (4 coins de l'écran) ── */}
      {(['tl','tr','bl','br'] as const).map(p => <Corner key={p} pos={p} />)}

      <style>{`
        @keyframes radarSpin { to { transform: rotate(360deg); } }
        @keyframes orbitA    { to { transform: rotate(360deg); } }
        @keyframes orbitB    { to { transform: rotate(-360deg); } }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder   { color: rgba(0,110,145,0.4); letter-spacing: 0.04em; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(0,15,35,0.95) inset !important;
          -webkit-text-fill-color: #9ad8f0 !important;
        }
      `}</style>
    </div>
  )
}

/* ── Bouton submit isolé pour le hover propre ───────────────────────── */
function SubmitButton({ loading }: { loading: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '13px 0',
        borderRadius: 3,
        border: `1px solid ${loading ? 'rgba(0,80,110,0.3)' : hovered ? 'rgba(0,220,255,0.55)' : 'rgba(0,180,220,0.35)'}`,
        background: loading
          ? 'rgba(0,20,40,0.5)'
          : hovered
            ? 'linear-gradient(135deg, rgba(0,70,140,0.85), rgba(0,140,210,0.45))'
            : 'linear-gradient(135deg, rgba(0,55,115,0.75), rgba(0,120,190,0.35))',
        color: loading ? '#1a4a5a' : '#7ad8f8',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.26em',
        textTransform: 'uppercase' as const,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: loading ? 'none' : hovered
          ? '0 0 40px rgba(0,180,255,0.18), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 0 20px rgba(0,140,220,0.1),  inset 0 1px 0 rgba(255,255,255,0.03)',
        transition: 'all 0.18s',
        fontFamily: "'Courier New', monospace",
        marginTop: 4,
      }}
    >
      {loading
        ? <><Loader2 size={13} className="animate-spin" /> VÉRIFICATION EN COURS...</>
        : <>INITIER CONNEXION SÉCURISÉE</>
      }
    </button>
  )
}
