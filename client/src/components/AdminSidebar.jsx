import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventory", label: "Inventory" },
  { id: "media", label: "Media" },
  { id: "auctions", label: "Auctions" },
  { id: "orders", label: "Orders" },
  { id: "users", label: "Users" },
  { id: "subscribers", label: "Subscribers" },
  { id: "campaigns", label: "Campaigns" },
  { id: "coupons", label: "Coupons" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" }
];

export function AdminSidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-badge">B</div>
        <div>
          <h1>BIDNSTEAL</h1>
          <p>Admin Panel</p>
        </div>
      </div>

      <nav className="admin-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <NavLink to="/front" className="admin-link-btn">
          Front Panel
        </NavLink>
        <button className="admin-link-btn" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}
