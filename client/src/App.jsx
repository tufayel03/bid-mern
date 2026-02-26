import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLoginPage } from "./pages/AdminLoginPage";
import { FrontPlaceholderPage } from "./pages/FrontPlaceholderPage";

function LegacyAdminPanelRedirect() {
  React.useEffect(() => {
    window.location.replace("/tufayel/panel/index.html");
  }, []);

  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/front" replace />} />
      <Route path="/front" element={<FrontPlaceholderPage />} />
      <Route path="/tufayel" element={<AdminLoginPage />} />
      <Route path="/tufayel/panel" element={<LegacyAdminPanelRedirect />} />
      <Route path="*" element={<Navigate to="/front" replace />} />
    </Routes>
  );
}
