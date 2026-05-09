import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface WebhookPayload {
  _type?: string;
  slug?: { current?: string };
  ticker?: string;
  sector?: { _ref?: string };
}

/**
 * Sanity webhook receiver. Configure in Sanity → API → Webhooks:
 *   URL: https://yourdomain.com/api/revalidate
 *   Filter: _type in ["stock","etfEntry","sector","weeklyPick","insight","sponsorship","siteSettings"]
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

  const { _type: type, slug, ticker } = body;
  const slugCurrent = slug?.current;

  // Always nuke the layout cache (header/footer ticker symbols may change).
  revalidatePath("/", "layout");

  switch (type) {
    case "stock": {
      revalidatePath("/stocks");
      revalidatePath("/sectors");
      revalidatePath("/screener");
      revalidatePath("/hidden-gems");
      revalidatePath("/top");
      if (slugCurrent) {
        revalidatePath(`/stocks/${slugCurrent}`);
      }
      // Stocks may be referenced by ticker uppercase elsewhere
      if (ticker) revalidatePath(`/stocks/${ticker.toLowerCase()}`);
      break;
    }
    case "etfEntry": {
      revalidatePath("/etfs");
      if (slugCurrent) revalidatePath(`/etfs/${slugCurrent}`);
      break;
    }
    case "sector": {
      revalidatePath("/sectors");
      revalidatePath("/top");
      if (slugCurrent) revalidatePath(`/sectors/${slugCurrent}`);
      break;
    }
    case "weeklyPick": {
      revalidatePath("/weekly-picks");
      if (slugCurrent) revalidatePath(`/weekly-picks/${slugCurrent}`);
      break;
    }
    case "topList": {
      revalidatePath("/top");
      if (slugCurrent) revalidatePath(`/top/${slugCurrent}`);
      break;
    }
    case "insight": {
      revalidatePath("/insights");
      if (slugCurrent) revalidatePath(`/insights/${slugCurrent}`);
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
