import { useEffect, useRef, useState, memo, useCallback, type Dispatch, type SetStateAction } from 'react'
import { useApp } from '../contexts/AppContext'
import { fmtDate } from '../services/api'
import { Trash2, RefreshCw, Play, Tv2, WifiOff, StopCircle } from 'lucide-react'
import type { AdminStream } from '../types'
import { VideoPlayer } from './VideoPlayer'
import { useStreamsData } from '../hooks/useStreamsData'

const POLL = 5000

/* ── Bruit statique animé (canvas) ──────────────────────────────── */
function StaticNoise() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c   = ref.current!
    const ctx = c.getContext('2d')!
    const d   = ctx.createImageData(c.width, c.height)
    for (let i = 0; i < d.data.length; i += 4) {
      const v = (Math.random() * 55) | 0
      d.data[i] = d.data[i+1] = d.data[i+2] = v
      d.data[i+3] = 255
    }
    ctx.putImageData(d, 0, 0)
  }, [])

  return (
    <canvas ref={ref} width={80} height={50}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }} />
  )
}

function ClockDisplay() {
  const [clock, setClock] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock([d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <div className="clock" style={{ fontSize: 20 }}>{clock}</div>
}

/* ── Un écran de moniteur TV ─────────────────────────────────────── */
const Monitor = memo(function Monitor({
  stream, index, selected, onOpen, onDelete, onEnd,
}: {
  stream: AdminStream
  index: number
  selected: boolean
  onOpen: Dispatch<SetStateAction<AdminStream | null>>
  onDelete: (s: AdminStream) => void
  onEnd: (s: AdminStream) => void
}) {
  const [hovered, setHovered] = useState(false)
  const online = ['LIVE', 'ONLINE'].includes(stream.status?.toUpperCase() ?? '')
  const url    = stream.streamUrl ?? stream.videoUrl ?? ''
  const cam    = String(stream.livestreamId ?? index + 1).padStart(2, '0')

  const borderColor = selected
    ? 'var(--primary)'
    : hovered ? (online ? '#ff6b5a' : 'var(--border-hi)') : (online ? 'rgba(255,59,48,.45)' : 'var(--border)')

  const outerGlow = selected
    ? '0 0 0 2px var(--primary), 0 0 30px rgba(0,180,255,.25)'
    : online ? '0 0 18px rgba(255,59,48,.18)' : '0 4px 24px rgba(0,0,0,.55)'

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: url ? 'pointer' : 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={url ? () => onOpen(prev => prev?.livestreamId === stream.livestreamId ? null : stream) : undefined}
    >
      <div style={{
        width: '100%', background: 'linear-gradient(160deg, #1c2030 0%, #12161f 60%, #0c1018 100%)',
        border: `2px solid ${borderColor}`, borderRadius: 10, padding: '8px 8px 0',
        boxShadow: outerGlow, transition: 'border-color .2s, box-shadow .2s', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 7, borderRadius: '8px 8px 0 0',
          background: 'linear-gradient(90deg, #252a36, #2e3444, #252a36)' }} />
        <div style={{ position: 'absolute', top: 1, left: 0, right: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 10px', zIndex: 10 }}>
          <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%',
            background: online ? 'var(--red)' : '#1a2030',
            boxShadow: online ? '0 0 6px var(--red), 0 0 14px rgba(255,59,48,.4)' : 'none',
            animation: online ? 'tvLed 1.8s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 7, letterSpacing: '0.2em', color: '#2a3550' }}>
            CAM {cam}
          </span>
        </div>

        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 5, overflow: 'hidden',
          background: '#000', marginTop: 5,
          boxShadow: online ? 'inset 0 0 40px rgba(0,0,0,.7)' : 'inset 0 0 50px rgba(0,0,0,.95)' }}>

          {online ? (
            <div style={{ position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(0,40,20,.15) 0%, #000 100%)' }} />
          ) : <StaticNoise />}

          {!online && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <WifiOff size={16} style={{ color: '#1e2a3a', opacity: .7 }} />
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
                letterSpacing: '0.3em', color: '#1e2a3a' }}>NO SIGNAL</span>
            </div>
          )}

          {online && (
            <div style={{ position: 'absolute', top: 7, left: 7, zIndex: 10, display: 'flex',
              alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.72)',
              border: '1px solid rgba(255,59,48,.5)', borderRadius: 3, padding: '2px 6px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)',
                boxShadow: '0 0 6px var(--red)', display: 'block', animation: 'tvLed .9s ease-in-out infinite' }} />
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8,
                letterSpacing: '0.25em', color: '#ff6b5a' }}>LIVE</span>
            </div>
          )}

          {url && hovered && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 15, display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,.65)',
                border: `1.5px solid ${online ? 'var(--red)' : 'var(--primary)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: online ? '0 0 20px rgba(255,59,48,.3)' : '0 0 20px rgba(0,180,255,.3)' }}>
                <Play size={16} style={{ color: online ? 'var(--red)' : 'var(--primary)', marginLeft: 2 }} />
              </div>
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 8,
            padding: '12px 8px 5px', background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 100%)' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, letterSpacing: '0.12em',
              color: online ? '#5a8a9a' : '#1e2a3a' }}>
              {stream.userId ? `OP · ${stream.userId}` : `FLUX #${stream.livestreamId ?? '—'}`}
            </div>
            {stream.startedAt && (
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 7, color: '#1e2a3a', marginTop: 1 }}>
                {fmtDate(stream.startedAt)}
              </div>
            )}
          </div>

          {/* Effets CRT */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.1) 2px, rgba(0,0,0,.1) 4px)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6) 100%)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
            zIndex: 22, pointerEvents: 'none', borderRadius: '5px 5px 0 0',
            background: 'linear-gradient(to bottom, rgba(255,255,255,.028), transparent)' }} />
        </div>

        <div style={{ background: 'linear-gradient(160deg, #1a1f2c, #12161e)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', borderTop: '1px solid rgba(255,255,255,.06)', gap: 6 }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 6,
            letterSpacing: '0.22em', color: '#1e2535', flex: 1 }}>CAM·{cam}</span>
          {online && (
            <button
              onClick={e => { e.stopPropagation(); onEnd(stream) }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                background: 'rgba(255,150,0,.12)', border: '1px solid rgba(255,150,0,.4)',
                borderRadius: 4, padding: '3px 8px', color: '#ff9600',
                fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: '0.1em' }}
              title="Terminer le flux"
            >
              <StopCircle size={10} /> TERMINER
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(stream) }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
              background: 'rgba(255,48,30,.1)', border: '1px solid rgba(255,48,30,.35)',
              borderRadius: 4, padding: '3px 8px', color: '#ff4030',
              fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: '0.1em' }}
            title="Supprimer le flux"
          >
            <Trash2 size={10} /> SUPPR
          </button>
        </div>
      </div>

      <div style={{ width: 32, height: 9, background: 'linear-gradient(160deg, #1a1f2c, #0e1218)', borderRadius: '0 0 3px 3px' }} />
      <div style={{ width: 54, height: 5, background: 'linear-gradient(160deg, #16192200, #0e1218)',
        borderRadius: '0 0 5px 5px', boxShadow: '0 3px 8px rgba(0,0,0,.5)',
        border: '1px solid rgba(255,255,255,.03)', borderTop: 'none' }} />
    </div>
  )
}, (prev, next) =>
  prev.stream.livestreamId === next.stream.livestreamId &&
  prev.stream.status       === next.stream.status       &&
  prev.stream.videoUrl     === next.stream.videoUrl     &&
  prev.selected            === next.selected            &&
  prev.index               === next.index
)

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — UI seule, données via useStreamsData
═══════════════════════════════════════════════════════════════════ */
export function StreamsList() {
  const { token, toast } = useApp()

  const { streams, loading, lastUpd, selected, setSelected, refresh, deleteStream, endStream } =
    useStreamsData({ token, onError: msg => toast(msg, 'error') })

  const isLive     = (s: AdminStream) => ['LIVE', 'ONLINE'].includes(s.status?.toUpperCase() ?? '')
  const liveCount  = streams.filter(isLive).length
  const cols       = streams.length <= 1 ? 1 : streams.length <= 4 ? 2 : streams.length <= 9 ? 3 : 4

  const handleDelete = useCallback(async (s: AdminStream) => {
    if (!confirm('Supprimer définitivement ce flux ?')) return
    try {
      await deleteStream(s)
      toast('Flux supprimé', 'success')
    } catch {
      toast('Échec de la suppression', 'error')
    }
  }, [deleteStream, toast])

  const handleEnd = useCallback(async (s: AdminStream) => {
    try {
      await endStream(s)
      toast('Flux terminé', 'success')
    } catch {
      toast('Échec — impossible de terminer le flux', 'error')
    }
  }, [endStream, toast])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div className="spinner" />
      <p className="loading-txt" style={{ marginTop: 10 }}>INITIALISATION DES MONITEURS...</p>
    </div>
  )

  return (
    <>
      {selected && <VideoPlayer stream={selected} onClose={() => setSelected(null)} />}

      {/* ══ EN-TÊTE ══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '14px 20px', boxShadow: 'inset 0 1px 0 rgba(0,180,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tv2 size={20} style={{ color: 'var(--primary)', opacity: .8 }} />
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase', color: 'var(--txt-hi)' }}>Mur de Moniteurs</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: 'var(--txt-lo)', letterSpacing: 1 }}>
                CENTRE DE SURVEILLANCE · {streams.length} CAMÉRA{streams.length !== 1 ? 'S' : ''}
              </div>
            </div>
          </div>
          {[
            { label: 'TOTAL',      val: streams.length,              color: 'var(--primary)' },
            { label: 'EN DIRECT',  val: liveCount,                   color: liveCount > 0 ? 'var(--red)' : 'var(--txt-lo)' },
            { label: 'HORS LIGNE', val: streams.length - liveCount,  color: 'var(--txt-lo)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, letterSpacing: '0.18em', color: 'var(--txt-lo)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
          {liveCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,59,48,.12)',
              border: '1px solid rgba(255,59,48,.3)', borderRadius: 4, padding: '5px 12px' }}>
              <span className="blink-dot" />
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                letterSpacing: '0.2em', color: 'var(--red)' }}>{liveCount} EN DIRECT</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <ClockDisplay />
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8,
              letterSpacing: '0.2em', color: 'var(--txt-lo)', marginTop: 2 }}>HEURE LOCALE</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => refresh(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      </div>

      {/* ══ AUCUN FLUX ══ */}
      {streams.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Tv2 size={44} /></div>
          <p>Aucun flux disponible</p>
          <p style={{ fontSize: 11, marginTop: 6, fontFamily: "'Share Tech Mono', monospace" }}>
            Nouvelle vérification dans {POLL / 1000}s
          </p>
        </div>
      ) : (
        <div style={{ background: 'radial-gradient(ellipse at center, rgba(5,12,25,.97) 0%, rgba(3,9,18,1) 100%)',
          border: '1px solid var(--border)', borderRadius: 12, padding: 28,
          boxShadow: 'inset 0 0 80px rgba(0,0,0,.4)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(0,90,140,.025) 1px, transparent 1px),linear-gradient(90deg, rgba(0,90,140,.025) 1px, transparent 1px)',
            backgroundSize: '44px 44px' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: cols === 1 ? 0 : cols === 2 ? 32 : 24,
            maxWidth: cols === 1 ? 560 : '100%', margin: '0 auto' }}>
            {streams.map((s, i) => (
              <Monitor
                key={s.livestreamId ?? i} stream={s} index={i}
                selected={selected?.livestreamId === s.livestreamId}
                onOpen={setSelected}
                onDelete={handleDelete}
                onEnd={handleEnd}
              />
            ))}
          </div>
          <div style={{ position: 'relative', zIndex: 2, marginTop: 20, paddingTop: 14,
            borderTop: '1px solid rgba(22,45,80,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              {['SURVEILLANCE ACTIVE', `${streams.length} CAMÉRA${streams.length > 1 ? 'S' : ''}`, 'FLUX CHIFFRÉS'].map(l => (
                <span key={l} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8,
                  letterSpacing: '0.2em', color: 'var(--txt-lo)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#0a5040', display: 'block' }} />
                  {l}
                </span>
              ))}
            </div>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8,
              letterSpacing: '0.16em', color: 'var(--txt-lo)' }}>
              MAJ {lastUpd?.toLocaleTimeString('fr-FR') ?? '—'}
            </span>
          </div>
        </div>
      )}
      <style>{`@keyframes tvLed { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }`}</style>
    </>
  )
}
