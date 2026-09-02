"use client";

import { Button } from "@/components/ui/button";

type DeleteEventButtonProps = {
  action: () => Promise<void>;
};

export function DeleteEventButton({ action }: DeleteEventButtonProps) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="secondary"
        onClick={(event) => {
          if (
            !window.confirm(
              "Delete this event permanently? It will be removed from the public events page.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        Delete event
      </Button>
    </form>
  );
}
