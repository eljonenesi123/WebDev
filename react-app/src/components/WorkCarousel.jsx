import { useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { useTranslation } from "../i18n";

// Work section: horizontal mini-carousel (intro -> laptop -> phone -> browser).
// Ported 1:1 from script.js's work-carousel IIFE: same transform-based
// positions, dot/arrow/keyboard-free (touch swipe only) navigation, and a
// 4-slide total matching the original TOTAL = 4.
const TOTAL = 4;

export default function WorkCarousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const goTo = (i) => setCurrent(Math.max(0, Math.min(TOTAL - 1, i)));

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    goTo(dx < 0 ? current + 1 : current - 1);
  };

  return (
    <section className="work" id="work">
      <div
        className={"work-carousel pos-" + current}
        id="work-carousel"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="work-slide work-slide-intro">
          <h2 className="section-title">{t("work.title", "Work")}</h2>
          <p className="work-intro-text">
            A couple of projects, shown the way they actually run — not just a screenshot. Live
            sites you can click through, built end to end: design, code, and deployment.
          </p>
          <p className="work-intro-count">3 live projects</p>
          <button type="button" className="work-nav-hint" onClick={() => goTo(current + 1)}>
            Next ↗
          </button>
        </div>

        <div className="work-slide">
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
          <a
            className="device-frame device-laptop"
            href="https://eljonenesi123.github.io/TopLevelPerformance/"
            target="_blank"
            rel="noopener"
            aria-label="Open Top Level Performance live site"
            onClick={() => trackEvent("project_click", { project: "Open Top Level Performance live site" })}
          >
            <div className="device-laptop-screen">
              <video autoPlay muted loop playsInline poster="/assets/TOP.png">
                <source src="/assets/TOP-demo.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="device-laptop-hinge"></div>
            <div className="device-laptop-keyboard"></div>
          </a>
        </div>

        <div className="work-slide">
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
          <a
            className="device-frame device-phone"
            href="https://eljonenesi123.github.io/MovieDecider/"
            target="_blank"
            rel="noopener"
            aria-label="Open Just Pick Something live site"
            onClick={() => trackEvent("project_click", { project: "Open Just Pick Something live site" })}
          >
            <div className="device-phone-notch"></div>
            <div className="device-phone-screen">
              <video autoPlay muted loop playsInline poster="/assets/phone.png">
                <source src="/assets/phone-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </a>
        </div>

        <div className="work-slide">
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
              <video autoPlay muted loop playsInline poster="/assets/CV.png">
                <source src="/assets/cv-demo.mp4" type="video/mp4" />
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
