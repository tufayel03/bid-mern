(function attachAdminPanelMethods(global) {
  const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

  global.adminPanelMethods = {
    defaultCourierSettings() {
      return {
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
        balanceLoading: false,
        saving: false
      };
    },

    ensureCourierSettings() {
      const defaults = this.defaultCourierSettings();
      const current =
        this.courierSettings && typeof this.courierSettings === "object" ? this.courierSettings : {};
      this.courierSettings = {
        ...defaults,
        ...current,
        provider: current.provider || defaults.provider,
        enabled: Boolean(current.enabled),
        fraudCheckerEnabled: Boolean(current.fraudCheckerEnabled),
        defaultDeliveryType: Number(current.defaultDeliveryType || 0) === 1 ? 1 : 0
      };
      return this.courierSettings;
    },

    courierDispatchEnabled() {
      return Boolean(
        this.courierSettings &&
          typeof this.courierSettings === "object" &&
          this.courierSettings.enabled
      );
    },

    toggleCourierDispatchEnabled() {
      try {
        const settings = this.ensureCourierSettings();
        this.courierSettings = {
          ...settings,
          enabled: !Boolean(settings.enabled)
        };
      } catch (error) {
        console.error("[admin] courier toggle failed", error);
        this.courierSettings = this.defaultCourierSettings();
        this.notify("Recovered courier settings state. Please try again.", "error");
      }
    },

    toggleFraudCheckerEnabled() {
      try {
        const settings = this.ensureCourierSettings();
        this.courierSettings = {
          ...settings,
          fraudCheckerEnabled: !Boolean(settings.fraudCheckerEnabled)
        };
      } catch (error) {
        console.error("[admin] fraud checker toggle failed", error);
        this.courierSettings = this.defaultCourierSettings();
        this.notify("Recovered success-check settings state. Please try again.", "error");
      }
    },

    setCourierDispatchEnabled(value) {
      const settings = this.ensureCourierSettings();
      settings.enabled = String(value) === "true";
      this.courierSettings = settings;
    },

    resetCourierSettingsState() {
      this.courierSettings = this.defaultCourierSettings();
      this.notify("Courier settings state recovered.", "success");
    },

    async init() {
      this.restoreLocalSettings();
      this.ensureCourierSettings();
      this.refreshIcons();
      await this.bootstrap();
      setInterval(() => this.updateAuctionTimers(), 1000);
    },

    async bootstrap() {
      this.isLoading = true;
      try {
        await this.loadCurrentUser();
        await this.loadDashboard(true);
        this.loadedTabs.dashboard = true;
        this.markTabLoaded("dashboard");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.isLoading = false;
        this.refreshIcons();
      }
    },

    refreshIcons() {
      if (!window.lucide) return;
      if (this.__iconRefreshScheduled) return;
      this.__iconRefreshScheduled = true;
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          try {
            if (window.lucide) {
              window.lucide.createIcons();
            }
          } finally {
            this.__iconRefreshScheduled = false;
          }
        });
      });
    },

    setActiveTab(tab) {
      if (!tab) return;
      if (this.activeTab === tab) {
        this.showSearch = false;
        return;
      }
      this.activeTab = tab;
      this.showSearch = false;
      const shouldBackgroundLoad = Boolean(this.loadedTabs[tab]);
      requestAnimationFrame(() => {
        this.loadTab(tab, { background: shouldBackgroundLoad });
      });
    },

    tabCacheTtlMs(tab) {
      if (tab === "dashboard" || tab === "analytics" || tab === "reports") return 45_000;
      if (tab === "orders" || tab === "inventory" || tab === "auctions") return 60_000;
      return 90_000;
    },

    markTabLoaded(tab) {
      if (!this.__tabLoadedAt || typeof this.__tabLoadedAt !== "object") {
        this.__tabLoadedAt = {};
      }
      this.__tabLoadedAt[tab] = Date.now();
    },

    shouldReloadTab(tab, force = false) {
      if (force) return true;
      if (!this.loadedTabs[tab]) return true;
      if (!this.localSettings.autoRefresh) return false;
      const loadedAt = Number(this.__tabLoadedAt?.[tab] || 0);
      if (!loadedAt) return true;
      return Date.now() - loadedAt >= this.tabCacheTtlMs(tab);
    },

    toggleSidebarCollapse() {
      this.localSettings.sidebarCollapsed = !Boolean(this.localSettings.sidebarCollapsed);
      this.persistLocalSettings();
    },

    setAuctionView(view) {
      const nextView = String(view || "").toLowerCase() === "column" ? "column" : "grid";
      if (this.localSettings.auctionView === nextView) {
        return;
      }
      this.localSettings.auctionView = nextView;
      this.persistLocalSettings();
    },

    async loadTab(tab, options = {}) {
      const force = Boolean(options.force);
      const background = Boolean(options.background);
      if (!this.shouldReloadTab(tab, force)) {
        this.refreshIcons();
        return;
      }

      if (!this.__pendingTabLoads || typeof this.__pendingTabLoads !== "object") {
        this.__pendingTabLoads = {};
      }
      if (this.__pendingTabLoads[tab] && !force) {
        return this.__pendingTabLoads[tab];
      }

      const task = (async () => {
        if (!background) {
          this.isLoading = true;
        }
        try {
          if (tab === "dashboard") await this.loadDashboard();
          if (tab === "inventory") await this.loadInventory();
          if (tab === "media") await this.loadMedia();
          if (tab === "auctions") await this.loadAuctions();
          if (tab === "orders") await this.loadOrders();
          if (tab === "users") await this.loadUsers();
          if (tab === "subscribers") await this.loadSubscribers();
          if (tab === "campaigns") await this.loadCampaigns();
          if (tab === "coupons") await this.loadCoupons();
          if (tab === "analytics") await this.loadAnalytics();
          if (tab === "reports") await this.loadReports();
          if (tab === "settings") await this.loadSettings();
          this.loadedTabs[tab] = true;
          this.markTabLoaded(tab);
        } catch (error) {
          this.notify(this.errorMessage(error), "error");
        } finally {
          if (!background) {
            this.isLoading = false;
          }
          this.refreshIcons();
        }
      })();

      this.__pendingTabLoads[tab] = task;
      try {
        await task;
      } finally {
        if (this.__pendingTabLoads[tab] === task) {
          delete this.__pendingTabLoads[tab];
        }
      }
    },

    withBaseUrl(path) {
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      const base = this.apiBase.endsWith("/") ? this.apiBase.slice(0, -1) : this.apiBase;
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `${base}${normalizedPath}`;
    },

    async readPayload(response) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return response.json();
      }
      return response.text();
    },

    persistRenewedAccessToken(response) {
      return response;
    },

    isCsrfFailure(payload) {
      return payload && typeof payload === "object" && payload.message === "CSRF validation failed";
    },

    async fetchCsrfToken(forceRefresh = false) {
      if (!forceRefresh && this.csrfTokenCache) {
        return this.csrfTokenCache;
      }

      if (!forceRefresh && this.csrfTokenRequest) {
        return this.csrfTokenRequest;
      }

      this.csrfTokenRequest = (async () => {
        try {
          const response = await fetch(this.withBaseUrl("/csrf-token"), {
            method: "GET",
            credentials: "include",
            cache: "no-store"
          });
          const payload = await this.readPayload(response);
          if (response.ok && payload && typeof payload === "object" && typeof payload.csrfToken === "string") {
            this.csrfTokenCache = payload.csrfToken;
            return this.csrfTokenCache;
          }
          return null;
        } catch {
          return null;
        } finally {
          this.csrfTokenRequest = null;
        }
      })();

      return this.csrfTokenRequest;
    },
    async apiRequest(path, options = {}) {
      const method = (options.method || "GET").toUpperCase();
      const headers = new Headers(options.headers || {});
      const needsCsrf = !SAFE_HTTP_METHODS.has(method);

      if (options.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      if (needsCsrf && !headers.has("x-csrf-token")) {
        const csrf = await this.fetchCsrfToken();
        if (csrf) headers.set("x-csrf-token", csrf);
      }

      const sendRequest = async () => {
        const response = await fetch(this.withBaseUrl(path), {
          method,
          credentials: "include",
          headers,
          cache: method === "GET" ? "default" : "no-store",
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined
        });
        this.persistRenewedAccessToken(response);
        const payload = await this.readPayload(response);
        return { response, payload };
      };

      let result = await sendRequest();

      if (needsCsrf && result.response.status === 403 && this.isCsrfFailure(result.payload)) {
        const refreshed = await this.fetchCsrfToken(true);
        if (refreshed) {
          headers.set("x-csrf-token", refreshed);
          result = await sendRequest();
        }
      }

      if (!result.response.ok) {
        const message =
          result.payload && typeof result.payload === "object" && typeof result.payload.message === "string"
            ? result.payload.message
            : `Request failed (${result.response.status})`;
        const error = new Error(message);
        error.status = result.response.status;
        error.payload = result.payload;
        throw error;
      }

      return result.payload;
    },

    async loadCurrentUser() {
      try {
        this.authUser = await this.apiRequest("/auth/me");
        if (!this.authUser || this.authUser.role !== "admin") {
          throw new Error("Admin access required.");
        }
      } catch {
        throw new Error("Admin session not found. Please login at /auth/login.");
      }
    },

    normalizeStatus(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "_");
    },

    courierStatusLabel(value) {
      const normalized = this.normalizeStatus(value || "");
      if (!normalized) return "Not Synced";
      return normalized.replace(/_/g, " ");
    },

    courierStatusClass(value) {
      const normalized = this.normalizeStatus(value || "");
      if (!normalized) return "status-ended";
      if (normalized.includes("delivered")) return "status-delivered";
      if (normalized.includes("cancelled")) return "status-cancelled";
      if (normalized === "hold") return "status-low";
      if (
        normalized === "pending" ||
        normalized === "in_review" ||
        normalized === "unknown" ||
        normalized.endsWith("_approval_pending")
      ) {
        return "status-processing";
      }
      return "status-ended";
    },

    number(value) {
      return new Intl.NumberFormat("en-US").format(Number(value || 0));
    },

    currency(value) {
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0
      }).format(Number(value || 0));
    },

    orderItemSubtotal(item) {
      return (Number(item?.qty) || 0) * (Number(item?.unitPrice) || 0);
    },

    orderItemImage(item) {
      const candidates = [
        item?.imageUrl,
        item?.image,
        item?.imageSnapshot,
        item?.thumbnailUrl,
        Array.isArray(item?.images) ? item.images[0] : undefined
      ];
      const raw = candidates
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .find((value) => Boolean(value));
      return raw ? this.mediaUrl(raw) : "";
    },

    orderItemInitial(item) {
      const source = String(item?.titleSnapshot || "I").trim();
      return source ? source.charAt(0).toUpperCase() : "I";
    },

    compactCurrency(value) {
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        notation: "compact",
        maximumFractionDigits: 1
      }).format(Number(value || 0));
    },

    date(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    },

    dateTime(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    },

    time(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    },

    productIdentifier(item) {
      const identifier = item?.id || item?._id || item?.slug || "";
      return String(identifier).trim();
    },

    toQueryString(params) {
      const q = new URLSearchParams();
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          q.set(key, String(value));
        }
      });
      return q.toString();
    },

    buildDailyRevenueSeries(orders, days) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const map = new Map();
      const labels = [];
      for (let i = days - 1; i >= 0; i -= 1) {
        const bucketDate = new Date(today);
        bucketDate.setDate(today.getDate() - i);
        const key = bucketDate.toISOString().slice(0, 10);
        map.set(key, 0);
        labels.push(
          bucketDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          })
        );
      }

      (orders || []).forEach((order) => {
        const created = new Date(order.createdAt);
        if (Number.isNaN(created.getTime())) return;
        created.setHours(0, 0, 0, 0);
        const key = created.toISOString().slice(0, 10);
        if (!map.has(key)) return;
        map.set(key, map.get(key) + Number(order.total || 0));
      });

      return {
        labels,
        values: Array.from(map.values())
      };
    },

    setRevenueWindow(windowKey) {
      if (windowKey !== "7d" && windowKey !== "30d") return;
      this.revenueWindow = windowKey;
      this.renderRevenueChart();
    },
    async loadDashboard(force = false) {
      const [metrics, financial, ordersRes, productsRes, subscribersRes, reservationsRes] = await Promise.all([
        this.apiRequest("/metrics"),
        this.apiRequest("/admin/financial/summary"),
        this.apiRequest("/orders?page=1&limit=60"),
        this.apiRequest("/products?page=1&limit=60&sort=newest"),
        this.apiRequest("/admin/subscribers?page=1&limit=1"),
        this.apiRequest("/admin/reservations")
      ]);

      const orders = Array.isArray(ordersRes.items) ? ordersRes.items : [];
      const products = Array.isArray(productsRes.items) ? productsRes.items : [];
      const activeReservations = Array.isArray(reservationsRes.active) ? reservationsRes.active : [];

      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartMs = todayStart.getTime();

      let todayRevenue = 0;
      let todayOrders = 0;
      let sevenDayRevenue = 0;
      let thirtyDayRevenue = 0;
      let pendingOrders = 0;
      const statusCounts = { delivered: 0, processing: 0, cancelled: 0, pending: 0, shipped: 0 };

      orders.forEach((order) => {
        const createdAt = new Date(order.createdAt).getTime();
        const total = Number(order.total || 0);
        if (createdAt >= todayStartMs) {
          todayOrders += 1;
          todayRevenue += total;
        }
        if (now - createdAt <= 7 * 24 * 60 * 60 * 1000) sevenDayRevenue += total;
        if (now - createdAt <= 30 * 24 * 60 * 60 * 1000) thirtyDayRevenue += total;
        if (order.fulfillmentStatus === "pending") pendingOrders += 1;
        if (statusCounts[order.fulfillmentStatus] !== undefined) {
          statusCounts[order.fulfillmentStatus] += 1;
        }
      });

      const reservedByProduct = {};
      let reservedUnits = 0;
      activeReservations.forEach((reservation) => {
        (reservation.items || []).forEach((item) => {
          const qty = Number(item.qty || 0);
          reservedByProduct[item.productId] = (reservedByProduct[item.productId] || 0) + qty;
          reservedUnits += qty;
        });
      });

      const lowStockItems = products.filter((p) => Number(p.stock || 0) <= 5).length;
      const outOfStock = products.filter((p) => Number(p.stock || 0) <= 0).length;
      const totalUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
      const stockHealth = totalUnits > 0 ? Math.round(Math.max(0, Math.min(100, ((totalUnits - reservedUnits) / totalUnits) * 100))) : 100;

      this.kpisRow1 = [
        { label: "Today Sales (BDT)", value: this.number(todayRevenue), icon: "dollar-sign", trend: "LIVE", trendUp: true },
        { label: "Today Orders", value: this.number(todayOrders), icon: "shopping-cart", trend: "LIVE", trendUp: true },
        { label: "Live Auctions", value: this.number(metrics.liveAuctions || 0), icon: "flame", trend: "ACTIVE", trendUp: true },
        { label: "Low Stock Items", value: this.number(lowStockItems), icon: "alert-triangle", trend: lowStockItems > 0 ? "CHECK" : "OK", trendUp: lowStockItems === 0 }
      ];

      this.kpisRow2 = [
        { label: "Pending Orders", value: this.number(pendingOrders) },
        { label: "7-Day Revenue", value: this.compactCurrency(sevenDayRevenue) },
        { label: "30-Day Revenue", value: this.compactCurrency(thirtyDayRevenue) },
        { label: "New Subscribers", value: this.number(subscribersRes.total || 0) }
      ];

      this.inventoryStats = {
        totalProducts: Number(productsRes.total || products.length),
        outOfStock,
        reservedUnits,
        totalUnits,
        stockHealth
      };

      this.recentOrders = orders.slice(0, 8).map((order) => ({
        ...order,
        customer: order.customer || order.customerName || "-",
        status: order.fulfillmentStatus || "pending"
      }));
      this.orders = orders;
      this.orderDrafts = {};
      orders.forEach((order) => {
        this.orderDrafts[order.id] = {
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus
        };
      });

      this.revenueSeries["7d"] = this.buildDailyRevenueSeries(orders, 7);
      this.revenueSeries["30d"] = this.buildDailyRevenueSeries(orders, 30);
      this.renderRevenueChart();
      this.renderOrdersPie(statusCounts);
      this.financialSummary = { ...this.financialSummary, ...financial };

      this.topProducts = products
        .map((item) => {
          const identifier = this.productIdentifier(item);
          const reservedCount = Number(
            reservedByProduct[identifier] ||
            reservedByProduct[item.id] ||
            reservedByProduct[item._id] ||
            0
          );
          return {
            id: identifier,
            title: item.title,
            percent: Math.min(
              100,
              Math.round((Number(item.stock || 0) / Math.max(1, Number(item.stock || 0) + reservedCount)) * 100)
            )
          };
        })
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 6);

      await this.loadAuctions(true);
      if (force) {
        this.loadedTabs.analytics = false;
      }
    },

    async loadInventory() {
      const saleMode = this.inventoryFilters.saleMode === "All Sale Modes"
        ? ""
        : this.inventoryFilters.saleMode === "Fixed Price"
          ? "fixed"
          : "auction";

      const productsRes = await this.apiRequest(`/products?${this.toQueryString({
        page: 1,
        limit: 100,
        search: this.inventoryFilters.search,
        saleMode
      })}`);

      const reservationsRes = await this.apiRequest("/admin/reservations");
      const reservedByProduct = {};
      (reservationsRes.active || []).forEach((reservation) => {
        (reservation.items || []).forEach((item) => {
          reservedByProduct[item.productId] = (reservedByProduct[item.productId] || 0) + Number(item.qty || 0);
        });
      });

      this.inventory = (productsRes.items || []).map((item) => {
        const identifier = this.productIdentifier(item);
        const firstImage = Array.isArray(item.images) ? item.images[0] || "" : "";
        return {
          id: identifier,
          title: item.title,
          sku: item.sku || item.slug,
          slug: item.slug,
          mode: item.saleMode === "fixed" ? "Fixed" : item.saleMode === "auction" ? "Auction" : "Hybrid",
          price: Number(item.price || 0),
          stock: Number(item.stock || 0),
          reserved: Number(
            reservedByProduct[identifier] ||
            reservedByProduct[item.id] ||
            reservedByProduct[item._id] ||
            0
          ),
          image: this.mediaUrl(firstImage),
          isFeatured: Boolean(item.isFeatured),
          isNewDrop: Boolean(item.isNewDrop),
          series: item.series || "",
          condition: item.condition,
          saleMode: item.saleMode
        };
      });
      this.syncInventorySelection();
    },

    syncInventorySelection() {
      const next = {};
      this.inventory.forEach((item) => {
        const key = this.productIdentifier(item);
        if (key && this.inventorySelection[key]) {
          next[key] = true;
        }
      });
      this.inventorySelection = next;
    },

    isInventorySelected(item) {
      const key = this.productIdentifier(item);
      return key ? Boolean(this.inventorySelection[key]) : false;
    },

    toggleInventorySelection(item) {
      const key = this.productIdentifier(item);
      if (!key) return;
      if (this.inventorySelection[key]) {
        delete this.inventorySelection[key];
      } else {
        this.inventorySelection[key] = true;
      }
      this.inventorySelection = { ...this.inventorySelection };
    },

    selectAllVisibleInventory() {
      const next = { ...this.inventorySelection };
      this.inventory.forEach((item) => {
        const key = this.productIdentifier(item);
        if (key) {
          next[key] = true;
        }
      });
      this.inventorySelection = next;
    },

    clearInventorySelection() {
      this.inventorySelection = {};
    },

    selectedInventoryIds() {
      return Object.keys(this.inventorySelection).filter((key) => Boolean(this.inventorySelection[key]));
    },

    selectedInventoryCount() {
      return this.selectedInventoryIds().length;
    },

    async loadMedia(searchOverride) {
      const search = typeof searchOverride === "string" ? searchOverride : this.mediaFilters.search;
      const response = await this.apiRequest(`/admin/media?${this.toQueryString({
        search
      })}`);
      this.mediaAssets = response.items || [];
      this.syncMediaSelection();
    },

    filteredMediaAssets() {
      const search = String(this.mediaFilters.search || "").toLowerCase().trim();
      if (!search) {
        return this.mediaAssets;
      }
      return this.mediaAssets.filter((item) => {
        const fileName = String(item.fileName || "").toLowerCase();
        const templateTag = this.mediaTemplateTag(item.fileName).toLowerCase();
        return fileName.includes(search) || templateTag.includes(search);
      });
    },

    syncMediaSelection() {
      const next = {};
      this.mediaAssets.forEach((item) => {
        const key = String(item?.fileName || "").trim();
        if (key && this.mediaSelection[key]) {
          next[key] = true;
        }
      });
      this.mediaSelection = next;
    },

    isMediaSelected(item) {
      const key = String(item?.fileName || "").trim();
      return key ? Boolean(this.mediaSelection[key]) : false;
    },

    toggleMediaSelection(item) {
      const key = String(item?.fileName || "").trim();
      if (!key) return;
      if (this.mediaSelection[key]) {
        delete this.mediaSelection[key];
      } else {
        this.mediaSelection[key] = true;
      }
      this.mediaSelection = { ...this.mediaSelection };
    },

    selectAllVisibleMedia() {
      const next = { ...this.mediaSelection };
      this.filteredMediaAssets().forEach((item) => {
        const key = String(item?.fileName || "").trim();
        if (key) {
          next[key] = true;
        }
      });
      this.mediaSelection = next;
    },

    clearMediaSelection() {
      this.mediaSelection = {};
    },

    selectedMediaFileNames() {
      return Object.keys(this.mediaSelection).filter((key) => Boolean(this.mediaSelection[key]));
    },

    selectedMediaCount() {
      return this.selectedMediaFileNames().length;
    },

    mediaTemplateTagKey(fileName) {
      const rawName = String(fileName || "").trim().toLowerCase();
      if (!rawName) return "";
      const normalized = rawName
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      if (!normalized) return "";
      return /^[a-z]/.test(normalized) ? normalized : `img_${normalized}`;
    },

    mediaTemplateTag(fileName) {
      const key = this.mediaTemplateTagKey(fileName);
      return key ? `media.${key}` : "";
    },

    mediaTemplatePlaceholder(fileName) {
      const tag = this.mediaTemplateTag(fileName);
      return tag ? `{{${tag}}}` : "";
    },

    mediaTemplateTags(limit = 40) {
      const unique = new Set();
      (this.mediaAssets || []).forEach((item) => {
        const placeholder = this.mediaTemplatePlaceholder(item?.fileName);
        if (placeholder) {
          unique.add(placeholder);
        }
      });
      return Array.from(unique).slice(0, Math.max(1, Number(limit) || 40));
    },

    mediaPreviewUrl(item) {
      const fileName = String(item?.fileName || "").trim();
      if (fileName) {
        return this.withBaseUrl(`/uploads/email/${encodeURIComponent(fileName)}`);
      }
      return String(item?.url || "");
    },

    normalizeImageUrl(value) {
      const raw = String(value || "").trim();
      if (!raw) return "";

      if (
        raw.startsWith("http://") ||
        raw.startsWith("https://") ||
        raw.startsWith("//") ||
        raw.startsWith("data:") ||
        raw.startsWith("blob:")
      ) {
        return raw;
      }

      if (raw.startsWith("/api/")) {
        return raw;
      }

      if (raw.startsWith("api/")) {
        return `/${raw}`;
      }

      if (raw.startsWith("/uploads/")) {
        return this.withBaseUrl(raw);
      }

      if (raw.startsWith("uploads/")) {
        return this.withBaseUrl(`/${raw}`);
      }

      const uploadsIndex = raw.indexOf("/uploads/");
      if (uploadsIndex >= 0) {
        return this.withBaseUrl(raw.slice(uploadsIndex));
      }

      if (/^[a-z0-9._-]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(raw)) {
        return this.withBaseUrl(`/uploads/email/${encodeURIComponent(raw)}`);
      }

      return raw;
    },

    mediaUrl(itemOrUrl) {
      if (itemOrUrl && typeof itemOrUrl === "object") {
        return this.mediaPreviewUrl(itemOrUrl);
      }
      return this.normalizeImageUrl(itemOrUrl);
    },

    copyMediaTemplateTag(item) {
      const placeholder = this.mediaTemplatePlaceholder(item?.fileName);
      if (!placeholder) {
        this.notify("Auto media tag unavailable for this file.", "error");
        return;
      }
      void this.copyText(placeholder);
    },

    formatBytes(bytes) {
      const size = Number(bytes || 0);
      if (size <= 0) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const index = Math.min(units.length - 1, Math.floor(Math.log(size) / Math.log(1024)));
      const value = size / (1024 ** index);
      return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
    },

    onMediaFileChange(event) {
      const files = Array.from(event?.target?.files || []);
      this.mediaUpload.files = files;
    },

    async uploadSingleMediaFile(file) {
      const headers = new Headers();

      if (!headers.has("x-csrf-token")) {
        const csrf = await this.fetchCsrfToken();
        if (csrf) {
          headers.set("x-csrf-token", csrf);
        }
      }

      const sendRequest = async () => {
        const formData = new FormData();
        formData.append("image", file, file.name || "upload.jpg");
        const response = await fetch(this.withBaseUrl("/admin/upload-image"), {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers,
          body: formData
        });
        this.persistRenewedAccessToken(response);
        const payload = await this.readPayload(response);
        return { response, payload };
      };

      let result = await sendRequest();
      if (result.response.status === 403 && this.isCsrfFailure(result.payload)) {
        const refreshed = await this.fetchCsrfToken(true);
        if (refreshed) {
          headers.set("x-csrf-token", refreshed);
          result = await sendRequest();
        }
      }

      if (!result.response.ok) {
        const message =
          result.payload && typeof result.payload === "object" && typeof result.payload.message === "string"
            ? result.payload.message
            : `Upload failed (${result.response.status})`;
        throw new Error(message);
      }

      return result.payload;
    },

    async uploadSelectedMedia() {
      try {
        if (!this.mediaUpload.files.length) {
          const input = document.getElementById("mediaUploadInput");
          const pickedFiles = Array.from(input?.files || []);
          if (pickedFiles.length) {
            this.mediaUpload.files = pickedFiles;
          }
        }

        if (!this.mediaUpload.files.length) {
          throw new Error("Select image files to upload.");
        }
        this.mediaUpload.uploading = true;
        for (const file of this.mediaUpload.files) {
          await this.uploadSingleMediaFile(file);
        }
        this.mediaUpload.files = [];
        const input = document.getElementById("mediaUploadInput");
        if (input) {
          input.value = "";
        }
        this.notify("Media uploaded successfully.", "success");
        await this.loadMedia();
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.mediaUpload.uploading = false;
      }
    },

    async deleteMedia(item) {
      try {
        if (!item?.fileName) {
          return;
        }
        if (!confirm(`Delete media "${item.fileName}"?`)) {
          return;
        }
        await this.deleteMediaByFileName(item.fileName);
        this.notify("Media deleted.", "success");
        await this.loadMedia();
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async deleteMediaByFileName(fileName) {
      const normalized = String(fileName || "").trim();
      if (!normalized) {
        return;
      }
      await this.apiRequest(`/admin/media/${encodeURIComponent(normalized)}`, {
        method: "DELETE"
      });
      if (this.mediaSelection[normalized]) {
        delete this.mediaSelection[normalized];
        this.mediaSelection = { ...this.mediaSelection };
      }
    },

    async deleteSelectedMedia() {
      try {
        const fileNames = this.selectedMediaFileNames();
        if (!fileNames.length) {
          throw new Error("Select images first.");
        }
        if (!confirm(`Delete ${fileNames.length} selected image(s)? This cannot be undone.`)) {
          return;
        }

        const failed = [];
        let deleted = 0;
        for (const fileName of fileNames) {
          try {
            await this.deleteMediaByFileName(fileName);
            deleted += 1;
          } catch {
            failed.push(fileName);
          }
        }

        if (deleted) {
          this.notify(`${deleted} selected image(s) deleted.`, "success");
        }
        if (failed.length) {
          this.notify(`Failed to delete ${failed.length} image(s).`, "error");
        }
        await this.loadMedia();
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async deleteAllMedia() {
      try {
        const fileNames = this.mediaAssets
          .map((item) => String(item?.fileName || "").trim())
          .filter(Boolean);
        if (!fileNames.length) {
          throw new Error("No images found.");
        }
        if (!confirm(`Delete ALL ${fileNames.length} loaded image(s)? This cannot be undone.`)) {
          return;
        }

        const failed = [];
        let deleted = 0;
        for (const fileName of fileNames) {
          try {
            await this.deleteMediaByFileName(fileName);
            deleted += 1;
          } catch {
            failed.push(fileName);
          }
        }

        this.clearMediaSelection();
        if (deleted) {
          this.notify(`${deleted} image(s) deleted.`, "success");
        }
        if (failed.length) {
          this.notify(`Failed to delete ${failed.length} image(s).`, "error");
        }
        await this.loadMedia();
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    filteredEmailMediaAssets() {
      const search = String(this.emailMediaPicker.search || "").toLowerCase().trim();
      if (!search) {
        return this.mediaAssets;
      }
      return this.mediaAssets.filter((item) => {
        const fileName = String(item.fileName || "").toLowerCase();
        const url = String(item.url || "").toLowerCase();
        const templateTag = this.mediaTemplateTag(item.fileName).toLowerCase();
        return fileName.includes(search) || url.includes(search) || templateTag.includes(search);
      });
    },

    async openEmailMediaPicker(target = "template") {
      this.emailMediaPicker.target = target === "campaign" ? "campaign" : "template";
      this.emailMediaPicker.search = "";
      this.emailMediaPicker.open = true;
      if (this.mediaAssets.length && !String(this.mediaFilters.search || "").trim()) {
        return;
      }
      await this.refreshEmailMediaPicker();
    },

    closeEmailMediaPicker() {
      this.emailMediaPicker.open = false;
    },

    async refreshEmailMediaPicker() {
      this.emailMediaPicker.loading = true;
      try {
        await this.loadMedia("");
      } catch {
        // fail-open
      } finally {
        this.emailMediaPicker.loading = false;
      }
    },

    buildEmailImageTag(srcValue) {
      const safeSrc = String(srcValue || "").trim();
      if (!safeSrc) return "";
      const alt = String(this.emailMediaPicker.alt || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<img src="${safeSrc}" alt="${alt}" style="max-width:100%;height:auto;" />`;
    },

    resolveEmailImageSource(itemOrUrl, target) {
      if (target === "template" && itemOrUrl && typeof itemOrUrl === "object") {
        const placeholder = this.mediaTemplatePlaceholder(itemOrUrl.fileName);
        if (placeholder) {
          return placeholder;
        }
      }
      return this.mediaUrl(itemOrUrl);
    },

    insertEmailImageTag(itemOrUrl, targetOverride) {
      const target = targetOverride || this.emailMediaPicker.target || "template";
      const source = this.resolveEmailImageSource(itemOrUrl, target);
      if (!source) return;
      const snippet = this.buildEmailImageTag(source);

      if (target === "campaign") {
        this.campaignDraft.html = this.campaignDraft.html
          ? `${this.campaignDraft.html}\n${snippet}`
          : snippet;
        this.setActiveTab("campaigns");
      } else {
        this.templateEditor.htmlTemplate = this.templateEditor.htmlTemplate
          ? `${this.templateEditor.htmlTemplate}\n${snippet}`
          : snippet;
        this.setActiveTab("settings");
      }

      this.notify("Image tag inserted into editor.", "success");
      this.emailMediaPicker.open = false;
    },

    useMediaInTemplate(itemOrUrl) {
      this.emailMediaPicker.target = "template";
      this.insertEmailImageTag(itemOrUrl, "template");
    },

    useMediaAsProductPrimary(itemOrUrl) {
      const safeUrl = this.mediaUrl(itemOrUrl);
      if (!safeUrl) return;
      if (!this.productModal.open) {
        this.openProductCreate();
      }
      this.setProductPrimaryMedia(safeUrl);
      this.notify("Set as product primary image.", "success");
    },

    addMediaToProductGallery(itemOrUrl) {
      const safeUrl = this.mediaUrl(itemOrUrl);
      if (!safeUrl) return;
      if (!this.productModal.open) {
        this.openProductCreate();
      }
      this.addProductGalleryMedia(safeUrl);
      this.notify("Added to product gallery.", "success");
    },

    filteredProductMediaAssets() {
      const search = String(this.productMediaPicker.search || "").toLowerCase().trim();
      if (!search) {
        return this.mediaAssets;
      }
      return this.mediaAssets.filter((item) => {
        const fileName = String(item.fileName || "").toLowerCase();
        const url = String(item.url || "").toLowerCase();
        return fileName.includes(search) || url.includes(search);
      });
    },

    async ensureMediaLoadedForProduct() {
      if (this.mediaAssets.length && !String(this.mediaFilters.search || "").trim()) {
        return;
      }

      this.productMediaPicker.loading = true;
      try {
        await this.loadMedia("");
      } catch {
        // fail-open: picker can still be opened and manually refreshed
      } finally {
        this.productMediaPicker.loading = false;
      }
    },

    async openProductMediaPicker() {
      this.productMediaPicker.open = true;
      if (!this.mediaAssets.length) {
        await this.ensureMediaLoadedForProduct();
      }
    },

    closeProductMediaPicker() {
      this.productMediaPicker.open = false;
    },

    async refreshProductMediaPicker() {
      this.productMediaPicker.loading = true;
      try {
        await this.loadMedia("");
      } finally {
        this.productMediaPicker.loading = false;
      }
    },

    setProductPrimaryMedia(url) {
      const safeUrl = this.mediaUrl(url);
      if (!safeUrl) {
        return;
      }
      this.productModal.form.primaryImage = safeUrl;
    },

    clearProductPrimaryMedia() {
      this.productModal.form.primaryImage = "";
    },

    getProductGalleryMediaList() {
      const normalized = this.parseCsv(this.productModal.form.galleryImages || "")
        .map((url) => this.mediaUrl(url))
        .filter(Boolean);
      return [...new Set(normalized)];
    },

    hasProductGalleryMedia(url) {
      const safeUrl = this.mediaUrl(url);
      if (!safeUrl) {
        return false;
      }
      return this.getProductGalleryMediaList().includes(safeUrl);
    },

    addProductGalleryMedia(url) {
      const safeUrl = this.mediaUrl(url);
      if (!safeUrl) {
        return;
      }
      const current = this.getProductGalleryMediaList();
      if (!current.includes(safeUrl)) {
        current.push(safeUrl);
      }
      this.productModal.form.galleryImages = current.join(", ");
    },

    removeProductGalleryMedia(url) {
      const safeUrl = this.mediaUrl(url);
      if (!safeUrl) {
        return;
      }
      const next = this.getProductGalleryMediaList().filter((itemUrl) => itemUrl !== safeUrl);
      this.productModal.form.galleryImages = next.join(", ");
    },

    toggleProductGalleryMedia(url) {
      if (this.hasProductGalleryMedia(url)) {
        this.removeProductGalleryMedia(url);
      } else {
        this.addProductGalleryMedia(url);
      }
    },

    filteredAuctionCards() {
      const search = String(this.auctionFilters.search || "").toLowerCase().trim();
      const status = String(this.auctionFilters.status || "").toLowerCase().trim();
      return (this.auctionCards || []).filter((item) => {
        if (status && String(item.status || "").toLowerCase() !== status) {
          return false;
        }
        if (!search) {
          return true;
        }
        const title = String(item.title || "").toLowerCase();
        const slug = String(item.productSlug || "").toLowerCase();
        const productId = String(item.productId || "").toLowerCase();
        const winnerName = String(item.winner?.name || "").toLowerCase();
        const winnerEmail = String(item.winner?.email || "").toLowerCase();
        return (
          title.includes(search) ||
          slug.includes(search) ||
          productId.includes(search) ||
          winnerName.includes(search) ||
          winnerEmail.includes(search)
        );
      });
    },

    auctionBidderLabel(bid) {
      if (!bid) return "-";
      const name = String(bid.bidderName || bid.name || "").trim();
      const email = String(bid.bidderEmail || bid.email || "").trim();
      if (name && email) {
        return `${name} (${email})`;
      }
      return name || email || "-";
    },

    syncAuctionDetailsDraft(detail) {
      if (!detail) {
        this.auctionDetailsModal.draft = {
          status: "scheduled",
          startAt: "",
          endAt: "",
          startingPrice: "",
          reservePrice: "",
          minIncrement: "1"
        };
        return;
      }
      this.auctionDetailsModal.draft = {
        status: detail.status || "scheduled",
        startAt: detail.startAt ? this.toLocalDatetime(new Date(detail.startAt)) : "",
        endAt: detail.endAt ? this.toLocalDatetime(new Date(detail.endAt)) : "",
        startingPrice: String(Number(detail.startingPrice || 0)),
        reservePrice:
          typeof detail.reservePrice === "number" && Number.isFinite(detail.reservePrice)
            ? String(Number(detail.reservePrice))
            : "",
        minIncrement: String(Math.max(1, Number(detail.minIncrement || 1)))
      };
    },

    async loadAuctions(_force = false) {
      const response = await this.apiRequest(`/admin/auctions?${this.toQueryString({
        page: 1,
        limit: 120
      })}`);
      this.auctionCards = (response.items || []).map((item) => {
        const endMs = new Date(item.endAt).getTime();
        const timeLeftMs = Math.max(0, Number(item.timeLeftMs || (Number.isFinite(endMs) ? endMs - Date.now() : 0)));
        return {
          id: String(item.id || ""),
          productId: String(item.productId || ""),
          title: item.product?.title || "Untitled",
          productSlug: item.product?.slug || "",
          productImage: item.product?.image || "",
          status: item.status || "scheduled",
          startAt: item.startAt,
          endAt: item.endAt,
          endMs,
          endedAt: item.endedAt,
          currentPrice: Number(item.currentPrice || 0),
          startingPrice: Number(item.startingPrice || 0),
          reservePrice:
            typeof item.reservePrice === "number" && Number.isFinite(item.reservePrice)
              ? Number(item.reservePrice)
              : null,
          reservePriceReached: Boolean(item.reservePriceReached),
          minIncrement: Number(item.minIncrement || 1),
          totalBids: Number(item.totalBids || 0),
          lastBidAt: item.lastBidAt || "",
          highestBid: item.highestBid || null,
          winner: item.winner || null,
          timeLeftMs,
          timeLeftText: this.msToClock(timeLeftMs)
        };
      });
      this.endingAuctions = this.auctionCards
        .filter((item) => item.status === "live")
        .sort((a, b) => a.timeLeftMs - b.timeLeftMs)
        .slice(0, 8);
    },

    async openAuctionDetails(auction) {
      const productId = String(auction?.productId || "").trim();
      if (!productId) {
        this.notify("Auction product id missing.", "error");
        return;
      }
      this.auctionDetailsModal.open = true;
      this.auctionDetailsModal.loading = true;
      this.auctionDetailsModal.saving = false;
      this.auctionDetailsModal.detail = null;
      this.syncAuctionDetailsDraft(null);

      try {
        const detail = await this.apiRequest(`/admin/auctions/${encodeURIComponent(productId)}`);
        this.auctionDetailsModal.detail = detail;
        this.syncAuctionDetailsDraft(detail);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
        this.closeAuctionDetails();
      } finally {
        this.auctionDetailsModal.loading = false;
      }
    },

    closeAuctionDetails() {
      this.auctionDetailsModal.open = false;
      this.auctionDetailsModal.loading = false;
      this.auctionDetailsModal.saving = false;
      this.auctionDetailsModal.detail = null;
      this.syncAuctionDetailsDraft(null);
    },

    async refreshAuctionDetails() {
      const productId = String(this.auctionDetailsModal.detail?.productId || "").trim();
      if (!productId) return;
      this.auctionDetailsModal.loading = true;
      try {
        const detail = await this.apiRequest(`/admin/auctions/${encodeURIComponent(productId)}`);
        this.auctionDetailsModal.detail = detail;
        this.syncAuctionDetailsDraft(detail);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.auctionDetailsModal.loading = false;
      }
    },

    buildAuctionDetailsUpdatePayload() {
      const detail = this.auctionDetailsModal.detail;
      const draft = this.auctionDetailsModal.draft;
      if (!detail || !draft) {
        throw new Error("Auction details are not loaded.");
      }

      const startAtDate = new Date(String(draft.startAt || "").trim());
      const endAtDate = new Date(String(draft.endAt || "").trim());
      if (Number.isNaN(startAtDate.getTime()) || Number.isNaN(endAtDate.getTime())) {
        throw new Error("Invalid auction start/end time.");
      }
      if (endAtDate.getTime() <= startAtDate.getTime()) {
        throw new Error("Auction end time must be after start time.");
      }

      const startingPrice = Number(String(draft.startingPrice || "").trim() || 0);
      const minIncrement = Number(String(draft.minIncrement || "").trim() || 1);
      const reserveRaw = String(draft.reservePrice || "").trim();
      const reservePrice = reserveRaw === "" ? null : Number(reserveRaw);

      if (!Number.isFinite(startingPrice) || !Number.isInteger(startingPrice) || startingPrice < 0) {
        throw new Error("Starting price must be a whole number 0 or higher.");
      }
      if (!Number.isFinite(minIncrement) || !Number.isInteger(minIncrement) || minIncrement < 1) {
        throw new Error("Minimum bid increment must be a whole number 1 or higher.");
      }
      if (
        reservePrice !== null &&
        (!Number.isFinite(reservePrice) || !Number.isInteger(reservePrice) || reservePrice < 0)
      ) {
        throw new Error("Reserve price must be a whole number 0 or higher.");
      }

      const payload = {};
      const currentStartAt = new Date(detail.startAt);
      const currentEndAt = new Date(detail.endAt);
      const currentStartingPrice = Number(detail.startingPrice || 0);
      const currentReservePrice =
        typeof detail.reservePrice === "number" && Number.isFinite(detail.reservePrice)
          ? Number(detail.reservePrice)
          : null;
      const currentMinIncrement = Number(detail.minIncrement || 1);
      const currentStatus = String(detail.status || "scheduled");
      const nextStatus = String(draft.status || "").trim() || currentStatus;

      if (startAtDate.getTime() !== currentStartAt.getTime()) {
        payload.startAt = startAtDate.toISOString();
      }
      if (endAtDate.getTime() !== currentEndAt.getTime()) {
        payload.endAt = endAtDate.toISOString();
      }
      if (startingPrice !== currentStartingPrice) {
        payload.startingPrice = startingPrice;
      }
      if (reservePrice !== currentReservePrice) {
        payload.reservePrice = reservePrice;
      }
      if (minIncrement !== currentMinIncrement) {
        payload.minIncrement = minIncrement;
      }
      if (nextStatus !== currentStatus) {
        payload.status = nextStatus;
      }

      return payload;
    },

    async saveAuctionDetails() {
      const detail = this.auctionDetailsModal.detail;
      if (!detail?.productId) return;

      let payload = {};
      try {
        payload = this.buildAuctionDetailsUpdatePayload();
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
        return;
      }

      if (!Object.keys(payload).length) {
        this.notify("No auction changes to save.");
        return;
      }

      this.auctionDetailsModal.saving = true;
      try {
        const updated = await this.apiRequest(`/admin/auctions/${encodeURIComponent(detail.productId)}`, {
          method: "PATCH",
          body: payload
        });
        this.auctionDetailsModal.detail = updated;
        this.syncAuctionDetailsDraft(updated);
        await this.loadAuctions(true);
        this.notify("Auction updated.", "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.auctionDetailsModal.saving = false;
      }
    },

    async updateAuctionStatusQuick(auction, nextStatus) {
      const productId = String(auction?.productId || "").trim();
      if (!productId || !nextStatus) return;
      if (
        !confirm(
          `Change auction "${auction.title}" status to ${String(nextStatus).toUpperCase()}?`
        )
      ) {
        return;
      }
      try {
        const updated = await this.apiRequest(`/admin/auctions/${encodeURIComponent(productId)}`, {
          method: "PATCH",
          body: { status: nextStatus }
        });
        if (
          this.auctionDetailsModal.open &&
          String(this.auctionDetailsModal.detail?.productId || "") === productId
        ) {
          this.auctionDetailsModal.detail = updated;
          this.syncAuctionDetailsDraft(updated);
        }
        await this.loadAuctions(true);
        this.notify(`Auction moved to ${String(nextStatus).toUpperCase()}.`, "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async loadOrders() {
      const query = this.toQueryString({
        status: this.orderFilters.status,
        paymentStatus: this.orderFilters.paymentStatus,
        page: this.orderFilters.page,
        limit: this.orderFilters.limit
      });
      const response = await this.apiRequest(`/orders?${query}`);
      this.orders = response.items || [];
      this.syncOrderSelection();
      this.ordersMeta = {
        page: Number(response.page || 1),
        limit: Number(response.limit || 20),
        total: Number(response.total || 0),
        totalPages: Number(response.totalPages || 1)
      };
      this.orderDrafts = {};
      this.orders.forEach((order) => {
        this.orderDrafts[order.id] = {
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus
        };
      });
    },

    orderSerial(index) {
      const page = Math.max(1, Number(this.ordersMeta.page || this.orderFilters.page || 1));
      const limit = Math.max(1, Number(this.ordersMeta.limit || this.orderFilters.limit || 20));
      return (page - 1) * limit + Number(index || 0) + 1;
    },

    syncOrderSelection() {
      const next = {};
      this.orders.forEach((order) => {
        const key = String(order?.id || "").trim();
        if (key && this.orderSelection[key]) {
          next[key] = true;
        }
      });
      this.orderSelection = next;
    },

    isOrderSelected(order) {
      const key = String(order?.id || "").trim();
      return key ? Boolean(this.orderSelection[key]) : false;
    },

    toggleOrderSelection(order) {
      const key = String(order?.id || "").trim();
      if (!key) return;
      if (this.orderSelection[key]) {
        delete this.orderSelection[key];
      } else {
        this.orderSelection[key] = true;
      }
      this.orderSelection = { ...this.orderSelection };
    },

    selectAllVisibleOrders() {
      const next = { ...this.orderSelection };
      this.orders.forEach((order) => {
        const key = String(order?.id || "").trim();
        if (key) {
          next[key] = true;
        }
      });
      this.orderSelection = next;
    },

    clearOrderSelection() {
      this.orderSelection = {};
    },

    selectedOrderIds() {
      return Object.keys(this.orderSelection).filter((key) => Boolean(this.orderSelection[key]));
    },

    selectedOrderCount() {
      return this.selectedOrderIds().length;
    },

    changeOrdersPage(page) {
      const target = Math.max(1, Number(page || 1));
      this.orderFilters.page = target;
      this.loadOrders();
    },

    resetOrderFilters() {
      this.orderFilters.status = "";
      this.orderFilters.paymentStatus = "";
      this.orderFilters.page = 1;
      this.loadOrders();
    },

    async saveOrder(order) {
      const orderId = String(order?.id || "").trim();
      const draft = this.orderDrafts[orderId];
      if (!orderId || !draft) return;

      try {
        const payload = {};
        if (draft.paymentStatus && draft.paymentStatus !== order.paymentStatus) {
          payload.paymentStatus = draft.paymentStatus;
        }
        if (draft.fulfillmentStatus && draft.fulfillmentStatus !== order.fulfillmentStatus) {
          payload.fulfillmentStatus = draft.fulfillmentStatus;
        }
        if (!Object.keys(payload).length) {
          this.notify("No order changes to save.");
          return;
        }
        const updated = await this.apiRequest(`/orders/${orderId}/status`, {
          method: "PATCH",
          body: payload
        });
        this.applyOrderToList(updated);
        this.notify(`Updated ${order.orderNumber}.`, "success");
        this.loadedTabs.dashboard = false;
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    normalizeOrderDraftShipping(address) {
      const source = address && typeof address === "object" ? address : {};
      const clean = (value) => String(value || "").trim();
      return {
        fullName: clean(source.fullName),
        phone: clean(source.phone),
        addressLine1: clean(source.addressLine1),
        addressLine2: clean(source.addressLine2),
        area: clean(source.area),
        city: clean(source.city),
        postalCode: clean(source.postalCode),
        country: "BD"
      };
    },

    applyOrderToList(updated) {
      const orderId = String(updated?.id || "").trim();
      if (!orderId) return;
      const target = this.orders.find((item) => String(item?.id || "").trim() === orderId);
      if (target) {
        target.paymentStatus = updated.paymentStatus;
        target.fulfillmentStatus = updated.fulfillmentStatus;
        if ("customerNote" in updated) {
          target.customerNote = updated.customerNote || "";
        }
      }
      this.orderDrafts[orderId] = {
        paymentStatus: updated.paymentStatus,
        fulfillmentStatus: updated.fulfillmentStatus
      };
    },

    async openOrderDetails(order) {
      const orderId = String(order?.id || "").trim();
      if (!orderId) return;

      this.orderDetailsModal.open = true;
      this.orderDetailsModal.loading = true;
      this.orderDetailsModal.saving = false;
      this.orderDetailsModal.order = null;

      try {
        const detail = await this.apiRequest(`/orders/${orderId}`);
        const shipping = this.normalizeOrderDraftShipping(detail?.shippingAddress || {});
        this.orderDetailsModal.order = detail;
        this.orderDetailsModal.draft = {
          paymentStatus: detail?.paymentStatus || "unpaid",
          fulfillmentStatus: detail?.fulfillmentStatus || "pending",
          customerNote: String(detail?.customerNote || ""),
          shippingAddress: shipping
        };
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
        this.closeOrderDetails();
      } finally {
        this.orderDetailsModal.loading = false;
      }
    },

    closeOrderDetails() {
      this.orderDetailsModal.open = false;
      this.orderDetailsModal.loading = false;
      this.orderDetailsModal.saving = false;
      this.orderDetailsModal.order = null;
    },

    async saveOrderDetails() {
      const detail = this.orderDetailsModal.order;
      if (!detail?.id) return;

      const draft = this.orderDetailsModal.draft || {};
      const payload = {};

      if (draft.paymentStatus && draft.paymentStatus !== detail.paymentStatus) {
        payload.paymentStatus = draft.paymentStatus;
      }
      if (draft.fulfillmentStatus && draft.fulfillmentStatus !== detail.fulfillmentStatus) {
        payload.fulfillmentStatus = draft.fulfillmentStatus;
      }

      const draftNote = String(draft.customerNote || "").trim().slice(0, 1000);
      const currentNote = String(detail.customerNote || "").trim();
      if (draftNote !== currentNote) {
        payload.customerNote = draftNote;
      }

      const nextShipping = this.normalizeOrderDraftShipping(draft.shippingAddress || {});
      const currentShipping = this.normalizeOrderDraftShipping(detail.shippingAddress || {});
      if (JSON.stringify(nextShipping) !== JSON.stringify(currentShipping)) {
        payload.shippingAddress = nextShipping;
      }

      if (!Object.keys(payload).length) {
        this.notify("No detail changes to save.");
        return;
      }

      this.orderDetailsModal.saving = true;
      try {
        const updated = await this.apiRequest(`/orders/${detail.id}/status`, {
          method: "PATCH",
          body: payload
        });

        this.orderDetailsModal.order = updated;
        this.orderDetailsModal.draft = {
          paymentStatus: updated?.paymentStatus || "unpaid",
          fulfillmentStatus: updated?.fulfillmentStatus || "pending",
          customerNote: String(updated?.customerNote || ""),
          shippingAddress: this.normalizeOrderDraftShipping(updated?.shippingAddress || {})
        };
        this.applyOrderToList(updated);
        this.loadedTabs.dashboard = false;
        this.notify(`Order ${updated.orderNumber} updated.`, "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.orderDetailsModal.saving = false;
      }
    },

    async deleteOrder(order, options = {}) {
      const orderId = String(order?.id || "").trim();
      if (!orderId) return;
      const label = String(order?.orderNumber || orderId);
      const skipConfirm = Boolean(options.skipConfirm);
      const skipReload = Boolean(options.skipReload);
      const silent = Boolean(options.silent);

      try {
        if (!skipConfirm && !confirm(`Delete order ${label}? This cannot be undone.`)) {
          return;
        }

        await this.apiRequest(`/orders/${orderId}`, {
          method: "DELETE"
        });

        delete this.orderDrafts[orderId];
        delete this.orderSelection[orderId];
        this.orderSelection = { ...this.orderSelection };
        this.loadedTabs.dashboard = false;

        if (!skipReload) {
          await this.loadOrders();
        }

        if (!silent) {
          this.notify(`Deleted ${label}.`, "success");
        }
      } catch (error) {
        if (!silent) {
          this.notify(this.errorMessage(error), "error");
        }
        throw error;
      }
    },

    async deleteSelectedOrders() {
      const selectedIds = this.selectedOrderIds();
      if (!selectedIds.length) {
        this.notify("Select at least one order.");
        return;
      }

      if (!confirm(`Delete ${selectedIds.length} selected order(s)? This cannot be undone.`)) {
        return;
      }

      this.ordersDeleting = true;
      let deleted = 0;
      let failed = 0;

      try {
        for (const orderId of selectedIds) {
          const targetOrder = this.orders.find((item) => String(item?.id || "") === String(orderId));
          try {
            await this.deleteOrder(targetOrder || { id: orderId }, {
              skipConfirm: true,
              skipReload: true,
              silent: true
            });
            deleted += 1;
          } catch (error) {
            failed += 1;
            if (this.localSettings.debug) {
              console.error("Failed to delete order", orderId, error);
            }
          }
        }

        await this.loadOrders();
      } finally {
        this.ordersDeleting = false;
      }

      if (deleted && !failed) {
        this.notify(`Deleted ${deleted} order(s).`, "success");
        return;
      }

      if (deleted && failed) {
        this.notify(`Deleted ${deleted} order(s). Failed: ${failed}.`, "info");
        return;
      }

      this.notify("Failed to delete selected orders.", "error");
    },

    async sendOrderToCourier(order, force = false) {
      try {
        if (!order?.id) return;
        const response = await this.apiRequest(`/admin/courier/steadfast/orders/${order.id}/create`, {
          method: "POST",
          body: { force: Boolean(force) }
        });
        if (response?.order) {
          order.fulfillmentStatus = response.order.fulfillmentStatus || order.fulfillmentStatus;
          order.paymentStatus = response.order.paymentStatus || order.paymentStatus;
          order.courier = response.order.courier || order.courier;
          this.orderDrafts[order.id] = {
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus
          };
        }
        this.notify(response?.message || `Order ${order.orderNumber} sent to courier.`, "success");
      } catch (error) {
        if (Number(error?.status) === 409) {
          const shouldResend = confirm(
            "This order is already sent to courier. Do you want to force resend?"
          );
          if (shouldResend) {
            await this.sendOrderToCourier(order, true);
            return;
          }
        }
        this.notify(this.errorMessage(error), "error");
      }
    },

    async syncOrderCourierStatus(order) {
      try {
        if (!order?.id) return;
        const response = await this.apiRequest(`/admin/courier/steadfast/orders/${order.id}/sync-status`, {
          method: "POST",
          body: {}
        });
        if (response?.order) {
          order.fulfillmentStatus = response.order.fulfillmentStatus || order.fulfillmentStatus;
          order.paymentStatus = response.order.paymentStatus || order.paymentStatus;
          order.courier = response.order.courier || order.courier;
          this.orderDrafts[order.id] = {
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus
          };
        }
        this.notify(`Courier status synced: ${this.courierStatusLabel(response?.deliveryStatus)}`, "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async openCourierSuccessModal(order) {
      if (!order?.id) return;
      this.courierSuccessModal.open = true;
      this.courierSuccessModal.loading = true;
      this.courierSuccessModal.orderNumber = String(order.orderNumber || "");
      this.courierSuccessModal.phoneNumber = "";
      this.courierSuccessModal.totalOrders = 0;
      this.courierSuccessModal.totalDelivered = 0;
      this.courierSuccessModal.totalCancelled = 0;
      this.courierSuccessModal.successRatio = 0;

      try {
        const endpointCandidates = [
          `/admin/courier/steadfast/orders/${order.id}/customer-success-rate`,
          `/admin/courier/steadfast/orders/${order.id}/check-score`,
          `/admin/courier/steadfast/orders/${order.id}/checkscore`,
          `/admin/courier/steadfast/orders/${order.id}/score`,
          `/admin/courier/orders/${order.id}/customer-success-rate`,
          `/admin/courier/orders/${order.id}/check-score`,
          `/admin/courier/orders/${order.id}/checkscore`,
          `/admin/courier/orders/${order.id}/score`
        ];

        let response = null;
        let lastError = null;
        for (const endpoint of endpointCandidates) {
          try {
            response = await this.apiRequest(endpoint);
            break;
          } catch (error) {
            lastError = error;
            if (Number(error?.status) !== 404) {
              throw error;
            }
          }
        }

        if (!response) {
          if (Number(lastError?.status) === 404) {
            throw new Error("Check Score endpoint is not active. Restart API server, then hard refresh (Ctrl+F5).");
          }
          throw lastError || new Error("Unable to fetch courier success rate.");
        }

        this.courierSuccessModal.phoneNumber = String(response.phoneNumber || "");
        this.courierSuccessModal.totalOrders = Number(response.totalOrders || 0);
        this.courierSuccessModal.totalDelivered = Number(response.totalDelivered || 0);
        this.courierSuccessModal.totalCancelled = Number(response.totalCancelled || 0);
        this.courierSuccessModal.successRatio = Number(response.successRatio || 0);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
        this.closeCourierSuccessModal();
      } finally {
        this.courierSuccessModal.loading = false;
      }
    },

    closeCourierSuccessModal() {
      this.courierSuccessModal.open = false;
      this.courierSuccessModal.loading = false;
      this.courierSuccessModal.orderNumber = "";
      this.courierSuccessModal.phoneNumber = "";
      this.courierSuccessModal.totalOrders = 0;
      this.courierSuccessModal.totalDelivered = 0;
      this.courierSuccessModal.totalCancelled = 0;
      this.courierSuccessModal.successRatio = 0;
    },

    async loadUsers(resetPage = false) {
      if (resetPage) {
        this.userFilters.page = 1;
      }
      const query = this.toQueryString({
        page: this.userFilters.page,
        limit: this.userFilters.limit
      });
      const response = await this.apiRequest(`/admin/users?${query}`);
      this.users = Array.isArray(response.items) ? response.items : [];

      const total = Number(response.total || 0);
      const limit = Math.max(1, Number(response.limit || this.userFilters.limit || 20));
      const totalPages = Math.max(1, Number(response.totalPages || Math.ceil(total / limit) || 1));
      const page = Math.min(totalPages, Math.max(1, Number(response.page || this.userFilters.page || 1)));

      this.usersMeta = {
        page,
        limit,
        total,
        totalPages
      };
      this.userFilters.page = page;
      this.userFilters.limit = limit;
    },

    changeUsersPage(page) {
      const totalPages = Math.max(1, Number(this.usersMeta.totalPages || 1));
      const target = Math.min(totalPages, Math.max(1, Number(page || 1)));
      if (target === this.userFilters.page) return;
      this.userFilters.page = target;
      this.loadUsers();
    },

    changeUsersLimit(limit) {
      const parsed = Math.max(1, Number(limit || 20));
      if (parsed === this.userFilters.limit) return;
      this.userFilters.limit = parsed;
      this.userFilters.page = 1;
      this.loadUsers();
    },

    userRowSerial(index) {
      const page = Math.max(1, Number(this.usersMeta.page || this.userFilters.page || 1));
      const limit = Math.max(1, Number(this.usersMeta.limit || this.userFilters.limit || 20));
      return (page - 1) * limit + Number(index || 0) + 1;
    },

    onUsersImportFileChange(event) {
      const file = event?.target?.files?.[0] || null;
      this.usersImport.file = file;
      this.usersImport.fileName = file ? String(file.name || "") : "";
    },

    async exportUsersCsv() {
      try {
        const response = await fetch(this.withBaseUrl("/admin/users/export"), {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });
        this.persistRenewedAccessToken(response);
        if (!response.ok) {
          throw new Error("Failed to export users.");
        }
        const blob = await response.blob();
        this.downloadBlob(blob, `users-${this.todayFileDate()}.csv`);
        this.notify("Users CSV downloaded.", "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    parseCsvTable(text) {
      const input = String(text || "");
      const rows = [];
      let row = [];
      let cell = "";
      let inQuotes = false;

      for (let i = 0; i < input.length; i += 1) {
        const char = input[i];

        if (char === "\"") {
          if (inQuotes && input[i + 1] === "\"") {
            cell += "\"";
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (char === "," && !inQuotes) {
          row.push(cell);
          cell = "";
          continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
          if (char === "\r" && input[i + 1] === "\n") {
            i += 1;
          }
          row.push(cell);
          rows.push(row);
          row = [];
          cell = "";
          continue;
        }

        cell += char;
      }

      if (cell.length || row.length) {
        row.push(cell);
        rows.push(row);
      }

      return rows.filter((line) => line.some((value) => String(value || "").trim().length));
    },

    parseImportedBoolean(value) {
      if (typeof value === "boolean") {
        return value;
      }
      const normalized = String(value || "").trim().toLowerCase();
      if (!normalized) return undefined;
      if (["1", "true", "yes", "y", "active", "suspended"].includes(normalized)) return true;
      if (["0", "false", "no", "n", "inactive", "unsuspended"].includes(normalized)) return false;
      return undefined;
    },

    async importUsersCsv() {
      if (!this.usersImport.file) {
        this.notify("Select a CSV file first.", "error");
        return;
      }

      this.usersImport.importing = true;
      try {
        const csvText = await this.usersImport.file.text();
        const rows = this.parseCsvTable(csvText);
        if (rows.length < 2) {
          throw new Error("CSV must include headers and at least one user row.");
        }

        const header = rows[0].map((value) => String(value || "").trim().toLowerCase());
        const indexByName = new Map();
        header.forEach((name, idx) => {
          if (name) {
            indexByName.set(name, idx);
          }
        });

        if (!indexByName.has("email")) {
          throw new Error("CSV must include an 'email' column.");
        }

        const users = [];
        for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
          const row = rows[rowIndex];
          const getValue = (name) => {
            const idx = indexByName.get(name);
            if (idx === undefined) return "";
            return String(row[idx] || "").trim();
          };

          const email = getValue("email").toLowerCase();
          if (!email) {
            continue;
          }

          const roleRaw = getValue("role").toLowerCase();
          const role = roleRaw === "admin" || roleRaw === "customer" ? roleRaw : undefined;
          const isSuspended = this.parseImportedBoolean(getValue("issuspended"));
          const phone = getValue("phone");
          const name = getValue("name");
          const password = getValue("password");

          users.push({
            rowNumber: rowIndex + 1,
            email,
            name: name || undefined,
            phone: phone || undefined,
            role,
            isSuspended,
            password: password || undefined
          });
        }

        if (!users.length) {
          throw new Error("No valid user rows found in CSV.");
        }

        const result = await this.apiRequest("/admin/users/import", {
          method: "POST",
          body: { users }
        });

        const created = Number(result?.created || 0);
        const updated = Number(result?.updated || 0);
        const skipped = Number(result?.skipped || 0);
        this.notify(`Import done: ${created} created, ${updated} updated, ${skipped} skipped.`, "success");

        if (Array.isArray(result?.errors) && result.errors.length) {
          const first = result.errors[0];
          this.notify(`Row ${first.rowNumber}: ${first.message}`, "error");
        }

        this.usersImport.file = null;
        this.usersImport.fileName = "";
        const input = document.getElementById("usersImportInput");
        if (input) {
          input.value = "";
        }

        await this.loadUsers(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.usersImport.importing = false;
      }
    },

    async viewUserDetails(user) {
      try {
        if (!user?.id) {
          return;
        }
        this.userDetailsLoading = true;
        const details = await this.apiRequest(`/admin/users/${user.id}`);
        this.selectedUserDetails = details;
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.userDetailsLoading = false;
      }
    },

    closeUserDetails() {
      this.selectedUserDetails = null;
      this.userDetailsLoading = false;
    },

    async setUserRole(user, role) {
      const updated = await this.apiRequest(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: { role }
      });
      user.role = updated.role;
      this.notify(`Role updated for ${user.email}.`, "success");
    },

    async toggleUserSuspend(user) {
      const updated = await this.apiRequest(`/admin/users/${user.id}/suspend`, {
        method: "PATCH",
        body: { suspend: !user.isSuspended }
      });
      user.isSuspended = updated.isSuspended;
      this.notify(`User ${user.email} ${user.isSuspended ? "suspended" : "unsuspended"}.`, "success");
    },

    async sendUserPasswordReset(user) {
      try {
        if (!user?.id) {
          return;
        }
        await this.apiRequest(`/admin/users/${user.id}/send-password-reset`, {
          method: "POST"
        });
        this.notify(`Password reset email sent to ${user.email}.`, "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },
    async loadSubscribers() {
      const query = this.toQueryString({
        page: this.subscriberFilters.page,
        limit: this.subscriberFilters.limit,
        search: this.subscriberFilters.search,
        isActive: this.subscriberFilters.isActive
      });
      const response = await this.apiRequest(`/admin/subscribers?${query}`);
      this.subscribers = response.items || [];
    },

    async createSubscriber() {
      try {
        const email = String(this.subscriberDraft.email || "").trim().toLowerCase();
        if (!email) {
          throw new Error("Subscriber email is required.");
        }

        await this.apiRequest("/admin/subscribers", {
          method: "POST",
          body: {
            email,
            name: String(this.subscriberDraft.name || "").trim() || undefined,
            source: this.subscriberDraft.source || "manual",
            isActive: Boolean(this.subscriberDraft.isActive)
          }
        });

        this.subscriberDraft = {
          email: "",
          name: "",
          source: "manual",
          isActive: true
        };
        this.notify("Subscriber saved.", "success");
        await this.loadSubscribers(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async toggleSubscriber(subscriber) {
      const updated = await this.apiRequest(`/admin/subscribers/${subscriber.id}/toggle`, {
        method: "PATCH"
      });
      subscriber.isActive = updated.isActive;
      this.notify(`Subscriber ${subscriber.email} updated.`, "success");
    },

    async deleteSubscriber(subscriber) {
      if (!confirm(`Delete subscriber ${subscriber.email}?`)) return;
      await this.apiRequest(`/admin/subscribers/${subscriber.id}`, { method: "DELETE" });
      this.notify("Subscriber deleted.", "success");
      await this.loadSubscribers();
    },

    async exportSubscribersCsv() {
      const response = await fetch(this.withBaseUrl("/admin/subscribers/export"), {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });
      this.persistRenewedAccessToken(response);
      if (!response.ok) throw new Error("Failed to export subscribers.");
      const blob = await response.blob();
      this.downloadBlob(blob, `subscribers-${this.todayFileDate()}.csv`);
      this.notify("Subscriber CSV downloaded.", "success");
    },

    campaignTemplateRef(template) {
      if (!template || typeof template !== "object") {
        return "";
      }
      const byId = String(template.id || template._id || "").trim();
      if (byId) {
        return byId;
      }
      return String(template.key || "").trim();
    },

    campaignTemplateById(templateId) {
      const normalizedId = String(templateId || "").trim();
      if (!normalizedId) {
        return null;
      }

      return (
        this.campaignTemplates.find((template) => {
          const ref = this.campaignTemplateRef(template);
          return ref === normalizedId || String(template.key || "").trim() === normalizedId;
        }) || null
      );
    },

    applyCampaignTemplateById(templateId) {
      const template = this.campaignTemplateById(templateId);
      if (!template) {
        this.selectedCampaignTemplateId = "";
        return;
      }

      this.selectedCampaignTemplateId = this.campaignTemplateRef(template);
      this.campaignTemplateName = String(template.name || "");
      this.campaignDraft.subject = String(template.subject || "");
      this.campaignDraft.html = String(template.html || "");
      this.notify("Campaign template loaded.", "success");
    },

    clearCampaignTemplateSelection() {
      this.selectedCampaignTemplateId = "";
      this.campaignTemplateName = "";
    },

    async loadCampaignTemplates() {
      const response = await this.apiRequest("/admin/campaigns/templates?page=1&limit=100");
      this.campaignTemplates = (response.items || []).map((item) => ({
        ...item,
        id: this.campaignTemplateRef(item)
      }));

      if (!this.selectedCampaignTemplateId) {
        return;
      }
      const selected = this.campaignTemplateById(this.selectedCampaignTemplateId);
      if (!selected) {
        this.clearCampaignTemplateSelection();
      }
    },

    async saveCampaignTemplate() {
      try {
        const name = String(this.campaignTemplateName || "").trim();
        const subject = String(this.campaignDraft.subject || "").trim();
        const html = String(this.campaignDraft.html || "").trim();

        if (!name) {
          throw new Error("Template name is required.");
        }
        if (!subject || !html) {
          throw new Error("Template subject and html are required.");
        }

        const body = { name, subject, html };
        let savedTemplate;
        const selectedId = String(this.selectedCampaignTemplateId || "").trim();
        if (selectedId) {
          savedTemplate = await this.apiRequest(`/admin/campaigns/templates/${selectedId}`, {
            method: "PATCH",
            body
          });
        } else {
          savedTemplate = await this.apiRequest("/admin/campaigns/templates", {
            method: "POST",
            body
          });
        }

        await this.loadCampaignTemplates();
        const savedTemplateRef = this.campaignTemplateRef(savedTemplate);
        this.selectedCampaignTemplateId = savedTemplateRef;
        this.campaignTemplateName = String(savedTemplate?.name || name);
        if (savedTemplateRef) {
          this.applyCampaignTemplateById(savedTemplateRef);
        }
        this.notify(selectedId ? "Campaign template updated." : "Campaign template saved.", "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async deleteCampaignTemplate(template) {
      try {
        const target =
          template ||
          this.campaignTemplateById(this.selectedCampaignTemplateId) ||
          this.campaignTemplates.find(
            (item) =>
              String(item.name || "").trim().toLowerCase() ===
              String(this.campaignTemplateName || "").trim().toLowerCase()
          );
        const targetRef = this.campaignTemplateRef(target);
        if (!targetRef) {
          throw new Error("Select a template to delete.");
        }
        if (!confirm(`Delete campaign template "${target.name}"?`)) {
          return;
        }
        await this.apiRequest(`/admin/campaigns/templates/${encodeURIComponent(targetRef)}`, {
          method: "DELETE"
        });
        if (String(targetRef) === String(this.selectedCampaignTemplateId || "")) {
          this.clearCampaignTemplateSelection();
        }
        this.notify("Campaign template deleted.", "success");
        await this.loadCampaignTemplates();
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async loadCampaigns() {
      const [campaignResponse, templateResponse] = await Promise.all([
        this.apiRequest("/admin/campaigns?page=1&limit=50"),
        this.apiRequest("/admin/campaigns/templates?page=1&limit=100")
      ]);
      this.campaigns = campaignResponse.items || [];
      this.campaignTemplates = (templateResponse.items || []).map((item) => ({
        ...item,
        id: this.campaignTemplateRef(item)
      }));

      if (this.selectedCampaignTemplateId && !this.campaignTemplateById(this.selectedCampaignTemplateId)) {
        this.clearCampaignTemplateSelection();
      }
    },

    async createCampaign() {
      if (!this.campaignDraft.subject || !this.campaignDraft.html) {
        throw new Error("Campaign subject and html are required.");
      }
      await this.apiRequest("/admin/campaigns", {
        method: "POST",
        body: {
          subject: this.campaignDraft.subject,
          html: this.campaignDraft.html
        }
      });
      this.campaignDraft.subject = "";
      this.campaignDraft.html = "";
      this.notify("Campaign draft created.", "success");
      await this.loadCampaigns();
    },

    async sendCampaign(campaign) {
      const result = await this.apiRequest(`/admin/campaigns/${campaign.id}/send`, { method: "POST" });
      this.notify(`Campaign queued for ${this.number(result.queued || 0)} recipients.`, "success");
      await this.loadCampaigns();
    },

    async resendCampaign(campaign) {
      const result = await this.apiRequest(`/admin/campaigns/${campaign.id}/resend-non-openers`, { method: "POST" });
      this.notify(`Resend queued for ${this.number(result.queued || 0)} recipients.`, "success");
      await this.loadCampaigns();
    },

    async deleteCampaign(campaign) {
      if (!confirm(`Delete campaign ${campaign.subject}?`)) return;
      await this.apiRequest(`/admin/campaigns/${campaign.id}`, { method: "DELETE" });
      this.notify("Campaign deleted.", "success");
      await this.loadCampaigns();
    },

    async loadAnalytics() {
      if (!this.loadedTabs.dashboard) {
        await this.loadDashboard();
      }
      const topBuyerResponse = await this.apiRequest("/admin/users?page=1&limit=8&sort=top_spent");
      this.topBuyers = (topBuyerResponse.items || [])
        .filter((user) => Number(user.totalSpent || 0) > 0 || Number(user.orderCount || 0) > 0)
        .map((user) => ({
          id: user.id,
          name: user.name || "Unknown",
          email: user.email || "",
          orderCount: Number(user.orderCount || 0),
          totalSpent: Number(user.totalSpent || 0),
          lastOrderAt: user.lastOrderAt || null
        }));

      const counts = { delivered: 0, processing: 0, cancelled: 0, pending: 0, shipped: 0 };
      this.orders.forEach((order) => {
        if (counts[order.fulfillmentStatus] !== undefined) {
          counts[order.fulfillmentStatus] += 1;
        }
      });
      this.renderOrdersPie(counts);
    },

    async loadReports() {
      const [
        financial,
        walletsRes,
        reservations,
        disputesRes,
        health,
        ready
      ] = await Promise.all([
        this.apiRequest("/admin/financial/summary"),
        this.apiRequest("/admin/wallets?page=1&limit=20"),
        this.apiRequest("/admin/reservations"),
        this.apiRequest(`/admin/disputes?${this.toQueryString({
          page: 1,
          limit: 50,
          status: this.disputeFilters.status
        })}`),
        this.apiRequest("/health").catch(() => ({ ok: false })),
        this.apiRequest("/ready").catch(() => ({ ok: false }))
      ]);
      this.financialSummary = {
        ...this.financialSummary,
        ...financial
      };
      this.wallets = walletsRes.items || [];
      this.disputes = disputesRes.items || [];
      this.disputeDrafts = {};
      this.disputes.forEach((item) => {
        this.disputeDrafts[item.id] = {
          status: item.status || "under_review",
          resolution: item.resolution || "none",
          resolutionAmount: item.resolutionAmount ? String(item.resolutionAmount) : "",
          adminNote: item.adminNote || ""
        };
      });
      this.reservations = {
        active: reservations.active || [],
        expired: reservations.expired || [],
        consumed: reservations.consumed || []
      };
      this.systemHealth = {
        api: health?.ok ? "up" : "down",
        dependencies: ready?.ok ? "up" : "down",
        lastCheckedAt: new Date().toISOString()
      };
    },

    async applyReportFilters() {
      try {
        await this.loadReports(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async loadCoupons() {
      const response = await this.apiRequest(`/admin/coupons?${this.toQueryString({
        page: 1,
        limit: 100,
        isActive: this.couponFilters.isActive
      })}`);
      this.coupons = response.items || [];
    },

    async applyCouponFilters() {
      try {
        await this.loadCoupons(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async createCoupon() {
      try {
        if (!this.couponDraft.code || !this.couponDraft.value || !this.couponDraft.maxUses || !this.couponDraft.expiresAt) {
          throw new Error("Coupon code, value, max uses, and expiry are required.");
        }
        await this.apiRequest("/admin/coupons", {
          method: "POST",
          body: {
            code: this.couponDraft.code.trim().toUpperCase(),
            type: this.couponDraft.type,
            value: Number(this.couponDraft.value || 0),
            maxUses: Number(this.couponDraft.maxUses || 0),
            expiresAt: new Date(this.couponDraft.expiresAt).toISOString(),
            minOrderAmount: Number(this.couponDraft.minOrderAmount || 0),
            appliesTo: this.couponDraft.appliesTo,
            isActive: Boolean(this.couponDraft.isActive)
          }
        });
        this.couponDraft = {
          code: "",
          type: "percent",
          value: "",
          maxUses: "",
          expiresAt: "",
          minOrderAmount: "0",
          appliesTo: "both",
          isActive: true
        };
        this.notify("Coupon created.", "success");
        await this.loadCoupons(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async updateCoupon(coupon) {
      try {
        if (!coupon?.id) {
          return;
        }
        await this.apiRequest(`/admin/coupons/${coupon.id}`, {
          method: "PATCH",
          body: {
            type: coupon.type,
            value: Number(coupon.value || 0),
            maxUses: Number(coupon.maxUses || 1),
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : undefined,
            minOrderAmount: Number(coupon.minOrderAmount || 0),
            appliesTo: coupon.appliesTo,
            isActive: Boolean(coupon.isActive)
          }
        });
        this.notify(`Coupon ${coupon.code} updated.`, "success");
        await this.loadCoupons(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async deleteCoupon(coupon) {
      try {
        if (!coupon?.id) {
          return;
        }
        if (!confirm(`Delete coupon ${coupon.code}?`)) {
          return;
        }

        await this.apiRequest(`/admin/coupons/${coupon.id}`, {
          method: "DELETE"
        });
        this.notify(`Coupon ${coupon.code} deleted.`, "success");
        await this.loadCoupons(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    async resolveDispute(dispute) {
      try {
        if (!dispute?.id) {
          return;
        }
        const draft = this.disputeDrafts[dispute.id] || {};
        const payload = {
          status: draft.status || undefined,
          resolution: draft.resolution || undefined,
          resolutionAmount:
            draft.resolution === "partial_refund" && Number(draft.resolutionAmount || 0) > 0
              ? Number(draft.resolutionAmount || 0)
              : undefined,
          adminNote: draft.adminNote || undefined
        };
        await this.apiRequest(`/admin/disputes/${dispute.id}`, {
          method: "PATCH",
          body: payload
        });
        this.notify("Dispute updated.", "success");
        await this.loadReports(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      }
    },

    exportFinancialMonthlyCsv() {
      const rows = [
        ["month", "orders", "gmv", "netRevenue", "fees"],
        ...(this.financialSummary.monthlyReport || []).map((row) => [
          row.month,
          row.orders,
          row.gmv,
          row.netRevenue,
          row.fees
        ])
      ];
      const csv = rows.map((row) => row.map((cell) => this.escapeCsv(cell)).join(",")).join("\n");
      this.downloadBlob(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
        `financial-monthly-${this.todayFileDate()}.csv`
      );
      this.notify("Monthly financial CSV downloaded.", "success");
    },

    async loadSettings() {
      this.ensureCourierSettings();
      const [templateResponse, smtpResponse, courierResponse] = await Promise.all([
        this.apiRequest("/admin/email-templates"),
        this.apiRequest("/admin/email-templates/transport/smtp"),
        this.apiRequest("/admin/courier/steadfast/settings")
      ]);

      const items = templateResponse.items || [];
      this.templateKeys = items.map((item) => item.key);
      if (!this.templateEditor.selectedKey && this.templateKeys.length) {
        this.templateEditor.selectedKey = this.templateKeys[0];
      }
      if (this.templateEditor.selectedKey) {
        await this.selectTemplate(this.templateEditor.selectedKey);
      }

      const testEmail = this.smtpSettings.testEmail || "";
      this.smtpSettings = {
        ...this.smtpSettings,
        enabled: Boolean(smtpResponse.enabled),
        host: String(smtpResponse.host || ""),
        port: Number(smtpResponse.port || 465),
        secure: Boolean(smtpResponse.secure),
        username: String(smtpResponse.username || ""),
        password: "",
        hasPassword: Boolean(smtpResponse.hasPassword),
        passwordMasked: String(smtpResponse.passwordMasked || ""),
        fromEmail: String(smtpResponse.fromEmail || ""),
        fromName: String(smtpResponse.fromName || ""),
        replyTo: String(smtpResponse.replyTo || ""),
        ignoreTLS: Boolean(smtpResponse.ignoreTLS),
        testEmail,
        saving: false,
        testing: false
      };

      this.courierSettings = {
        ...this.ensureCourierSettings(),
        provider: courierResponse.provider || "steadfast",
        enabled: Boolean(courierResponse.enabled),
        baseUrl: String(courierResponse.baseUrl || "https://portal.packzy.com/api/v1"),
        apiKey: String(courierResponse.apiKey || ""),
        secretKey: "",
        hasSecret: Boolean(courierResponse.hasSecret),
        secretKeyMasked: String(courierResponse.secretKeyMasked || ""),
        fraudCheckerEnabled: Boolean(courierResponse.fraudCheckerEnabled),
        fraudCheckerEmail: String(courierResponse.fraudCheckerEmail || ""),
        fraudCheckerPassword: "",
        fraudCheckerHasPassword: Boolean(courierResponse.fraudCheckerHasPassword),
        fraudCheckerPasswordMasked: String(courierResponse.fraudCheckerPasswordMasked || ""),
        defaultDeliveryType: Number(courierResponse.defaultDeliveryType || 0) === 1 ? 1 : 0,
        defaultItemDescription: String(courierResponse.defaultItemDescription || "BidnSteal order"),
        saving: false,
        balanceLoading: false
      };
    },

    async saveCourierSettings() {
      const settings = this.ensureCourierSettings();
      settings.saving = true;
      try {
        const payload = {
          enabled: Boolean(settings.enabled),
          baseUrl: String(settings.baseUrl || "").trim(),
          apiKey: String(settings.apiKey || "").trim(),
          secretKey: String(settings.secretKey || "").trim() || undefined,
          fraudCheckerEnabled: Boolean(settings.fraudCheckerEnabled),
          fraudCheckerEmail: String(settings.fraudCheckerEmail || "").trim(),
          fraudCheckerPassword: String(settings.fraudCheckerPassword || "").trim() || undefined,
          defaultDeliveryType: Number(settings.defaultDeliveryType || 0) === 1 ? 1 : 0,
          defaultItemDescription:
            String(settings.defaultItemDescription || "").trim() || "BidnSteal order"
        };
        const saved = await this.apiRequest("/admin/courier/steadfast/settings", {
          method: "PUT",
          body: payload
        });
        settings.provider = String(saved.provider || "steadfast");
        settings.enabled = Boolean(saved.enabled);
        settings.baseUrl = String(saved.baseUrl || payload.baseUrl || "https://portal.packzy.com/api/v1");
        settings.apiKey = String(saved.apiKey || payload.apiKey);
        settings.secretKey = "";
        settings.hasSecret = Boolean(saved.hasSecret);
        settings.secretKeyMasked = String(saved.secretKeyMasked || "");
        settings.fraudCheckerEnabled = Boolean(saved.fraudCheckerEnabled);
        settings.fraudCheckerEmail = String(saved.fraudCheckerEmail || payload.fraudCheckerEmail || "");
        settings.fraudCheckerPassword = "";
        settings.fraudCheckerHasPassword = Boolean(saved.fraudCheckerHasPassword);
        settings.fraudCheckerPasswordMasked = String(saved.fraudCheckerPasswordMasked || "");
        settings.defaultDeliveryType = Number(saved.defaultDeliveryType || 0) === 1 ? 1 : 0;
        settings.defaultItemDescription = String(
          saved.defaultItemDescription || payload.defaultItemDescription
        );
        this.courierSettings = settings;
        this.notify("Courier settings saved.", "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        settings.saving = false;
        this.courierSettings = settings;
      }
    },

    async checkCourierBalance() {
      const settings = this.ensureCourierSettings();
      settings.balanceLoading = true;
      try {
        const response = await this.apiRequest("/admin/courier/steadfast/balance");
        settings.balance = Number(response.currentBalance || 0);
        this.courierSettings = settings;
        this.notify("Courier balance fetched.", "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        settings.balanceLoading = false;
        this.courierSettings = settings;
      }
    },

    async saveSmtpSettings() {
      this.smtpSettings.saving = true;
      try {
        const payload = {
          enabled: Boolean(this.smtpSettings.enabled),
          host: String(this.smtpSettings.host || "").trim(),
          port: Number(this.smtpSettings.port || 465),
          secure: Boolean(this.smtpSettings.secure),
          username: String(this.smtpSettings.username || "").trim(),
          fromEmail: String(this.smtpSettings.fromEmail || "").trim(),
          fromName: String(this.smtpSettings.fromName || "").trim(),
          replyTo: String(this.smtpSettings.replyTo || "").trim(),
          ignoreTLS: Boolean(this.smtpSettings.ignoreTLS)
        };
        const password = String(this.smtpSettings.password || "").trim();

        if (payload.enabled) {
          if (!payload.host || !payload.username || !payload.fromEmail) {
            throw new Error("SMTP host, username, and from email are required when SMTP is enabled.");
          }
          if (!password && !this.smtpSettings.hasPassword) {
            throw new Error("SMTP password is required when SMTP is enabled.");
          }
        }

        const body = password ? { ...payload, password } : payload;
        const saved = await this.apiRequest("/admin/email-templates/transport/smtp", {
          method: "PUT",
          body
        });

        this.smtpSettings.enabled = Boolean(saved.enabled);
        this.smtpSettings.host = String(saved.host || "");
        this.smtpSettings.port = Number(saved.port || 465);
        this.smtpSettings.secure = Boolean(saved.secure);
        this.smtpSettings.username = String(saved.username || "");
        this.smtpSettings.password = "";
        this.smtpSettings.hasPassword = Boolean(saved.hasPassword);
        this.smtpSettings.passwordMasked = String(saved.passwordMasked || "");
        this.smtpSettings.fromEmail = String(saved.fromEmail || "");
        this.smtpSettings.fromName = String(saved.fromName || "");
        this.smtpSettings.replyTo = String(saved.replyTo || "");
        this.smtpSettings.ignoreTLS = Boolean(saved.ignoreTLS);

        this.notify("SMTP email settings saved.", "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.smtpSettings.saving = false;
      }
    },

    async testSmtpSettings() {
      this.smtpSettings.testing = true;
      try {
        const to = String(this.smtpSettings.testEmail || "").trim();
        if (!to) {
          throw new Error("Enter a test recipient email.");
        }

        await this.apiRequest("/admin/email-templates/transport/smtp/test", {
          method: "POST",
          body: { to }
        });
        this.notify(`SMTP test email sent to ${to}.`, "success");
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.smtpSettings.testing = false;
      }
    },

    async selectTemplate(key) {
      if (!key) return;
      const template = await this.apiRequest(`/admin/email-templates/${key}`);
      this.templateEditor.selectedKey = template.key;
      this.templateEditor.key = template.key;
      this.templateEditor.subjectTemplate = template.subjectTemplate;
      this.templateEditor.htmlTemplate = template.htmlTemplate;
    },
    async createTemplate() {
      if (!this.templateEditor.key || !this.templateEditor.subjectTemplate || !this.templateEditor.htmlTemplate) {
        throw new Error("Template key, subject, and html are required.");
      }
      await this.apiRequest("/admin/email-templates", {
        method: "POST",
        body: {
          key: this.templateEditor.key,
          subjectTemplate: this.templateEditor.subjectTemplate,
          htmlTemplate: this.templateEditor.htmlTemplate,
          isActive: true
        }
      });
      this.notify("Template created.", "success");
      await this.loadSettings();
    },

    async updateTemplate() {
      const key = this.templateEditor.selectedKey || this.templateEditor.key;
      if (!key) throw new Error("Template key required.");
      await this.apiRequest(`/admin/email-templates/${key}`, {
        method: "PUT",
        body: {
          subjectTemplate: this.templateEditor.subjectTemplate,
          htmlTemplate: this.templateEditor.htmlTemplate,
          isActive: true
        }
      });
      this.notify("Template updated.", "success");
    },

    async previewTemplate() {
      const key = this.templateEditor.selectedKey || this.templateEditor.key;
      if (!key) throw new Error("Template key required.");
      const preview = await this.apiRequest(`/admin/email-templates/${key}/preview`, {
        method: "POST",
        body: { data: {} }
      });
      this.templatePreview = {
        subject: preview.subject || "",
        html: preview.html || ""
      };
    },

    async testSendTemplate() {
      const key = this.templateEditor.selectedKey || this.templateEditor.key;
      if (!key || !this.templateEditor.testEmail) {
        throw new Error("Template key and test email required.");
      }
      await this.apiRequest(`/admin/email-templates/${key}/test-send`, {
        method: "POST",
        body: {
          email: this.templateEditor.testEmail,
          data: {}
        }
      });
      this.notify("Test email sent.", "success");
    },

    insertTemplateTag(tag) {
      if (!tag) return;
      this.insertTemplateText(`{{${tag}}}`);
    },

    insertTemplateText(value) {
      const normalized = String(value || "").trim();
      if (!normalized) return;
      if (!this.templateEditor.htmlTemplate) {
        this.templateEditor.htmlTemplate = normalized;
      } else {
        this.templateEditor.htmlTemplate = `${this.templateEditor.htmlTemplate}\n${normalized}`;
      }
    },

    async copyText(value) {
      const text = String(value || "");
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.notify("Copied to clipboard.", "success");
      } catch {
        this.notify("Clipboard permission denied.", "error");
      }
    },

    defaultAuctionWindow() {
      const now = new Date();
      const start = new Date(now.getTime() + 5 * 60 * 1000);
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return {
        startAt: this.toLocalDatetime(start),
        endAt: this.toLocalDatetime(end)
      };
    },

    openProductCreate() {
      const auctionWindow = this.defaultAuctionWindow();
      this.productModal.mode = "create";
      this.productModal.productId = "";
      this.productModal.form = {
        title: "",
        slug: "",
        price: "",
        sku: "",
        stock: "",
        condition: "carded",
        saleMode: "fixed",
        series: "",
        primaryImage: "",
        galleryImages: "",
        tags: "",
        description: "",
        isFeatured: false,
        isNewDrop: false,
        auctionStartAt: auctionWindow.startAt,
        auctionEndAt: auctionWindow.endAt,
        auctionStartingPrice: "",
        auctionReservePrice: "",
        auctionMinIncrement: "1"
      };
      this.productMediaPicker.open = false;
      this.productMediaPicker.search = "";
      this.productModal.open = true;
      void this.ensureMediaLoadedForProduct();
      this.refreshIcons();
    },

    async openProductEdit(item) {
      let detail = null;
      try {
        detail = await this.apiRequest(`/products/${item.slug}`);
      } catch {
        detail = null;
      }
      const identifier = this.productIdentifier(item) || item.slug || "";
      const saleMode = detail?.saleMode || item.saleMode || "fixed";
      const auctionWindow = this.defaultAuctionWindow();
      let auctionState = null;
      if (identifier && saleMode !== "fixed") {
        try {
          auctionState = await this.apiRequest(`/auctions/${identifier}`);
        } catch {
          auctionState = null;
        }
      }
      const detailImages = Array.isArray(detail?.images) ? detail.images : [];
      const normalizedImages = detailImages
        .map((url) => this.mediaUrl(url))
        .filter(Boolean);
      this.productModal.mode = "edit";
      this.productModal.productId = identifier;
      this.productModal.form = {
        title: detail?.title || item.title,
        slug: detail?.slug || item.slug,
        price: detail?.price ?? item.price,
        sku: detail?.sku || item.sku,
        stock: detail?.stock ?? item.stock,
        condition: detail?.condition || item.condition,
        saleMode,
        series: detail?.series || item.series || "",
        primaryImage: normalizedImages[0] || "",
        galleryImages: normalizedImages.slice(1).join(", "),
        tags: "",
        description: detail?.description || item.description || "",
        isFeatured: Boolean(detail?.isFeatured ?? item.isFeatured),
        isNewDrop: Boolean(detail?.isNewDrop ?? item.isNewDrop),
        auctionStartAt: auctionWindow.startAt,
        auctionEndAt: auctionState?.endAt ? this.toLocalDatetime(new Date(auctionState.endAt)) : auctionWindow.endAt,
        auctionStartingPrice:
          auctionState?.startingPrice !== undefined
            ? String(auctionState.startingPrice)
            : String(Math.max(0, Math.round(Number(detail?.price ?? item.price ?? 0)))),
        auctionReservePrice: "",
        auctionMinIncrement: String(Math.max(1, Number(auctionState?.minIncrement || 1)))
      };
      this.productMediaPicker.open = false;
      this.productMediaPicker.search = "";
      this.productModal.open = true;
      await this.ensureMediaLoadedForProduct();
      this.refreshIcons();
    },

    closeProductModal() {
      this.productModal.open = false;
      this.productModal.saving = false;
      this.productMediaPicker.open = false;
      this.productMediaPicker.search = "";
    },

    parseCsv(value) {
      return String(value || "").split(",").map((x) => x.trim()).filter(Boolean);
    },

    buildProductAuctionPayload(productId) {
      if (!productId) {
        throw new Error("Cannot configure auction: missing product id.");
      }
      if (this.productModal.form.saleMode === "fixed") {
        return null;
      }

      const startRaw = String(this.productModal.form.auctionStartAt || "").trim();
      const endRaw = String(this.productModal.form.auctionEndAt || "").trim();
      if (!startRaw || !endRaw) {
        throw new Error("Auction start and end time are required for auction/hybrid products.");
      }

      const startAt = new Date(startRaw);
      const endAt = new Date(endRaw);
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        throw new Error("Invalid auction start/end time.");
      }
      if (endAt.getTime() <= startAt.getTime()) {
        throw new Error("Auction end time must be after start time.");
      }
      if (startAt.getTime() <= Date.now()) {
        throw new Error("Auction start time must be in the future.");
      }

      const startingPrice = Math.max(
        0,
        Math.round(Number(this.productModal.form.auctionStartingPrice || this.productModal.form.price || 0))
      );
      const minIncrement = Math.max(1, Math.round(Number(this.productModal.form.auctionMinIncrement || 1)));
      if (!Number.isFinite(startingPrice)) {
        throw new Error("Invalid auction starting price.");
      }
      if (!Number.isFinite(minIncrement) || minIncrement < 1) {
        throw new Error("Invalid auction minimum increment.");
      }

      let reservePrice;
      const reserveRaw = String(this.productModal.form.auctionReservePrice || "").trim();
      if (reserveRaw) {
        reservePrice = Math.max(0, Math.round(Number(reserveRaw)));
        if (!Number.isFinite(reservePrice)) {
          throw new Error("Invalid auction reserve price.");
        }
      }

      return {
        productId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        startingPrice,
        reservePrice,
        minIncrement
      };
    },

    async saveProductModal() {
      this.productModal.saving = true;
      try {
        const primaryImage = this.mediaUrl(this.productModal.form.primaryImage || "");
        const galleryImages = this.parseCsv(this.productModal.form.galleryImages || "")
          .map((url) => this.mediaUrl(url))
          .filter(Boolean);
        const mergedImages = [...new Set([primaryImage, ...galleryImages].filter(Boolean))];
        const body = {
          title: this.productModal.form.title,
          slug: this.productModal.form.slug || undefined,
          price: Number(this.productModal.form.price || 0),
          sku: this.productModal.form.sku,
          stock: Number(this.productModal.form.stock || 0),
          condition: this.productModal.form.condition,
          saleMode: this.productModal.form.saleMode,
          series: this.productModal.form.series || undefined,
          images: mergedImages,
          tags: this.parseCsv(this.productModal.form.tags),
          description: this.productModal.form.description || undefined,
          isFeatured: Boolean(this.productModal.form.isFeatured),
          isNewDrop: Boolean(this.productModal.form.isNewDrop)
        };
        const requiresAuction = this.productModal.form.saleMode !== "fixed";
        const auctionDraftPayload = requiresAuction ? this.buildProductAuctionPayload("_pending_") : null;

        let savedProduct;
        const modeLabel = this.productModal.mode === "create" ? "created" : "updated";
        if (this.productModal.mode === "create") {
          savedProduct = await this.apiRequest("/admin/products", { method: "POST", body });
        } else {
          savedProduct = await this.apiRequest(`/admin/products/${this.productModal.productId}`, {
            method: "PATCH",
            body
          });
        }

        let auctionNote = "";
        if (auctionDraftPayload) {
          const auctionPayload = {
            ...auctionDraftPayload,
            productId: savedProduct?.id || this.productModal.productId
          };
          if (auctionPayload) {
            try {
              await this.apiRequest("/admin/auctions", {
                method: "POST",
                body: auctionPayload
              });
              auctionNote = " Auction configured.";
            } catch (error) {
              const message = this.errorMessage(error);
              if (String(message).toLowerCase().includes("already exists")) {
                auctionNote = " Auction already exists for this product.";
              } else {
                throw new Error(`Product ${modeLabel}, but auction setup failed: ${message}`);
              }
            }
          }
        }

        this.notify(`Product ${modeLabel}.${auctionNote}`, "success");
        this.closeProductModal();
        await this.loadInventory();
        await this.loadAuctions(true);
        this.loadedTabs.dashboard = false;
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.productModal.saving = false;
      }
    },

    async deleteProduct(item, options = {}) {
      const skipConfirm = Boolean(options.skipConfirm);
      const skipReload = Boolean(options.skipReload);
      const silent = Boolean(options.silent);
      const rethrow = Boolean(options.rethrow);
      try {
        const identifier = this.productIdentifier(item);
        if (!identifier) {
          const message = "Product identifier missing. Reload inventory and try again.";
          if (!silent) {
            this.notify(message, "error");
          }
          if (rethrow) {
            throw new Error(message);
          }
          return;
        }
        const label = String(item?.title || identifier).trim();
        if (!skipConfirm && !confirm(`Delete product "${label}"?`)) {
          return;
        }
        await this.apiRequest(`/admin/products/${encodeURIComponent(identifier)}`, { method: "DELETE" });
        delete this.inventorySelection[identifier];
        this.inventorySelection = { ...this.inventorySelection };
        if (!skipReload) {
          await this.loadInventory();
        }
        this.loadedTabs.dashboard = false;
        if (!silent) {
          this.notify("Product removed.", "success");
        }
      } catch (error) {
        if (!silent) {
          this.notify(this.errorMessage(error), "error");
        }
        if (rethrow) {
          throw error;
        }
      }
    },

    async deleteSelectedInventory() {
      const selectedIds = this.selectedInventoryIds();
      if (!selectedIds.length) {
        this.notify("Select at least one product.");
        return;
      }
      if (!confirm(`Delete ${selectedIds.length} selected product(s)? This cannot be undone.`)) {
        return;
      }

      this.inventoryDeleting = true;
      let deleted = 0;
      let failed = 0;

      try {
        for (const productId of selectedIds) {
          const targetProduct = this.inventory.find((item) => String(this.productIdentifier(item)) === String(productId));
          try {
            await this.deleteProduct(targetProduct || { id: productId, title: productId }, {
              skipConfirm: true,
              skipReload: true,
              silent: true,
              rethrow: true
            });
            deleted += 1;
          } catch (error) {
            failed += 1;
            if (this.localSettings.debug) {
              console.error("Failed to delete product", productId, error);
            }
          }
        }

        await this.loadInventory();
      } finally {
        this.inventoryDeleting = false;
      }

      if (deleted && !failed) {
        this.notify(`Deleted ${deleted} product(s).`, "success");
        return;
      }
      if (deleted && failed) {
        this.notify(`Deleted ${deleted} product(s). Failed: ${failed}.`, "info");
        return;
      }
      this.notify("Failed to delete selected products.", "error");
    },

    async openAuctionCreate() {
      try {
        if (!this.inventory.length) {
          await this.loadInventory();
        }
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
        return;
      }
      const auctionWindow = this.defaultAuctionWindow();
      this.auctionModal.form = {
        productId: "",
        startAt: auctionWindow.startAt,
        endAt: auctionWindow.endAt,
        startingPrice: "",
        reservePrice: "",
        minIncrement: "1"
      };
      this.auctionModal.open = true;
      this.refreshIcons();
    },

    closeAuctionModal() {
      this.auctionModal.open = false;
      this.auctionModal.saving = false;
    },

    async saveAuctionModal() {
      const form = this.auctionModal.form;
      const productId = String(form.productId || "").trim();
      if (!productId || !form.startAt || !form.endAt) {
        throw new Error("Product, start, and end are required.");
      }

      const startAtDate = new Date(form.startAt);
      const endAtDate = new Date(form.endAt);
      if (Number.isNaN(startAtDate.getTime()) || Number.isNaN(endAtDate.getTime())) {
        throw new Error("Invalid auction start/end time.");
      }
      if (endAtDate.getTime() <= startAtDate.getTime()) {
        throw new Error("Auction end time must be after start time.");
      }
      if (startAtDate.getTime() <= Date.now()) {
        throw new Error("Auction start time must be in the future.");
      }

      const startingPriceRaw = String(form.startingPrice ?? "").trim();
      const minIncrementRaw = String(form.minIncrement ?? "").trim();
      const reservePriceRaw = String(form.reservePrice ?? "").trim();

      const startingPrice = Number(startingPriceRaw === "" ? 0 : startingPriceRaw);
      const minIncrement = Number(minIncrementRaw === "" ? 1 : minIncrementRaw);
      const reservePrice = reservePriceRaw === "" ? undefined : Number(reservePriceRaw);

      if (!Number.isFinite(startingPrice) || !Number.isInteger(startingPrice) || startingPrice < 0) {
        throw new Error("Starting price must be a whole number 0 or higher.");
      }
      if (!Number.isFinite(minIncrement) || !Number.isInteger(minIncrement) || minIncrement < 1) {
        throw new Error("Minimum bid increment must be a whole number 1 or higher.");
      }
      if (
        reservePrice !== undefined &&
        (!Number.isFinite(reservePrice) || !Number.isInteger(reservePrice) || reservePrice < 0)
      ) {
        throw new Error("Reserve price must be a whole number 0 or higher.");
      }

      this.auctionModal.saving = true;
      try {
        await this.apiRequest("/admin/auctions", {
          method: "POST",
          body: {
            productId,
            startAt: startAtDate.toISOString(),
            endAt: endAtDate.toISOString(),
            startingPrice,
            reservePrice,
            minIncrement
          }
        });
        this.notify("Auction created.", "success");
        this.closeAuctionModal();
        await this.loadAuctions(true);
      } catch (error) {
        this.notify(this.errorMessage(error), "error");
      } finally {
        this.auctionModal.saving = false;
      }
    },
    renderRevenueChart() {
      const series = this.revenueSeries[this.revenueWindow] || { labels: [], values: [] };
      const labels = series.labels.length ? series.labels : ["No data"];
      const gmv = series.values.length ? series.values : [0];
      const wrap = document.getElementById("revenueChartWrap");
      const canvas = document.getElementById("revenueChart");
      if (!canvas || !wrap) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      wrap.style.height = "260px";
      canvas.style.height = "100%";
      canvas.style.width = "100%";
      canvas.style.maxHeight = "260px";

      if (this.charts.revenue) {
        try {
          const boundCanvas = this.charts.revenue.canvas;
          const sameCanvas = boundCanvas === canvas;
          if (!sameCanvas) {
            this.charts.revenue.destroy();
            this.charts.revenue = null;
          } else {
            this.charts.revenue.data.labels = labels;
            this.charts.revenue.data.datasets[0].label = `Revenue (${this.revenueWindow.toUpperCase()})`;
            this.charts.revenue.data.datasets[0].data = gmv;
            this.charts.revenue.resize();
            this.charts.revenue.update("none");
            return;
          }
        } catch (error) {
          if (this.localSettings.debug) {
            console.error("[admin] revenue chart recover", error);
          }
          try {
            this.charts.revenue.destroy();
          } catch {
            // ignore chart destroy failure
          }
          this.charts.revenue = null;
        }
      }

      this.charts.revenue = new Chart(context, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: `Revenue (${this.revenueWindow.toUpperCase()})`,
              data: gmv,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.15)",
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          resizeDelay: 100,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${this.currency(ctx.parsed.y || 0)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#27272a" },
              ticks: { color: "#71717a", font: { size: 10 } }
            },
            x: { grid: { display: false }, ticks: { color: "#71717a", font: { size: 10 } } }
          }
        }
      });
    },

    renderOrdersPie(counts) {
      const canvas = document.getElementById("ordersPieChart");
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      if (this.charts.ordersPie) {
        try {
          const boundCanvas = this.charts.ordersPie.canvas;
          const sameCanvas = boundCanvas === canvas;
          if (sameCanvas) {
            this.charts.ordersPie.destroy();
            this.charts.ordersPie = null;
          } else {
            this.charts.ordersPie.destroy();
            this.charts.ordersPie = null;
          }
        } catch (error) {
          if (this.localSettings.debug) {
            console.error("[admin] orders pie chart recover", error);
          }
          this.charts.ordersPie = null;
        }
      }

      const values = counts || {
        delivered: 0,
        processing: 0,
        cancelled: 0,
        pending: 0,
        shipped: 0
      };

      this.charts.ordersPie = new Chart(context, {
        type: "doughnut",
        data: {
          labels: ["Delivered", "Processing", "Shipped", "Pending", "Cancelled"],
          datasets: [
            {
              data: [values.delivered, values.processing, values.shipped, values.pending, values.cancelled],
              backgroundColor: ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444"],
              borderWidth: 0,
              cutout: "70%"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: "#71717a", usePointStyle: true, boxWidth: 6 }
            }
          }
        }
      });
    },

    updateAuctionTimers() {
      const shouldTick =
        this.activeTab === "dashboard" || this.activeTab === "auctions" || Boolean(this.auctionDetailsModal?.open);
      if (!shouldTick) return;

      const now = Date.now();
      for (const auction of this.auctionCards || []) {
        const end = Number.isFinite(Number(auction.endMs))
          ? Number(auction.endMs)
          : new Date(auction.endAt).getTime();
        const left = Math.max(0, end - now);
        const text = this.msToClock(left);
        if (auction.timeLeftMs !== left) auction.timeLeftMs = left;
        if (auction.timeLeftText !== text) auction.timeLeftText = text;
      }
      if (this.auctionDetailsModal?.detail?.endAt) {
        const detailEnd = Number.isFinite(Number(this.auctionDetailsModal.detail.endMs))
          ? Number(this.auctionDetailsModal.detail.endMs)
          : new Date(this.auctionDetailsModal.detail.endAt).getTime();
        const detailLeft = Math.max(0, detailEnd - now);
        this.auctionDetailsModal.detail = {
          ...this.auctionDetailsModal.detail,
          timeLeftMs: detailLeft
        };
      }
    },

    msToClock(ms) {
      const s = Math.max(0, Math.floor(ms / 1000));
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      return `${h}:${m}:${sec}`;
    },

    toLocalDatetime(date) {
      const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return d.toISOString().slice(0, 16);
    },

    todayFileDate() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },

    exportOrdersCsv() {
      const rows = [
        ["orderNumber", "total", "paymentStatus", "fulfillmentStatus", "createdAt"],
        ...this.orders.map((o) => [o.orderNumber, o.total, o.paymentStatus, o.fulfillmentStatus, o.createdAt])
      ];
      const csv = rows.map((row) => row.map((cell) => this.escapeCsv(cell)).join(",")).join("\n");
      this.downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `orders-${this.todayFileDate()}.csv`);
      this.notify("Orders CSV downloaded.", "success");
    },

    escapeCsv(value) {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    },

    downloadBlob(blob, fileName) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },

    notify(message, type = "info") {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toast = { show: true, type, message: String(message || "") };
      this.toastTimer = setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    errorMessage(error) {
      if (!error) return "Request failed.";
      if (typeof error === "string") return error;
      if (error.message) return error.message;
      return "Request failed.";
    },

    restoreLocalSettings() {
      try {
        const raw = localStorage.getItem("bidnsteal_admin_local_settings");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.localSettings) {
          this.localSettings = { ...this.localSettings, ...parsed.localSettings };
          if (this.localSettings.auctionView !== "grid" && this.localSettings.auctionView !== "column") {
            this.localSettings.auctionView = "grid";
          }
        }

        const perfMigrationKey = "bidnsteal_admin_perf_v2";
        if (localStorage.getItem(perfMigrationKey) !== "1") {
          this.localSettings.autoRefresh = false;
          localStorage.setItem(perfMigrationKey, "1");
          this.persistLocalSettings();
        }
      } catch {
        // ignore parse failure
      }
    },

    persistLocalSettings() {
      localStorage.setItem(
        "bidnsteal_admin_local_settings",
        JSON.stringify({ localSettings: this.localSettings })
      );
    },

    saveLocalSettings() {
      this.persistLocalSettings();
      this.notify("Local settings saved.", "success");
    },

    async logout() {
      try {
        await this.apiRequest("/auth/logout", { method: "POST" });
      } catch {
        // ignore logout API errors
      }
      window.location.href = "/auth/login?next=/admin";
    },

    initBackground() {
      if (typeof this.__bgCleanup === "function") {
        this.__bgCleanup();
        this.__bgCleanup = null;
      }
      const canvas = document.getElementById("bg-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
})(window);
