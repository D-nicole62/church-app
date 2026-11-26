import { YouTubeFacade } from "@/components/sermons/YouTubeFacade";
import { extractYouTubeVideoId } from "@/lib/sermons/media";

type SermonPlayerProps = {
  mediaType: "AUDIO" | "VIDEO";
  mediaUrl: string;
  title: string;
  priority?: boolean;
};

export function SermonPlayer({ mediaType, mediaUrl, title, priority = false }: SermonPlayerProps) {
  if (mediaType === "AUDIO") {
    return (
      <audio controls preload="none" className="mt-3 w-full" src={mediaUrl}>
        <a href={mediaUrl}>Listen to {title}</a>
      </audio>
    );
  }

  const videoId = extractYouTubeVideoId(mediaUrl);
  if (videoId) {
    return (
      <div className="overflow-hidden rounded-xl">
        <YouTubeFacade videoId={videoId} title={title} priority={priority} />
      </div>
    );
  }

  return (
    <video controls preload="none" className="mt-3 w-full rounded-xl" src={mediaUrl}>
      <a href={mediaUrl}>Watch {title}</a>
    </video>
  );
}
