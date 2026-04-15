import { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '../contexts/AppContext'
import { api, fmtDate } from '../services/api'
import { Video, Trash2, RefreshCw, Play, Signal, Radio } from 'lucide-react'
import type { AdminStream } from '../types'
import { VideoPlayer } from './VideoPlayer'

const POLL_INTERVAL = 5000 // 5 secondes

export function StreamsList() {
  const { token, toast } = useApp()
  const [streams,        setStreams]        = useState<AdminStream[]>([])
  const [loading,        setLoading]        = useState(true)
  const [lastUpdate,     setLastUpdate]     = useState<Date | null>(null)
  const [liveCount,      setLiveCount]      = useState(0)
  const [selectedStream, setSelectedStream] = useState<AdminStream | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  /* ── Fetch silencieux (sans spinner) pour le polling ── */
  const fetchStreams = useCallback(async (silent = false) => {
    if (!token) return
    if (!silent) setLoading(true)
    try {
      const data = await api.getStreams(token)
      setStreams(data)
      setLiveCount(data.filter(s => s.status?.toUpperCase() === 'ONLINE').length)
      setLastUpdate(new Date())

      // Met à jour le stream sélectionné si son statut a changé
      setSelectedStream(prev => {
        if (!prev) return null
        const updated = data.find(s => s.livestreamId === prev.livestreamId)
        return updated ?? prev
      })
    } catch {
      if (!silent) toast('Impossible de charger les flux', 'error')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [token])

  /* ── Démarrage du polling temps réel ── */
  useEffect(() => {
    fetchStreams(false)
    pollRef.current = setInterval(() => fetchStreams(true), POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [fetchStreams])

  const deleteStream = async (id: number) => {
    if (confirm('Clôturer ce flux ?')) {
      try {
        await api.deleteStream(id, token)
        toast('Flux clôturé', 'success')
        if (selectedStream?.livestreamId === id) setSelectedStream(null)
        fetchStreams(true)
      } catch {
        toast('Échec de la suppression', 'error')
      }
    }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-cyan-400 text-sm py-8 justify-center">
      <Radio size={16} className="animate-pulse" />
      Connexion aux flux en cours...
    </div>
  )

  const getUrl    = (s: AdminStream) => s.streamUrl ?? s.videoUrl ?? ''
  const isOnline  = (s: AdminStream) => s.status?.toUpperCase() === 'ONLINE'
  const isHls     = (url: string) => url.includes('.m3u8') || url.includes('/hls/')

  return (
    <>
      {/* ── Lecteur vidéo modal ── */}
      {selectedStream && (
        <VideoPlayer
          stream={selectedStream}
          onClose={() => setSelectedStream(null)}
        />
      )}

      <div>
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 tracking-wider">
              <Video size={22} className="text-cyan-400" /> Flux Live
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {liveCount > 0 ? (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {liveCount} EN DIRECT
                </span>
              ) : (
                <span className="text-xs text-gray-600">Aucun flux actif</span>
              )}
              <span className="text-[10px] text-cyan-900 tracking-widest">
                · {streams.length} total · Actualisé {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicateur de polling actif */}
            <span className="text-[10px] text-cyan-800 flex items-center gap-1 tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-700 animate-pulse" />
              TEMPS RÉEL · {POLL_INTERVAL / 1000}s
            </span>
            <button
              onClick={() => fetchStreams(false)}
              className="p-2 rounded border border-cyan-900/50 text-cyan-500 hover:bg-cyan-950/40 transition"
              title="Actualiser maintenant"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Liste vide */}
        {streams.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-cyan-900/30 rounded-xl">
            <Radio size={32} className="text-cyan-900 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun flux disponible.</p>
            <p className="text-gray-700 text-xs mt-1">Nouvelle vérification dans {POLL_INTERVAL / 1000}s</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {streams.map((stream) => {
              const id         = stream.livestreamId ?? 0
              const online     = isOnline(stream)
              const url        = getUrl(stream)
              const hls        = isHls(url)
              const isSelected = selectedStream?.livestreamId === id

              return (
                <div
                  key={id}
                  className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_20px_rgba(0,240,255,0.06)]'
                      : online
                        ? 'border-red-900/40 bg-black/50 hover:border-red-900/70'
                        : 'border-cyan-900/30 bg-black/30 hover:border-cyan-900/60'
                  }`}
                >
                  <div className="p-4 flex items-center gap-4">

                    {/* Icône statut */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                        online
                          ? 'border-red-700/50 bg-red-950/30'
                          : 'border-gray-800/50 bg-gray-950/20'
                      }`}>
                        <Signal size={18} className={online ? 'text-red-400' : 'text-gray-600'} />
                      </div>
                      {online && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-black">
                          <span className="absolute inset-0 w-full h-full rounded-full bg-red-400 animate-ping opacity-60" />
                        </span>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-cyan-200 tracking-wider">Flux #{id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border tracking-widest uppercase ${
                          online
                            ? 'bg-red-900/30 border-red-800/40 text-red-400'
                            : 'bg-gray-900/30 border-gray-800/40 text-gray-500'
                        }`}>{stream.status ?? 'OFFLINE'}</span>
                        {online && (
                          <span className="text-[10px] text-red-300 font-bold tracking-[0.2em]">● LIVE</span>
                        )}
                        {hls && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 border border-purple-800/40 text-purple-400 tracking-widest">
                            HLS
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-[11px] text-gray-500 flex-wrap">
                        <span>Opérateur : {stream.userId ?? '—'}</span>
                        <span>Début : {fmtDate(stream.startedAt)}</span>
                        {stream.duration && <span>Durée : {stream.duration}s</span>}
                      </div>
                      {url ? (
                        <p className="text-[10px] text-cyan-900 mt-1 truncate max-w-sm font-mono">{url}</p>
                      ) : (
                        <p className="text-[10px] text-gray-700 mt-1 italic">Aucune URL de flux</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedStream(isSelected ? null : stream)}
                        disabled={!url}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold tracking-widest uppercase transition-all border ${
                          isSelected
                            ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                            : url
                              ? online
                                ? 'bg-red-900/30 border-red-700/50 text-red-300 hover:bg-red-900/50'
                                : 'bg-blue-900/30 border-blue-800/40 text-blue-300 hover:bg-blue-900/50'
                              : 'bg-gray-900/20 border-gray-800/30 text-gray-700 cursor-not-allowed'
                        }`}
                        title={url ? 'Visionner' : 'Aucune URL disponible'}
                      >
                        <Play size={11} />
                        {isSelected ? 'Fermer' : online ? 'Regarder LIVE' : 'Lire'}
                      </button>
                      <button
                        onClick={() => deleteStream(id)}
                        className="p-2 rounded border border-red-900/40 text-red-600 hover:text-red-400 hover:bg-red-950/30 transition"
                        title="Clôturer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
