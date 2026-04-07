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
        "rounded-2xl border border-border bg-card/90 p-5 shadow-sm shadow-slate-900/5 backdrop-blur dark:shadow-none",
        className,
      )}
    >
      {header && <div className="mb-3">{header}</div>}
      <div className="text-sm text-muted-foreground">{children}</div>
      {footer && (
        <div className="mt-4 text-sm text-muted-foreground">{footer}</div>
      )}
    </section>
  );
}

