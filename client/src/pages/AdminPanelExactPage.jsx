import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminProvider, useAdmin } from '../panel/AdminContext';
import { AdminSidebar } from '../panel/components/AdminSidebar';
import { AdminTopbar } from '../panel/components/AdminTopbar';
import { DashboardTab } from '../panel/tabs/DashboardTab';
import { InventoryTab } from '../panel/tabs/InventoryTab';
import { MediaTab } from '../panel/tabs/MediaTab';
import { AuctionsTab } from '../panel/tabs/AuctionsTab';
import { OrdersTab } from '../panel/tabs/OrdersTab';
import { AnalyticsTab } from '../panel/tabs/AnalyticsTab';
import { SettingsTab } from '../panel/tabs/SettingsTab';
import { UsersTab } from '../panel/tabs/UsersTab';
import { SubscribersTab } from '../panel/tabs/SubscribersTab';
import { CampaignsTab } from '../panel/tabs/CampaignsTab';
import { CouponsTab } from '../panel/tabs/CouponsTab';
import { ReportsTab } from '../panel/tabs/ReportsTab';
import { ProductFormTab } from '../panel/tabs/ProductFormTab';
import { AdminModals } from '../panel/components/modals/AdminModals';

function AdminLayout() {
  const admin = useAdmin();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Inject required styles dynamically just for the admin panel if needed
    const loadStyles = () => {
      // Assuming global styles are already sufficient, but we can add specific ones here if needed based on the original template
      // For example, Google Fonts are usually in index.html, so we rely on that.
    };
    loadStyles();

    // Small delay to ensure state is ready before rendering content
    setTimeout(() => {
      setIsLoaded(true);
      if (admin.initPanel) {
        admin.initPanel();
      }
    }, 100);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-100 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-zinc-400">Loading Control Panel...</p>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (admin.activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'inventory':
      case 'products':
        return <InventoryTab />;
      case 'product-form':
        return <ProductFormTab />;
      case 'media':
        return <MediaTab />;
      case 'auctions':
        return <AuctionsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'users':
      case 'customers':
        return <UsersTab />;
      case 'subscribers':
        return <SubscribersTab />;
      case 'campaigns':
      case 'marketing':
        return <CampaignsTab />;
      case 'coupons':
      case 'discounts':
        return <CouponsTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        // Fallback for not-yet-implemented tabs
        return (
          <div className="flex h-64 items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-zinc-400">{admin.activeTab}</h3>
              <p className="text-sm text-zinc-600 mt-2">This module is under construction in the new React architecture.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`admin-layout ${admin.localSettings?.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />

        <main className="admin-content custom-scrollbar">
          {renderActiveTab()}
        </main>
      </div>

      <AdminModals />
    </div>
  );
}

export function AdminPanelExactPage() {
  return (
    <>
      <Helmet>
        <title>Control Panel | BidnSteal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminProvider>
        <AdminLayout />
      </AdminProvider>
    </>
  );
}
