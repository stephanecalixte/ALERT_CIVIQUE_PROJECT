import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import {
  X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  Signal, AlertTriangle, Loader2, RefreshCw, Radio
} from 'lucide-react'
import type { AdminStream } from '../types'
import { fmtDate } from '../services/api'

interface Props {
  stream: AdminStream
  onClose: () => void
}

type PlayerStatus = 'loading' | 'ready' | 'error' | 'no-url' | 'reconnecting'

export function VideoPlayer({ stream, onClose }: Props) {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const hlsRef        = useRef<Hls | null>(null)
  const containerRef  = useRef<HTMLDivElement>(null)
  const reconnectRef  = useRef<ReturnType<typeof setTimeout>>()

  const [playing,      setPlaying]      = useState(false)
  const [muted,        setMuted]        = useState(false)
  const [volume,       setVolume]       = useState(1)
  const [fullscreen,   setFullscreen]   = useState(false)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [status,       setStatus]       = useState<PlayerStatus>('loading')
  const [retryCount,   setRetryCount]   = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [bandwidth,    setBandwidth]    = useState<number | null>(null)
  const controlsTimer  = useRef<ReturnType<typeof setTimeout>>()

  const url     = stream.streamUrl ?? stream.videoUrl ?? ''
  const isLive  = !duration || !isFinite(duration)
  const isOnline = stream.status?.toUpperCase() === 'ONLINE'
  const isHls   = url.includes('.m3u8') || url.includes('/hls/')

  /* ── Init / destroy HLS ── */
  const initPlayer = useCallback(() => {
    if (!url || !videoRef.current) { setStatus('no-url'); return }
    const video = videoRef.current
    setStatus('loading')

    // Nettoyage HLS précédent
    hlsRef.current?.destroy()
    hlsRef.current = null

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker:     true,
        lowLatencyMode:   true,     // Mode basse latence pour le LIVE
        liveSyncDuration: 2,        // Synchronisation à 2s du live edge
        liveMaxLatencyDuration: 6,  // Rattrape si > 6s de retard
        maxBufferLength:  30,
        backBufferLength: 10,
      })
      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('ready')
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
        setBandwidth(Math.round((data.frag.stats.loaded * 8) / (data.frag.stats.loading.end - data.frag.stats.loading.start)))
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (retryCount < 3) {
            setStatus('reconnecting')
            reconnectRef.current = setTimeout(() => {
              setRetryCount(c => c + 1)
              initPlayer()
            }, 3000)
          } else {
            setStatus('error')
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // HLS natif Safari
      video.src = url
      video.oncanplay  = () => { setStatus('ready'); video.play().catch(() => {}) }
      video.onerror    = () => setStatus('error')
    } else {
      // MP4 / WebM natif
      video.src = url
      video.oncanplay  = () => { setStatus('ready'); video.play().catch(() => {}) }
      video.onerror    = () => setStatus('error')
    }
  }, [url, retryCount])

  useEffect(() => {
    initPlayer()
    return () => {
      hlsRef.current?.destroy()
      clearTimeout(reconnectRef.current)
    }
  }, [url]) // Réinitialise uniquement si l'URL change

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
      if (e.key === 'Escape')   { onClose(); return }
      if (e.key === ' ')        { e.preventDefault(); togglePlay() }
      if (e.key === 'm')        { toggleMute() }
      if (e.key === 'f')        { toggleFullscreen() }
      if (e.key === 'ArrowRight' && !isLive) seek(currentTime + 10)
      if (e.key === 'ArrowLeft'  && !isLive) seek(Math.max(0, currentTime - 10))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* ── Auto-hide contrôles ── */
  const showCtrl = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    if (playing) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  const togglePlay = () => {
    const v = videoRef.current!
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const toggleMute = () => {
    const v = videoRef.current!
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const changeVolume = (val: number) => {
    const v = videoRef.current!
    v.volume = val
    v.muted = val === 0
    setVolume(val)
    setMuted(val === 0)
  }

  const seek = (val: number) => {
    const v = videoRef.current!
    v.currentTime = val
    setCurrentTime(val)
  }

  const goToLiveEdge = () => {
    const hls = hlsRef.current
    if (hls) {
      const v = videoRef.current!
      v.currentTime = v.seekable.end(0)
      v.play().catch(() => {})
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {})
    }
  }

  const fmt = (s: number) => {
    if (!isFinite(s) || s === 0) return '∞'
    const m   = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const fmtBandwidth = (bps: number | null) => {
    if (!bps) return null
    if (bps > 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`
    return `${Math.round(bps / 1000)} kbps`
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
            <span className="font-bold text-cyan-200 tracking-wider shrink-0">
              FLUX #{stream.livestreamId ?? '—'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest uppercase shrink-0 ${
              isOnline
                ? 'bg-red-900/30 border-red-800/40 text-red-400'
                : 'bg-gray-900/40 border-gray-700/40 text-gray-500'
            }`}>
              {stream.status ?? 'OFFLINE'}
            </span>
            {isOnline && (
              <span className="flex items-center gap-1 text-[10px] text-red-300 font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
            {bandwidth && (
              <span className="text-[10px] text-cyan-800 hidden md:block tracking-widest">
                {fmtBandwidth(bandwidth)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-cyan-800 shrink-0">
            <span className="hidden md:block">Op. : {stream.userId ?? '—'}</span>
            <span className="hidden md:block">Début : {fmtDate(stream.startedAt)}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded border border-red-900/50 text-red-500 hover:bg-red-950/40 transition"
              title="Fermer (Echap)"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Zone vidéo ── */}
        <div
          className="relative bg-black aspect-video cursor-pointer select-none"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted={muted}
          />

          {/* Overlay : chargement ── */}
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
              <Loader2 size={40} className="text-cyan-500 animate-spin" />
              <p className="text-cyan-500 text-xs tracking-widest uppercase">Connexion au flux...</p>
            </div>
          )}

          {/* Overlay : reconnexion ── */}
          {status === 'reconnecting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75">
              <Radio size={36} className="text-yellow-500 animate-pulse" />
              <p className="text-yellow-400 text-sm">Reconnexion en cours... (tentative {retryCount}/3)</p>
            </div>
          )}

          {/* Overlay : erreur ── */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85">
              <AlertTriangle size={44} className="text-red-500" />
              <p className="text-red-400 text-sm tracking-wide">Flux inaccessible</p>
              {url && <p className="text-gray-600 text-[10px] max-w-xs text-center break-all">{url}</p>}
              <button
                onClick={e => { e.stopPropagation(); setRetryCount(0); initPlayer() }}
                className="flex items-center gap-2 px-4 py-2 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 text-xs tracking-widest uppercase transition"
              >
                <RefreshCw size={12} /> Réessayer
              </button>
            </div>
          )}

          {/* Overlay : pas d'URL ── */}
          {status === 'no-url' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85">
              <AlertTriangle size={36} className="text-yellow-500" />
              <p className="text-yellow-400 text-sm">Aucune URL de flux associée</p>
            </div>
          )}

          {/* Bouton play central ── */}
          {status === 'ready' && !playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-16 h-16 rounded-full bg-black/70 border border-cyan-500/40 flex items-center justify-center"
                style={{ boxShadow: '0 0 40px rgba(0,240,255,0.15)' }}
              >
                <Play size={28} className="text-cyan-300 ml-1" />
              </div>
            </div>
          )}

          {/* Ligne de scan décorative ── */}
          {playing && status === 'ready' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
              <div className="absolute left-0 right-0 h-[1px] bg-cyan-300"
                style={{ animation: 'scan 5s linear infinite' }} />
            </div>
          )}

          {/* ── Barre de contrôles ── */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
              showControls || !playing ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Seekbar (seulement hors live) */}
            {!isLive && duration > 0 && (
              <div className="px-4 pb-1">
                <input
                  type="range" min={0} max={duration} step={0.5}
                  value={currentTime}
                  onChange={e => seek(Number(e.target.value))}
                  className="w-full h-1 accent-cyan-400 cursor-pointer"
                />
              </div>
            )}

            <div className="bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-3 pt-6 flex items-center gap-3 flex-wrap">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-cyan-300 hover:text-white transition shrink-0"
                title={`${playing ? 'Pause' : 'Lire'} (Espace)`}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={toggleMute} className="text-cyan-400 hover:text-white transition" title="Muet (M)">
                  {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={muted ? 0 : volume}
                  onChange={e => changeVolume(Number(e.target.value))}
                  className="w-20 h-1 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Temps / LIVE badge */}
              <div className="flex items-center gap-2">
                {isLive ? (
                  <button
                    onClick={goToLiveEdge}
                    className="flex items-center gap-1 text-[11px] text-red-400 border border-red-800/40 rounded px-1.5 py-0.5 hover:bg-red-950/30 transition tracking-widest"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    DIRECT
                  </button>
                ) : (
                  <span className="text-[11px] text-cyan-600 font-mono">
                    {fmt(currentTime)} / {fmt(duration)}
                  </span>
                )}
              </div>

              {/* Infos HLS */}
              {isHls && (
                <span className="text-[10px] text-purple-700 tracking-widest hidden sm:block">
                  HLS · Basse latence
                </span>
              )}

              <div className="flex-1" />

              {/* Plein écran */}
              <button
                onClick={toggleFullscreen}
                className="text-cyan-400 hover:text-white transition shrink-0"
                title="Plein écran (F)"
              >
                {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer info ── */}
        <div className="bg-black/95 border-t border-cyan-900/30 px-5 py-2 flex gap-6 text-[10px] text-cyan-900 tracking-widest items-center">
          <span className="text-cyan-800">
            URL : <span className="text-cyan-700">{url || 'N/D'}</span>
          </span>
          {stream.duration && <span>DURÉE : {stream.duration}s</span>}
          <span className="ml-auto text-[9px] text-gray-800 hidden md:block">
            Espace : play/pause · M : muet · F : plein écran · ← → : ±10s
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: -2px; }
          to   { top: 100%; }
        }
      `}</style>
    </div>
  )
}
