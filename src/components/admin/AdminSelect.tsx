import { cn } from "@/lib/utils";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function AdminSelect({ className, ...props }: AdminSelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
}
