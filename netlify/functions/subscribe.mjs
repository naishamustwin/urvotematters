/**
 * POST /api/subscribe
 * Server-side relay between the signup form and Google Sheets.
 *
 * The browser never sees the Google Apps Script URL or the shared secret.
 * Set both in Netlify: Site configuration > Environment variables
 *   APPS_SCRIPT_URL   the Apps Script web app URL (ends in /exec)
 *   SIGNUP_SECRET     a long random string, identical to the one in Apps Script
 *   ALLOWED_ORIGIN    optional, e.g. https://urvotematters.com
 */

const STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI",
  "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

  // ALLOWED_ORIGIN may list several sites, separated by commas, e.g.
  // https://urvotematters.com,https://www.urvotematters.com,https://urvotematters.netlify.app
  const allowed = (process.env.ALLOWED_ORIGIN || "")
    .split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
  const origin = req.headers.get("origin");
  if (allowed.length && origin && !allowed.includes(origin)) {
    console.error("Blocked signup from an origin not in ALLOWED_ORIGIN:", origin);
    return json(403, { ok: false, error: "forbidden" });
  }

  const { APPS_SCRIPT_URL, SIGNUP_SECRET } = process.env;
  if (!APPS_SCRIPT_URL || !SIGNUP_SECRET) {
    console.error("Signup is not configured: set APPS_SCRIPT_URL and SIGNUP_SECRET.");
    return json(500, { ok: false, error: "not_configured" });
  }

  let body;
  try {
    const raw = await req.text();
    if (raw.length > 4000) return json(413, { ok: false, error: "too_large" });
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "bad_json" });
  }

  // Spam trap and speed check: pretend success so bots learn nothing.
  if ((body.hpCheck && String(body.hpCheck).trim() !== "") ||
      (typeof body.elapsedMs === "number" && body.elapsedMs < MIN_FILL_MS)) {
    console.warn("Signup dropped as likely spam (trap field filled or form sent too fast).");
    return json(200, { ok: true, status: "added" });
  }

  const firstName = String(body.firstName || "").trim().replace(/\s+/g, " ").slice(0, 60);
  const email = String(body.email || "").trim().toLowerCase();
  const state = String(body.state || "").trim().toUpperCase();

  if (!firstName) return json(400, { ok: false, field: "firstName", message: "Enter your first name." });
  if (!email || email.length > 254 || !EMAIL_RE.test(email))
    return json(400, { ok: false, field: "email", message: "Check your email address. It should look like name@example.com." });
  if (!STATES.has(state)) return json(400, { ok: false, field: "state", message: "Choose your state." });
  if (body.consent !== true)
    return json(400, { ok: false, field: "consent", message: "Tick the box to agree to receive URVoteMatters updates." });

  const record = {
    secret: SIGNUP_SECRET,
    firstName,
    email,
    state,
    timestamp: new Date().toISOString(),
    consent: "URVoteMatters updates v1",
    source: "urvotematters.com"
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      redirect: "follow",
      signal: AbortSignal.timeout(12000)
    });
    const data = await res.json().catch(() => null);
    if (!data || !data.ok) {
      console.error("Apps Script rejected the signup", res.status, data && data.error);
      return json(502, { ok: false, error: "upstream" });
    }
    return json(200, { ok: true, status: data.status === "duplicate" ? "duplicate" : "added" });
  } catch (err) {
    console.error("Apps Script request failed", err && err.message);
    return json(502, { ok: false, error: "upstream" });
  }
};

export const config = {
  path: "/api/subscribe",
  // Netlify's built-in rate limiting: 5 sign-ups per minute per IP.
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
