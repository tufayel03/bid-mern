import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPanelExactPage } from "./pages/AdminPanelExactPage";
import { FrontPlaceholderPage } from "./pages/FrontPlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/front" replace />} />
      <Route path="/front" element={<FrontPlaceholderPage />} />
      <Route path="/tufayel" element={<AdminLoginPage />} />
      <Route path="/tufayel/panel" element={<AdminPanelExactPage />} />
      <Route path="*" element={<Navigate to="/front" replace />} />
    </Routes>
  );
}
