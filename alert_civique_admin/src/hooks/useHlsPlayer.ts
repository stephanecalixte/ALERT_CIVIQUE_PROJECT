import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

export type PlayerStatus = 'loading' | 'ready' | 'error' | 'no-url' | 'reconnecting'

interface UseHlsPlayerOptions {
  url: string
  videoRef: React.RefObject<HTMLVideoElement | null>
}

interface UseHlsPlayerReturn {
  status: PlayerStatus
  bandwidth: number | null
  retryCount: number
  isHls: boolean
  initPlayer: () => void
  setRetryCount: React.Dispatch<React.SetStateAction<number>>
}

/**
 * Gère l'initialisation et le cycle de vie du lecteur HLS/natif.
 * Séparé de l'UI pour permettre des tests unitaires et le réemploi.
 */
export function useHlsPlayer({ url, videoRef }: UseHlsPlayerOptions): UseHlsPlayerReturn {
  const [status,     setStatus]     = useState<PlayerStatus>('loading')
  const [bandwidth,  setBandwidth]  = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const hlsRef       = useRef<Hls | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>()

  const isHls = url.includes('.m3u8') || url.includes('/hls/')

  const initPlayer = useCallback(() => {
    if (!url || !videoRef.current) { setStatus('no-url'); return }
    const video = videoRef.current
    setStatus('loading')

    hlsRef.current?.destroy()
    hlsRef.current = null

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker:           true,
        lowLatencyMode:         true,
        liveSyncDuration:       2,
        liveMaxLatencyDuration: 6,
        maxBufferLength:        30,
        backBufferLength:       10,
      })
      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('ready')
        video.play().catch(() => {})
      })

      hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
        const { loaded, loading } = data.frag.stats
        setBandwidth(Math.round((loaded * 8) / (loading.end - loading.start)))
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
      video.oncanplay = () => { setStatus('ready'); video.play().catch(() => {}) }
      video.onerror   = () => setStatus('error')
    } else {
      // MP4 / WebM natif
      video.src = url
      video.oncanplay = () => { setStatus('ready'); video.play().catch(() => {}) }
      video.onerror   = () => setStatus('error')
    }
  }, [url, retryCount, isHls, videoRef])

  useEffect(() => {
    initPlayer()
    return () => {
      hlsRef.current?.destroy()
      clearTimeout(reconnectRef.current)
    }
  }, [url]) // Réinitialise uniquement si l'URL change

  return { status, bandwidth, retryCount, isHls, initPlayer, setRetryCount }
}
