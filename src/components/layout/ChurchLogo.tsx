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
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <Image
        src="/tod-logo-transparent.png"
        alt={isHeader ? LOGO_ALT : ""}
        width={520}
        height={120}
        priority={priority}
        className={cn(
          "h-auto w-auto max-w-full object-contain object-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
          isHeader
            ? "max-h-11 max-w-[11.5rem] sm:max-h-12 sm:max-w-[16rem]"
            : "max-h-10 max-w-[9.5rem] sm:max-h-11 sm:max-w-[14rem]",
        )}
      />
    </span>
  );
}
