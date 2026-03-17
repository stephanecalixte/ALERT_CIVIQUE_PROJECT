export interface LiveStream {
  livestreamId?: number;
  startedAt?: string; // ISO
  endedAt?: string;
  streamUrl?: string;
  status?: string;
  videoUrl?: string;  // Nouvelle: URL de la vidéo enregistrée
  mediaId?: number;   // Nouvelle: FK vers Media
  duration?: number;  // secondes
}
