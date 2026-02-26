function adminPanel() {
  const createState =
    typeof window.adminPanelState === "function"
      ? window.adminPanelState
      : function fallbackAdminPanelState() {
          return {};
        };

  const methods =
    window.adminPanelMethods && typeof window.adminPanelMethods === "object"
      ? window.adminPanelMethods
      : {};

  return {
    ...createState(),
    ...methods
  };
}

window.adminPanel = adminPanel;
