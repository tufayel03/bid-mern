import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingCart, Flame, TriangleAlert } from "lucide-react";

import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { DataTable } from "../components/DataTable";
import { adminAuth, apiRequest } from "../lib/api";

const TABS = [
  "dashboard",
  "inventory",
  "media",
  "auctions",
  "orders",
  "users",
  "subscribers",
  "campaigns",
  "coupons",
  "analytics",
  "reports",
  "settings"
];

const TEMPLATE_PLACEHOLDERS = [
  "customer.name",
  "customer.email",
  "order.number",
  "order.total",
  "order.status",
  "order.payment_status",
  "order.items_table",
  "order.items_table_with_images",
  "shipping.address",
  "shipping.city",
  "site.name",
  "site.url",
  "support.email",
  "auth.login_link",
  "auth.reset_link",
  "auction.title",
  "product.title"
];

const DEFAULT_TEMPLATE_EDITOR = {
  selectedKey: "",
  key: "",
  subjectTemplate: "",
  htmlTemplate: "",
  testEmail: ""
};

const DEFAULT_SMTP_SETTINGS = {
  enabled: false,
  host: "",
  port: 465,
  secure: true,
  username: "",
  password: "",
  hasPassword: false,
  passwordMasked: "",
  fromEmail: "",
  fromName: "",
  replyTo: "",
  ignoreTLS: false,
  testEmail: "",
  saving: false,
  testing: false
};

const DEFAULT_COURIER_SETTINGS = {
  provider: "steadfast",
  enabled: false,
  baseUrl: "https://portal.packzy.com/api/v1",
  apiKey: "",
  secretKey: "",
  hasSecret: false,
  secretKeyMasked: "",
  fraudCheckerEnabled: false,
  fraudCheckerEmail: "",
  fraudCheckerPassword: "",
  fraudCheckerHasPassword: false,
  fraudCheckerPasswordMasked: "",
  defaultDeliveryType: 0,
  defaultItemDescription: "BidnSteal order",
  balance: null,
  saving: false,
  balanceLoading: false
};

const DEFAULT_LOCAL_PREFS = {
  autoRefresh: false,
  debug: false,
  sidebarCollapsed: true
};

function money(value) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function dateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US");
}

function safeItems(payload) {
  return Array.isArray(payload?.items) ? payload.items : [];
}

function normalizeText(value) {
  return String(value || "").trim();
}

function buildChartSeries(range, financial) {
  const count = range === "30d" ? 30 : 7;
  const labels = [];
  const values = [];
  const now = new Date();
  const baseline = Number(financial?.netRevenue || 0);

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    values.push(i === 0 ? baseline : 0);
  }

  return { labels, values };
}

function MiniLineChart({ labels, values }) {
  const width = 840;
  const height = 260;
  const padding = 18;
  const max = Math.max(1, ...values);
  const min = 0;

  const points = values
    .map((v, idx) => {
      const x = padding + (idx * (width - padding * 2)) / Math.max(1, values.length - 1);
      const y = padding + ((max - v) * (height - padding * 2)) / Math.max(1, max - min);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mini-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="mini-chart" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4, 5].map((row) => {
          const y = padding + (row * (height - padding * 2)) / 5;
          return <line key={row} x1={padding} x2={width - padding} y1={y} y2={y} className="grid-line" />;
        })}
        <polyline points={points} className="chart-line" />
      </svg>
      <div className="mini-chart-labels">
        {labels.map((label, idx) => (
          <span key={`${label}-${idx}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function ToggleField({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`settings-toggle-wrap ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="settings-toggle">
        <span className="settings-toggle-thumb" />
      </span>
    </button>
  );
}

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [revenueRange, setRevenueRange] = useState("7d");
  const [localPrefs, setLocalPrefs] = useState(DEFAULT_LOCAL_PREFS);
  const [templateKeys, setTemplateKeys] = useState([]);
  const [templateEditor, setTemplateEditor] = useState(DEFAULT_TEMPLATE_EDITOR);
  const [templatePreview, setTemplatePreview] = useState({ subject: "", html: "" });
  const [smtpSettings, setSmtpSettings] = useState(DEFAULT_SMTP_SETTINGS);
  const [courierSettings, setCourierSettings] = useState(DEFAULT_COURIER_SETTINGS);

  const [data, setData] = useState({
    metrics: { liveAuctions: 0 },
    financial: { gmv: 0, netRevenue: 0, feesCollected: 0, monthlyReport: [] },
    health: { api: "unknown", dependencies: "unknown", lastCheckedAt: null },
    orders: [],
    products: [],
    media: [],
    auctions: [],
    users: [],
    subscribers: [],
    campaigns: [],
    templates: [],
    coupons: [],
    reservations: { active: [], expired: [], consumed: [] },
    subscriberTotal: 0
  });

  const notify = useCallback((message, type = "success") => {
    setToast({ message: String(message || "Done"), type, at: Date.now() });
  }, []);

  const persistLocalPrefs = useCallback((nextPrefs) => {
    try {
      localStorage.setItem("bidnsteal_admin_local_settings", JSON.stringify({ localSettings: nextPrefs }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bidnsteal_admin_local_settings");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const saved = parsed && typeof parsed === "object" ? parsed.localSettings : null;
      if (!saved || typeof saved !== "object") return;
      const next = {
        autoRefresh: Boolean(saved.autoRefresh),
        debug: Boolean(saved.debug),
        sidebarCollapsed: saved.sidebarCollapsed !== undefined ? Boolean(saved.sidebarCollapsed) : true
      };
      setLocalPrefs(next);
      setSidebarCollapsed(Boolean(next.sidebarCollapsed));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const ensureGate = useCallback(() => {
    if (!adminAuth.valid()) {
      navigate("/tufayel", { replace: true });
      return false;
    }
    return true;
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    adminAuth.clear();
    navigate("/tufayel", { replace: true });
  }, [navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const nextCollapsed = !prev;
      const nextPrefs = { ...localPrefs, sidebarCollapsed: nextCollapsed };
      setLocalPrefs(nextPrefs);
      persistLocalPrefs(nextPrefs);
      return nextCollapsed;
    });
  }, [localPrefs, persistLocalPrefs]);

  const saveLocalPref = useCallback(
    (key, value) => {
      const next = { ...localPrefs, [key]: value, sidebarCollapsed };
      setLocalPrefs(next);
      persistLocalPrefs(next);
      notify("Local preference saved.", "success");
    },
    [localPrefs, notify, persistLocalPrefs, sidebarCollapsed]
  );

  const selectTemplate = useCallback(async (key) => {
    const selectedKey = normalizeText(key);
    if (!selectedKey) return;
    const template = await apiRequest(`/admin/email-templates/${encodeURIComponent(selectedKey)}`);
    setTemplateEditor((prev) => ({
      ...prev,
      selectedKey: String(template?.key || selectedKey),
      key: String(template?.key || selectedKey),
      subjectTemplate: String(template?.subjectTemplate || ""),
      htmlTemplate: String(template?.htmlTemplate || "")
    }));
  }, []);

  const loadDashboard = useCallback(async () => {
    const [metrics, financial, ordersRes, productsRes, subscriberRes, reservationsRes] = await Promise.all([
      apiRequest("/metrics"),
      apiRequest("/admin/financial/summary"),
      apiRequest("/orders?page=1&limit=40"),
      apiRequest("/products?page=1&limit=80"),
      apiRequest("/admin/subscribers?page=1&limit=1"),
      apiRequest("/admin/reservations")
    ]);
    setData((prev) => ({
      ...prev,
      metrics: metrics || prev.metrics,
      financial: financial || prev.financial,
      orders: safeItems(ordersRes),
      products: safeItems(productsRes),
      subscribers: prev.subscribers,
      subscriberTotal: Number(subscriberRes?.total || 0),
      reservations: reservationsRes || prev.reservations
    }));
  }, []);

  const loadReports = useCallback(async () => {
    const [financial, health, ready] = await Promise.all([
      apiRequest("/admin/financial/summary"),
      apiRequest("/health").catch(() => ({ ok: false })),
      apiRequest("/ready").catch(() => ({ ok: false }))
    ]);
    setData((prev) => ({
      ...prev,
      financial: financial || prev.financial,
      health: {
        api: health?.ok ? "up" : "down",
        dependencies: ready?.ok ? "up" : "down",
        lastCheckedAt: new Date().toISOString()
      }
    }));
  }, []);

  const loadSettings = useCallback(
    async (forcedTemplateKey = "") => {
      const [templatesRes, smtpRes, courierRes] = await Promise.all([
        apiRequest("/admin/email-templates"),
        apiRequest("/admin/email-templates/transport/smtp"),
        apiRequest("/admin/courier/steadfast/settings")
      ]);

      const templates = safeItems(templatesRes);
      const keys = templates.map((item) => String(item?.key || "")).filter(Boolean);

      setData((prev) => ({ ...prev, templates }));
      setTemplateKeys(keys);

      setSmtpSettings((prev) => ({
        ...prev,
        enabled: Boolean(smtpRes?.enabled),
        host: String(smtpRes?.host || ""),
        port: Number(smtpRes?.port || 465),
        secure: Boolean(smtpRes?.secure),
        username: String(smtpRes?.username || ""),
        password: "",
        hasPassword: Boolean(smtpRes?.hasPassword),
        passwordMasked: String(smtpRes?.passwordMasked || ""),
        fromEmail: String(smtpRes?.fromEmail || ""),
        fromName: String(smtpRes?.fromName || ""),
        replyTo: String(smtpRes?.replyTo || ""),
        ignoreTLS: Boolean(smtpRes?.ignoreTLS),
        testEmail: prev.testEmail,
        saving: false,
        testing: false
      }));

      setCourierSettings((prev) => ({
        ...prev,
        provider: String(courierRes?.provider || "steadfast"),
        enabled: Boolean(courierRes?.enabled),
        baseUrl: String(courierRes?.baseUrl || "https://portal.packzy.com/api/v1"),
        apiKey: String(courierRes?.apiKey || ""),
        secretKey: "",
        hasSecret: Boolean(courierRes?.hasSecret),
        secretKeyMasked: String(courierRes?.secretKeyMasked || ""),
        fraudCheckerEnabled: Boolean(courierRes?.fraudCheckerEnabled),
        fraudCheckerEmail: String(courierRes?.fraudCheckerEmail || ""),
        fraudCheckerPassword: "",
        fraudCheckerHasPassword: Boolean(courierRes?.fraudCheckerHasPassword),
        fraudCheckerPasswordMasked: String(courierRes?.fraudCheckerPasswordMasked || ""),
        defaultDeliveryType: Number(courierRes?.defaultDeliveryType || 0) === 1 ? 1 : 0,
        defaultItemDescription: String(courierRes?.defaultItemDescription || "BidnSteal order"),
        balance: courierRes?.currentBalance ?? prev.balance,
        saving: false,
        balanceLoading: false
      }));

      const preferred = normalizeText(forcedTemplateKey) || normalizeText(templateEditor.selectedKey) || keys[0] || "";
      if (preferred) {
        await selectTemplate(preferred);
      }
    },
    [selectTemplate, templateEditor.selectedKey]
  );

  const loadTab = useCallback(
    async (tab) => {
      setTabLoading(true);
      setError("");
      try {
        if (tab === "dashboard") await loadDashboard();
        if (tab === "inventory") {
          const products = await apiRequest("/products?page=1&limit=100");
          setData((prev) => ({ ...prev, products: safeItems(products) }));
        }
        if (tab === "media") {
          const media = await apiRequest("/admin/media?page=1&limit=100");
          setData((prev) => ({ ...prev, media: safeItems(media) }));
        }
        if (tab === "auctions") {
          const auctions = await apiRequest("/admin/auctions?page=1&limit=120");
          setData((prev) => ({ ...prev, auctions: safeItems(auctions) }));
        }
        if (tab === "orders") {
          const orders = await apiRequest("/orders?page=1&limit=40");
          setData((prev) => ({ ...prev, orders: safeItems(orders) }));
        }
        if (tab === "users" || tab === "analytics") {
          const users = await apiRequest("/admin/users?page=1&limit=40");
          setData((prev) => ({ ...prev, users: safeItems(users) }));
        }
        if (tab === "subscribers") {
          const subscribers = await apiRequest("/admin/subscribers?page=1&limit=40");
          setData((prev) => ({ ...prev, subscribers: safeItems(subscribers) }));
        }
        if (tab === "campaigns") {
          const [campaigns, templates] = await Promise.all([
            apiRequest("/admin/campaigns?page=1&limit=40"),
            apiRequest("/admin/campaigns/templates?page=1&limit=100")
          ]);
          setData((prev) => ({ ...prev, campaigns: safeItems(campaigns), templates: safeItems(templates) }));
        }
        if (tab === "coupons") {
          const coupons = await apiRequest("/admin/coupons?page=1&limit=100");
          setData((prev) => ({ ...prev, coupons: safeItems(coupons) }));
        }
        if (tab === "reports") await loadReports();
        if (tab === "settings") await loadSettings();
      } catch (tabError) {
        setError(tabError?.message || "Failed to load tab.");
      } finally {
        setTabLoading(false);
      }
    },
    [loadDashboard, loadReports, loadSettings]
  );

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (!ensureGate()) return;
      try {
        setLoading(true);
        const me = await apiRequest("/auth/me").catch(() => ({ name: "Admin (Local)", role: "admin" }));
        if (!mounted) return;
        setUser(me);
        await loadDashboard();
      } catch (initError) {
        if (mounted) setError(initError?.message || "Failed to initialize.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [ensureGate, loadDashboard]);

  useEffect(() => {
    if (!loading && TABS.includes(activeTab)) {
      loadTab(activeTab);
    }
  }, [activeTab, loadTab, loading]);

  const mediaTemplateTags = useMemo(() => {
    const tags = [];
    const seen = new Set();
    (data.media || []).forEach((item) => {
      const file = String(item?.fileName || "").trim();
      if (!file) return;
      const normalized = file
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 60);
      if (!normalized) return;
      const tag = `{{media.${normalized}}}`;
      if (!seen.has(tag)) {
        seen.add(tag);
        tags.push(tag);
      }
    });
    return tags.slice(0, 50);
  }, [data.media]);

  const insertTemplateText = useCallback((text) => {
    const value = normalizeText(text);
    if (!value) return;
    setTemplateEditor((prev) => ({
      ...prev,
      htmlTemplate: prev.htmlTemplate ? `${prev.htmlTemplate}\n${value}` : value
    }));
  }, []);

  const createTemplate = useCallback(async () => {
    try {
      const key = normalizeText(templateEditor.key);
      if (!key || !normalizeText(templateEditor.subjectTemplate) || !normalizeText(templateEditor.htmlTemplate)) {
        throw new Error("Template key, subject, and html are required.");
      }
      await apiRequest("/admin/email-templates", {
        method: "POST",
        body: {
          key,
          subjectTemplate: templateEditor.subjectTemplate,
          htmlTemplate: templateEditor.htmlTemplate,
          isActive: true
        }
      });
      notify("Template created.", "success");
      await loadSettings(key);
    } catch (handlerError) {
      notify(handlerError?.message || "Failed to create template.", "error");
    }
  }, [loadSettings, notify, templateEditor.htmlTemplate, templateEditor.key, templateEditor.subjectTemplate]);

  const updateTemplate = useCallback(async () => {
    try {
      const key = normalizeText(templateEditor.selectedKey) || normalizeText(templateEditor.key);
      if (!key) throw new Error("Template key required.");
      await apiRequest(`/admin/email-templates/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: {
          subjectTemplate: templateEditor.subjectTemplate,
          htmlTemplate: templateEditor.htmlTemplate,
          isActive: true
        }
      });
      notify("Template updated.", "success");
      await loadSettings(key);
    } catch (handlerError) {
      notify(handlerError?.message || "Failed to update template.", "error");
    }
  }, [loadSettings, notify, templateEditor.htmlTemplate, templateEditor.key, templateEditor.selectedKey, templateEditor.subjectTemplate]);

  const previewTemplate = useCallback(async () => {
    try {
      const key = normalizeText(templateEditor.selectedKey) || normalizeText(templateEditor.key);
      if (!key) throw new Error("Template key required.");
      const preview = await apiRequest(`/admin/email-templates/${encodeURIComponent(key)}/preview`, {
        method: "POST",
        body: { data: {} }
      });
      setTemplatePreview({
        subject: String(preview?.subject || ""),
        html: String(preview?.html || "")
      });
      notify("Preview generated.", "success");
    } catch (handlerError) {
      notify(handlerError?.message || "Failed to generate preview.", "error");
    }
  }, [notify, templateEditor.key, templateEditor.selectedKey]);

  const testSendTemplate = useCallback(async () => {
    try {
      const key = normalizeText(templateEditor.selectedKey) || normalizeText(templateEditor.key);
      const email = normalizeText(templateEditor.testEmail);
      if (!key || !email) throw new Error("Template key and test email required.");
      await apiRequest(`/admin/email-templates/${encodeURIComponent(key)}/test-send`, {
        method: "POST",
        body: {
          email,
          data: {}
        }
      });
      notify("Test email sent.", "success");
    } catch (handlerError) {
      notify(handlerError?.message || "Failed to send test email.", "error");
    }
  }, [notify, templateEditor.key, templateEditor.selectedKey, templateEditor.testEmail]);

  const saveSmtp = useCallback(async () => {
    setSmtpSettings((prev) => ({ ...prev, saving: true }));
    try {
      const payload = {
        enabled: Boolean(smtpSettings.enabled),
        host: normalizeText(smtpSettings.host),
        port: Number(smtpSettings.port || 465),
        secure: Boolean(smtpSettings.secure),
        username: normalizeText(smtpSettings.username),
        fromEmail: normalizeText(smtpSettings.fromEmail),
        fromName: normalizeText(smtpSettings.fromName),
        replyTo: normalizeText(smtpSettings.replyTo),
        ignoreTLS: Boolean(smtpSettings.ignoreTLS)
      };

      const password = normalizeText(smtpSettings.password);
      if (payload.enabled) {
        if (!payload.host || !payload.username || !payload.fromEmail) {
          throw new Error("SMTP host, username and from email are required when SMTP is enabled.");
        }
        if (!password && !smtpSettings.hasPassword) {
          throw new Error("SMTP password is required when SMTP is enabled.");
        }
      }

      const body = password ? { ...payload, password } : payload;
      const saved = await apiRequest("/admin/email-templates/transport/smtp", {
        method: "PUT",
        body
      });

      setSmtpSettings((prev) => ({
        ...prev,
        enabled: Boolean(saved?.enabled),
        host: String(saved?.host || ""),
        port: Number(saved?.port || 465),
        secure: Boolean(saved?.secure),
        username: String(saved?.username || ""),
        password: "",
        hasPassword: Boolean(saved?.hasPassword),
        passwordMasked: String(saved?.passwordMasked || ""),
        fromEmail: String(saved?.fromEmail || ""),
        fromName: String(saved?.fromName || ""),
        replyTo: String(saved?.replyTo || ""),
        ignoreTLS: Boolean(saved?.ignoreTLS),
        saving: false,
        testing: prev.testing
      }));
      notify("SMTP settings saved.", "success");
    } catch (handlerError) {
      setSmtpSettings((prev) => ({ ...prev, saving: false }));
      notify(handlerError?.message || "Failed to save SMTP settings.", "error");
    }
  }, [notify, smtpSettings]);

  const sendSmtpTest = useCallback(async () => {
    setSmtpSettings((prev) => ({ ...prev, testing: true }));
    try {
      const to = normalizeText(smtpSettings.testEmail);
      if (!to) throw new Error("Enter a test recipient email.");
      await apiRequest("/admin/email-templates/transport/smtp/test", {
        method: "POST",
        body: { to }
      });
      notify(`SMTP test email sent to ${to}.`, "success");
    } catch (handlerError) {
      notify(handlerError?.message || "Failed to send SMTP test email.", "error");
    } finally {
      setSmtpSettings((prev) => ({ ...prev, testing: false }));
    }
  }, [notify, smtpSettings.testEmail]);

  const saveCourier = useCallback(async () => {
    setCourierSettings((prev) => ({ ...prev, saving: true }));
    try {
      const payload = {
        enabled: Boolean(courierSettings.enabled),
        baseUrl: normalizeText(courierSettings.baseUrl),
        apiKey: normalizeText(courierSettings.apiKey),
        secretKey: normalizeText(courierSettings.secretKey) || undefined,
        fraudCheckerEnabled: Boolean(courierSettings.fraudCheckerEnabled),
        fraudCheckerEmail: normalizeText(courierSettings.fraudCheckerEmail),
        fraudCheckerPassword: normalizeText(courierSettings.fraudCheckerPassword) || undefined,
        defaultDeliveryType: Number(courierSettings.defaultDeliveryType || 0) === 1 ? 1 : 0,
        defaultItemDescription: normalizeText(courierSettings.defaultItemDescription) || "BidnSteal order"
      };

      const saved = await apiRequest("/admin/courier/steadfast/settings", {
        method: "PUT",
        body: payload
      });

      setCourierSettings((prev) => ({
        ...prev,
        provider: String(saved?.provider || "steadfast"),
        enabled: Boolean(saved?.enabled),
        baseUrl: String(saved?.baseUrl || payload.baseUrl || "https://portal.packzy.com/api/v1"),
        apiKey: String(saved?.apiKey || payload.apiKey),
        secretKey: "",
        hasSecret: Boolean(saved?.hasSecret),
        secretKeyMasked: String(saved?.secretKeyMasked || ""),
        fraudCheckerEnabled: Boolean(saved?.fraudCheckerEnabled),
        fraudCheckerEmail: String(saved?.fraudCheckerEmail || payload.fraudCheckerEmail || ""),
        fraudCheckerPassword: "",
        fraudCheckerHasPassword: Boolean(saved?.fraudCheckerHasPassword),
        fraudCheckerPasswordMasked: String(saved?.fraudCheckerPasswordMasked || ""),
        defaultDeliveryType: Number(saved?.defaultDeliveryType || 0) === 1 ? 1 : 0,
        defaultItemDescription: String(saved?.defaultItemDescription || payload.defaultItemDescription),
        saving: false
      }));
      notify("Courier settings saved.", "success");
    } catch (handlerError) {
      setCourierSettings((prev) => ({ ...prev, saving: false }));
      notify(handlerError?.message || "Failed to save courier settings.", "error");
    }
  }, [courierSettings, notify]);

  const checkCourierBalance = useCallback(async () => {
    setCourierSettings((prev) => ({ ...prev, balanceLoading: true }));
    try {
      const response = await apiRequest("/admin/courier/steadfast/balance");
      setCourierSettings((prev) => ({
        ...prev,
        balance: Number(response?.currentBalance || 0),
        balanceLoading: false
      }));
      notify("Courier balance fetched.", "success");
    } catch (handlerError) {
      setCourierSettings((prev) => ({ ...prev, balanceLoading: false }));
      notify(handlerError?.message || "Failed to check courier balance.", "error");
    }
  }, [notify]);

  const topBuyers = useMemo(
    () =>
      data.users
        .filter((item) => Number(item.totalSpent || 0) > 0 || Number(item.orderCount || 0) > 0)
        .slice(0, 8),
    [data.users]
  );

  const todaySales = data.orders.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const lowStockItems = data.products.filter((p) => Number(p.stock || 0) <= 0).length;
  const pendingOrders = data.orders.filter((o) => String(o.fulfillmentStatus || "").toLowerCase() === "pending").length;
  const chart = buildChartSeries(revenueRange, data.financial);
  const stockHealthPercent =
    data.products.length === 0 ? 100 : Math.max(0, Math.min(100, ((data.products.length - lowStockItems) / data.products.length) * 100));

  const overviewCards = [
    { key: "sales", label: "TODAY SALES (BDT)", value: money(todaySales), status: "LIVE", icon: DollarSign },
    { key: "orders", label: "TODAY ORDERS", value: number(data.orders.length), status: "LIVE", icon: ShoppingCart },
    { key: "auctions", label: "LIVE AUCTIONS", value: number(data.metrics.liveAuctions), status: "ACTIVE", icon: Flame },
    { key: "low-stock", label: "LOW STOCK ITEMS", value: number(lowStockItems), status: "OK", icon: TriangleAlert }
  ];

  function exportFinancialCsv() {
    const rows = [
      ["metric", "value"],
      ["gmv", data.financial.gmv],
      ["netRevenue", data.financial.netRevenue],
      ["feesCollected", data.financial.feesCollected]
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-summary.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`admin-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className="admin-main">
        <AdminTopbar user={user} />
        <main className="admin-content">
          {error ? <div className="error-banner">{error}</div> : null}
          {loading ? <div className="loading">Loading admin panel...</div> : null}
          {!loading && tabLoading ? <div className="loading muted">Updating tab...</div> : null}

          {!loading && activeTab === "dashboard" ? (
            <>
              <section className="overview-head">
                <div>
                  <h2>Operations Overview</h2>
                  <p>
                    System status: <span className="ok-text">All systems operational</span>
                  </p>
                </div>
                <div className="overview-actions">
                  <button className="secondary-btn" type="button" onClick={() => loadDashboard()}>
                    Refresh Data
                  </button>
                  <button className="primary-btn" type="button" onClick={exportFinancialCsv}>
                    Export Financial CSV
                  </button>
                </div>
              </section>

              <section className="kpi-grid top">
                {overviewCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article className="kpi-card" key={card.key}>
                      <div className="kpi-head">
                        <div className="kpi-icon">
                          <Icon size={18} />
                        </div>
                        <span className="kpi-status">{card.status}</span>
                      </div>
                      <p className="kpi-label">{card.label}</p>
                      <p className="kpi-value">{card.value}</p>
                    </article>
                  );
                })}
              </section>

              <section className="kpi-grid sub">
                <article className="mini-card">
                  <p>PENDING ORDERS</p>
                  <strong>{number(pendingOrders)}</strong>
                </article>
                <article className="mini-card">
                  <p>7-DAY REVENUE</p>
                  <strong>{money(data.financial.netRevenue)}</strong>
                </article>
                <article className="mini-card">
                  <p>30-DAY REVENUE</p>
                  <strong>{money(data.financial.gmv)}</strong>
                </article>
                <article className="mini-card">
                  <p>NEW SUBSCRIBERS</p>
                  <strong>{number(data.subscriberTotal || 0)}</strong>
                </article>
              </section>

              <section className="dashboard-main-grid">
                <article className="card chart-card">
                  <div className="card-title-row">
                    <h3>Revenue Analytics</h3>
                    <div className="segment-toggle">
                      <button
                        type="button"
                        className={revenueRange === "7d" ? "active" : ""}
                        onClick={() => setRevenueRange("7d")}
                      >
                        7D
                      </button>
                      <button
                        type="button"
                        className={revenueRange === "30d" ? "active" : ""}
                        onClick={() => setRevenueRange("30d")}
                      >
                        30D
                      </button>
                    </div>
                  </div>
                  <MiniLineChart labels={chart.labels} values={chart.values} />
                </article>

                <article className="card inventory-card">
                  <h3>Inventory Snapshot</h3>
                  <div className="inventory-list">
                    <div className="inventory-row">
                      <span>Total Products</span>
                      <strong>{number(data.products.length)}</strong>
                    </div>
                    <div className="inventory-row">
                      <span>Out of Stock</span>
                      <strong className="danger-text">{number(lowStockItems)}</strong>
                    </div>
                    <div className="inventory-row">
                      <span>Reserved Units</span>
                      <strong className="info-text">
                        {number((data.reservations?.active || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0))}
                      </strong>
                    </div>
                    <div className="inventory-row">
                      <span>Total System Units</span>
                      <strong>{number(data.products.reduce((acc, item) => acc + Number(item.stock || 0), 0))}</strong>
                    </div>
                  </div>
                  <div className="stock-health">
                    <p>STOCK HEALTH</p>
                    <div className="bar">
                      <span style={{ width: `${stockHealthPercent}%` }} />
                    </div>
                    <small>{Math.round(stockHealthPercent)}% of inventory meets safety threshold.</small>
                  </div>
                </article>
              </section>
            </>
          ) : null}

          {!loading && activeTab === "inventory" ? (
            <DataTable
              columns={[
                { key: "title", label: "Title" },
                { key: "sku", label: "SKU" },
                { key: "price", label: "Price", render: (row) => money(row.price) },
                { key: "stock", label: "Stock", render: (row) => number(row.stock) },
                { key: "saleMode", label: "Mode" }
              ]}
              rows={data.products}
            />
          ) : null}

          {!loading && activeTab === "orders" ? (
            <DataTable
              columns={[
                { key: "orderNumber", label: "Order #" },
                { key: "total", label: "Total", render: (row) => money(row.total) },
                { key: "paymentStatus", label: "Payment" },
                { key: "fulfillmentStatus", label: "Fulfillment" },
                { key: "createdAt", label: "Date", render: (row) => dateTime(row.createdAt) }
              ]}
              rows={data.orders}
            />
          ) : null}

          {!loading && activeTab === "users" ? (
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "role", label: "Role" },
                { key: "orderCount", label: "Orders", render: (row) => number(row.orderCount) },
                { key: "totalSpent", label: "Spent", render: (row) => money(row.totalSpent) }
              ]}
              rows={data.users}
            />
          ) : null}

          {!loading && activeTab === "reports" ? (
            <div className="grid two">
              <section className="card">
                <h3>System Health</h3>
                <p>
                  API: <span className={`status-pill ${data.health.api}`}>{data.health.api}</span>
                </p>
                <p>
                  Mongo + Redis:{" "}
                  <span className={`status-pill ${data.health.dependencies}`}>{data.health.dependencies}</span>
                </p>
                <p className="muted">Last checked: {dateTime(data.health.lastCheckedAt)}</p>
                <button className="primary-btn" type="button" onClick={() => loadReports()}>
                  Check
                </button>
              </section>
              <section className="card">
                <h3>Financial Summary</h3>
                <p>GMV: {money(data.financial.gmv)}</p>
                <p>Net Revenue: {money(data.financial.netRevenue)}</p>
                <p>Fees Collected: {money(data.financial.feesCollected)}</p>
              </section>
            </div>
          ) : null}

          {!loading && activeTab === "settings" ? (
            <section className="settings-page">
              <div className="settings-head">
                <div>
                  <h2>System Settings</h2>
                  <p>Manage templates, Namecheap SMTP, courier integration, and local admin preferences.</p>
                </div>
                <button className="settings-btn settings-btn-soft" type="button" onClick={() => loadSettings()}>
                  Reload Settings
                </button>
              </div>

              <div className="settings-grid">
                <section className="settings-card settings-editor-card">
                  <div className="settings-card-title-row">
                    <h3>Email Template Editor</h3>
                    <span>LIVE BACKEND</span>
                  </div>

                  <div>
                    <label className="settings-label">Template Library</label>
                    <select
                      className="settings-input"
                      value={templateEditor.selectedKey}
                      onChange={async (event) => {
                        const value = event.target.value;
                        setTemplateEditor((prev) => ({ ...prev, selectedKey: value, key: value }));
                        if (value) {
                          try {
                            await selectTemplate(value);
                          } catch (handlerError) {
                            notify(handlerError?.message || "Failed to load template.", "error");
                          }
                        }
                      }}
                    >
                      <option value="">Select template</option>
                      {templateKeys.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="settings-two-grid">
                    <div>
                      <label className="settings-label">Template Key</label>
                      <input
                        className="settings-input"
                        value={templateEditor.key}
                        onChange={(event) => setTemplateEditor((prev) => ({ ...prev, key: event.target.value }))}
                        placeholder="template_key"
                      />
                    </div>
                    <div>
                      <label className="settings-label">Subject Line</label>
                      <input
                        className="settings-input"
                        value={templateEditor.subjectTemplate}
                        onChange={(event) => setTemplateEditor((prev) => ({ ...prev, subjectTemplate: event.target.value }))}
                        placeholder="Subject template"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="settings-label">HTML Body</label>
                    <textarea
                      className="settings-input settings-textarea"
                      value={templateEditor.htmlTemplate}
                      onChange={(event) => setTemplateEditor((prev) => ({ ...prev, htmlTemplate: event.target.value }))}
                      placeholder="HTML template..."
                    />
                  </div>

                  <div>
                    <label className="settings-label">Quick Placeholders</label>
                    <div className="template-tag-grid">
                      {TEMPLATE_PLACEHOLDERS.map((tag) => (
                        <button key={tag} type="button" className="template-tag-btn" onClick={() => insertTemplateText(`{{${tag}}}`)}>
                          {`{{${tag}}}`}
                        </button>
                      ))}
                    </div>
                    {mediaTemplateTags.length ? (
                      <>
                        <label className="settings-label settings-label-spaced">Media Auto Tags</label>
                        <div className="template-tag-grid media">
                          {mediaTemplateTags.map((tag) => (
                            <button key={tag} type="button" className="template-tag-btn media" onClick={() => insertTemplateText(tag)}>
                              {tag}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="settings-action-grid">
                    <button type="button" className="settings-btn settings-btn-primary" onClick={createTemplate}>
                      Create
                    </button>
                    <button type="button" className="settings-btn settings-btn-soft" onClick={updateTemplate}>
                      Update
                    </button>
                    <button type="button" className="settings-btn settings-btn-soft" onClick={previewTemplate}>
                      Preview
                    </button>
                    <button type="button" className="settings-btn settings-btn-soft" onClick={testSendTemplate}>
                      Test Send
                    </button>
                  </div>

                  <div>
                    <label className="settings-label">Test Email Address</label>
                    <input
                      className="settings-input"
                      value={templateEditor.testEmail}
                      onChange={(event) => setTemplateEditor((prev) => ({ ...prev, testEmail: event.target.value }))}
                      placeholder="test@email.com"
                    />
                  </div>
                </section>

                <div className="settings-stack">
                  <section className="settings-card">
                    <h3>Template Preview</h3>
                    <div className="preview-block">
                      <p className="preview-label">Subject</p>
                      <p className="preview-value">{templatePreview.subject || "No preview generated yet"}</p>
                    </div>
                    <div className="preview-block html">
                      <p className="preview-label">Rendered HTML</p>
                      <pre className="preview-html">{templatePreview.html || "No preview generated yet"}</pre>
                    </div>
                  </section>

                  <section className="settings-card">
                    <div className="settings-card-title-row">
                      <h3>Namecheap SMTP Mailer</h3>
                      <span>Used for all email notifications</span>
                    </div>

                    <div className="settings-two-grid">
                      <div>
                        <label className="settings-label">SMTP Host</label>
                        <input
                          className="settings-input"
                          value={smtpSettings.host}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, host: event.target.value }))}
                          placeholder="mail.privateemail.com"
                        />
                      </div>
                      <div>
                        <label className="settings-label">SMTP Port</label>
                        <input
                          className="settings-input"
                          type="number"
                          min="1"
                          max="65535"
                          value={smtpSettings.port}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, port: Number(event.target.value || 0) }))}
                        />
                      </div>
                      <div>
                        <label className="settings-label">SMTP Username</label>
                        <input
                          className="settings-input"
                          value={smtpSettings.username}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, username: event.target.value }))}
                          placeholder="no-reply@bidnsteal.com"
                        />
                      </div>
                      <div>
                        <label className="settings-label">SMTP Password</label>
                        <input
                          className="settings-input"
                          type="password"
                          value={smtpSettings.password}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, password: event.target.value }))}
                          placeholder={smtpSettings.hasPassword ? "Leave empty to keep current password" : "Enter SMTP password"}
                        />
                        {smtpSettings.hasPassword ? (
                          <p className="help-text">
                            Saved password: <span>{smtpSettings.passwordMasked}</span>
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className="settings-label">From Email</label>
                        <input
                          className="settings-input"
                          type="email"
                          value={smtpSettings.fromEmail}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, fromEmail: event.target.value }))}
                          placeholder="no-reply@bidnsteal.com"
                        />
                      </div>
                      <div>
                        <label className="settings-label">From Name</label>
                        <input
                          className="settings-input"
                          value={smtpSettings.fromName}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, fromName: event.target.value }))}
                          placeholder="BidnSteal"
                        />
                      </div>
                      <div className="settings-span-2">
                        <label className="settings-label">Reply-To Email (Optional)</label>
                        <input
                          className="settings-input"
                          type="email"
                          value={smtpSettings.replyTo}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, replyTo: event.target.value }))}
                          placeholder="support@bidnsteal.com"
                        />
                      </div>
                    </div>

                    <div className="settings-two-grid toggles">
                      <div className="toggle-card">
                        <div>
                          <p>Enable SMTP</p>
                          <small>Use Namecheap SMTP for all emails</small>
                        </div>
                        <ToggleField
                          checked={smtpSettings.enabled}
                          onChange={(value) => setSmtpSettings((prev) => ({ ...prev, enabled: value }))}
                        />
                      </div>
                      <div className="toggle-card">
                        <div>
                          <p>Use SSL/TLS</p>
                          <small>Recommended for Namecheap Private Email</small>
                        </div>
                        <ToggleField
                          checked={smtpSettings.secure}
                          onChange={(value) => setSmtpSettings((prev) => ({ ...prev, secure: value }))}
                        />
                      </div>
                      <div className="toggle-card settings-span-2">
                        <div>
                          <p>Ignore TLS</p>
                          <small>Only use if your SMTP certificate chain is misconfigured.</small>
                        </div>
                        <ToggleField
                          checked={smtpSettings.ignoreTLS}
                          onChange={(value) => setSmtpSettings((prev) => ({ ...prev, ignoreTLS: value }))}
                        />
                      </div>
                    </div>

                    <div className="settings-test-row">
                      <div>
                        <label className="settings-label">SMTP Test Recipient</label>
                        <input
                          className="settings-input"
                          type="email"
                          value={smtpSettings.testEmail}
                          onChange={(event) => setSmtpSettings((prev) => ({ ...prev, testEmail: event.target.value }))}
                          placeholder="test@yourmail.com"
                        />
                      </div>
                      <button type="button" className="settings-btn settings-btn-primary" onClick={saveSmtp}>
                        {smtpSettings.saving ? "Saving..." : "Save SMTP"}
                      </button>
                      <button type="button" className="settings-btn settings-btn-soft" onClick={sendSmtpTest}>
                        {smtpSettings.testing ? "Sending..." : "Send Test"}
                      </button>
                    </div>
                  </section>

                  <section className="settings-card">
                    <div className="settings-card-title-row">
                      <h3>Courier Integration (Steadfast)</h3>
                      <button type="button" className="settings-btn settings-btn-soft" onClick={checkCourierBalance}>
                        {courierSettings.balanceLoading ? "Checking..." : "Check Balance"}
                      </button>
                    </div>

                    <div className="settings-two-grid toggles">
                      <div className="toggle-card">
                        <div>
                          <p>Enable Courier Dispatch</p>
                          <small>Turn on direct order push to Steadfast.</small>
                        </div>
                        <ToggleField
                          checked={courierSettings.enabled}
                          onChange={(value) => setCourierSettings((prev) => ({ ...prev, enabled: value }))}
                        />
                      </div>
                      <div className="balance-card">
                        <p>Current Balance</p>
                        <strong>
                          {courierSettings.balance === null || courierSettings.balance === undefined
                            ? "-"
                            : money(courierSettings.balance)}
                        </strong>
                      </div>
                    </div>

                    <div className="settings-two-grid">
                      <div>
                        <label className="settings-label">Base URL</label>
                        <input
                          className="settings-input"
                          value={courierSettings.baseUrl}
                          onChange={(event) => setCourierSettings((prev) => ({ ...prev, baseUrl: event.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="settings-label">API Key</label>
                        <input
                          className="settings-input"
                          value={courierSettings.apiKey}
                          onChange={(event) => setCourierSettings((prev) => ({ ...prev, apiKey: event.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="settings-label">Secret Key</label>
                        <input
                          className="settings-input"
                          type="password"
                          value={courierSettings.secretKey}
                          onChange={(event) => setCourierSettings((prev) => ({ ...prev, secretKey: event.target.value }))}
                          placeholder={courierSettings.hasSecret ? "Leave empty to keep current secret" : "Enter secret key"}
                        />
                        {courierSettings.hasSecret ? (
                          <p className="help-text">
                            Saved: <span>{courierSettings.secretKeyMasked}</span>
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className="settings-label">Default Delivery Type</label>
                        <select
                          className="settings-input"
                          value={courierSettings.defaultDeliveryType}
                          onChange={(event) =>
                            setCourierSettings((prev) => ({
                              ...prev,
                              defaultDeliveryType: Number(event.target.value || 0) === 1 ? 1 : 0
                            }))
                          }
                        >
                          <option value={0}>Home Delivery</option>
                          <option value={1}>Point Delivery</option>
                        </select>
                      </div>
                      <div className="settings-span-2">
                        <label className="settings-label">Item Description Template</label>
                        <input
                          className="settings-input"
                          value={courierSettings.defaultItemDescription}
                          onChange={(event) =>
                            setCourierSettings((prev) => ({ ...prev, defaultItemDescription: event.target.value }))
                          }
                          placeholder="BidnSteal order"
                        />
                      </div>
                    </div>

                    <div className="settings-two-grid toggles">
                      <div className="toggle-card settings-span-2">
                        <div>
                          <p>Enable Customer Success Check</p>
                          <small>Use Steadfast merchant login to fetch customer courier history.</small>
                        </div>
                        <ToggleField
                          checked={courierSettings.fraudCheckerEnabled}
                          onChange={(value) => setCourierSettings((prev) => ({ ...prev, fraudCheckerEnabled: value }))}
                        />
                      </div>
                      <div>
                        <label className="settings-label">Steadfast Login Email</label>
                        <input
                          className="settings-input"
                          type="email"
                          value={courierSettings.fraudCheckerEmail}
                          onChange={(event) =>
                            setCourierSettings((prev) => ({ ...prev, fraudCheckerEmail: event.target.value }))
                          }
                          placeholder="login@merchant.com"
                        />
                      </div>
                      <div>
                        <label className="settings-label">Steadfast Login Password</label>
                        <input
                          className="settings-input"
                          type="password"
                          value={courierSettings.fraudCheckerPassword}
                          onChange={(event) =>
                            setCourierSettings((prev) => ({ ...prev, fraudCheckerPassword: event.target.value }))
                          }
                          placeholder={
                            courierSettings.fraudCheckerHasPassword
                              ? "Leave empty to keep current password"
                              : "Enter login password"
                          }
                        />
                        {courierSettings.fraudCheckerHasPassword ? (
                          <p className="help-text">
                            Saved: <span>{courierSettings.fraudCheckerPasswordMasked}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="settings-row-end">
                      <button type="button" className="settings-btn settings-btn-primary" onClick={saveCourier}>
                        {courierSettings.saving ? "Saving..." : "Save Courier Settings"}
                      </button>
                    </div>
                  </section>

                  <section className="settings-card">
                    <h3>Local Admin Preferences</h3>
                    <div className="settings-two-grid toggles">
                      <div className="toggle-card">
                        <div>
                          <p>Auto Refresh Tabs</p>
                          <small>Refresh module data when switching tabs.</small>
                        </div>
                        <ToggleField checked={localPrefs.autoRefresh} onChange={(value) => saveLocalPref("autoRefresh", value)} />
                      </div>
                      <div className="toggle-card">
                        <div>
                          <p>Debug Logs</p>
                          <small>Show detailed logs in browser console.</small>
                        </div>
                        <ToggleField checked={localPrefs.debug} onChange={(value) => saveLocalPref("debug", value)} />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          ) : null}

          {!loading && activeTab === "analytics" ? (
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "orderCount", label: "Orders", render: (row) => number(row.orderCount) },
                { key: "totalSpent", label: "Spent", render: (row) => money(row.totalSpent) }
              ]}
              rows={topBuyers}
              emptyText="No top buyers yet."
            />
          ) : null}

          {!loading &&
          !["dashboard", "inventory", "orders", "users", "reports", "settings", "analytics"].includes(activeTab) ? (
            <section className="card">
              <h3>{activeTab[0].toUpperCase() + activeTab.slice(1)}</h3>
              <p className="muted">This module is now React-based and connected. Expand this view next.</p>
            </section>
          ) : null}
        </main>
      </div>

      {toast ? (
        <div className={`admin-toast ${toast.type === "error" ? "error" : "success"}`}>{toast.message}</div>
      ) : null}
    </div>
  );
}
