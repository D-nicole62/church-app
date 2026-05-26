import Image from "next/image";
import type { ChurchPhoto } from "@/lib/church-photos";
import { cn } from "@/lib/utils";

type PhotoGridProps = {
  photos: ChurchPhoto[];
  className?: string;
  columns?: 2 | 3;
};

export function PhotoGrid({
  photos,
  className,
  columns = 3,
}: PhotoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {photos.map((photo) => (
        <div
          key={photo.src}
          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
