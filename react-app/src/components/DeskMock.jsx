import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n";
import { asset } from "../asset";
import HeroTitle from "./HeroTitle";

// The hero's whole "mock website" payload is overlaid as a % zone onto the
// monitor's screen area in assets/hero-desk.webp. That file is a pre-cropped
// version of the original 1536x1024 source (cropped to y:[187,879], so
// 1536x692) — trimming only the empty transparent margin above/below the
// real content, so the full monitor, keyboard, and mouse are always
// visible, at every breakpoint (object-fit:contain throughout, no cropping
// object-fit:cover trick on mobile). Screen bounds were re-measured against
// this cropped frame (pixel-scanned for the teal-placeholder region, not
// eyeballed): x:[444,1089] / y:[66,410], i.e. left 28.91% / top 9.54% /
// width 41.99% / height 49.71% of the cropped frame. .desk-screen carries
// those numbers so every overlay element inside it positions relative to
// the screen itself, not the whole image.
// Small brand favicons for the mock browser's tabs — simplified,
// hand-built shapes evoking each brand's real mark (not traced from an
// official asset) since they only ever render at a few pixels tall.
function SiteFavicon() {
  return (
    <svg className="desk-tab-favicon" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0a0a0a" />
      <text x="12" y="16.5" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="11" fill="#f3ecdc">EE</text>
    </svg>
  );
}
function GmailFavicon() {
  return (
    <svg className="desk-tab-favicon" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#ffffff" />
      <path d="M3.5 7.5L12 14L20.5 7.5" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 7.5V16.3" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.5 7.5V16.3" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
      <path d="M3.5 16.3L7.2 13.4" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function WhatsAppFavicon() {
  return (
    <svg className="desk-tab-favicon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d="M12 5.5a6.5 6.5 0 0 0-5.6 9.8L5.5 19l3.8-1a6.5 6.5 0 1 0 2.7-12.5z" fill="#fff" />
      <path d="M9.6 9c.15-.35.3-.35.45-.35h.4c.1 0 .25 0 .38.3.15.35.45 1 .5 1.1.05.1.1.2 0 .3-.1.1-.15.2-.25.3-.1.1-.2.2-.1.4.1.2.5.8 1.05 1.3.7.65 1.3.85 1.5.95.2.1.3.05.4-.05.1-.1.45-.5.55-.7.1-.2.2-.15.4-.08.15.05.95.45 1.1.55.15.05.25.1.3.2.05.1.05.4-.1.8-.15.4-.85.75-1.2.8-.3.05-.65.05-1.05-.08a7 7 0 0 1-1-.4c-1.8-.8-2.95-2.6-3-2.7-.1-.1-.65-.85-.65-1.65 0-.8.4-1.15.55-1.3z" fill="#25D366" />
    </svg>
  );
}

export default function DeskMock() {
  const { t } = useTranslation();
  const mockRef = useRef(null);
  const [inView, setInView] = useState(true);

  // Same pause-when-offscreen pattern used for the globe — the rings/glow
  // animate continuously, no reason to keep them running once scrolled
  // well past.
  useEffect(() => {
    const el = mockRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="desk-mock" ref={mockRef}>
      <img className="desk-img" src={asset("/assets/hero-desk.webp")} alt="" loading="eager" />

      <div className="desk-screen">
        <div className="desk-browserbar" aria-hidden="true">
          <div className="desk-tabs-row">
            <div className="desk-tabs">
              <span className="desk-tab desk-tab-active">
                <SiteFavicon />
                <span className="desk-tab-label">Eljon Enesi</span>
                <span className="desk-tab-close">×</span>
              </span>
              <span className="desk-tab">
                <GmailFavicon />
                <span className="desk-tab-label">Gmail</span>
              </span>
              <span className="desk-tab">
                <WhatsAppFavicon />
                <span className="desk-tab-label">WhatsApp</span>
              </span>
              <span className="desk-tab-new">+</span>
            </div>
            <div className="desk-window-controls">
              <span className="desk-win-btn desk-win-min">–</span>
              <span className="desk-win-btn desk-win-max">▢</span>
              <span className="desk-win-btn desk-win-close">×</span>
            </div>
          </div>
          <div className="desk-toolbar">
            <span className="desk-toolbar-icon">‹</span>
            <span className="desk-toolbar-icon desk-toolbar-icon-dim">›</span>
            <span className="desk-toolbar-icon">⟳</span>
            <span className="desk-toolbar-url">eljonenesi.com</span>
          </div>
        </div>

        <div className="desk-nav" aria-hidden="true">
          <span className="desk-nav-mark">EE</span>
          <span className="desk-nav-links">
            <span>Work</span>
            <span>Services</span>
            <span>Contact</span>
          </span>
        </div>

        <div className={"desk-hero" + (inView ? "" : " is-paused")}>
          <HeroTitle text={t("hero.title", "A website that makes clients trust your brand.")} />
          <p className="desk-hero-sub">{t("hero.point1", "Custom design, not a template")}</p>

          <div className="desk-cta-row">
            <a href="#contact" className="mock-btn mock-btn-primary">
              {t("hero.cta1", "Get in touch")}
            </a>
            <a href="#work" className="mock-btn mock-btn-line">
              {t("hero.cta2", "See my work")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
