"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  classifyCollectionStatus,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  formatGivingNarration,
  generateReferenceId,
  GIVING_PURPOSE_OPTIONS,
  type CardCollectionPayload,
  type CollectionStatus,
  type GivingPurposeId,
  type GivingType,
  type MomoCollectionRequest,
} from "@/lib/lipila";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 4_000;
const PENDING_PAYMENT_KEY = "tod-giving-pending";

type PendingPayment = {
  reference: string;
  phone: string;
  startedAt: number;
  timeoutMs: number;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "momo-pending";
      reference: string;
      phone: string;
      message?: string;
    }
  | {
      kind: "momo-success";
      reference: string;
      details?: CollectionStatus;
    }
  | {
      kind: "momo-failed";
      reference: string;
      message: string;
      timedOut?: boolean;
    }
  | {
      kind: "momo-cancelled";
      reference: string;
      message: string;
    }
  | { kind: "card-redirect"; url: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type GivingResponse = {
  error?: string;
  detail?: string;
  message?: string;
  status?: string;
  referenceId?: string;
  cardRedirectionUrl?: string;
  redirectUrl?: string;
  data?: Record<string, unknown>;
};

function formatAmount(amount?: number, currency = DEFAULT_CURRENCY) {
  if (typeof amount !== "number") return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

type GivingFormProps = {
  paymentTimeoutSeconds: number;
  returnStatus?: string;
  returnReferenceId?: string;
};

export function GivingForm({
  paymentTimeoutSeconds,
  returnStatus,
  returnReferenceId,
}: GivingFormProps) {
  const paymentTimeoutMs = Math.max(30, paymentTimeoutSeconds) * 1000;
  const [type, setType] = useState<GivingType>("momo");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<GivingPurposeId>("tithe");
  const [otherNote, setOtherNote] = useState("");

  const [phone, setPhone] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cardPhone, setCardPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lusaka");
  const [zip, setZip] = useState("10101");

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollDeadlineRef = useRef<number>(0);

  const isLoading = status.kind === "loading";

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const clearPendingPayment = useCallback(() => {
    try {
      sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {
      // Ignore storage failures (private mode).
    }
  }, []);

  const rememberPendingPayment = useCallback(
    (reference: string, phoneNumber: string) => {
      const pending: PendingPayment = {
        reference,
        phone: phoneNumber,
        startedAt: Date.now(),
        timeoutMs: paymentTimeoutMs,
      };
      try {
        sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pending));
      } catch {
        // Ignore storage failures.
      }
    },
    [paymentTimeoutMs],
  );

  const closeSession = useCallback(
    async (
      reference: string,
      outcome: "timeout" | "cancelled" | "failed",
      message: string,
    ) => {
      stopPolling();
      clearPendingPayment();
      try {
        await fetch("/api/giving/outcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referenceId: reference, outcome }),
        });
      } catch {
        // The UI still leaves the pending session even if recording fails.
      }

      if (outcome === "cancelled") {
        setStatus({ kind: "momo-cancelled", reference, message });
        return;
      }

      setStatus({
        kind: "momo-failed",
        reference,
        message,
        timedOut: outcome === "timeout",
      });
    },
    [clearPendingPayment, stopPolling],
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollStatus = useCallback(
    async (reference: string, phoneNumber: string) => {
      try {
        const res = await fetch(
          `/api/giving/status?referenceId=${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        const json = (await res.json()) as CollectionStatus & {
          error?: string;
        };

        if (!res.ok) {
          if (Date.now() >= pollDeadlineRef.current) {
            await closeSession(
              reference,
              "timeout",
              "Payment failed / timed out. No gift was recorded.",
            );
            return;
          }
          pollTimerRef.current = setTimeout(
            () => pollStatus(reference, phoneNumber),
            POLL_INTERVAL_MS,
          );
          return;
        }

        const outcome = classifyCollectionStatus(json.status);
        if (outcome === "successful") {
          stopPolling();
          clearPendingPayment();
          setStatus({ kind: "momo-success", reference, details: json });
          return;
        }
        if (outcome === "cancelled") {
          await closeSession(
            reference,
            "cancelled",
            json.message || "Payment cancelled. No gift was recorded.",
          );
          return;
        }
        if (outcome === "failed") {
          await closeSession(
            reference,
            "failed",
            json.message ||
              "Payment failed. The payment was declined and no gift was recorded.",
          );
          return;
        }

        if (Date.now() >= pollDeadlineRef.current) {
          await closeSession(
            reference,
            "timeout",
            "Payment failed / timed out. No gift was recorded.",
          );
          return;
        }
        pollTimerRef.current = setTimeout(
          () => pollStatus(reference, phoneNumber),
          POLL_INTERVAL_MS,
        );
      } catch {
        if (Date.now() >= pollDeadlineRef.current) {
          await closeSession(
            reference,
            "timeout",
            "Payment failed / timed out. No gift was recorded.",
          );
          return;
        }
        pollTimerRef.current = setTimeout(
          () => pollStatus(reference, phoneNumber),
          POLL_INTERVAL_MS,
        );
      }
    },
    [clearPendingPayment, closeSession, stopPolling],
  );

  function startPolling(reference: string, phoneNumber: string, startedAt = Date.now()) {
    stopPolling();
    pollDeadlineRef.current = startedAt + paymentTimeoutMs;
    pollTimerRef.current = setTimeout(
      () => pollStatus(reference, phoneNumber),
      POLL_INTERVAL_MS,
    );
  }

  function resetStatus() {
    stopPolling();
    clearPendingPayment();
    setStatus({ kind: "idle" });
  }

  useEffect(() => {
    const returned = returnStatus?.toLowerCase();
    if (returned === "cancelled" && returnReferenceId) {
      void closeSession(
        returnReferenceId,
        "cancelled",
        "Payment cancelled. No gift was recorded.",
      );
      return;
    }

    if (returned === "success" && returnReferenceId) {
      rememberPendingPayment(returnReferenceId, "");
      setStatus({
        kind: "momo-pending",
        reference: returnReferenceId,
        phone: "",
        message: "Checking whether the card payment was completed…",
      });
      startPolling(returnReferenceId, "");
      return;
    }

    try {
      const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as PendingPayment;
      if (!pending.reference || !pending.startedAt) return;
      if (Date.now() >= pending.startedAt + pending.timeoutMs) {
        void closeSession(
          pending.reference,
          "timeout",
          "Payment failed / timed out. No gift was recorded.",
        );
        return;
      }
      setStatus({
        kind: "momo-pending",
        reference: pending.reference,
        phone: pending.phone,
      });
      startPolling(pending.reference, pending.phone, pending.startedAt);
    } catch {
      // Ignore unreadable session storage.
    }
    // Resume a pending payment once when the Give page loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopPolling();
    setStatus({ kind: "loading" });

    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber <= 0) {
      setStatus({ kind: "error", message: "Please enter a valid amount." });
      return;
    }

    const referenceId = generateReferenceId();
    const narration = formatGivingNarration(purpose, otherNote);

    try {
      if (type === "momo") {
        if (!phone.trim()) {
          setStatus({
            kind: "error",
            message: "Please enter your mobile money number.",
          });
          return;
        }

        const data: MomoCollectionRequest = {
          referenceId,
          amount: amountNumber,
          narration,
          accountNumber: phone.trim(),
          currency: DEFAULT_CURRENCY,
          ...(email.trim() ? { email: email.trim() } : {}),
        };

        const res = await fetch("/api/giving", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, data }),
        });

        const json = (await res.json()) as GivingResponse;

        if (!res.ok) {
          setStatus({
            kind: "error",
            message:
              json.error ||
              json.message ||
              "We couldn't initiate your payment. Please try again.",
          });
          return;
        }

        const reference = json.referenceId || referenceId;
        rememberPendingPayment(reference, phone.trim());
        setStatus({
          kind: "momo-pending",
          reference,
          phone: phone.trim(),
        });
        startPolling(reference, phone.trim());
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          setStatus({
            kind: "error",
            message: "Please enter your first and last name.",
          });
          return;
        }
        if (!cardPhone.trim() || !email.trim() || !address.trim()) {
          setStatus({
            kind: "error",
            message: "Phone, email, and address are required for card giving.",
          });
          return;
        }

        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const redirectUrl = `${origin}/give?status=success&referenceId=${encodeURIComponent(referenceId)}`;
        const backUrl = `${origin}/give?status=cancelled&referenceId=${encodeURIComponent(referenceId)}`;

        const data: CardCollectionPayload = {
          customerInfo: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: cardPhone.trim(),
            email: email.trim(),
            city: city.trim() || "Lusaka",
            country: DEFAULT_COUNTRY,
            address: address.trim(),
            zip: zip.trim() || "10101",
          },
          collectionRequest: {
            referenceId,
            amount: amountNumber,
            narration,
            accountNumber: cardPhone.trim(),
            currency: DEFAULT_CURRENCY,
            backUrl,
            redirectUrl,
          },
        };

        const res = await fetch("/api/giving", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, data }),
        });

        const json = (await res.json()) as GivingResponse;

        if (!res.ok) {
          setStatus({
            kind: "error",
            message:
              json.error ||
              json.message ||
              "We couldn't start the card payment. Please try again.",
          });
          return;
        }

        const redirect =
          json.cardRedirectionUrl ||
          json.redirectUrl ||
          (typeof json.data === "object" && json.data
            ? ((json.data as Record<string, unknown>).cardRedirectionUrl as
                | string
                | undefined) ||
              ((json.data as Record<string, unknown>).redirectUrl as
                | string
                | undefined)
            : undefined);

        if (redirect) {
          rememberPendingPayment(referenceId, cardPhone.trim());
          setStatus({ kind: "card-redirect", url: redirect });
          window.location.href = redirect;
          return;
        }

        setStatus({
          kind: "error",
          message:
            "We couldn't open the secure card page. The payment was not completed. Please try again.",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error. Try again.";
      setStatus({ kind: "error", message });
    }
  }

  function renderStatusBanner() {
    if (status.kind === "momo-pending") {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-0.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            />
            <div>
              <p className="font-medium">Approve the prompt on your phone</p>
              <p className="mt-1 text-amber-900/80 dark:text-amber-200/80">
                {status.message ||
                  `We sent a payment prompt to ${status.phone}. Open your mobile money app or enter your PIN to confirm.`}
              </p>
              <p className="mt-1 text-[11px] text-amber-900/70 dark:text-amber-200/70">
                Reference: <span className="font-mono">{status.reference}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (status.kind === "momo-success") {
      const d = status.details;
      return (
        <div className="rounded-xl border border-brand-green/40 bg-brand-green-muted px-3 py-2 text-xs text-foreground">
          <p className="font-medium">Payment received — thank you!</p>
          <p className="mt-1 text-muted-foreground">
            {d?.message || "Your gift has been received successfully."}
          </p>
          <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
            {typeof d?.amount === "number" && (
              <li>Amount: {formatAmount(d.amount, d.currency)}</li>
            )}
            {d?.paymentType && <li>Method: {d.paymentType}</li>}
            <li>
              Reference: <span className="font-mono">{status.reference}</span>
            </li>
            {d?.identifier && (
              <li>
                Receipt: <span className="font-mono">{d.identifier}</span>
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={resetStatus}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90"
          >
            Give again
          </button>
        </div>
      );
    }

    if (status.kind === "momo-failed") {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <p className="font-medium">
            {status.timedOut ? "Payment failed / timed out" : "Payment failed"}
          </p>
          <p className="mt-1">{status.message}</p>
          <p className="mt-1 text-[11px] opacity-80">
            Reference: <span className="font-mono">{status.reference}</span>
          </p>
          <button
            type="button"
            onClick={resetStatus}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-3 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
          >
            Try again
          </button>
        </div>
      );
    }

    if (status.kind === "momo-cancelled") {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">Payment cancelled</p>
          <p className="mt-1">{status.message}</p>
          <p className="mt-1 text-[11px] opacity-80">
            Reference: <span className="font-mono">{status.reference}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetStatus}
              className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-3 py-1 text-[11px] font-medium text-amber-950 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            >
              Try again
            </button>
            <a
              href="/give"
              className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium text-primary underline-offset-4 hover:underline"
            >
              Return to Give
            </a>
          </div>
        </div>
      );
    }

    if (status.kind === "card-redirect") {
      return (
        <div className="rounded-xl border border-brand-green/40 bg-brand-green-muted px-3 py-2 text-xs text-foreground">
          <p className="font-medium">
            Redirecting you to the secure card page…
          </p>
          <p className="mt-1 text-muted-foreground">
            If nothing happens, use the button below to continue.
          </p>
          <a
            href={status.url}
            className="mt-2 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Continue to secure payment
          </a>
        </div>
      );
    }

    if (status.kind === "success") {
      return (
        <div className="rounded-xl border border-brand-green/40 bg-brand-green-muted px-3 py-2 text-xs text-foreground">
          <p className="font-medium">Thank you for your gift</p>
          <p className="mt-1 text-muted-foreground">{status.message}</p>
        </div>
      );
    }

    if (status.kind === "error") {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status.message}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="space-y-4">
      <div
        className="inline-flex rounded-full border border-border bg-muted p-1 text-xs font-medium"
        role="tablist"
        aria-label="Giving method"
      >
        {([
          { id: "momo", label: "Mobile Money" },
          { id: "card", label: "Card" },
        ] as const).map((tab) => {
          const active = type === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setType(tab.id);
                if (status.kind === "error") resetStatus();
              }}
              className={cn(
                "rounded-full px-4 py-1.5 transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-primary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderStatusBanner()}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium text-foreground/80">
            What is this gift for?
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Giving purpose"
          >
            {GIVING_PURPOSE_OPTIONS.map((option) => {
              const active = purpose === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPurpose(option.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {purpose === "other" && (
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Please specify (optional)
              </label>
              <Input
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                placeholder="e.g. Building fund, special project"
              />
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Amount ({DEFAULT_CURRENCY})
            </label>
            <Input
              type="number"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              required
            />
          </div>
        </div>

        {type === "momo" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  Mobile money number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="260977000000"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Use the format <span className="font-mono">2609XXXXXXXX</span> for
              MTN or Airtel mobile money. You will receive a prompt on your
              phone to approve.
            </p>
          </>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  First name
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  Last name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={cardPhone}
                  onChange={(e) => setCardPhone(e.target.value)}
                  placeholder="260977000000"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Address
              </label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  City
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/80">
                  Postal / ZIP
                </label>
                <Input value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              You will be redirected to a secure page to enter your card
              details. We never store card information on this site.
            </p>
          </>
        )}

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || status.kind === "momo-pending"}
          >
            {isLoading
              ? "Processing…"
              : status.kind === "momo-pending"
                ? "Waiting for confirmation…"
                : type === "momo"
                  ? "Give with Mobile Money"
                  : "Continue to card payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
