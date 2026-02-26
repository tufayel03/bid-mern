import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { adminAuth, apiRequest } from "../lib/api";

const LOCAL_ADMIN_EMAIL = "admin@bidnsteal.com";
const LOCAL_ADMIN_PASSWORD = "Tufayel@142003";

function safeNext(value) {
  if (!value) return "/tufayel/panel";
  try {
    const next = new URL(value, window.location.origin);
    if (next.origin !== window.location.origin) return "/tufayel/panel";
    if (!next.pathname.startsWith("/tufayel")) return "/tufayel/panel";
    return `${next.pathname}${next.search}${next.hash}`;
  } catch {
    return "/tufayel/panel";
  }
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextPath = useMemo(() => safeNext(params.get("next")), [params]);

  const [email, setEmail] = useState(LOCAL_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminAuth.valid()) {
      navigate(nextPath, { replace: true });
    }
  }, [navigate, nextPath]);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      let backendAccepted = false;
      try {
        const payload = await apiRequest("/auth/login", {
          method: "POST",
          body: { email, password }
        });
        backendAccepted = payload?.user?.role === "admin";
      } catch {
        backendAccepted = false;
      }

      const localAccepted = email.trim().toLowerCase() === LOCAL_ADMIN_EMAIL && password === LOCAL_ADMIN_PASSWORD;

      if (!backendAccepted && !localAccepted) {
        setError("Invalid admin email or password.");
        return;
      }

      adminAuth.write(email.trim().toLowerCase() || LOCAL_ADMIN_EMAIL);
      navigate(nextPath, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell center">
      <section className="card auth-card">
        <div className="brand-row">
          <div className="badge">B</div>
          <div>
            <h1>BIDNSTEAL</h1>
            <p>Admin access portal</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label>Admin Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="muted">Session stays signed in for 7 days on this browser.</p>
      </section>
    </main>
  );
}
