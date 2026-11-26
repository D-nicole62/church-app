const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function isYouTubeVideoId(value: string | null | undefined): value is string {
  return typeof value === "string" && VIDEO_ID.test(value);
}

function youtubeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function isYouTubeHost(hostname: string) {
  const host = youtubeHost(hostname);
  return (
    host === "youtu.be" ||
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  );
}

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    if (!isYouTubeHost(parsed.hostname)) return null;
    const host = youtubeHost(parsed.hostname);

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return isYouTubeVideoId(id) ? id : null;
    }

    const fromQuery = parsed.searchParams.get("v");
    if (isYouTubeVideoId(fromQuery)) return fromQuery;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const head = parts[0];
    if (
      (head === "embed" || head === "shorts" || head === "live" || head === "v") &&
      isYouTubeVideoId(parts[1])
    ) {
      return parts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedUrl(url: string) {
  const id = extractYouTubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function youtubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeNocookieEmbedSrc(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}
