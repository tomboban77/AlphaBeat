import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface WebhookPayload {
  _type?: string;
  slug?: { current?: string };
  ticker?: string;
}

/**
 * Sanity webhook receiver. Configure in Sanity → API → Webhooks:
 *   URL: https://yourdomain.com/api/revalidate
 *   Filter: _type in ["stockFile","brief","playbook","rankedList","siteSettings","sponsorship"]
 *   Header: x-revalidation-secret: <REVALIDATION_SECRET>
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidation-secret");
  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ message: "Bad JSON" }, { status: 400 });
  }

  const { _type: type, slug } = body;
  const slugCurrent = slug?.current;

  // Always revalidate layout (marquee symbols may change).
  revalidatePath("/", "layout");

  switch (type) {
    case "stockFile": {
      revalidatePath("/stocks");
      revalidatePath("/");
      if (slugCurrent) revalidatePath(`/stocks/${slugCurrent}`);
      break;
    }
    case "brief": {
      revalidatePath("/brief");
      revalidatePath("/");
      if (slugCurrent) revalidatePath(`/brief/${slugCurrent}`);
      break;
    }
    case "playbook": {
      revalidatePath("/playbooks");
      if (slugCurrent) revalidatePath(`/playbooks/${slugCurrent}`);
      break;
    }
    case "rankedList": {
      revalidatePath("/best");
      revalidatePath("/");
      if (slugCurrent) revalidatePath(`/best/${slugCurrent}`);
      break;
    }
    case "sponsorship":
    case "siteSettings":
    default: {
      // Layout-level revalidation already done above.
      break;
    }
  }

  return NextResponse.json({
    revalidated: true,
    type,
    slug: slugCurrent,
    date: new Date().toISOString(),
  });
}
