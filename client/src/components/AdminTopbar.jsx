import React from "react";
import { Bell, Search } from "lucide-react";

export function AdminTopbar({ user }) {
  return (
    <header className="admin-topbar">
      <div className="admin-search-shell">
        <Search size={18} />
        <input disabled placeholder="Search operations... (Ctrl+K)" />
      </div>
      <div className="admin-topbar-right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="dot" />
        </button>
        <div className="admin-user">
          <strong>{user?.name || "Admin User"}</strong>
          <span>{String(user?.role || "superuser").toUpperCase()}</span>
        </div>
        <div className="avatar" />
      </div>
    </header>
  );
}

