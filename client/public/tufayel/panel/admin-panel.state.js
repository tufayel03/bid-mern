(function attachAdminPanelState(global) {
  global.adminPanelState = function adminPanelState() {
    return {
    activeTab: "dashboard",
    showSearch: false,
    menuItems: [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { id: "inventory", label: "Inventory", icon: "package" },
      { id: "media", label: "Media", icon: "image" },
      { id: "auctions", label: "Auctions", icon: "flame" },
      { id: "orders", label: "Orders", icon: "receipt" },
      { id: "users", label: "Users", icon: "users" },
      { id: "subscribers", label: "Subscribers", icon: "mail" },
      { id: "campaigns", label: "Campaigns", icon: "megaphone" },
      { id: "coupons", label: "Coupons", icon: "ticket-percent" },
      { id: "analytics", label: "Analytics", icon: "trending-up" },
      { id: "reports", label: "Reports", icon: "file-text" },
      { id: "settings", label: "Settings", icon: "settings" }
    ],

    // auth and api
    apiBase: "/api",
    csrfTokenCache: null,
    csrfTokenRequest: null,
    authUser: null,

    // ui
    isLoading: false,
    loadedTabs: {},
    toast: { show: false, type: "info", message: "" },
    toastTimer: null,

    // dashboard
    kpisRow1: [],
    kpisRow2: [],
    inventoryStats: {
      totalProducts: 0,
      outOfStock: 0,
      reservedUnits: 0,
      totalUnits: 0,
      stockHealth: 0
    },
    recentOrders: [],
    endingAuctions: [],
    topProducts: [],
    topBuyers: [],

    // inventory
    inventory: [],
    inventoryFilters: {
      search: "",
      saleMode: "All Sale Modes"
    },
    inventorySelection: {},
    inventoryDeleting: false,
    mediaAssets: [],
    mediaFilters: {
      search: ""
    },
    mediaSelection: {},
    mediaUpload: {
      files: [],
      uploading: false
    },

    // auctions
    auctionCards: [],
    auctionFilters: {
      search: "",
      status: ""
    },
    auctionDetailsModal: {
      open: false,
      loading: false,
      saving: false,
      detail: null,
      draft: {
        status: "scheduled",
        startAt: "",
        endAt: "",
        startingPrice: "",
        reservePrice: "",
        minIncrement: "1"
      }
    },

    // orders
    orders: [],
    orderFilters: {
      status: "",
      paymentStatus: "",
      page: 1,
      limit: 20
    },
    ordersMeta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    },
    orderDrafts: {},
    orderSelection: {},
    ordersDeleting: false,
    orderDetailsModal: {
      open: false,
      loading: false,
      saving: false,
      order: null,
      draft: {
        paymentStatus: "unpaid",
        fulfillmentStatus: "pending",
        customerNote: "",
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
      }
    },
    courierSuccessModal: {
      open: false,
      loading: false,
      orderNumber: "",
      phoneNumber: "",
      totalOrders: 0,
      totalDelivered: 0,
      totalCancelled: 0,
      successRatio: 0
    },

    // users
    users: [],
    userFilters: {
      page: 1,
      limit: 20
    },
    usersMeta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    },
    selectedUserDetails: null,
    userDetailsLoading: false,
    usersImport: {
      file: null,
      fileName: "",
      importing: false
    },

    // subscribers
    subscribers: [],
    subscriberFilters: {
      search: "",
      isActive: "",
      page: 1,
      limit: 20
    },
    subscriberDraft: {
      email: "",
      name: "",
      source: "manual",
      isActive: true
    },

    // campaigns
    campaigns: [],
    campaignTemplates: [],
    selectedCampaignTemplateId: "",
    campaignTemplateName: "",
    campaignDraft: {
      subject: "",
      html: ""
    },
    emailMediaPicker: {
      open: false,
      loading: false,
      target: "template",
      search: "",
      alt: ""
    },

    // reports
    financialSummary: {
      gmv: 0,
      netRevenue: 0,
      feesCollected: 0,
      conversionRate: 0,
      avgAuctionUplift: 0,
      walletBalances: { total: 0, locked: 0 },
      monthlyReport: []
    },
    wallets: [],
    reservations: {
      active: [],
      expired: [],
      consumed: []
    },
    coupons: [],
    couponFilters: {
      isActive: ""
    },
    couponDraft: {
      code: "",
      type: "percent",
      value: "",
      maxUses: "",
      expiresAt: "",
      minOrderAmount: "0",
      appliesTo: "both",
      isActive: true
    },
    disputes: [],
    disputeFilters: {
      status: ""
    },
    disputeDrafts: {},
    systemHealth: {
      api: "unknown",
      dependencies: "unknown",
      lastCheckedAt: null
    },

    // settings/email templates
    templateKeys: [],
    templateEditor: {
      selectedKey: "",
      key: "",
      subjectTemplate: "",
      htmlTemplate: "",
      testEmail: ""
    },
    templatePreview: {
      subject: "",
      html: ""
    },
    smtpSettings: {
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
    },
    templatePlaceholders: [
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
    ],
    localSettings: {
      autoRefresh: false,
      debug: false,
      sidebarCollapsed: true,
      auctionView: "grid"
    },
    courierSettings: {
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
    },

    // product modal
    productModal: {
      open: false,
      mode: "create",
      saving: false,
      productId: "",
      form: {
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
        auctionStartAt: "",
        auctionEndAt: "",
        auctionStartingPrice: "",
        auctionReservePrice: "",
        auctionMinIncrement: "1"
      }
    },
    productMediaPicker: {
      open: false,
      search: "",
      loading: false
    },

    // auction modal
    auctionModal: {
      open: false,
      saving: false,
      form: {
        productId: "",
        startAt: "",
        endAt: "",
        startingPrice: "",
        reservePrice: "",
        minIncrement: "1"
      }
    },

    charts: {
      revenue: null,
      ordersPie: null
    },
    revenueWindow: "7d",
    revenueSeries: {
      "7d": { labels: [], values: [] },
      "30d": { labels: [], values: [] }
    },


    };
  };
})(window);
