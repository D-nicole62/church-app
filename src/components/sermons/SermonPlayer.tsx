import { SermonMediaType } from "@/generated/prisma/client";
import { youtubeEmbedUrl } from "@/lib/sermons/media";

type SermonPlayerProps = {
  mediaType: SermonMediaType;
  mediaUrl: string;
  title: string;
};

export function SermonPlayer({ mediaType, mediaUrl, title }: SermonPlayerProps) {
  if (mediaType === SermonMediaType.AUDIO) {
    return (
      <audio controls preload="none" className="mt-3 w-full" src={mediaUrl}>
        <a href={mediaUrl}>Listen to {title}</a>
      </audio>
    );
  }

  const embed = youtubeEmbedUrl(mediaUrl);
  if (embed) {
    return (
      <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          title={title}
          src={embed}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video controls preload="none" className="mt-3 w-full rounded-xl" src={mediaUrl}>
      <a href={mediaUrl}>Watch {title}</a>
    </video>
  );
}
