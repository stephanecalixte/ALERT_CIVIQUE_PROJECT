// ─── Correspond à LiveStreamDTO (Java) ───────────────────────────────────────
// status Java : "LIVE" | "ENDED" | "SCHEDULED"
export interface LiveStream {
  livestreamId?: number;  // Long
  userId?: string;        // String (mapped "dummy-user" en attendant FK user)
  startedAt?: string;     // ISO LocalDateTime
  endedAt?: string;       // ISO LocalDateTime
  streamUrl?: string;
  status?: 'LIVE' | 'ENDED' | 'SCHEDULED';
  videoUrl?: string;      // URL de la vidéo uploadée
  mediaId?: number;       // Long FK vers Media
  duration?: number;      // Integer (secondes)
}
