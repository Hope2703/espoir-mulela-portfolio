import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { validateContact } from "@/features/contact/validation";
export const runtime = "nodejs";
const secret =
  process.env.CONTACT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? ""
    : randomBytes(32).toString("hex"));
const buckets = new Map<string, { count: number; expires: number }>();
const sign = (s: string) =>
  createHmac("sha256", secret).update(s).digest("hex");
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const available = Boolean(
    secret &&
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM &&
    process.env.CONTACT_EMAIL,
  );
  if (!secret) return json({ token: "", available: false });
  const payload = `${Date.now()}.${randomBytes(16).toString("hex")}`;
  return json({ token: `${payload}.${sign(payload)}`, available });
}
function validToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = parts.slice(0, 2).join("."),
    expected = sign(payload);
  if (!/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const age = Date.now() - Number(parts[0]);
  return (
    age >= 1500 &&
    age < 3600000 &&
    timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))
  );
}
function allow(key: string) {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.expires < now) buckets.delete(k);
  const item = buckets.get(key);
  if (item && item.count >= 5) return false;
  if (!item && buckets.size >= 10000) return false;
  buckets.set(key, {
    count: (item?.count ?? 0) + 1,
    expires: item?.expires ?? now + 900000,
  });
  return true;
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const port = new URL(request.url).port;
  const allowedOrigins = process.env.NEXT_PUBLIC_SITE_URL
    ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).origin]
    : [
        `http://127.0.0.1${port ? `:${port}` : ""}`,
        `http://localhost${port ? `:${port}` : ""}`,
      ];
  if (!origin || !allowedOrigins.includes(origin))
    return json({ error: "origin" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "content-type" }, 415);
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "body" }, 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 24000) {
        await reader.cancel();
        return json({ error: "size" }, 413);
      }
      chunks.push(value);
    }
  } catch {
    return json({ error: "body" }, 400);
  }
  let body: unknown;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return json({ error: "json" }, 400);
  }
  const { data, errors } = validateContact(body);
  if (!data) return json({ errors }, 422);
  if (!secret) return json({ error: "delivery-not-configured" }, 503);
  if (data.website || !validToken(data.token))
    return json({ error: "verification" }, 400);
  const ip =
    process.env.CONTACT_TRUST_PROXY === "true"
      ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown")
      : "single-origin";
  if (!allow(sign(ip)) || !allow(sign(data.email.toLowerCase())))
    return json({ error: "rate-limit" }, 429);
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.CONTACT_FROM ||
    !process.env.CONTACT_EMAIL
  )
    return json({ error: "delivery-not-configured" }, 503);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": sign(data.token),
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_EMAIL],
        reply_to: data.email,
        subject: `Portfolio — ${data.subject}`,
        text: `Nom: ${data.name}\nEmail: ${data.email}\nSujet: ${data.subject}\n\n${data.message}`,
      }),
    });
    if (!response.ok) return json({ error: "delivery-failed" }, 502);
    return json({ ok: true });
  } catch {
    return json({ error: "delivery-failed" }, 502);
  }
}
