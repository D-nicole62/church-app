import { YOUTUBE_UPLOADS_PLAYLIST_ID } from "@/lib/site";

export function UploadsFallback() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
      <iframe
        title="Latest uploads from Tabernacle of David Assembly on YouTube"
        src={`https://www.youtube-nocookie.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST_ID}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
