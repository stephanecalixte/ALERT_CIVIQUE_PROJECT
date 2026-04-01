import { useCallback, useRef, useState } from 'react';
import LiveStreamService from '@/app/lib/services/LiveStreamService';
import type { LiveStream } from '../models/LiveStream';

export function useLiveStreamAPI(token: string | undefined, userId: string | undefined) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [currentLivestreamId, setCurrentLivestreamId] = useState<number | null>(null);
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
    const effectiveUserId = userId || `anon_${Date.now()}`;
    const effectiveToken = token || '';

    try {
      const payload = {
        userId: effectiveUserId,
        facing: facing as string,
        startedAt: new Date().toISOString(),
      };

      console.log('📡 Envoi au serveur:', payload);
      const response = await LiveStreamService.sendLiveStreamData(payload, effectiveToken);
      const id = response?.livestreamId || null;
      setCurrentLivestreamId(id);
      startTimeRef.current = new Date();
      console.log('✅ Stream démarré ID:', id);
      return id;
    } catch (error) {
      console.error('❌ Erreur start stream (continuing local):', error);
      const fakeId = Date.now();
      setCurrentLivestreamId(fakeId);
      startTimeRef.current = new Date();
      return fakeId;
    }
  }, [userId, token]);

  const sendStopStream = useCallback(async () => {
    try {
      if (!startTimeRef.current || !currentLivestreamId) return;

      const duration = (Date.now() - startTimeRef.current.getTime()) / 1000;

      const payload = {
        userId: userId || '123',
        endedAt: new Date().toISOString(),
        duration: Math.floor(duration),
        livestreamId: currentLivestreamId,
      };
      await LiveStreamService.sendLiveStreamData(payload, token!);
      console.log('✅ Stream arrêté envoyé');
    } catch (error) {
      console.error('❌ Erreur envoi stop stream:', error);
    }
  }, [userId, token, currentLivestreamId]);

  const updateStreamWithVideo = useCallback(async (videoUrl: string, videoId?: string) => {
    if (!currentLivestreamId) return;
    
    try {
      await LiveStreamService.updateLiveStream(
        currentLivestreamId,
        { videoUrl, videoId },
        token!
      );
      console.log('✅ Vidéo associée au stream:', videoUrl);
    } catch (error) {
      console.error('❌ Erreur update stream:', error);
    }
  }, [currentLivestreamId, token]);

  return {
    streams,
    currentLivestreamId,
    loadStreams,
    sendStartStream,
    sendStopStream,
    updateStreamWithVideo,
  };
}