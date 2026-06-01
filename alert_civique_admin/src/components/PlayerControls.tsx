import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react'

interface Props {
  playing: boolean
  muted: boolean
  volume: number
  fullscreen: boolean
  isLive: boolean
  isHls: boolean
  currentTime: number
  duration: number
  visible: boolean
  onTogglePlay: () => void
  onToggleMute: () => void
  onChangeVolume: (val: number) => void
  onSeek: (val: number) => void
  onGoToLiveEdge: () => void
  onToggleFullscreen: () => void
}

const fmt = (s: number) => {
  if (!isFinite(s) || s === 0) return '∞'
  const m   = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/**
 * Barre de contrôles du lecteur vidéo :
 * play/pause, volume, seekbar, badge LIVE, plein écran.
 */
export function PlayerControls({
  playing, muted, volume, fullscreen, isLive, isHls,
  currentTime, duration, visible,
  onTogglePlay, onToggleMute, onChangeVolume, onSeek, onGoToLiveEdge, onToggleFullscreen,
}: Props) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
        visible || !playing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={e => e.stopPropagation()}
    >
      {/* Seekbar (seulement hors live) */}
      {!isLive && duration > 0 && (
        <div className="px-4 pb-1">
          <input
            type="range" min={0} max={duration} step={0.5}
            value={currentTime}
            onChange={e => onSeek(Number(e.target.value))}
            className="w-full h-1 accent-cyan-400 cursor-pointer"
          />
        </div>
      )}

      <div className="bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-3 pt-6 flex items-center gap-3 flex-wrap">
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="text-cyan-300 hover:text-white transition shrink-0"
          title={`${playing ? 'Pause' : 'Lire'} (Espace)`}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggleMute} className="text-cyan-400 hover:text-white transition" title="Muet (M)">
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={e => onChangeVolume(Number(e.target.value))}
            className="w-20 h-1 accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Temps / badge LIVE */}
        <div className="flex items-center gap-2">
          {isLive ? (
            <button
              onClick={onGoToLiveEdge}
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

        {isHls && (
          <span className="text-[10px] text-purple-700 tracking-widest hidden sm:block">
            HLS · Basse latence
          </span>
        )}

        <div className="flex-1" />

        {/* Plein écran */}
        <button
          onClick={onToggleFullscreen}
          className="text-cyan-400 hover:text-white transition shrink-0"
          title="Plein écran (F)"
        >
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  )
}
