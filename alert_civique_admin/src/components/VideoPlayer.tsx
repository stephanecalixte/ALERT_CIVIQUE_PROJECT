import { useEffect, useRef, useState } from 'react'
import { X, Signal } from 'lucide-react'
import type { AdminStream } from '../types'
import { fmtDate } from '../services/api'
import { useHlsPlayer } from '../hooks/useHlsPlayer'
import { PlayerOverlay } from './PlayerOverlay'
import { PlayerControls } from './PlayerControls'

interface Props {
  stream: AdminStream
  onClose: () => void
}

const fmtBandwidth = (bps: number | null) => {
  if (!bps) return null
  if (bps > 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`
  return `${Math.round(bps / 1000)} kbps`
}

export function VideoPlayer({ stream, onClose }: Props) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing,      setPlaying]      = useState(false)
  const [muted,        setMuted]        = useState(false)
  const [volume,       setVolume]       = useState(1)
  const [fullscreen,   setFullscreen]   = useState(false)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [showControls, setShowControls] = useState(true)
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>()

  const url      = stream.streamUrl ?? stream.videoUrl ?? ''
  const isLive   = !duration || !isFinite(duration)
  const isOnline = ['LIVE', 'ONLINE'].includes(stream.status?.toUpperCase() ?? '')

  const { status, bandwidth, retryCount, isHls, initPlayer, setRetryCount } =
    useHlsPlayer({ url, videoRef })

  /* ── Suivi des événements vidéo ── */
  useEffect(() => {
    const v = videoRef.current!
    const onTime  = () => setCurrentTime(v.currentTime)
    const onMeta  = () => setDuration(isFinite(v.duration) ? v.duration : 0)
    const onPlay  = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('timeupdate',     onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('play',           onPlay)
    v.addEventListener('pause',          onPause)
    return () => {
      v.removeEventListener('timeupdate',     onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('play',           onPlay)
      v.removeEventListener('pause',          onPause)
    }
  }, [])

  /* ── Raccourcis clavier ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')    { onClose(); return }
      if (e.key === ' ')         { e.preventDefault(); togglePlay() }
      if (e.key === 'm')         { toggleMute() }
      if (e.key === 'f')         { toggleFullscreen() }
      if (e.key === 'ArrowRight' && !isLive) seek(currentTime + 10)
      if (e.key === 'ArrowLeft'  && !isLive) seek(Math.max(0, currentTime - 10))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* ── Contrôles ── */
  const showCtrl = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    if (playing) controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  const togglePlay = () => {
    const v = videoRef.current!
    if (v.paused) { v.play().catch(() => {}) } else { v.pause() }
  }

  const toggleMute = () => {
    const v = videoRef.current!
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const changeVolume = (val: number) => {
    const v = videoRef.current!
    v.volume = val; v.muted = val === 0
    setVolume(val); setMuted(val === 0)
  }

  const seek = (val: number) => {
    const v = videoRef.current!
    v.currentTime = val; setCurrentTime(val)
  }

  const goToLiveEdge = () => {
    const v = videoRef.current!
    v.currentTime = v.seekable.end(0)
    v.play().catch(() => {})
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {})
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 font-mono"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl rounded-xl overflow-hidden border border-cyan-900/50"
        style={{ boxShadow: '0 0 80px rgba(0,240,255,0.07), 0 0 1px rgba(0,240,255,0.5)' }}
        onClick={e => e.stopPropagation()}
        onMouseMove={showCtrl}
      >
        {/* ── Header ── */}
        <div className="bg-black/95 border-b border-cyan-900/30 px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Signal size={13} className={isOnline ? 'text-red-400' : 'text-gray-600'} />
            <span className="font-bold text-cyan-200 tracking-wider shrink-0">FLUX #{stream.livestreamId ?? '—'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest uppercase shrink-0 ${
              isOnline ? 'bg-red-900/30 border-red-800/40 text-red-400' : 'bg-gray-900/40 border-gray-700/40 text-gray-500'
            }`}>{stream.status ?? 'OFFLINE'}</span>
            {isOnline && (
              <span className="flex items-center gap-1 text-[10px] text-red-300 font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
              </span>
            )}
            {bandwidth && (
              <span className="text-[10px] text-cyan-800 hidden md:block tracking-widest">{fmtBandwidth(bandwidth)}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-cyan-800 shrink-0">
            <span className="hidden md:block">Op. : {stream.userId ?? '—'}</span>
            <span className="hidden md:block">Début : {fmtDate(stream.startedAt)}</span>
            <button onClick={onClose} className="p-1.5 rounded border border-red-900/50 text-red-500 hover:bg-red-950/40 transition" title="Fermer (Echap)">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Zone vidéo ── */}
        <div className="relative bg-black aspect-video cursor-pointer select-none" onClick={togglePlay}>
          <video ref={videoRef} className="w-full h-full object-contain" playsInline muted={muted} />
          <PlayerOverlay
            status={status} retryCount={retryCount} url={url} playing={playing}
            onRetry={() => { setRetryCount(0); initPlayer() }}
          />
          <PlayerControls
            playing={playing} muted={muted} volume={volume} fullscreen={fullscreen}
            isLive={isLive} isHls={isHls} currentTime={currentTime} duration={duration}
            visible={showControls}
            onTogglePlay={togglePlay} onToggleMute={toggleMute}
            onChangeVolume={changeVolume} onSeek={seek}
            onGoToLiveEdge={goToLiveEdge} onToggleFullscreen={toggleFullscreen}
          />
        </div>

        {/* ── Footer ── */}
        <div className="bg-black/95 border-t border-cyan-900/30 px-5 py-2 flex gap-6 text-[10px] text-cyan-900 tracking-widest items-center">
          <span className="text-cyan-800">URL : <span className="text-cyan-700">{url || 'N/D'}</span></span>
          {stream.duration && <span>DURÉE : {stream.duration}s</span>}
          <span className="ml-auto text-[9px] text-gray-800 hidden md:block">Espace : play/pause · M : muet · F : plein écran · ← → : ±10s</span>
        </div>
      </div>

      <style>{`@keyframes scan { from { top: -2px; } to { top: 100%; } }`}</style>
    </div>
  )
}
