const SESSION_COOKIE_NAME = "valhalla_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  email: string;
  exp: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET || "valhalla-local-auth-secret";
}

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "admin@valhalla.local";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "ValhallaAdmin2026";
}

function stringToBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToString(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  const bytes = Array.from(new Uint8Array(signature))
    .map((byte) => String.fromCharCode(byte))
    .join("");

  return stringToBase64Url(bytes);
}

export async function createSessionToken() {
  const payload: SessionPayload = {
    sub: getAdminUsername(),
    email: getAdminEmail(),
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  };

  const encodedPayload = stringToBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = await signValue(payloadPart);
  if (expectedSignature !== signaturePart) return null;

  try {
    const payload = JSON.parse(base64UrlToString(payloadPart)) as SessionPayload;
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isValidAdminCredentials(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const matchesUser =
    normalizedIdentifier === getAdminUsername().trim().toLowerCase() ||
    normalizedIdentifier === getAdminEmail().trim().toLowerCase();

  return matchesUser && password === getAdminPassword();
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionDurationSeconds() {
  return SESSION_DURATION_SECONDS;
}
