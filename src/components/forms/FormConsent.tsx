import Link from "next/link";

export function FormConsent() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      By submitting, you agree we may store these details to respond to you.
      See our{" "}
      <Link
        href="/privacy"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        privacy policy
      </Link>{" "}
      for what we keep and how to ask us to delete it.
    </p>
  );
}
