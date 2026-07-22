/** Extrae el playback id de una URL de stream de Mux (stream.mux.com/{id}.m3u8). */
export function getMuxPlaybackId(url: string): string | null {
  const match = url.match(/stream\.mux\.com\/([^/.]+)/);
  return match ? match[1] : null;
}

/** Extrae el video id de una URL de YouTube (watch, embed o youtu.be). */
export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
