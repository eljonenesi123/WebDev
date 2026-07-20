import { useEffect, useState, useCallback } from "react";
import { loadGoogleAnalytics } from "./analytics";

// Ported from the original script.js cookie-banner IIFE: shows the banner
// 1.2s after first load if no consent decision has been stored yet, loads
// GA immediately if consent was already granted in a previous visit, and
// exposes an `openSettings` action so the footer's "Cookie settings" link
// can reopen the banner at any time.
export function useCookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let consent = null;
    try {
      consent = localStorage.getItem("cookie-consent");
    } catch {
      /* ignore */
    }

    if (consent === "granted") {
      loadGoogleAnalytics();
    } else if (consent === null) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem("cookie-consent", "granted");
    } catch {
      /* ignore */
    }
    loadGoogleAnalytics();
    setVisible(false);
  }, []);

  const decline = useCallback(() => {
    try {
      localStorage.setItem("cookie-consent", "denied");
    } catch {
      /* ignore */
    }
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    setVisible(false);
  }, []);

  const openSettings = useCallback(() => setVisible(true), []);

  return { visible, accept, decline, openSettings };
}
