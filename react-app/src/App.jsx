import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useTranslation } from "./i18n";
import { useCookieConsent } from "./useCookieConsent";
import { trackEvent } from "./analytics";
import { asset } from "./asset";

import CookieBanner from "./components/CookieBanner";
import { RobotHero } from "@/components/ui/robot-hero";
import CtrlBrand from "./components/CtrlBrand";
import WhyStats from "./components/WhyStats";
import WorkCarousel from "./components/WorkCarousel";
import ProcessPath from "./components/ProcessPath";
import Estimator from "./components/Estimator";
import GlobeSection from "./components/GlobeSection";
import ContactForm from "./components/ContactForm";

gsap.registerPlugin(ScrollTrigger);

// Fixed behind every section (not scoped to one page) — a handful of
// large, soft abstract shapes drifting slowly across the viewport
// regardless of scroll position. Pure CSS transform animation, no JS
// per-frame work, so it costs nothing (this replaced a three.js scene
// earlier in the project specifically for being too heavy — same mistake
// wasn't worth repeating here for a purely decorative layer).
function AmbientShapes() {
  return (
    <div className="ambient-shapes" aria-hidden="true">
      <svg className="ambient-shape ambient-shape-1" viewBox="0 0 400 400">
        <path d="M200,40 C300,35 365,120 360,210 C355,305 280,365 190,360 C100,355 35,285 40,195 C45,105 110,45 200,40 Z" />
      </svg>
      <svg className="ambient-shape ambient-shape-2" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="160" />
      </svg>
      <svg className="ambient-shape ambient-shape-3" viewBox="0 0 400 400">
        <path d="M200,60 C280,70 340,140 330,220 C320,300 240,350 165,335 C90,320 45,250 60,175 C75,100 130,50 200,60 Z" />
      </svg>
    </div>
  );
}

// Full-screen intro shown once on load: logo, name, a quote already used
// elsewhere on the site (og:description) — slides away upward after a beat
// to reveal the real page, instead of just appearing.
function LoadingSplash() {
  const { t } = useTranslation();
  const [hiding, setHiding] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRemoved(true);
      return;
    }
    const t1 = setTimeout(() => setHiding(true), 1450);
    const t2 = setTimeout(() => setRemoved(true), 2250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (removed) return null;

  return (
    <div className={"loading-splash" + (hiding ? " is-hiding" : "")} aria-hidden="true">
      <div className="loading-splash-mark">EE</div>
      <p className="loading-splash-name">{t("loading.name", "Eljon Enesi")}</p>
      <p className="loading-splash-quote">{t("loading.quote", "Websites that work, load fast, and don't need explaining.")}</p>
    </div>
  );
}

// --- Topbar: brand, desktop nav, language switch, mobile menu toggle+panel. ---
const NAV_SECTION_IDS = ["work", "skills", "process", "services", "faq", "contact"];

function Header({ lang, setLang, menuOpen, setMenuOpen, theme, setTheme }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuOpen) return;
      if (panelRef.current?.contains(e.target)) return;
      if (toggleRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, setMenuOpen]);

  useEffect(() => {
    const sections = NAV_SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="topbar">
      <a href="#top" className="brand">
        <span className="brand-mark" aria-hidden="true">EE</span>
        Eljon Enesi
      </a>

      <nav className="topnav">
        <a href="#work" className={activeSection === "work" ? "active" : ""}>{t("nav.work", "Work")}</a>
        <a href="#skills" className={activeSection === "skills" ? "active" : ""}>{t("nav.skills", "Skills")}</a>
        <a href="#process" className={activeSection === "process" ? "active" : ""}>{t("nav.process", "Process")}</a>
        <a href="#services" className={activeSection === "services" ? "active" : ""}>{t("nav.services", "Services")}</a>
        <a href="#faq" className={activeSection === "faq" ? "active" : ""}>{t("nav.faq", "FAQ")}</a>
        <a href="#contact" className={activeSection === "contact" ? "active" : ""}>{t("nav.contact", "Contact")}</a>
      </nav>

      <div className="topbar-right">
        <div className="lang-switch" role="group" aria-label={t("lang.label", "Language")}>
          {["en", "sq", "de"].map((code) => (
            <button
              key={code}
              type="button"
              className={"lang-btn" + (lang === code ? " active" : "")}
              data-lang={code}
              onClick={() => setLang(code)}
            >
              {code === "en" ? "EN" : code === "sq" ? "AL" : "DE"}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === "dark" ? t("theme.toLight", "Switch to light mode") : t("theme.toDark", "Switch to dark mode")}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.7 14.9A8.5 8.5 0 0 1 9.1 3.3a.6.6 0 0 0-.7-.8A9.5 9.5 0 1 0 21.5 15.6a.6.6 0 0 0-.8-.7z" />
            </svg>
          )}
        </button>

        <button
          ref={toggleRef}
          type="button"
          className={"menu-toggle" + (menuOpen ? " active" : "")}
          aria-label={t("menu.open", "Open menu")}
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
        >
          <span className="menu-dots">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </span>
        </button>
      </div>

      <nav ref={panelRef} className={"menu-panel" + (menuOpen ? " open" : "")}>
        <a href="#work" onClick={() => setMenuOpen(false)}>{t("nav.work", "Work")}</a>
        <a href="#skills" onClick={() => setMenuOpen(false)}>{t("nav.skills", "Skills")}</a>
        <a href="#process" onClick={() => setMenuOpen(false)}>{t("nav.process", "Process")}</a>
        <a href="#services" onClick={() => setMenuOpen(false)}>{t("nav.services", "Services")}</a>
        <a href="#estimator-section" onClick={() => setMenuOpen(false)}>{t("nav.estimate", "Estimate")}</a>
        <a href="#global-reach" onClick={() => setMenuOpen(false)}>{t("nav.globalReach", "Global Reach")}</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>{t("nav.faq", "FAQ")}</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>{t("nav.contact", "Contact")}</a>
      </nav>
    </header>
  );
}


// Monochrome by default (single-color, currentColor) — the badge itself
// supplies the brand color as a hover/tap-only fill, so these no longer bake
// brand colors into the icon paths. Where a logo's inner numeral/flap only
// reads correctly as a two-tone cutout (HTML5's "5", CSS3's "3", Node's
// wordmark), that inner shape is punched out with var(--surface) instead of
// a second brand color — it still themes correctly since --surface flips
// with light/dark mode, and reads as a clean single-color icon either way.
const SKILLS = [
  {
    name: "JavaScript", rot: -7, brand: "#F7DF1E", contrast: "dark",
    icon: <path d="M6.5 17.3c.4.7 1 1.2 2 1.2 1 0 1.7-.5 1.7-1.6v-5.4h-1.6v5.4c0 .5-.2.7-.6.7-.4 0-.6-.3-.8-.6l-1.7.3zm5.7-.2c.5.9 1.5 1.5 2.9 1.5 1.5 0 2.6-.8 2.6-2.2 0-1.3-.8-1.9-2.1-2.4l-.4-.2c-.7-.3-1-.5-1-1 0-.4.3-.7.8-.7.5 0 .8.2 1.1.7l1.3-.8c-.5-.9-1.2-1.3-2.4-1.3-1.4 0-2.4.9-2.4 2.1 0 1.2.7 1.8 1.9 2.3l.4.2c.8.3 1.2.6 1.2 1.1 0 .4-.4.8-1.1.8-.8 0-1.2-.4-1.6-1l-1.4.7z" />,
  },
  {
    name: "CSS3", rot: 5, brand: "#264DE4", contrast: "white",
    icon: <>
      <path d="M3.5 2h17l-1.5 17L12 22 5 19z" />
      <path fill="var(--skill-cutout)" d="M12 12.8H8.9L8.7 10H12V7H5.6l.1 1.2L6.4 15h5.6zM12 17.5l-3-.8-.2-2.2H6l.4 4.4 5.6 1.6zM12 12.8h2.8l-.3 3-2.5.7v2.9l5.1-1.4.8-8.9H12zM12 7v3h6.3l.3-3z" />
    </>,
  },
  {
    name: "HTML5", rot: -4, brand: "#E34F26", contrast: "white",
    icon: <>
      <path d="M3.5 2h17l-1.5 17L12 22 5 19z" />
      <path fill="var(--skill-cutout)" d="M12 12.5H9l-.2-2.4H12V7.7H6.2l.5 6.2H12zM12 17.8l-3-.8-.2-2.3H6.4l.4 4.3L12 20.4zM12 12.5h2.7l-.3 3-2.4.7v2.5l4.6-1.3.7-7.5H12zM12 7.7v2.4h5.4l.2-2.4z" />
    </>,
  },
  {
    name: "Visual Studio", rot: 8, brand: "#5C9EE7", contrast: "white",
    icon: <g fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17.5 3.5l-11 5v7l11 5 3-1.5v-14z" /><path d="M6.5 8.5l8 3.5-8 3.5" /></g>,
  },
  {
    name: "Node.js", rot: -6, brand: "#339933", contrast: "white",
    icon: <>
      <path d="M12 1.5L2 7v10l10 5.5 10-5.5V7z" />
      <path fill="var(--skill-cutout)" d="M12 5.2L6 8.5v7l6 3.3 6-3.3v-7zM10.8 9h1.3l2.3 6h-1.3l-.5-1.3h-2.3L9.8 15H8.5zm.6 3.6h1.4l-.7-1.9z" />
    </>,
  },
  {
    name: "WordPress", rot: 4, brand: "#21759B", contrast: "white",
    icon: <path d="M2.6 12a9.4 9.4 0 0 0 5.3 8.5L3.8 8.9a9.3 9.3 0 0 0-1.2 3.1zm16.5-.5c0-1.2-.4-2-.8-2.6-.5-.8-.9-1.4-.9-2.2 0-.9.7-1.7 1.6-1.7h.1a9.4 9.4 0 0 0-14.2 1.8h.6c.9 0 2.3-.1 2.3-.1.5 0 .5.6.1.7 0 0-.5.1-1 .1L9.4 16l2.1-6.3-1.5-4c-.5 0-1-.1-1-.1-.5 0-.4-.7.1-.7 0 0 1.5.1 2.3.1.9 0 2.3-.1 2.3-.1.5 0 .5.6.1.7 0 0-.5.1-1 .1l2.5 7.4.7-2.3c.3-1 .5-1.7.5-2.3zm-6.6 1.4l-2.1 6c1.2.4 2.6.4 3.9 0zm7.7-5c0 .2 0 .5-.1.8L18.2 20a9.4 9.4 0 0 0 2-11.1zM12 2.6A9.4 9.4 0 1 0 21.4 12 9.4 9.4 0 0 0 12 2.6zm0 19.4A10 10 0 1 1 22 12a10 10 0 0 1-10 10z" />,
  },
  {
    name: "Git", rot: -8, brand: "#F05033", contrast: "white",
    icon: <path d="M23.5 11.3L12.7.5a1.6 1.6 0 0 0-2.3 0L8.2 2.7l2.8 2.8a2 2 0 0 1 2.5 1.9 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 .1-.6L6.9 4.1.5 10.4a1.6 1.6 0 0 0 0 2.3l10.8 10.8a1.6 1.6 0 0 0 2.3 0l10.8-10.8a1.6 1.6 0 0 0 .1-.4 1.6 1.6 0 0 0 0-1zM9.4 18.6a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2zm7-7a2 2 0 0 1-.9-.2v5.4a2 2 0 1 1-1.6 0V11a2 2 0 1 1 2.5-1.9 2 2 0 0 1-2 2z" />,
  },
  {
    // GitHub's real mark is near-black, which nearly vanishes against the
    // site's own near-black dark-mode background — swapped to white/dark
    // just for that theme so the badge stays visible, same real brand,
    // just the light variant of it (this is how GitHub's own brand
    // guidelines already treat dark surfaces).
    name: "GitHub", rot: 6, brand: "#181717", contrast: "white", darkBrand: "#ffffff", darkContrast: "dark",
    icon: <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.3 9.4 7.9 11 .6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />,
  },
  {
    name: "React", rot: -5, brand: "#61DAFB", contrast: "dark",
    icon: <g transform="translate(12,12)">
      <circle r="2.2" fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <ellipse rx="10" ry="4" />
        <ellipse rx="10" ry="4" transform="rotate(60)" />
        <ellipse rx="10" ry="4" transform="rotate(120)" />
      </g>
    </g>,
  },
  {
    name: "Claude", rot: 7, brand: "#DA7756", contrast: "white",
    // Anthropic's mark is a simple radiating asterisk/sparkle — reproduced
    // here as 8 evenly-rotated rounded bars rather than traced from an
    // official asset, since exact path data for it isn't something to guess at.
    icon: <g fill="currentColor">
      {Array.from({ length: 8 }).map((_, k) => (
        <rect key={k} x="11.1" y="1.5" width="1.8" height="7.5" rx="0.9" transform={`rotate(${k * 45} 12 12)`} />
      ))}
    </g>,
  },
];

function Skills() {
  const { t } = useTranslation();
  const gridRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="skills" id="skills">
      <h2 className="section-title">{t("skills.title", "Skills & Experience")}</h2>
      <p className="skills-copy">
        {t(
          "skills.p1",
          "We build with a focused set of tools we actually know well, rather than a long list we barely use. HTML, CSS, and JavaScript are the foundation of everything we ship. When a project needs more, like a CMS or a Node backend, we bring in exactly what fits and nothing more."
        )}
      </p>
      <p className="skills-copy">
        {t("skills.p2Before", "For a fuller look at our background and experience, visit our")}{" "}
        <a href="https://www.linkedin.com/in/eljonenesi/" target="_blank" rel="noopener" className="skills-link">
          LinkedIn
        </a>
        .
      </p>

      <div className={"skills-grid" + (revealed ? " is-revealed" : "")} ref={gridRef}>
        {SKILLS.map((s, i) => (
          <div
            className="skill-item"
            key={s.name}
            style={{
              "--base-rot": `${s.rot}deg`,
              "--i": i,
              "--brand": s.brand,
              "--brand-contrast": s.contrast === "dark" ? "#171717" : "#ffffff",
              ...(s.darkBrand ? { "--brand-dark": s.darkBrand } : {}),
              ...(s.darkContrast ? { "--brand-contrast-dark": s.darkContrast === "dark" ? "#171717" : "#ffffff" } : {}),
            }}
          >
            <div className="skill-item-inner">
              <span className="skill-badge">
                <svg className="skill-icon" viewBox="0 0 24 24" fill="currentColor">{s.icon}</svg>
              </span>
              <span className="skill-tooltip">{s.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const MAINTENANCE_PLANS = [
  { label: "services.maintenance.basic", fallback: "Basic: updates, backups, uptime", price: "€50/mo" },
  { label: "services.maintenance.standard", fallback: "Standard: plus small content edits", price: "€40/mo" },
];

const ADDONS = [
  { label: "services.addons.i1", fallback: "Extra language", price: "€40–60" },
  { label: "services.addons.i2", fallback: "Booking/contact form system", price: "€40–60" },
  { label: "services.addons.i3", fallback: "Analytics/SEO setup", price: "€20–50" },
  { label: "services.addons.i4", fallback: "Domain and DNS setup", price: "€30" },
];

function Services() {
  const { t } = useTranslation();
  const [group, setGroup] = useState(0);

  const DESIGN_TIERS = [
    { label: "services.p1.tag", fallback: "Landing page", price: "€100 – 150" },
    { label: "services.p2.tag", fallback: "Multi-page business site", price: "€150+" },
    { label: "services.p3.tag", fallback: "E-commerce store", price: "€500+" },
    { label: "services.p4.tag", fallback: "Custom web app", price: "€700+" },
    { label: "services.p5.tag", fallback: "Redesign existing site", price: "€150+" },
  ];

  const PAYMENT_TERMS = [
    { label: "services.payment.deposit", fallback: "Deposit", valueLabel: "services.payment.depositValue", valueFallback: "50% upfront, 50% on delivery" },
    { label: "services.payment.maintenance", fallback: "Maintenance", valueLabel: "services.payment.maintenanceValue", valueFallback: "paid upfront, monthly" },
  ];

  const GROUPS = [
    { title: t("services.designBuild", "Design and build"), rows: DESIGN_TIERS },
    { title: t("services.maintenance.title", "Maintenance (monthly)"), rows: MAINTENANCE_PLANS },
    { title: t("services.addons.title", "Add-ons"), rows: ADDONS },
    {
      title: t("services.payment.title", "Payment terms"),
      rows: PAYMENT_TERMS.map((item) => ({ label: item.label, fallback: item.fallback, price: t(item.valueLabel, item.valueFallback) })),
    },
  ];
  const current = GROUPS[group];

  return (
    <section className="services" id="services">
      <h2 className="section-title">{t("services.title", "Services")}</h2>
      <p className="services-sub">{t("services.sub", "Prices vary by scope. This is a starting point.")}</p>

      <div className="services-layout">
        <div className="pricing-card">
          <div className="pricing-group-toggle" role="tablist">
            {GROUPS.map((g, i) => (
              <button
                key={g.title}
                type="button"
                role="tab"
                aria-selected={group === i}
                className={"pricing-group-btn" + (group === i ? " is-active" : "")}
                onClick={() => setGroup(i)}
              >
                {g.title}
              </button>
            ))}
          </div>

          <div key={group} className="pricing-group">
            <ul className="pricing-rows">
              {current.rows.map((item) => (
                <li key={item.label}>
                  <span>{t(item.label, item.fallback)}</span>
                  <span>{item.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pricing-cta-row">
            <a
              href="#contact"
              className="btn-primary"
              onClick={() => trackEvent("quote_click", { tier: "services_table" })}
            >
              {t("services.cta", "Get a quote")}
            </a>
            <a href="#work" className="pricing-examples-link">
              {t("services.seeWork", "See examples of our work ↗")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  { qKey: "faq.q1", qFallback: "How long does a website take to build?", aKey: "faq.a1", aFallback: "A landing page usually takes 3 to 5 days. Something with several pages or a contact form takes 1 to 2 weeks. It depends on how much content you already have ready." },
  { qKey: "faq.q2", qFallback: "Do you work with clients outside your own country?", aKey: "faq.a2", aFallback: "Yes. Everything is handled remotely, so location doesn't matter. Most of the process happens over WhatsApp or email anyway." },
  { qKey: "faq.q3", qFallback: "Will my site work properly on phones?", aKey: "faq.a3", aFallback: "Yes. Every website we build starts from the mobile layout first, then scales up to desktop, not the other way around." },
  { qKey: "faq.q4", qFallback: "Can you redesign a site I already have?", aKey: "faq.a4", aFallback: "Yes. We can rebuild it from scratch or work with what's already there, depending on what shape it's in." },
  { qKey: "faq.q5", qFallback: "Who owns the code and the domain afterward?", aKey: "faq.a5", aFallback: "You do, fully. You buy your own domain, and you get the full source code once the project is done." },
  { qKey: "faq.q6", qFallback: "What happens after the site goes live?", aKey: "faq.a6", aFallback: "We stay reachable for fixes and small changes. If you need something bigger added later, we just talk about it like a new small project." },
  { qKey: "faq.q7", qFallback: "How much does a website cost?", aKey: "faq.a7", aFallback: "It starts at €100–150 for a landing page and €150+ for a multi-page business site. Exact pricing depends on scope, see the Services section above for details." },
];

function FaqChevron() {
  return (
    <svg className="faq-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Faq() {
  const { t } = useTranslation();
  return (
    <section className="faq" id="faq">
      <h2 className="section-title">{t("faq.title", "FAQ")}</h2>
      <div className="imessage-thread">
        <p className="imessage-date">Today</p>
        {/* All open by default so the answers are visible on load — the
            `open` attribute is only ever passed the literal `true`, so
            React never re-forces a user's manual collapse back open on a
            later re-render (it only touches the DOM when the prop value
            itself changes between renders, not when it re-reads the
            current value), while the chevron/collapse toggle stays live. */}
        {FAQ_ITEMS.map((item) => (
          <details className="imessage-pair" key={item.qKey} open>
            <summary className="imessage-bubble imessage-received">
              <span className="imessage-bubble-text">{t(item.qKey, item.qFallback)}</span>
              <FaqChevron />
            </summary>
            <p className="imessage-bubble imessage-sent">{t(item.aKey, item.aFallback)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

function Contact() {
  const { t } = useTranslation();
  const socialClick = (label) => () => trackEvent("contact_click", { channel: label });

  return (
    <section className="contact" id="contact">
      <div className="contact-split">
        <div className="contact-info">
          <ContactSparkle className="contact-sparkle contact-sparkle-1" />
          <ContactSparkle className="contact-sparkle contact-sparkle-2" />

          <h2 className="section-title">{t("contact.title", "Let's build something")}</h2>
          <p className="contact-sub">{t("contact.sub", "Tell us what you're trying to build. We'll reply within a day or two.")}</p>

          <div className="contact-direct">
            <a href="mailto:eljonenesi9@gmail.com" className="contact-direct-link" onClick={socialClick("Email")}>
              eljonenesi9@gmail.com
            </a>
            <a href="https://wa.me/355688944708" target="_blank" rel="noopener" className="contact-direct-link" onClick={socialClick("WhatsApp")}>
              WhatsApp: +355 68 894 4708
            </a>
          </div>

          <div className="contact-socials">
            <a href="https://instagram.com/eljonenesi" target="_blank" rel="noopener" className="social-link" aria-label="Instagram" onClick={socialClick("Instagram")}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.linkedin.com/in/eljonenesi/" target="_blank" rel="noopener" className="social-link" aria-label="LinkedIn" onClick={socialClick("LinkedIn")}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21h-4V9z" /></svg>
            </a>
            <a href="tel:+355688944708" className="social-link" aria-label="Phone" onClick={socialClick("Phone")}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4c0 1-1 2-2 2C10 21 3 14 3 7c0-1 1-2 1-2z" /></svg>
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}

function Footer({ onOpenCookieSettings }) {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col footer-brand-col">
          <span className="footer-brand">
            <span className="brand-mark footer-mark" aria-hidden="true">EE</span>
          </span>
          <p>{t("footer.bio", "We build custom websites for businesses and independent brands.")}</p>
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="footer-stat-num">3+</span>
              <span className="footer-stat-label">{t("footer.statYears", "Years experience")}</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-num">10+</span>
              <span className="footer-stat-label">{t("footer.statCerts", "Certifications")}</span>
            </div>
          </div>
          <div className="footer-socials">
            <a href="https://instagram.com/eljonenesi" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
            <a href="https://www.linkedin.com/in/eljonenesi/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21h-4V9z" /></svg></a>
            <a href="https://wa.me/355688944708" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.4-1.42a9.87 9.87 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.14c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" /></svg></a>
          </div>
        </div>

        <div className="footer-col">
          <p className="footer-heading">{t("footer.menuHeading", "Menu")}</p>
          <a href="#top">{t("footer.menuHome", "Home")}</a>
          <a href="#work">{t("nav.work", "Work")}</a>
          <a href="#skills">{t("nav.skills", "Skills")}</a>
          <a href="#services">{t("nav.services", "Services")}</a>
          <a href="#process">{t("nav.process", "Process")}</a>
          <a href="#faq">{t("nav.faq", "FAQ")}</a>
        </div>

        <div className="footer-col">
          <p className="footer-heading">{t("footer.servicesHeading", "Services")}</p>
          <a href="#services">{t("footer.svcLanding", "Landing pages")}</a>
          <a href="#services">{t("footer.svcMultipage", "Multi-page websites")}</a>
          <a href="#services">{t("footer.svcEcommerce", "E-commerce stores")}</a>
          <a href="#services">{t("footer.svcCustomApp", "Custom web apps")}</a>
        </div>

        <div className="footer-col">
          <p className="footer-heading">{t("footer.contactHeading", "Contact")}</p>
          <a href="tel:+355688944708">+355 68 894 4708</a>
          <a href="mailto:eljonenesi9@gmail.com">eljonenesi9@gmail.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t("footer.loc", "© 2026. All rights reserved.")}</span>
        <div className="footer-legal-links">
          <a href={asset("/terms.html")} target="_blank" rel="noopener">{t("footer.terms", "Terms")}</a>
          <a href={asset("/privacy.html")} target="_blank" rel="noopener">{t("footer.privacy", "Privacy")}</a>
          <button type="button" onClick={onOpenCookieSettings}>{t("footer.cookieSettings", "Cookie settings")}</button>
        </div>
        <a href="#top" className="back-to-top" aria-label={t("footer.backToTop", "Back to top")}>↑</a>
      </div>
    </footer>
  );
}

export default function App() {
  const { t, lang, setLang } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { visible: cookieVisible, accept, decline, openSettings } = useCookieConsent();

  // Always dark on a first visit (matches index.html's pre-paint script) —
  // the visitor opts into light via the toggle rather than the site
  // following their OS-level preference.
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const progressRef = useRef(null);
  const spotlightRef = useRef(null);

  // --- Scroll progress bar. ---
  // Was writing `width` (a layout-triggering property) on every raw scroll
  // event — scroll fires far more often than the display refreshes, so this
  // forced a layout recalc many times per frame during a fast scroll/fling.
  // Batched to one write per frame via rAF, and switched to `transform:
  // scaleX()` so the write is compositor-only (no layout/paint at all).
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    let raf = null;
    function update() {
      raf = null;
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrolled / max : 0})`;
    }
    function onScroll() {
      if (raf == null) raf = requestAnimationFrame(update);
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      document.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // --- Cursor spotlight: soft light that follows the pointer (desktop only). ---
  useEffect(() => {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    const el = spotlightRef.current;
    if (!el) return;
    // Batched to one write per animation frame instead of one per raw
    // mousemove event — mousemove can fire far more often than the display
    // refreshes, so most of those writes were previously wasted work.
    let raf = null;
    let last = null;
    function apply() {
      raf = null;
      if (!last) return;
      el.style.setProperty("--sx", last.x + "px");
      el.style.setProperty("--sy", last.y + "px");
    }
    function onMove(e) {
      last = { x: e.clientX, y: e.clientY };
      if (raf == null) raf = requestAnimationFrame(apply);
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // --- Magnetic pull on primary buttons: nudges toward the cursor within a
  // radius, snaps back on leave (desktop only — no cursor to react to on
  // touch devices). Re-queries on every move instead of caching the node
  // list once, since it's only a handful of elements and buttons like the
  // pricing CTA get replaced when the tier toggle re-renders. ---
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)").matches) return;
    const reach = 70;
    // Batched to once per animation frame (was running on every raw
    // mousemove) and reads all buttons' rects before writing any of their
    // transforms — reading rect B right after writing transform A forces a
    // synchronous layout recalculation to flush A's pending style change
    // first, so interleaving read/write/read/write across multiple buttons
    // was real layout thrashing on every mouse move across the whole page.
    let raf = null;
    let last = null;
    function apply() {
      raf = null;
      if (!last) return;
      const btns = Array.from(document.querySelectorAll(".btn-primary"));
      const rects = btns.map((btn) => btn.getBoundingClientRect());
      btns.forEach((btn, i) => {
        const rect = rects[i];
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = last.x - cx;
        const dy = last.y - cy;
        const dist = Math.hypot(dx, dy);
        const catchRadius = reach + rect.width / 2;
        if (dist < catchRadius) {
          const pull = (1 - dist / catchRadius) * 0.3;
          btn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
        } else if (btn.style.transform) {
          btn.style.transform = "";
        }
      });
    }
    function onMove(e) {
      last = { x: e.clientX, y: e.clientY };
      if (raf == null) raf = requestAnimationFrame(apply);
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // --- GSAP entrance animations + scroll reveals + parallax + the side
  // nav's click-to-scroll/active-highlight. Ported from script.js as a
  // single effect since it's inherently DOM/scroll-imperative; the DOM
  // structure/classes it queries are the same ones rendered by the JSX
  // below, so the selectors match 1:1. (This used to also wheel/keydown-
  // jack the whole page into one-tick-per-section jumps; removed in favor
  // of normal scrolling — the side nav now just smooth-scrolls on click,
  // same as clicking any other in-page link.)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups = [];

    if (!prefersReducedMotion) {
      function revealGroup(selector, opts = {}) {
        const items = gsap.utils.toArray(selector);
        if (!items.length) return;
        items.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 32, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              delay: (opts.stagger || 0) * i,
              scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
            }
          );
        });
      }

      revealGroup(".skill-item", { stagger: 0.06 });
      revealGroup(".pricing-card", { stagger: 0.12 });
      revealGroup(".process-step", { stagger: 0.1 });

      gsap.utils.toArray(".section-title").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });

      document
        .querySelectorAll(".robot-hero, .why-stats, .work, .skills, .services, .process, .estimator-section, .globe-section, .faq, .contact")
        .forEach((section) => {
          const inner = section.querySelector(".stats-grid, .work-grid, .pricing-card, .process-list, .contact-grid");
          if (!inner) return;
          gsap.fromTo(
            inner,
            { y: 60 },
            {
              y: -60,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LoadingSplash />
      <CookieBanner visible={cookieVisible} onAccept={accept} onDecline={decline} />

      <AmbientShapes />
      <div className="scroll-progress" aria-hidden="true" ref={progressRef}></div>
      <div className="cursor-spotlight" aria-hidden="true" ref={spotlightRef}></div>
      <div className="grain-overlay" aria-hidden="true"></div>

      <Header lang={lang} setLang={setLang} menuOpen={menuOpen} setMenuOpen={setMenuOpen} theme={theme} setTheme={setTheme} />

      <main id="top">
        <RobotHero
          key={lang}
          badgeText={t("hero.badge", "Take your brand to the next level")}
          headline={<>{t("hero.headlinePart1", "Bridging Ideas,")} <span style={{ color: "var(--accent)" }}>{t("hero.headlinePart2", "Building Websites")}</span></>}
          subline={t("hero.subline", "Design, build, and support after launch.")}
          primaryCta={{ label: t("hero.cta1", "Get in touch"), href: "#contact" }}
          secondaryCta={{ label: t("hero.cta2", "See our work"), href: "#work" }}
          className="robot-hero"
        />
        <CtrlBrand />
        <WhyStats />
        <WorkCarousel />
        <Skills />
        <ProcessPath />
        <Services />
        <Estimator />
        <GlobeSection />
        <Faq />
        <Contact />
      </main>

      <Footer onOpenCookieSettings={openSettings} />
    </>
  );
}
