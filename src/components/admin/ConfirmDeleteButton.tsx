"use client";

import { Button } from "@/components/ui/button";

type ConfirmDeleteButtonProps = {
  action: () => Promise<void>;
  label?: string;
  confirm: string;
};

export function ConfirmDeleteButton({
  action,
  label = "Delete",
  confirm,
}: ConfirmDeleteButtonProps) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="secondary"
        onClick={(event) => {
          if (!window.confirm(confirm)) {
            event.preventDefault();
          }
        }}
      >
        {label}
      </Button>
    </form>
  );
}
