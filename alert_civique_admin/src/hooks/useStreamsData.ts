import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { api } from '../services/api'
import type { AdminStream } from '../types'

const POLL       = 5000
const SOCKET_URL = 'http://localhost:9091'

interface UseStreamsDataOptions {
  token: string | null
  onError: (msg: string) => void
}

interface UseStreamsDataReturn {
  streams: AdminStream[]
  loading: boolean
  lastUpd: Date | null
  selected: AdminStream | null
  setSelected: React.Dispatch<React.SetStateAction<AdminStream | null>>
  refresh: (silent?: boolean) => void
  deleteStream: (s: AdminStream) => Promise<void>
  endStream: (s: AdminStream) => Promise<void>
}

/**
 * Gère le cycle de vie des données de streams :
 * - Polling HTTP toutes les 5s
 * - Notifications temps réel via Socket.IO
 * - Suppression d'un stream
 *
 * Séparé de l'UI pour permettre le test et le réemploi.
 */
export function useStreamsData({ token, onError }: UseStreamsDataOptions): UseStreamsDataReturn {
  const [streams,  setStreams]  = useState<AdminStream[]>([])
  const [loading,  setLoading]  = useState(true)
  const [lastUpd,  setLastUpd]  = useState<Date | null>(null)
  const [selected, setSelected] = useState<AdminStream | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const refresh = useCallback(async (silent = false) => {
    if (!token) return
    if (!silent) setLoading(true)
    try {
      const data = await api.getStreams(token)
      setStreams(data)
      setLastUpd(new Date())
      setSelected(prev => prev
        ? (data.find(s => s.livestreamId === prev.livestreamId) ?? prev)
        : null)
    } catch {
      if (!silent) onError('Impossible de charger les flux')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [token, onError])

  // Polling initial + intervalle
  useEffect(() => {
    refresh(false)
    pollRef.current = setInterval(() => refresh(true), POLL)
    return () => clearInterval(pollRef.current)
  }, [refresh])

  // Notifications Socket.IO temps réel
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })

    socket.on('liveStreamStarted', (data: Partial<AdminStream>) => {
      setStreams(prev => {
        if (prev.some(s => s.livestreamId === data.livestreamId)) return prev
        return [...prev, {
          livestreamId: data.livestreamId,
          userId:       data.userId,
          startedAt:    data.startedAt as string,
          status:       'LIVE',
        }]
      })
      setLastUpd(new Date())
    })

    socket.on('liveStreamEnded', () => {
      refresh(true)
    })

    socket.on('liveStreamVideoReady', (data: { livestreamId: number; videoUrl: string; status: string }) => {
      setStreams(prev => prev.map(s =>
        s.livestreamId === data.livestreamId
          ? { ...s, videoUrl: data.videoUrl, status: data.status }
          : s
      ))
      setSelected(prev =>
        prev?.livestreamId === data.livestreamId
          ? { ...prev, videoUrl: data.videoUrl, status: data.status }
          : prev
      )
      setLastUpd(new Date())
    })

    return () => { socket.disconnect() }
  }, [refresh])

  const deleteStream = useCallback(async (s: AdminStream) => {
    await api.deleteStream(s.livestreamId!, token ?? '')
    if (selected?.livestreamId === s.livestreamId) setSelected(null)
    refresh(true)
  }, [token, selected, refresh])

  const endStream = useCallback(async (s: AdminStream) => {
    await api.endStream(s.livestreamId!, token ?? '')
    refresh(true)
  }, [token, refresh])

  return { streams, loading, lastUpd, selected, setSelected, refresh, deleteStream, endStream }
}
