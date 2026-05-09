"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  /** Lets us track which surface a signup came from. */
  source?: string;
  placeholder?: string;
  ctaLabel?: string;
  className?: string;
  /** Visual variant: stacked = mobile-first column; inline = email + button on one line. */
  variant?: "inline" | "stacked";
}

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function NewsletterForm({
  source,
  placeholder = "you@example.com",
  ctaLabel = "Subscribe",
  className,
  variant = "inline",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    startTransition(async () => {
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source, website }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          message?: string;
        };
        if (data.ok) {
          setState({
            kind: "success",
            message: data.message || "You're in. First issue will land soon.",
          });
          setEmail("");
        } else {
          setState({
            kind: "error",
            message:
              data.message || "Subscription failed. Please try again later.",
          });
        }
      } catch {
        setState({
          kind: "error",
          message: "Network error. Please try again.",
        });
      }
    });
  };

  if (state.kind === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex items-center gap-2 rounded-full border border-up-500/40 bg-up-500/10 px-4 py-2.5 text-sm text-up-200",
          className
        )}
      >
        <Check className="h-4 w-4" />
        {state.message}
      </div>
    );
  }

  const submitting = state.kind === "submitting";

  return (
    <form
      onSubmit={submit}
      className={cn(
        variant === "inline"
          ? "flex w-full flex-col gap-2 sm:flex-row sm:items-center"
          : "flex w-full flex-col gap-2",
        className
      )}
      noValidate
    >
      {/* Honeypot — visually hidden, no autocomplete. */}
      <label
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <span>Leave this field empty</span>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>

      <label htmlFor={`nl-email-${source ?? "default"}`} className="sr-only">
        Email address
      </label>
      <input
        id={`nl-email-${source ?? "default"}`}
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        placeholder={placeholder}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state.kind === "error") setState({ kind: "idle" });
        }}
        disabled={submitting}
        aria-invalid={state.kind === "error"}
        className={cn(
          "min-w-0 flex-1 rounded-full border bg-ink-900 px-4 py-2.5 text-sm text-ash-50 placeholder:text-ash-500 outline-none ring-0 transition-colors",
          "border-ink-600 focus:border-accent-400 focus:bg-ink-800",
          state.kind === "error" && "border-down-500/60",
          submitting && "opacity-60"
        )}
      />

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400",
          "disabled:opacity-60 disabled:hover:bg-accent-500"
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {state.kind === "error" && (
        <p
          role="alert"
          className="mt-1 text-xs text-down-300 sm:absolute sm:translate-y-12"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
