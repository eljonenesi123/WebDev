import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useTranslation } from "./i18n";
import { useCookieConsent } from "./useCookieConsent";
import { trackEvent } from "./analytics";
import { asset } from "./asset";

import CookieBanner from "./components/CookieBanner";
import DeskMock from "./components/DeskMock";
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
      <p className="loading-splash-name">Eljon Enesi</p>
      <p className="loading-splash-quote">Websites that work, load fast, and don't need explaining.</p>
    </div>
  );
}

// --- Topbar: brand, desktop nav, language switch, mobile menu toggle+panel. ---
function Header({ lang, setLang, menuOpen, setMenuOpen, theme, setTheme }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

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

  return (
    <header className="topbar">
      <a href="#top" className="brand">
        <span className="brand-mark" aria-hidden="true">EE</span>
        Eljon Enesi
      </a>

      <nav className="topnav">
        <a href="#work">Work</a>
        <a href="#skills">Skills</a>
        <a href="#process">Process</a>
        <a href="#services">Services</a>
        <a href="#faq">FAQ</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="topbar-right">
        <div className="lang-switch" role="group" aria-label="Language">
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
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
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
          aria-label="Open menu"
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
        <a href="#estimator-section" onClick={() => setMenuOpen(false)}>Estimate</a>
        <a href="#global-reach" onClick={() => setMenuOpen(false)}>Global Reach</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>{t("nav.contact", "Contact")}</a>
      </nav>
    </header>
  );
}

// --- Side "elevator" nav: 01-08, wired up to the wheel/keyboard section-snap effect below via data-target. ---
function SideNav() {
  const targets = [".hero", ".why-stats", ".work", ".skills", ".process", ".services", ".estimator-section", ".globe-section", ".faq", ".contact"];
  return (
    <nav className="side-nav" aria-label="Section navigation">
      {targets.map((target, i) => (
        <button key={target} type="button" data-target={target}>
          {String(i + 1).padStart(2, "0")}
        </button>
      ))}
    </nav>
  );
}

// Fixed hand-drawn "keep scrolling" cue, bottom-right on every section,
// labeled with whichever section comes next. Hides once the last section
// (Contact) is reached since there's nothing further down to point at.
const SCROLL_CUE_SECTIONS = [".hero", ".why-stats", ".work", ".skills", ".process", ".services", ".estimator-section", ".globe-section", ".faq", ".contact"];
const SCROLL_CUE_LABELS = ["Why This Matters", "Work", "Skills", "Process", "Services", "Estimator", "Global Reach", "FAQ", "Contact"];

function ScrollCue() {
  const [hidden, setHidden] = useState(false);
  const [suppressForWork, setSuppressForWork] = useState(false);
  const [nextLabel, setNextLabel] = useState(SCROLL_CUE_LABELS[0]);

  useEffect(() => {
    const last = document.querySelector(".contact");
    if (!last) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(last);
    return () => observer.disconnect();
  }, []);

  // The carousel can advance by tap alone, with no page scroll at all — react
  // to that immediately instead of waiting for the next scroll/resize tick.
  useEffect(() => {
    const carousel = document.getElementById("work-carousel");
    const workSection = document.querySelector(".work");
    if (!carousel || !workSection) return;
    function check() {
      const r = workSection.getBoundingClientRect();
      const workFillsScreen = r.top <= window.innerHeight * 0.1 && r.bottom >= window.innerHeight * 0.9;
      const onLastSlide = carousel.getAttribute("data-on-last-slide") === "true";
      setSuppressForWork(workFillsScreen && !onLastSlide);
    }
    const observer = new MutationObserver(check);
    observer.observe(carousel, { attributes: true, attributeFilter: ["data-on-last-slide"] });
    check();
    return () => observer.disconnect();
  }, []);

  // Track which section is currently closest to the top of the viewport so
  // the label always names the one right after it. Also, while the Work
  // carousel fills the screen and isn't on its last slide yet, suppress this
  // cue entirely — it's fixed bottom-right on every section, the same corner
  // as the carousel's own next-slide arrow, and a "scroll to Skills" hint is
  // both visually colliding with and semantically premature over "next
  // project" until the carousel is actually done.
  useEffect(() => {
    const els = SCROLL_CUE_SECTIONS.map((s) => document.querySelector(s)).filter(Boolean);
    const workSection = document.querySelector(".work");
    if (!els.length) return;
    let raf = null;
    function update() {
      raf = null;
      let closest = 0;
      let closestDist = Infinity;
      els.forEach((el, i) => {
        const dist = Math.abs(el.getBoundingClientRect().top);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setNextLabel(SCROLL_CUE_LABELS[closest] || "");

      if (workSection) {
        const r = workSection.getBoundingClientRect();
        const workFillsScreen = r.top <= window.innerHeight * 0.1 && r.bottom >= window.innerHeight * 0.9;
        const carousel = document.getElementById("work-carousel");
        const onLastSlide = carousel ? carousel.getAttribute("data-on-last-slide") === "true" : true;
        setSuppressForWork(workFillsScreen && !onLastSlide);
      }
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={"scroll-cue" + (hidden || suppressForWork ? " is-hidden" : "")}>
      <span className="scroll-cue-label">{nextLabel}</span>
      <button
        type="button"
        className="scroll-cue-btn"
        aria-label={`Scroll to ${nextLabel}`}
        onClick={() => {
          // Snap to the next section's actual top — a fixed 0.9-viewport
          // scroll used to strand the view between two sections (mobile has
          // no scroll-snap to correct it).
          const els = SCROLL_CUE_SECTIONS.map((s) => document.querySelector(s)).filter(Boolean);
          let closest = 0;
          let closestDist = Infinity;
          els.forEach((el, i) => {
            const dist = Math.abs(el.getBoundingClientRect().top);
            if (dist < closestDist) {
              closestDist = dist;
              closest = i;
            }
          });
          const next = els[closest + 1];
          // scrollTo with a computed Y rather than scrollIntoView — the
          // latter consistently landed ~26px short here. Pulled up further
          // by the fixed header's height so its target isn't left partially
          // hidden underneath it.
          if (next) {
            const headerH = document.querySelector(".topbar")?.offsetHeight || 0;
            window.scrollTo({
              top: next.getBoundingClientRect().top + window.scrollY - headerH,
              behavior: "smooth",
            });
          }
        }}
      >
        <svg className="scroll-cue-arrow" viewBox="0 0 40 60" aria-hidden="true">
          <filter id="pencilRoughCue" x="-60%" y="-20%" width="220%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.09" numOctaves="2" seed="9" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
          </filter>
          <g fill="none" stroke="currentColor" strokeLinecap="round" filter="url(#pencilRoughCue)">
            <path d="M20,3 L20,36" strokeWidth="3.6" />
            <path d="M21.5,3 L21.5,36" strokeWidth="1.5" opacity="0.5" />
          </g>
          <path d="M7,29 L20,52 L33,29 C27,33.5 20,36 20,36 C20,36 13,33.5 7,29 Z" fill="currentColor" filter="url(#pencilRoughCue)" />
        </svg>
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero hero-mock-only">
      <div className="hero-hook">
        <p className="hero-hook-line">Your brand deserves</p>
        <p className="hero-hook-mark-wrap">
          <span className="hero-hook-mark" aria-hidden="true"></span>
          <span className="hero-hook-mark-text">a better website</span>
          <span className="hero-hook-dot hero-hook-dot-tl" aria-hidden="true"></span>
          <span className="hero-hook-dot hero-hook-dot-br" aria-hidden="true"></span>
        </p>
        <p className="hero-hook-sub">And this is where that begins.</p>
      </div>
      <div className="hero-visual">
        <DeskMock />
      </div>
    </section>
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
    name: "GitHub", rot: 6, brand: "#181717", contrast: "white",
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
  const [activeIndex, setActiveIndex] = useState(null);

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

  // No hover on touch — tapping a badge reveals its fill/name instead, and
  // tapping anywhere outside the grid dismisses it, mirroring the header
  // menu's own outside-click-to-close pattern elsewhere in this file.
  useEffect(() => {
    function onDocPointerDown(e) {
      if (gridRef.current && !gridRef.current.contains(e.target)) setActiveIndex(null);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);

  return (
    <section className="skills" id="skills">
      <h2 className="section-title">{t("skills.title", "Skills & Experience")}</h2>
      <p className="skills-copy">
        I build with a focused set of tools I actually know well, rather than a long list I barely
        use. HTML, CSS, and JavaScript are the foundation of everything I ship. When a project
        needs more — a CMS, a Node backend — I bring in exactly what fits, nothing more.
      </p>
      <p className="skills-copy">
        For a fuller look at my background and experience, visit my{" "}
        <a href="https://www.linkedin.com/in/eljonenesi/" target="_blank" rel="noopener" className="skills-link">
          LinkedIn
        </a>
        .
      </p>

      <div className={"skills-grid" + (revealed ? " is-revealed" : "")} ref={gridRef}>
        {SKILLS.map((s, i) => (
          <div
            className={"skill-item" + (activeIndex === i ? " is-active" : "")}
            key={s.name}
            style={{
              "--base-rot": `${s.rot}deg`,
              "--i": i,
              "--brand": s.brand,
              "--brand-contrast": s.contrast === "dark" ? "#171717" : "#ffffff",
            }}
            onClick={() => setActiveIndex((cur) => (cur === i ? null : i))}
            aria-label={s.name}
          >
            <div className="skill-item-inner">
              <span className="skill-badge">
                <svg className="skill-icon" viewBox="0 0 24 24" width="30" height="30" fill="currentColor">{s.icon}</svg>
              </span>
              <span className="skill-tooltip">{s.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const { t } = useTranslation();
  const [tier, setTier] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(75);

  const TIERS = [
    {
      tag: t("services.p1.tag", "Landing page"),
      amount: 75,
      desc: t("services.p1.desc", "A single, focused page — for a business, event, or launch. Fast to build, fast to load."),
      items: [
        t("services.p1.i1", "Custom design, no templates"),
        t("services.p1.i2", "Mobile-first, responsive layout"),
        t("services.p1.i3", "Basic SEO setup"),
      ],
      eta: "~3–5 days",
      example: "https://eljonenesi123.github.io/CV/",
    },
    {
      tag: t("services.p2.tag", "Multi-page website"),
      amount: 100,
      desc: t("services.p2.desc", "Several pages, a contact form, and content structured the way your visitors actually browse."),
      items: [
        t("services.p2.i1", "Everything in Landing page"),
        t("services.p2.i2", "Contact form & content pages"),
        t("services.p2.i3", "Multi-language support"),
      ],
      eta: "~1–2 weeks",
      example: "https://eljonenesi123.github.io/TopLevelPerformance/",
      popular: true,
    },
  ];
  const current = TIERS[tier];

  // Count the price up/down between tiers instead of just snapping to the
  // new number, so switching tiers reads as a single continuous motion
  // rather than a hard cut.
  useEffect(() => {
    const from = displayAmount;
    const to = current.amount;
    if (from === to) return;
    const start = performance.now();
    const duration = 400;
    let raf;
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayAmount(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  return (
    <section className="services" id="services">
      <h2 className="section-title">{t("services.title", "Services")}</h2>
      <p className="services-sub">{t("services.sub", "Prices vary by scope. This is a starting point.")}</p>

      <div className="services-layout">
        <div className="services-pricing">
          <div className="tier-toggle" role="tablist">
            <div className="tier-toggle-thumb" style={{ transform: `translateX(${tier * 100}%)` }} aria-hidden="true" />
            {TIERS.map((tr, i) => (
              <button
                key={tr.tag}
                type="button"
                role="tab"
                aria-selected={tier === i}
                className={"tier-toggle-btn" + (tier === i ? " is-active" : "")}
                onClick={() => setTier(i)}
              >
                {tr.tag}
              </button>
            ))}
          </div>

          <div className={"price-card-single" + (current.popular ? " price-card-featured" : "")}>
            {current.popular && <span className="price-badge">Popular</span>}
            <p className="price-from">{t("services.startingAt", "Starting at")}</p>
            <p className="price-amount">
              €{displayAmount}
              <span>{t("services.from", "+")}</span>
            </p>
            <div key={tier} className="price-fade">
              <p className="price-desc">{current.desc}</p>
              <ul className="price-list">
                {current.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <p className="price-eta">{current.eta}</p>
            </div>
            <a
              href="#contact"
              className="btn-primary price-cta"
              onClick={() => trackEvent("quote_click", { tier: current.tag })}
            >
              {t("services.cta", "Get a quote")}
            </a>
            <a href={current.example} target="_blank" rel="noopener" className="price-example-link">
              {t("services.example", "See an example ↗")}
            </a>
          </div>

          <div className="services-annotation" aria-hidden="true">
            <svg className="services-annotation-arrow" viewBox="0 0 200 130">
              <filter id="pencilRoughSvc" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency="0.025 0.06" numOctaves="2" seed="4" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
              </filter>
              <g fill="none" stroke="#000" strokeLinecap="round" filter="url(#pencilRoughSvc)">
                <path d="M182,12 C144,4 76,18 33,66 C19,81 13,92 10,105" strokeWidth="3.4" />
                <path d="M180,18 C142,12 78,26 36,70 C23,84 17,94 13,106" strokeWidth="1.6" opacity="0.55" />
              </g>
              <path
                d="M0,84 C7,93 12,104 15,118 C21,109 30,100 40,95 C27,93 12,89 0,84 Z"
                fill="#000"
                filter="url(#pencilRoughSvc)"
              />
            </svg>
            <p className="sketch-text services-annotation-text">
              Try switching
              <br />
              <strong>the tiers →</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  { q: "How long does a website take to build?", a: "A landing page usually takes 3 to 5 days. Something with several pages or a contact form takes 1 to 2 weeks. It depends on how much content you already have ready.", open: true },
  { q: "Do you work with clients outside your own country?", a: "Yes. Everything is handled remotely, so location doesn't matter. Most of the process happens over WhatsApp or email anyway." },
  { q: "Will my site work properly on phones?", a: "Yes. Every site I build starts from the mobile layout first, then scales up to desktop, not the other way around." },
  { q: "Can you redesign a site I already have?", a: "Yes. I can rebuild it from scratch or work with what's already there, depending on what shape it's in." },
  { q: "Who owns the code and the domain afterward?", a: "You do, fully. You buy your own domain, and you get the full source code once the project is done." },
  { q: "What happens after the site goes live?", a: "I stay reachable for fixes and small changes. If you need something bigger added later, we just talk about it like a new small project." },
  { q: "How much does a website cost?", a: "It starts at €75 for a single page and €100 for a multi-page site. Exact pricing depends on scope, see the Services section above for details." },
];

function FaqChevron() {
  return (
    <svg className="faq-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Faq() {
  // First-time-visitor nudge that the questions are tappable — dismissed
  // for good after the first click anywhere in the thread, since by then
  // the interaction pattern has already been demonstrated.
  const [hintVisible, setHintVisible] = useState(true);

  return (
    <section className="faq" id="faq">
      <h2 className="section-title">FAQ</h2>
      <div className="imessage-thread" onClick={() => setHintVisible(false)}>
        <p className="imessage-date">Today</p>
        {FAQ_ITEMS.map((item, i) => (
          <Fragment key={item.q}>
            <details className="imessage-pair" open={item.open || undefined}>
              <summary className="imessage-bubble imessage-received">
                <span className="imessage-bubble-text">{item.q}</span>
                <FaqChevron />
              </summary>
              <p className="imessage-bubble imessage-sent">{item.a}</p>
            </details>
            {i === 0 && (
              <p className={"faq-hint" + (hintVisible ? "" : " is-hidden")} aria-hidden={!hintVisible}>
                Tap a question to see the answer
              </p>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useTranslation();
  const socialClick = (label) => () => trackEvent("contact_click", { channel: label });

  return (
    <section className="contact" id="contact">
      <div className="contact-card">
        <svg className="contact-decor" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
          <path className="contact-decor-blob" d="M260,-40 C340,-20 400,40 380,110 C360,180 280,190 240,150 C200,110 180,40 220,0 C230,-20 245,-35 260,-40 Z" />
          <path className="contact-decor-line" d="M180,320 C220,240 200,150 260,95 C320,40 300,-30 345,-70" />
          <path className="contact-decor-line" d="M140,320 C180,240 160,150 220,95 C280,40 260,-30 305,-70" />
          <path className="contact-decor-line" d="M100,320 C140,240 120,150 180,95 C240,40 220,-30 265,-70" />
        </svg>

        <h2 className="section-title">{t("contact.title", "Contact")}</h2>
        <p className="contact-sub">{t("contact.sub", "Tell me what you're trying to build. I'll reply within a day or two.")}</p>

        <div className="contact-layout">
          <ContactForm />

        <div className="contact-side">
          <p className="contact-side-label">{t("contact.alt", "Or reach me directly")}</p>
          <a href="https://wa.me/355688944708" target="_blank" rel="noopener" className="social-link" aria-label="WhatsApp" onClick={socialClick("WhatsApp")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.4-1.42a9.87 9.87 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.14c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" /></svg>
            <span>WhatsApp</span>
          </a>
          <a href="mailto:eljonenesi9@gmail.com" className="social-link" aria-label="Email" onClick={socialClick("Email")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="M3 6.5l9 6.5 9-6.5" /></svg>
            <span>Email</span>
          </a>
          <a href="https://instagram.com/eljonenesi" target="_blank" rel="noopener" className="social-link" aria-label="Instagram" onClick={socialClick("Instagram")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>
            <span>Instagram</span>
          </a>
          <a href="https://www.linkedin.com/in/eljonenesi/" target="_blank" rel="noopener" className="social-link" aria-label="LinkedIn" onClick={socialClick("LinkedIn")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21h-4V9z" /></svg>
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/eljonenesi123" target="_blank" rel="noopener" className="social-link" aria-label="GitHub" onClick={socialClick("GitHub")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.3 9.4 7.9 11 .6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" /></svg>
            <span>GitHub</span>
          </a>
          <a href="tel:+355688944708" className="social-link" aria-label="Phone" onClick={socialClick("Phone")}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4c0 1-1 2-2 2C10 21 3 14 3 7c0-1 1-2 1-2z" /></svg>
            <span>Call</span>
          </a>
          </div>
        </div>
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
            Eljon Enesi
          </span>
          <p>Web developer building sites and small web apps for businesses, coaches, and independent projects.</p>
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="footer-stat-num">3+</span>
              <span className="footer-stat-label">Years experience</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-num">10+</span>
              <span className="footer-stat-label">Certifications</span>
            </div>
            <div className="footer-stat">
              <span className="footer-stat-num">3</span>
              <span className="footer-stat-label">Live projects</span>
            </div>
          </div>
          <div className="footer-socials">
            <a href="https://github.com/eljonenesi123" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.3 9.4 7.9 11 .6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" /></svg></a>
            <a href="https://instagram.com/eljonenesi" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
            <a href="https://www.linkedin.com/in/eljonenesi/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21h-4V9z" /></svg></a>
            <a href="https://wa.me/355688944708" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.4-1.42a9.87 9.87 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.14c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" /></svg></a>
          </div>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Menu</p>
          <a href="#top">Home</a>
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Services</p>
          <a href="#services">Landing pages</a>
          <a href="#services">Multi-page websites</a>
          <a href="#services">Redesigns</a>
          <a href="#contact">Ongoing support</a>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Contact</p>
          <a href="tel:+355688944708">+355 68 894 4708</a>
          <a href="mailto:eljonenesi9@gmail.com">eljonenesi9@gmail.com</a>
        </div>
      </div>

      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee-track">
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
          <span>ELJON ENESI&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t("footer.loc", "Eljon Enesi")}</span>
        <div className="footer-legal-links">
          <a href={asset("/terms.html")} target="_blank" rel="noopener">Terms</a>
          <a href={asset("/privacy.html")} target="_blank" rel="noopener">Privacy</a>
          <button type="button" onClick={onOpenCookieSettings}>Cookie settings</button>
        </div>
        <a href="#top" className="back-to-top" aria-label="Back to top">↑</a>
      </div>
    </footer>
  );
}

export default function App() {
  const { lang, setLang } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { visible: cookieVisible, accept, decline, openSettings } = useCookieConsent();

  // Always light on a first visit — the visitor opts into dark via the
  // toggle rather than the site following their OS-level preference.
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
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
      revealGroup(".tier-toggle, .price-card-single", { stagger: 0.12 });
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
        .querySelectorAll(".hero, .why-stats, .work, .skills, .services, .process, .estimator-section, .globe-section, .faq, .contact")
        .forEach((section) => {
          // .hero-title deliberately excluded — it's only ever the embedded
          // mock-website headline inside the desk-mock screen (DeskMock.jsx),
          // not a standalone section heading, and picking it up here left a
          // stray scroll-linked transform on it that overlapped the subline
          // in that tight, small-scale layout.
          const inner = section.querySelector(".stats-grid, .work-grid, .price-card-single, .process-list, .contact-grid");
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

    // Side "elevator" nav: clicking a number smooth-scrolls to that section
    // (a discrete, user-initiated jump — not scroll-jacking, the same as
    // clicking any other in-page anchor link). Which button is "active" is
    // tracked passively via IntersectionObserver, independent of any of
    // this — normal page scroll is never intercepted or overridden.
    {
      const sections = Array.from(
        document.querySelectorAll(".hero, .why-stats, .work, .skills, .services, .process, .estimator-section, .globe-section, .faq, .contact")
      );
      const navButtons = Array.from(document.querySelectorAll(".side-nav button"));

      function scrollToSection(index) {
        // GSAP's ScrollToPlugin used to align the target under the fixed
        // header automatically; a plain scrollTo needs that offset applied
        // by hand (index 0 doesn't: main's own padding-top already reserves
        // that space, so y:0 already lands right below the header).
        const headerH = document.querySelector(".topbar")?.offsetHeight || 0;
        const targetY =
          index === 0 ? 0 : sections[index].getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }

      const navClickHandlers = navButtons.map((btn, i) => {
        const handler = () => scrollToSection(i);
        btn.addEventListener("click", handler);
        return handler;
      });

      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const i = sections.indexOf(entry.target);
            if (i === -1) return;
            navButtons.forEach((b, bi) => b.classList.toggle("active", bi === i));
          });
        },
        // Fires when a section crosses the vertical center of the
        // viewport — a shrunk root, not a scroll listener.
        { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((sec) => navObserver.observe(sec));

      cleanups.push(() => {
        navButtons.forEach((btn, i) => btn.removeEventListener("click", navClickHandlers[i]));
        navObserver.disconnect();
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
      <SideNav />
      <ScrollCue />

      <main id="top">
        <Hero />
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
