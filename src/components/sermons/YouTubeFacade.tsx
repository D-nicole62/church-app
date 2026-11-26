"use client";

import Image from "next/image";
import { useState } from "react";
import { youtubeNocookieEmbedSrc, youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/sermons/media";

type YouTubeFacadeProps = {
  videoId: string;
  title: string;
  priority?: boolean;
  sizes?: string;
};

export function YouTubeFacade({
  videoId,
  title,
  priority = false,
  sizes = "(min-width: 1024px) 720px, 100vw",
}: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = youtubeWatchUrl(videoId);

  if (playing) {
    return (
      <div className="relative aspect-video bg-black">
        <iframe
          title={title}
          src={youtubeNocookieEmbedSrc(videoId)}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <a
      href={watchUrl}
      aria-label={`Play ${title}`}
      onClick={(event) => {
        event.preventDefault();
        setPlaying(true);
      }}
      className="group relative block aspect-video bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <Image
        src={youtubeThumbnailUrl(videoId)}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/30 transition-colors group-hover:bg-slate-950/40">
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-semibold text-slate-950 shadow-sm">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
            <path d="M6.5 4.8v10.4L15.2 10 6.5 4.8Z" />
          </svg>
          Play
        </span>
      </span>
    </a>
  );
}
