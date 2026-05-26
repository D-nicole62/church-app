import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_ALT =
  "Tabernacle of David Assembly — City Mission Church";

type ChurchLogoProps = {
  variant?: "header" | "footer";
  className?: string;
  priority?: boolean;
};

export function ChurchLogo({
  variant = "header",
  className,
  priority = false,
}: ChurchLogoProps) {
  const isHeader = variant === "header";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-[#0f0a18] ring-1 ring-black/15",
        isHeader ? "px-2 py-1" : "px-1.5 py-1",
        className,
      )}
    >
      <Image
        src="/tod-logo.png"
        alt={isHeader ? LOGO_ALT : ""}
        width={320}
        height={72}
        priority={priority}
        className={cn(
          "w-auto object-contain object-center",
          isHeader ? "h-7 sm:h-8" : "h-6 sm:h-7",
        )}
      />
    </span>
  );
}
