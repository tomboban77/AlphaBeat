import { NextResponse } from "next/server";
import { getNewsletterProvider, isPlausibleEmail } from "@/lib/newsletter/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscribeBody {
  email?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  /** Honeypot field — bots tend to fill it. Real users never see it. */
  website?: string;
}

export async function POST(req: Request) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot — silently succeed so bots don't learn what tripped them.
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true, message: "You're in." });
  }

  const email = (body.email || "").trim();
  if (!isPlausibleEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email." },
      { status: 400 }
    );
  }

  const provider = getNewsletterProvider();
  const result = await provider.subscribe({
    email,
    source: body.source,
    utmSource: body.utm_source,
    utmMedium: body.utm_medium,
    utmCampaign: body.utm_campaign,
  });

  const httpStatus =
    result.status === "invalid-email"
      ? 400
      : result.status === "rate-limited"
      ? 429
      : result.status === "provider-error" || result.status === "not-configured"
      ? 502
      : 200;

  const ok =
    result.status === "subscribed" ||
    result.status === "already-subscribed" ||
    result.status === "pending-confirmation";

  return NextResponse.json(
    { ok, status: result.status, message: result.message },
    { status: httpStatus }
  );
}
