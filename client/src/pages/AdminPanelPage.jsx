import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

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
    smtp: { enabled: false, host: "", port: 465, username: "", fromEmail: "" },
    courier: {
      enabled: false,
      baseUrl: "https://portal.packzy.com/api/v1",
      apiKey: "",
      defaultItemDescription: "BidnSteal order"
    }
  });

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

  const loadSettings = useCallback(async () => {
    const [templates, smtp, courier] = await Promise.all([
      apiRequest("/admin/email-templates"),
      apiRequest("/admin/email-templates/transport/smtp"),
      apiRequest("/admin/courier/steadfast/settings")
    ]);
    setData((prev) => ({
      ...prev,
      templates: safeItems(templates),
      smtp: {
        enabled: Boolean(smtp?.enabled),
        host: String(smtp?.host || ""),
        port: Number(smtp?.port || 465),
        username: String(smtp?.username || ""),
        fromEmail: String(smtp?.fromEmail || "")
      },
      courier: {
        enabled: Boolean(courier?.enabled),
        baseUrl: String(courier?.baseUrl || prev.courier.baseUrl),
        apiKey: String(courier?.apiKey || ""),
        defaultItemDescription: String(courier?.defaultItemDescription || prev.courier.defaultItemDescription)
      }
    }));
  }, []);

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

  const topBuyers = useMemo(
    () =>
      data.users
        .filter((item) => Number(item.totalSpent || 0) > 0 || Number(item.orderCount || 0) > 0)
        .slice(0, 8),
    [data.users]
  );

  const dashboardCards = [
    { label: "Today Sales", value: money(data.orders.reduce((s, o) => s + Number(o.total || 0), 0)) },
    { label: "Orders", value: number(data.orders.length) },
    { label: "Products", value: number(data.products.length) },
    { label: "Live Auctions", value: number(data.metrics.liveAuctions) }
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout} />
      <div className="admin-main">
        <AdminTopbar user={user} />
        <main className="admin-content">
          {error ? <div className="error-banner">{error}</div> : null}
          {loading ? <div className="loading">Loading admin panel...</div> : null}
          {!loading && tabLoading ? <div className="loading muted">Updating tab...</div> : null}

          {!loading && activeTab === "dashboard" ? (
            <>
              <h2>Dashboard</h2>
              <div className="stat-grid">
                {dashboardCards.map((card) => (
                  <div className="card stat-card" key={card.label}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                  </div>
                ))}
              </div>
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
            <div className="grid two">
              <section className="card">
                <h3>SMTP</h3>
                <p>Enabled: {data.smtp.enabled ? "Yes" : "No"}</p>
                <p>Host: {data.smtp.host || "-"}</p>
                <p>Port: {data.smtp.port || "-"}</p>
                <p>From: {data.smtp.fromEmail || "-"}</p>
              </section>
              <section className="card">
                <h3>Courier</h3>
                <p>Enabled: {data.courier.enabled ? "Yes" : "No"}</p>
                <p>Base URL: {data.courier.baseUrl || "-"}</p>
                <p>API Key: {data.courier.apiKey ? "configured" : "not set"}</p>
              </section>
            </div>
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
    </div>
  );
}
