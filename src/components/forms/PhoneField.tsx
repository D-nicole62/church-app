"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  isValidZambianPhone,
  PHONE_ERROR_MESSAGE,
} from "@/lib/validation/contact";

type PhoneFieldProps = {
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
};

export function PhoneField({
  name = "phone",
  id,
  required = false,
  placeholder = "0971234567",
  autoComplete = "tel",
  defaultValue,
}: PhoneFieldProps) {
  const [error, setError] = useState<string | null>(null);

  function applyValidity(input: HTMLInputElement) {
    const value = input.value.trim();
    if (!value) {
      input.setCustomValidity(required ? PHONE_ERROR_MESSAGE : "");
      setError(required ? PHONE_ERROR_MESSAGE : null);
      return;
    }
    const valid = isValidZambianPhone(value);
    input.setCustomValidity(valid ? "" : PHONE_ERROR_MESSAGE);
    setError(valid ? null : PHONE_ERROR_MESSAGE);
  }

  return (
    <div>
      <Input
        id={id}
        type="tel"
        name={name}
        inputMode="tel"
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        onInput={(event) => applyValidity(event.currentTarget)}
        onBlur={(event) => applyValidity(event.currentTarget)}
        onInvalid={(event) => {
          event.currentTarget.setCustomValidity(PHONE_ERROR_MESSAGE);
          setError(PHONE_ERROR_MESSAGE);
        }}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
