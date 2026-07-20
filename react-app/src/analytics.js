// Google Analytics: only loads/activates after cookie consent (GDPR-friendly).
// Ported 1:1 from the original script.js — same measurement ID, same
// consent-gated loading, same event names/params.

export const GA_MEASUREMENT_ID = "G-99LLMQ1D8E";

let gaLoaded = false;

export function loadGoogleAnalytics() {
  if (gaLoaded) return;
  gaLoaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("config", GA_MEASUREMENT_ID);
  }
}

export function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, params);
}
