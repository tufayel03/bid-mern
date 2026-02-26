const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  const raw = fs.readFileSync(envFile, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const idx = t.indexOf("=");
    if (idx < 1) return;
    const key = t.slice(0, idx).trim();
    if (!key || process.env[key] !== undefined) return;
    process.env[key] = t.slice(idx + 1).trim();
  });
}

const PORT = Number(process.env.PORT || 3001);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bidnsteal.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tufayel@142003";
const SESSION_COOKIE = "bidnsteal_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const sessions = new Map();

const state = {
  emailTemplates: [
    {
      key: "welcome_email",
      subjectTemplate: "Welcome to {{site.name}}",
      htmlTemplate: "<h2>Welcome {{customer.name}}</h2><p>Thanks for joining.</p>",
      isActive: true
    }
  ],
  smtp: {
    enabled: false,
    host: "",
    port: 465,
    secure: true,
    username: "",
    hasPassword: false,
    passwordMasked: "",
    fromEmail: "",
    fromName: "",
    replyTo: "",
    ignoreTLS: false
  },
  courier: {
    provider: "steadfast",
    enabled: false,
    baseUrl: "https://portal.packzy.com/api/v1",
    apiKey: "",
    hasSecret: false,
    secretKeyMasked: "",
    fraudCheckerEnabled: false,
    fraudCheckerEmail: "",
    fraudCheckerHasPassword: false,
    fraudCheckerPasswordMasked: "",
    defaultDeliveryType: 0,
    defaultItemDescription: "BidnSteal order"
  }
};

function setCors(req, res) {
  const origin = req.headers.origin && req.headers.origin !== "null" ? req.headers.origin : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-csrf-token");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
}

function json(req, res, code, payload, extra = {}) {
  setCors(req, res);
  const body = JSON.stringify(payload);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...extra
  });
  res.end(body);
}

function text(req, res, code, body, contentType = "text/plain; charset=utf-8") {
  setCors(req, res);
  res.writeHead(code, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const result = {};
  raw.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    result[k] = decodeURIComponent(rest.join("=") || "");
  });
  return result;
}

function cookie(name, value, options = {}) {
  const seg = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) seg.push(`Max-Age=${Math.max(0, Number(options.maxAge) || 0)}`);
  if (options.path) seg.push(`Path=${options.path}`);
  if (options.httpOnly) seg.push("HttpOnly");
  if (options.sameSite) seg.push(`SameSite=${options.sameSite}`);
  if (options.secure) seg.push("Secure");
  return seg.join("; ");
}

function createSession(email) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, { email, expiresAt });
  return { token, expiresAt };
}

function getSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Number(session.expiresAt || 0) <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function clearExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (!session || Number(session.expiresAt || 0) <= now) {
      sessions.delete(token);
    }
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function parsePaging(url, fallbackLimit = 20) {
  const p = Math.max(1, Number(url.searchParams.get("page") || 1));
  const l = Math.max(1, Number(url.searchParams.get("limit") || fallbackLimit));
  return { page: Math.floor(p), limit: Math.floor(l) };
}

function emptyPage(url, fallbackLimit = 20) {
  const { page, limit } = parsePaging(url, fallbackLimit);
  return { items: [], page, limit, total: 0, totalPages: 1 };
}

function decodeTail(pathname, base) {
  return decodeURIComponent(pathname.slice(base.length));
}

function templateByKey(key) {
  return state.emailTemplates.find((item) => item.key === key) || null;
}

function requiresAuth(pathname) {
  return (
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/metrics") ||
    pathname.startsWith("/api/auctions")
  );
}

const genericPagePaths = new Set([
  "/api/orders",
  "/api/products",
  "/api/admin/users",
  "/api/admin/subscribers",
  "/api/admin/campaigns",
  "/api/admin/campaigns/templates",
  "/api/admin/auctions",
  "/api/admin/wallets",
  "/api/admin/disputes",
  "/api/admin/coupons",
  "/api/admin/media"
]);

const server = http.createServer(async (req, res) => {
  try {
    const method = (req.method || "GET").toUpperCase();
    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    const pathname = url.pathname;

    if (method === "OPTIONS") {
      setCors(req, res);
      res.writeHead(204);
      res.end();
      return;
    }

    if (!pathname.startsWith("/api")) {
      json(req, res, 404, { message: "Not found" });
      return;
    }

    if (pathname === "/api/health" && method === "GET") {
      json(req, res, 200, { ok: true, service: "bidnsteal-api", at: new Date().toISOString() });
      return;
    }

    if (pathname === "/api/ready" && method === "GET") {
      json(req, res, 200, { ok: true, checks: { mongo: "up", redis: "up" }, at: new Date().toISOString() });
      return;
    }

    if (pathname === "/api/csrf-token" && method === "GET") {
      json(req, res, 200, { csrfToken: "dev-csrf-token" });
      return;
    }

    if (pathname === "/api/auth/login" && method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (email !== String(ADMIN_EMAIL).trim().toLowerCase() || password !== ADMIN_PASSWORD) {
        json(req, res, 401, { message: "Invalid credentials" });
        return;
      }
      const session = createSession(email);
      json(
        req,
        res,
        200,
        { ok: true, user: { id: "admin_local", name: "Admin User", email: ADMIN_EMAIL, role: "admin" } },
        {
          "Set-Cookie": cookie(SESSION_COOKIE, session.token, {
            maxAge: Math.floor(SESSION_TTL_MS / 1000),
            path: "/",
            httpOnly: true,
            sameSite: "Lax"
          })
        }
      );
      return;
    }

    if (pathname === "/api/auth/me" && method === "GET") {
      const session = getSession(req);
      if (!session) {
        json(req, res, 401, { message: "Unauthorized" });
        return;
      }
      json(req, res, 200, {
        id: "admin_local",
        name: "Admin User",
        email: session.email || ADMIN_EMAIL,
        role: "admin"
      });
      return;
    }

    if (pathname === "/api/auth/logout" && method === "POST") {
      const session = getSession(req);
      if (session?.token) sessions.delete(session.token);
      json(req, res, 200, { ok: true }, {
        "Set-Cookie": cookie(SESSION_COOKIE, "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "Lax" })
      });
      return;
    }

    if (requiresAuth(pathname) && !getSession(req)) {
      json(req, res, 401, { message: "Unauthorized" });
      return;
    }

    if (pathname === "/api/metrics" && method === "GET") {
      json(req, res, 200, { liveAuctions: 0 });
      return;
    }

    if (pathname === "/api/admin/financial/summary" && method === "GET") {
      json(req, res, 200, {
        gmv: 0,
        netRevenue: 0,
        feesCollected: 0,
        conversionRate: 0,
        avgAuctionUplift: 0,
        walletBalances: { total: 0, locked: 0 },
        monthlyReport: []
      });
      return;
    }

    if (pathname === "/api/admin/reservations" && method === "GET") {
      json(req, res, 200, { active: [], expired: [], consumed: [] });
      return;
    }

    if (pathname === "/api/admin/email-templates" && method === "GET") {
      json(req, res, 200, { items: state.emailTemplates });
      return;
    }

    if (pathname === "/api/admin/email-templates" && method === "POST") {
      const body = await readBody(req);
      const key = String(body.key || "").trim();
      if (!key) {
        json(req, res, 400, { message: "Template key required" });
        return;
      }
      const existing = templateByKey(key);
      if (existing) {
        Object.assign(existing, body, { key });
        json(req, res, 200, existing);
        return;
      }
      const created = {
        key,
        subjectTemplate: String(body.subjectTemplate || ""),
        htmlTemplate: String(body.htmlTemplate || ""),
        isActive: body.isActive !== false
      };
      state.emailTemplates.push(created);
      json(req, res, 200, created);
      return;
    }

    if (pathname === "/api/admin/email-templates/transport/smtp" && method === "GET") {
      json(req, res, 200, state.smtp);
      return;
    }

    if (pathname === "/api/admin/email-templates/transport/smtp" && method === "PUT") {
      const body = await readBody(req);
      state.smtp = {
        ...state.smtp,
        enabled: Boolean(body.enabled),
        host: String(body.host || ""),
        port: Number(body.port || 465),
        secure: body.secure !== false,
        username: String(body.username || ""),
        hasPassword: Boolean(body.password) || state.smtp.hasPassword,
        passwordMasked: Boolean(body.password) ? "********" : state.smtp.passwordMasked,
        fromEmail: String(body.fromEmail || ""),
        fromName: String(body.fromName || ""),
        replyTo: String(body.replyTo || ""),
        ignoreTLS: Boolean(body.ignoreTLS)
      };
      json(req, res, 200, state.smtp);
      return;
    }

    if (pathname === "/api/admin/email-templates/transport/smtp/test" && method === "POST") {
      json(req, res, 200, { ok: true });
      return;
    }

    if (pathname === "/api/admin/courier/steadfast/settings" && method === "GET") {
      json(req, res, 200, state.courier);
      return;
    }

    if (pathname === "/api/admin/courier/steadfast/settings" && method === "PUT") {
      const body = await readBody(req);
      state.courier = {
        ...state.courier,
        enabled: Boolean(body.enabled),
        baseUrl: String(body.baseUrl || state.courier.baseUrl),
        apiKey: String(body.apiKey || ""),
        hasSecret: Boolean(body.secretKey) || state.courier.hasSecret,
        secretKeyMasked: Boolean(body.secretKey) ? "********" : state.courier.secretKeyMasked,
        fraudCheckerEnabled: Boolean(body.fraudCheckerEnabled),
        fraudCheckerEmail: String(body.fraudCheckerEmail || ""),
        fraudCheckerHasPassword: Boolean(body.fraudCheckerPassword) || state.courier.fraudCheckerHasPassword,
        fraudCheckerPasswordMasked: Boolean(body.fraudCheckerPassword)
          ? "********"
          : state.courier.fraudCheckerPasswordMasked,
        defaultDeliveryType: Number(body.defaultDeliveryType || 0) === 1 ? 1 : 0,
        defaultItemDescription: String(body.defaultItemDescription || state.courier.defaultItemDescription)
      };
      json(req, res, 200, state.courier);
      return;
    }

    if (pathname === "/api/admin/courier/steadfast/balance" && method === "GET") {
      json(req, res, 200, { currentBalance: 0 });
      return;
    }

    if (
      (pathname.includes("/courier/steadfast/orders/") || pathname.includes("/courier/orders/")) &&
      (pathname.endsWith("/customer-success-rate") ||
        pathname.endsWith("/check-score") ||
        pathname.endsWith("/checkscore") ||
        pathname.endsWith("/score")) &&
      method === "GET"
    ) {
      json(req, res, 200, { totalOrders: 0, totalDelivered: 0, totalCancelled: 0, successRatio: 0 });
      return;
    }

    if (
      (pathname.includes("/courier/steadfast/orders/") || pathname.includes("/courier/orders/")) &&
      (pathname.endsWith("/create") || pathname.endsWith("/sync-status")) &&
      method === "POST"
    ) {
      json(req, res, 200, { ok: true, trackingCode: `TRK-${Date.now()}`, courierStatus: "pending" });
      return;
    }

    if (pathname === "/api/admin/users/export" && method === "GET") {
      text(req, res, 200, "id,name,email\n", "text/csv; charset=utf-8");
      return;
    }

    if (pathname === "/api/admin/subscribers/export" && method === "GET") {
      text(req, res, 200, "email,name,source,isActive\n", "text/csv; charset=utf-8");
      return;
    }

    if (pathname === "/api/admin/upload-image" && method === "POST") {
      const id = `img_${Date.now()}`;
      const fileName = `${id}.webp`;
      json(req, res, 200, {
        id,
        fileName,
        size: 0,
        url: `/uploads/${fileName}`,
        templateTag: `{{media.${id}}}`,
        createdAt: new Date().toISOString()
      });
      return;
    }

    if (pathname.startsWith("/api/admin/media/") && method === "DELETE") {
      json(req, res, 200, { ok: true });
      return;
    }

    if (pathname.startsWith("/api/orders/") && pathname.endsWith("/status") && ["POST", "PATCH", "PUT"].includes(method)) {
      const orderId = decodeTail(pathname, "/api/orders/").replace(/\/status$/, "");
      const body = await readBody(req);
      json(req, res, 200, {
        id: orderId,
        paymentStatus: String(body.paymentStatus || "unpaid"),
        fulfillmentStatus: String(body.fulfillmentStatus || "pending"),
        customerNote: String(body.customerNote || "")
      });
      return;
    }

    if (pathname.startsWith("/api/orders/") && method === "GET") {
      const orderId = decodeTail(pathname, "/api/orders/");
      json(req, res, 200, {
        id: orderId,
        orderNumber: `DEV-${orderId}`,
        total: 0,
        subtotal: 0,
        shippingFee: 0,
        paymentStatus: "unpaid",
        fulfillmentStatus: "pending",
        customerNote: "",
        createdAt: new Date().toISOString(),
        items: [],
        shippingAddress: {
          fullName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          area: "",
          city: "",
          postalCode: "",
          country: "BD"
        }
      });
      return;
    }

    if (pathname.startsWith("/api/orders/") && method === "DELETE") {
      json(req, res, 200, { ok: true });
      return;
    }

    if (pathname.startsWith("/api/products/") && method === "GET") {
      const productId = decodeTail(pathname, "/api/products/");
      json(req, res, 200, {
        id: productId,
        slug: productId,
        title: "Draft Product",
        sku: productId,
        saleMode: "fixed",
        price: 0,
        stock: 0,
        images: []
      });
      return;
    }

    if (pathname.startsWith("/api/auctions/") && method === "GET") {
      const productId = decodeTail(pathname, "/api/auctions/");
      json(req, res, 200, {
        id: `auc_${productId}`,
        productId,
        status: "scheduled",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600_000).toISOString(),
        currentPrice: 0,
        startingPrice: 0,
        reservePrice: null,
        minIncrement: 1,
        totalBids: 0,
        bids: [],
        product: { id: productId, slug: productId, title: "Draft Product", image: "" }
      });
      return;
    }

    if (pathname.startsWith("/api/admin/email-templates/") && pathname.endsWith("/preview") && method === "POST") {
      const key = decodeURIComponent(pathname.split("/")[4] || "");
      const template = templateByKey(key);
      json(req, res, 200, { subject: template?.subjectTemplate || "", html: template?.htmlTemplate || "" });
      return;
    }

    if (pathname.startsWith("/api/admin/email-templates/") && pathname.endsWith("/test-send") && method === "POST") {
      json(req, res, 200, { ok: true });
      return;
    }

    if (pathname.startsWith("/api/admin/email-templates/") && method === "GET") {
      const key = decodeURIComponent(pathname.split("/")[4] || "");
      const template = templateByKey(key);
      if (!template) {
        json(req, res, 404, { message: "Template not found" });
        return;
      }
      json(req, res, 200, template);
      return;
    }

    if (pathname.startsWith("/api/admin/email-templates/") && method === "PUT") {
      const key = decodeURIComponent(pathname.split("/")[4] || "");
      const body = await readBody(req);
      const template = templateByKey(key) || { key, subjectTemplate: "", htmlTemplate: "", isActive: true };
      Object.assign(template, body, { key });
      if (!templateByKey(key)) state.emailTemplates.push(template);
      json(req, res, 200, template);
      return;
    }

    if (pathname.startsWith("/api/admin/email-templates/") && method === "DELETE") {
      json(req, res, 200, { ok: true });
      return;
    }

    if (pathname.startsWith("/api/admin/campaigns/") && pathname.endsWith("/send") && method === "POST") {
      json(req, res, 200, { queued: 0 });
      return;
    }

    if (pathname.startsWith("/api/admin/campaigns/") && pathname.endsWith("/resend-non-openers") && method === "POST") {
      json(req, res, 200, { queued: 0 });
      return;
    }

    if (genericPagePaths.has(pathname) && method === "GET") {
      json(req, res, 200, emptyPage(url, pathname === "/api/admin/auctions" ? 120 : 20));
      return;
    }

    if (pathname.startsWith("/api/admin/") && method === "GET") {
      json(req, res, 200, emptyPage(url, 20));
      return;
    }

    if (pathname.startsWith("/api/") && method !== "GET") {
      json(req, res, 200, { ok: true });
      return;
    }

    json(req, res, 404, { message: "Not found" });
  } catch (error) {
    console.error("[api] request failed", error);
    json(req, res, 500, { message: "Internal server error" });
  }
});

setInterval(clearExpiredSessions, 60_000).unref();

server.listen(PORT, () => {
  console.log(`[api] listening on http://127.0.0.1:${PORT}`);
});
