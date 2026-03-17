import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}>;

export function Card({ className, header, footer, children }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70",
        className,
      )}
    >
      {header && <div className="mb-3">{header}</div>}
      <div className="text-sm text-zinc-700 dark:text-zinc-300">{children}</div>
      {footer && <div className="mt-4 text-sm text-zinc-500">{footer}</div>}
    </section>
  );
}

