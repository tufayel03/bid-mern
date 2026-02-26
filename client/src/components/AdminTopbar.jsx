import React from "react";

export function AdminTopbar({ user }) {
  return (
    <header className="admin-topbar">
      <div className="admin-search-shell">
        <input disabled placeholder="Search operations... (Ctrl+K)" />
      </div>
      <div className="admin-user">
        <strong>{user?.name || "Admin"}</strong>
        <span>{user?.role || "ADMIN"}</span>
      </div>
    </header>
  );
}
