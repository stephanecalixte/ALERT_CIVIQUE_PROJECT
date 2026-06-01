import { useCallback, useRef, useState } from 'react';
import LiveStreamService from '@/app/lib/services/LiveStreamService';
import type { LiveStream } from '../models/LiveStream';
import { AlertType } from '@/contexts/AlertContext';
import { NODE_BASE_URL } from '@/lib/config';

async function notifyLiveStream(event: string, data: object) {
  try {
    await fetch(`${NODE_BASE_URL}/api/livestream/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    });
  } catch { /* non bloquant */ }
}

export function useLiveStreamAPI(token: string | undefined, userId: string | undefined, reportId?: number, alertType?: AlertType) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [currentLivestreamId, setCurrentLivestreamId] = useState<number | null>(null);

  // Ref pour éviter les closures périmées dans sendStopStream / updateStreamWithVideo
  const currentLivestreamIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const loadStreams = useCallback(async () => {
    try {
      const data = await LiveStreamService.getLiveStreams(token!);
      setStreams(data || []);
    } catch (error) {
      console.error('Get LiveStreams error:', error);
    }
  }, [token]);

  const sendStartStream = useCallback(async (facing: string) => {
    const numericUserId = userId && /^\d+$/.test(userId) ? Number(userId) : null;
    const effectiveToken = token || '';

    try {
      const payload = {
        userId: numericUserId,
        facing: facing as string,
        startedAt: new Date().toISOString(),
        ...(reportId  != null && { reportId }),
        ...(alertType != null && { alertType }),
      };

      console.log('📡 Envoi au serveur:', payload);
      const response = await LiveStreamService.sendLiveStreamData(payload, effectiveToken);
      const id = response?.livestreamId || null;
      setCurrentLivestreamId(id);
      currentLivestreamIdRef.current = id; // toujours à jour
      startTimeRef.current = new Date();
      console.log('✅ Stream démarré ID:', id);
      notifyLiveStream('liveStreamStarted', {
        livestreamId: id,
        userId: numericUserId,
        startedAt: new Date().toISOString(),
        status: 'LIVE',
      });
      return id;
    } catch (error) {
      console.error('❌ Erreur start stream (continuing local):', error);
      const fakeId = Date.now();
      setCurrentLivestreamId(fakeId);
      currentLivestreamIdRef.current = fakeId;
      startTimeRef.current = new Date();
      return fakeId;
    }
  }, [userId, token, reportId, alertType]);

  const sendStopStream = useCallback(async () => {
    // Utilise la ref pour toujours avoir l'ID courant, même en closure périmée
    const id = currentLivestreamIdRef.current;
    if (!startTimeRef.current || !id) return;

    try {
      const duration = (Date.now() - startTimeRef.current.getTime()) / 1000;
      const numericUserId = userId && /^\d+$/.test(userId) ? Number(userId) : null;
      const payload = {
        userId: numericUserId,
        endedAt: new Date().toISOString(),
        duration: Math.floor(duration),
        livestreamId: id,
      };
      await LiveStreamService.sendLiveStreamData(payload, token!);
      console.log('✅ Stream arrêté envoyé');
      notifyLiveStream('liveStreamEnded', {
        livestreamId: id,
        status: 'ENDED',
      });
    } catch (error) {
      console.error('❌ Erreur envoi stop stream:', error);
    }
  }, [userId, token]);

  const updateStreamWithVideo = useCallback(async (videoUrl: string, videoId?: string) => {
    const id = currentLivestreamIdRef.current;
    if (!id) return;

    try {
      await LiveStreamService.updateLiveStream(id, { videoUrl, videoId }, token!);
      console.log('✅ Vidéo associée au stream:', videoUrl);
      notifyLiveStream('liveStreamVideoReady', {
        livestreamId: id,
        videoUrl,
        status: 'ENDED',
      });
    } catch (error) {
      console.error('❌ Erreur update stream:', error);
    }
  }, [token]);

  return {
    streams,
    currentLivestreamId,
    loadStreams,
    sendStartStream,
    sendStopStream,
    updateStreamWithVideo,
  };
}
