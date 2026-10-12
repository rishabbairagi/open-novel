import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Accepts either:
 *  - `x-revalidation-secret: <REVALIDATION_SECRET>` (manual / proxy callers), or
 *  - GitHub's native `x-hub-signature-256` HMAC (set the webhook "Secret" to REVALIDATION_SECRET).
 * GitHub cannot send arbitrary headers, hence the HMAC path.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) return NextResponse.json({ error: "Revalidation is not configured." }, { status: 500 });

  const raw = await req.text();
  const header = req.headers.get("x-revalidation-secret");
  const signature = req.headers.get("x-hub-signature-256");
  const authorized = header
    ? safeEqual(header, secret)
    : signature
      ? safeEqual(signature, `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`)
      : false;
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = req.headers.get("x-github-event");
  if (event === "ping") return NextResponse.json({ ok: true, pong: true });

  let payload: { action?: string; pull_request?: { merged?: boolean; head?: { ref?: string } } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const merged = event === "pull_request" && payload.action === "closed" && payload.pull_request?.merged === true;
  if (!merged) return NextResponse.json({ ok: true, ignored: true });

  // Branch format: submission/<slug>-ch<N>-<8 char id>
  const match = /^submission\/(.+)-ch(\d+)-[a-z0-9]{8}$/.exec(payload.pull_request?.head?.ref ?? "");
  const paths = ["/", "/library"];
  if (match) {
    const [, slug, chapter] = match;
    paths.push(`/novel/${slug}`, `/novel/${slug}/${chapter}`, `/submit/${slug}`);
  }
  revalidatePath("/novel/[slug]/[chapter]", "page");
  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ ok: true, revalidated: paths });
}
