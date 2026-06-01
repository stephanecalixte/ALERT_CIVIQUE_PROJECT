import { AlertTriangle, Loader2, Radio, RefreshCw } from 'lucide-react'
import type { PlayerStatus } from '../hooks/useHlsPlayer'

interface Props {
  status: PlayerStatus
  retryCount: number
  url: string
  playing: boolean
  onRetry: () => void
}

/**
 * Overlays d'état du lecteur vidéo :
 * chargement, reconnexion, erreur, pas d'URL, bouton play central.
 */
export function PlayerOverlay({ status, retryCount, url, playing, onRetry }: Props) {
  return (
    <>
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
          <Loader2 size={40} className="text-cyan-500 animate-spin" />
          <p className="text-cyan-500 text-xs tracking-widest uppercase">Connexion au flux...</p>
        </div>
      )}

      {status === 'reconnecting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75">
          <Radio size={36} className="text-yellow-500 animate-pulse" />
          <p className="text-yellow-400 text-sm">Reconnexion en cours... (tentative {retryCount}/3)</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85">
          <AlertTriangle size={44} className="text-red-500" />
          <p className="text-red-400 text-sm tracking-wide">Flux inaccessible</p>
          {url && <p className="text-gray-600 text-[10px] max-w-xs text-center break-all">{url}</p>}
          <button
            onClick={e => { e.stopPropagation(); onRetry() }}
            className="flex items-center gap-2 px-4 py-2 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 text-xs tracking-widest uppercase transition"
          >
            <RefreshCw size={12} /> Réessayer
          </button>
        </div>
      )}

      {status === 'no-url' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85">
          <AlertTriangle size={36} className="text-yellow-500" />
          <p className="text-yellow-400 text-sm">Aucune URL de flux associée</p>
        </div>
      )}

      {/* Bouton play central (seulement si prêt et en pause) */}
      {status === 'ready' && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-16 h-16 rounded-full bg-black/70 border border-cyan-500/40 flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(0,240,255,0.15)' }}
          >
            <svg viewBox="0 0 24 24" width={28} className="text-cyan-300 ml-1 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Ligne de scan décorative */}
      {playing && status === 'ready' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
          <div className="absolute left-0 right-0 h-[1px] bg-cyan-300"
            style={{ animation: 'scan 5s linear infinite' }} />
        </div>
      )}
    </>
  )
}
