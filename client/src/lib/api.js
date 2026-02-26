const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

export const API_BASE = LOCAL_HOSTS.has(window.location.hostname)
  ? `${window.location.protocol}//${window.location.hostname}:3001/api`
  : "/api";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
let csrfCache = null;

async function readPayload(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

async function fetchCsrfToken() {
  if (csrfCache) return csrfCache;
  try {
    const res = await fetch(`${API_BASE}/csrf-token`, {
      method: "GET",
      credentials: "include",
      cache: "no-store"
    });
    const payload = await readPayload(res);
    if (res.ok && payload && typeof payload.csrfToken === "string") {
      csrfCache = payload.csrfToken;
      return csrfCache;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function apiRequest(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!SAFE_METHODS.has(method) && !headers.has("x-csrf-token")) {
    const csrf = await fetchCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
  }

  const res = await fetch(`${API_BASE}${normalizedPath}`, {
    method,
    credentials: "include",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: method === "GET" ? "default" : "no-store"
  });

  const payload = await readPayload(res);
  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && typeof payload.message === "string"
        ? payload.message
        : `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const adminAuth = {
  key: "bidnsteal_admin_gate",
  read() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  },
  write(email) {
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      this.key,
      JSON.stringify({
        role: "admin",
        email,
        createdAt: now,
        expiresAt
      })
    );
  },
  clear() {
    localStorage.removeItem(this.key);
  },
  valid() {
    const gate = this.read();
    return Boolean(gate && Number(gate.expiresAt || 0) > Date.now());
  }
};
