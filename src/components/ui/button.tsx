import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  fullWidth,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 active:opacity-95",
    secondary:
      "border border-border bg-muted text-foreground hover:bg-muted/80",
    ghost:
      "bg-transparent text-foreground hover:bg-muted",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={cn(base, variants[variant], width, "px-5 py-2.5", className)}
      {...props}
    />
  );
}

