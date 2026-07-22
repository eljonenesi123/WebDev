import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { useTranslation } from "../i18n";
import { asset } from "../asset";

// Work section: horizontal mini-carousel (intro -> laptop -> phone -> browser).
// Ported 1:1 from script.js's work-carousel IIFE: same transform-based
// positions, dot/arrow/keyboard-free (touch swipe only) navigation, and a
// 4-slide total matching the original TOTAL = 4.
const TOTAL = 4;
const SLIDE_MS = 1600; // matches .work-carousel's CSS transition duration

export default function WorkCarousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const sectionRef = useRef(null);
  const isActiveRef = useRef(false);
  const isSlidingRef = useRef(false);
  const laptopTiltRef = useRef(null);
  const ipadTiltRef = useRef(null);
  const topVideoRef = useRef(null);
  const ipadVideoRef = useRef(null);
  const cvVideoRef = useRef(null);

  const goTo = (i) => setCurrent(Math.max(0, Math.min(TOTAL - 1, i)));

  // Only the visible slide's video should ever load/play — with preload="none"
  // and no autoPlay, each one stays untouched (no network request at all)
  // until its slide is actually reached, instead of all three loading and
  // playing at once in the background.
  useEffect(() => {
    const bySlide = { 1: topVideoRef, 2: ipadVideoRef, 3: cvVideoRef };
    Object.entries(bySlide).forEach(([slide, ref]) => {
      const v = ref.current;
      if (!v) return;
      if (Number(slide) === current) v.play().catch(() => {});
      else v.pause();
    });
  }, [current]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    goTo(dx < 0 ? current + 1 : current - 1);
  };

  // Track whether the Work section is the one currently filling the
  // viewport, so the wheel intercept below only fires while it's active.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isActiveRef.current = entry.intersectionRatio > 0.95; },
      { threshold: [0, 0.95, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // While Work fills the screen, a wheel tick steps the carousel instead of
  // the page's normal section-to-section snap (see App.jsx). Only once
  // you're on the first/last slide does a further tick fall through to move
  // to the previous/next section, like scrolling normally would.
  // `capture: true` guarantees this runs before App.jsx's own window-level
  // wheel handler regardless of effect re-run order (see write-up below).
  useEffect(() => {
    if (window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches) return;
    function onWheel(e) {
      if (!isActiveRef.current) return;
      if (Math.abs(e.deltaY) < 10) return;
      if (isSlidingRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      const forward = e.deltaY > 0;
      if (forward && current < TOTAL - 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        isSlidingRef.current = true;
        setTimeout(() => { isSlidingRef.current = false; }, SLIDE_MS);
        goTo(current + 1);
      } else if (!forward && current > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        isSlidingRef.current = true;
        setTimeout(() => { isSlidingRef.current = false; }, SLIDE_MS);
        goTo(current - 1);
      }
      // else: already at the first/last slide in that direction — let the
      // event bubble up to App.jsx's normal vertical section-snap.
    }
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, { capture: true });
  }, [current]);

  // Cursor-follow tilt on the laptop, same technique as the hero phone's tilt.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)").matches) return;
    const el = laptopTiltRef.current;
    if (!el) return;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      el.style.transform = `rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 10}deg)`;
    }
    function onLeave() {
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Same cursor-follow tilt, applied to the iPad photo.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)").matches) return;
    const el = ipadTiltRef.current;
    if (!el) return;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      el.style.transform = `rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 10}deg)`;
    }
    function onLeave() {
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="work" id="work" ref={sectionRef}>
      <div
        className={"work-carousel pos-" + current}
        id="work-carousel"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="work-slide work-slide-intro">
          <div className="work-intro-col">
            <p className="work-intro-count">3 live projects</p>
            <h2 className="section-title">{t("work.title", "Work")}</h2>
            <p className="work-intro-text">
              A couple of projects, shown the way they actually run — not just a screenshot. Live
              sites you can click through, built end to end: design, code, and deployment.
            </p>
            <button type="button" className="work-nav-hint" onClick={() => goTo(current + 1)}>
              See them <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="work-intro-stack" aria-hidden="true">
            <div className="work-intro-card work-intro-card-1">
              <div className="work-intro-card-bar"><i></i><i></i><i></i></div>
              <img src={asset("/assets/work-preview-1.webp")} alt="" loading="lazy" />
            </div>
            <div className="work-intro-card work-intro-card-2">
              <div className="work-intro-card-bar"><i></i><i></i><i></i></div>
              <img src={asset("/assets/work-preview-2.webp")} alt="" loading="lazy" />
            </div>
            <div className="work-intro-card work-intro-card-3">
              <div className="work-intro-card-bar"><i></i><i></i><i></i></div>
              <img src={asset("/assets/work-preview-3.webp")} alt="" loading="lazy" />
            </div>
          </div>
        </div>

        <div className={"work-slide" + (current === 1 ? " is-active" : "")}>
          <div className="work-slide-text">
            <p className="project-tag">{t("work.p2.tag", "Coaching platform")}</p>
            <h3>Top Level Performance</h3>
            <p className="project-desc">
              {t(
                "work.p2.desc",
                "A site for a coach offering online and 1-on-1 sessions, built so a new visitor can understand the offer and book a session without friction."
              )}
            </p>
            <p className="project-stack">HTML · CSS · JavaScript · Responsive layout · Booking flow</p>
            <div className="project-links">
              <a
                href="https://eljonenesi123.github.io/TopLevelPerformance/"
                target="_blank"
                rel="noopener"
              >
                {t("work.live", "Live site ↗")}
              </a>
              <a href="https://github.com/eljonenesi123/TopLevelPerformance" target="_blank" rel="noopener">
                {t("work.source", "Source code ↗")}
              </a>
            </div>
            <blockquote className="testimonial">
              <p>
                Since the site went live, more people book sessions without me having to explain
                everything myself first. Clients take me more seriously now.
              </p>
              <cite>Jeart Kumi, Top Level Performance</cite>
            </blockquote>
          </div>
          <div className="device-laptop-tilt" ref={laptopTiltRef}>
            <a
              className="device-frame device-laptop"
              href="https://eljonenesi123.github.io/TopLevelPerformance/"
              target="_blank"
              rel="noopener"
              aria-label="Open Top Level Performance live site"
              onClick={() => trackEvent("project_click", { project: "Open Top Level Performance live site" })}
            >
              <img className="device-laptop-photo" src={asset("/assets/laptop.webp")} alt="" loading="lazy" />
              <div className="device-laptop-screen-clip">
                <video ref={topVideoRef} muted loop playsInline preload="none" poster={asset("/assets/TOP.webp")}>
                  <source src={asset("/assets/TOP-demo.mp4")} type="video/mp4" />
                </video>
                <div className="device-laptop-sheen" aria-hidden="true"></div>
              </div>
            </a>
          </div>
        </div>

        <div className={"work-slide" + (current === 2 ? " is-active" : "")}>
          <div className="work-slide-text">
            <p className="project-tag">{t("work.p1.tag", "Movie & TV picker")}</p>
            <h3>Just Pick Something</h3>
            <p className="project-desc">
              {t(
                "work.p1.desc",
                "A tool for groups who can't agree on what to watch. Spin a wheel, describe a mood, or swipe through picks together. Includes four built-in games, works offline as an installable app, and is available in three languages."
              )}
            </p>
            <p className="project-stack">HTML · CSS · JavaScript · TMDB API · PWA · i18n (EN/SQ/DE)</p>
            <div className="project-links">
              <a href="https://eljonenesi123.github.io/MovieDecider/" target="_blank" rel="noopener">
                {t("work.live", "Live site ↗")}
              </a>
              <a href="https://github.com/eljonenesi123/MovieDecider" target="_blank" rel="noopener">
                {t("work.source", "Source code ↗")}
              </a>
            </div>
          </div>
          <div className="device-ipad-tilt" ref={ipadTiltRef}>
            <a
              className="device-frame device-ipad"
              href="https://eljonenesi123.github.io/MovieDecider/"
              target="_blank"
              rel="noopener"
              aria-label="Open Just Pick Something live site"
              onClick={() => trackEvent("project_click", { project: "Open Just Pick Something live site" })}
            >
              <img className="device-ipad-photo" src={asset("/assets/ipad.webp")} alt="" loading="lazy" />
              <div className="device-ipad-screen-clip">
                <video ref={ipadVideoRef} muted loop playsInline preload="none" poster={asset("/assets/phone.webp")}>
                  <source src={asset("/assets/phone-demo.mp4")} type="video/mp4" />
                </video>
              </div>
            </a>
          </div>
        </div>

        <div className={"work-slide" + (current === 3 ? " is-active" : "")}>
          <div className="work-slide-text">
            <p className="project-tag">About &amp; background</p>
            <h3>The Long Version</h3>
            <p className="project-desc">
              For anyone who wants more than the portfolio shows. Background, timeline, and a way
              to reach me, all on one page that stays current.
            </p>
            <p className="project-stack">HTML · CSS · JavaScript · Responsive layout</p>
            <div className="project-links">
              <a href="https://eljonenesi123.github.io/CV/" target="_blank" rel="noopener">
                Live site ↗
              </a>
              <a href="https://github.com/eljonenesi123/CV" target="_blank" rel="noopener">
                Source code ↗
              </a>
            </div>
          </div>
          <a
            className="device-frame device-browser"
            href="https://eljonenesi123.github.io/CV/"
            target="_blank"
            rel="noopener"
            aria-label="Open The Long Version live site"
            onClick={() => trackEvent("project_click", { project: "Open The Long Version live site" })}
          >
            <div className="device-browser-bar">
              <span className="device-browser-dots">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span className="device-browser-url">eljonenesi123.github.io/CV</span>
            </div>
            <div className="device-browser-screen">
              <video ref={cvVideoRef} muted loop playsInline preload="none" poster={asset("/assets/CV.png")}>
                <source src={asset("/assets/cv-demo.mp4")} type="video/mp4" />
              </video>
            </div>
          </a>
        </div>
      </div>

      <div className="work-dots" id="work-dots">
        {["Intro", "Top Level Performance", "Just Pick Something", "The Long Version"].map((label, i) => (
          <button
            key={label}
            type="button"
            data-slide={i}
            className={current === i ? "active" : ""}
            aria-label={label}
            onClick={() => goTo(i)}
          ></button>
        ))}
      </div>
      <button
        type="button"
        className="work-arrow work-arrow-prev"
        id="work-prev"
        aria-label="Previous"
        disabled={current === 0}
        onClick={() => goTo(current - 1)}
      >
        ←
      </button>
      <button
        type="button"
        className="work-arrow work-arrow-next"
        id="work-next"
        aria-label="Next"
        disabled={current === TOTAL - 1}
        onClick={() => goTo(current + 1)}
      >
        →
      </button>
    </section>
  );
}
