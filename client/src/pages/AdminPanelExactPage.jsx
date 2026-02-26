import React from "react";

import adminTemplateHtml from "../panel/admin-template.html?raw";
import "../panel/admin-panel.state.js";
import "../panel/admin-panel.methods.js";
import "../panel/admin-panel.js";

const EXTERNAL_SCRIPT_SOURCES = [
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/lucide@latest",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"
];

function parseTemplate(html) {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const bodyOpenMatch = html.match(/<body([^>]*)>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  const styleText = styleMatch ? styleMatch[1] : "";
  const bodyAttributes = bodyOpenMatch ? bodyOpenMatch[1].trim() : "";
  const bodyInner = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "") : "";

  return {
    styleText,
    markup: `<div ${bodyAttributes}>${bodyInner}</div>`
  };
}

const parsedTemplate = parseTemplate(adminTemplateHtml);

function ensureStyle(id, cssText) {
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement("style");
    node.id = id;
    document.head.appendChild(node);
  }
  node.textContent = cssText;
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const selector = `script[data-admin-external="${src}"]`;
    const existing = document.querySelector(selector);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.adminExternal = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

function applyBodyTheme() {
  const prev = {
    overflow: document.body.style.overflow,
    height: document.body.style.height,
    backgroundColor: document.body.style.backgroundColor,
    color: document.body.style.color,
    fontFamily: document.body.style.fontFamily
  };

  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";
  document.body.style.backgroundColor = "#09090b";
  document.body.style.color = "#e4e4e7";
  document.body.style.fontFamily = "Inter, sans-serif";

  return () => {
    document.body.style.overflow = prev.overflow;
    document.body.style.height = prev.height;
    document.body.style.backgroundColor = prev.backgroundColor;
    document.body.style.color = prev.color;
    document.body.style.fontFamily = prev.fontFamily;
  };
}

export function AdminPanelExactPage() {
  const mountRef = React.useRef(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const mount = mountRef.current;
    if (!mount) return undefined;

    const restoreBody = applyBodyTheme();
    ensureStyle("admin-template-style", parsedTemplate.styleText);
    mount.innerHTML = parsedTemplate.markup;

    const boot = async () => {
      try {
        setError("");
        for (const src of EXTERNAL_SCRIPT_SOURCES) {
          await loadScriptOnce(src);
        }
        if (cancelled || !mountRef.current) return;

        const alpineRoot = mountRef.current.firstElementChild || mountRef.current;
        if (window.Alpine) {
          if (!window.__bidnstealAlpineStarted) {
            window.__bidnstealAlpineStarted = true;
            window.Alpine.start();
          } else if (typeof window.Alpine.initTree === "function") {
            window.Alpine.initTree(alpineRoot);
          }
        }
        if (window.lucide?.createIcons) {
          window.lucide.createIcons();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to initialize admin panel");
        }
      }
    };

    boot();

    return () => {
      cancelled = true;
      mount.innerHTML = "";
      restoreBody();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {error ? (
        <div style={{ color: "#fecaca", background: "#7f1d1d66", border: "1px solid #7f1d1d", padding: "10px 12px" }}>
          {error}
        </div>
      ) : null}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

