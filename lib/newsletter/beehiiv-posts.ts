/**
 * Beehiiv Posts API client.
 *
 * Fetches published newsletter issues so we can render them on /newsletter
 * (the on-site archive page). Cached server-side via Next.js fetch revalidation.
 *
 * API docs: https://developers.beehiiv.com/api-reference/posts
 *
 * Requires:
 *   BEEHIIV_API_KEY
 *   BEEHIIV_PUBLICATION_ID
 */

const BEEHIIV_API = "https://api.beehiiv.com/v2";

export interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string;
  slug?: string;
  status: string;
  publish_date?: number; // unix seconds
  displayed_date?: number;
  thumbnail_url?: string;
  web_url?: string;
  audience?: string;
  platform?: string;
  content_tags?: string[];
  preview_text?: string;
  authors?: { name?: string }[];
  /** Word count if Beehiiv exposes it; otherwise we estimate. */
  meta_default_description?: string;
}

interface PostsResponse {
  data?: BeehiivPost[];
  total_results?: number;
  page?: number;
  total_pages?: number;
  errors?: { message?: string }[];
}

function isConfigured(): boolean {
  return Boolean(
    process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID
  );
}

/**
 * List published posts, newest first.
 *
 * Cache: 10 minutes (revalidated by tag "beehiiv-posts" if you ever
 * trigger a webhook-driven invalidation).
 */
export async function listPublishedPosts(opts?: {
  limit?: number;
}): Promise<BeehiivPost[]> {
  if (!isConfigured()) return [];

  const limit = Math.max(1, Math.min(opts?.limit ?? 50, 100));
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID!;
  const apiKey = process.env.BEEHIIV_API_KEY!;

  const url = new URL(
    `${BEEHIIV_API}/publications/${encodeURIComponent(publicationId)}/posts`
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("status", "confirmed");
  url.searchParams.set("audience", "free");
  url.searchParams.set("platform", "both");
  url.searchParams.set("order_by", "publish_date");
  url.searchParams.set("direction", "desc");
  // Keep payload small but include thumbnail + tags.
  url.searchParams.append("expand[]", "free_web_content");
  url.searchParams.append("expand[]", "stats");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 600, tags: ["beehiiv-posts"] },
    });
  } catch (err) {
    console.warn("[beehiiv] failed to reach posts endpoint", err);
    return [];
  }

  if (!res.ok) {
    console.warn(`[beehiiv] posts list returned ${res.status}`);
    return [];
  }

  let body: PostsResponse;
  try {
    body = (await res.json()) as PostsResponse;
  } catch {
    return [];
  }

  return Array.isArray(body.data) ? body.data : [];
}

/**
 * Format a unix timestamp (seconds) into a friendly date.
 */
export function formatPostDate(unixSeconds: number | undefined): string {
  if (!unixSeconds) return "";
  const d = new Date(unixSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
