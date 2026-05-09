import type {
  NewsletterProvider,
  SubscribeInput,
  SubscribeResult,
} from "./provider";

/**
 * Beehiiv provider.
 *
 * Docs: https://developers.beehiiv.com/api-reference/subscriptions/create
 *
 * Required env vars:
 *   BEEHIIV_API_KEY        - the API key from Beehiiv → Integrations → API
 *   BEEHIIV_PUBLICATION_ID - your publication's pub_xxxxxxxx ID
 *
 * Optional:
 *   BEEHIIV_REACTIVATE     - "true"/"false" (default true) — re-subscribes churned emails
 *   BEEHIIV_SEND_WELCOME   - "true"/"false" (default true)
 */

const BEEHIIV_API = "https://api.beehiiv.com/v2";

interface BeehiivResponse {
  data?: {
    id?: string;
    email?: string;
    status?: string;
    created?: number;
  };
  errors?: Array<{ message?: string; code?: string }>;
}

function isConfigured(): boolean {
  return Boolean(
    process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID
  );
}

async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  if (!isConfigured()) {
    // Dev-friendly: pretend success so the form works locally without keys.
    // In production we surface an error so the editor knows to fix it.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[newsletter] BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID not set — pretending success in dev."
      );
      return {
        status: "subscribed",
        message: "You're in. (Dev fallback — Beehiiv keys not configured.)",
      };
    }
    return {
      status: "not-configured",
      message: "Newsletter is temporarily unavailable. Try again later.",
    };
  }

  const publicationId = process.env.BEEHIIV_PUBLICATION_ID!;
  const apiKey = process.env.BEEHIIV_API_KEY!;

  const reactivate = process.env.BEEHIIV_REACTIVATE !== "false";
  const sendWelcome = process.env.BEEHIIV_SEND_WELCOME !== "false";

  let res: Response;
  try {
    res = await fetch(
      `${BEEHIIV_API}/publications/${encodeURIComponent(
        publicationId
      )}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email.trim().toLowerCase(),
          reactivate_existing: reactivate,
          send_welcome_email: sendWelcome,
          utm_source: input.utmSource || input.source || "alphabeat-site",
          utm_medium: input.utmMedium || "web",
          utm_campaign: input.utmCampaign || input.source || "default",
        }),
        cache: "no-store",
      }
    );
  } catch {
    return {
      status: "provider-error",
      message: "Couldn't reach the newsletter service. Please try again.",
    };
  }

  let body: BeehiivResponse | null = null;
  try {
    body = (await res.json()) as BeehiivResponse;
  } catch {
    // If body isn't JSON we still rely on res.ok + status code.
  }

  if (res.status === 429) {
    return {
      status: "rate-limited",
      message: "Too many signups from this network — try again in a minute.",
    };
  }

  if (!res.ok) {
    const message = body?.errors?.[0]?.message || "";
    if (/email/i.test(message) && /(invalid|format)/i.test(message)) {
      return { status: "invalid-email", message: "That email looks invalid." };
    }
    return {
      status: "provider-error",
      message: message || "Subscription failed. Please try again.",
    };
  }

  const status = body?.data?.status;
  if (status === "active" || status === "validating") {
    return {
      status: status === "validating" ? "pending-confirmation" : "subscribed",
      message:
        status === "validating"
          ? "Almost done — check your inbox to confirm."
          : "You're in. First issue will land soon.",
    };
  }

  // Beehiiv returns 201 for new subscribers and an idempotent 200 for existing.
  return {
    status: res.status === 201 ? "subscribed" : "already-subscribed",
    message:
      res.status === 201
        ? "You're in. First issue will land soon."
        : "You're already on the list.",
  };
}

export const beehiivProvider: NewsletterProvider = {
  name: "beehiiv",
  isConfigured,
  subscribe,
};
