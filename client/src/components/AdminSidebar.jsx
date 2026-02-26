import React from "react";
import {
  LayoutDashboard,
  Package,
  Image,
  Flame,
  Receipt,
  Users,
  Mail,
  Megaphone,
  TicketPercent,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "media", label: "Media", icon: Image },
  { id: "auctions", label: "Auctions", icon: Flame },
  { id: "orders", label: "Orders", icon: Receipt },
  { id: "users", label: "Users", icon: Users },
  { id: "subscribers", label: "Subscribers", icon: Mail },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "coupons", label: "Coupons", icon: TicketPercent },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings }
];

export function AdminSidebar({ activeTab, onTabChange, onLogout, collapsed = false, onToggleCollapse }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="admin-brand">
        <div className="admin-brand-badge">B</div>
        <div>
          <h1>BIDNSTEAL</h1>
          <p>ADMIN PANEL</p>
        </div>
      </div>

      <nav className="admin-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => onTabChange(item.id)}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-link-btn ghost" onClick={onToggleCollapse} type="button" aria-label="Toggle sidebar">
          <ToggleIcon size={16} />
          <span>{collapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
        </button>
        <button className="admin-link-btn logout" onClick={onLogout} type="button">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
