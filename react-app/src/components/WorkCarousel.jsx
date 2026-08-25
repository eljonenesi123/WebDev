import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { useTranslation } from "../i18n";
import { asset } from "../asset";

// 6 projects, one phone slide each. Names/links are proper nouns (not
// translated); tag + description read through i18n so they switch with the
// site's EN/SQ/DE toggle. Stack lines list technology names only, same as
// the old Work section's .project-stack — those don't need translation.
//
// `fit` and `statusBar` were picked by actually measuring each screenshot
// (aspect ratio + average luminance of its top ~5% band), not eyeballed.
// All 6 are now portrait mobile-viewport captures (~0.46-0.60 width/height,
// close to the phone frame's own 9/19.5 ratio) so all use "cover" — kept as
// a per-project field rather than a hardcoded value since a prior round of
// screenshots was desktop-shaped (~1.6:1) and needed "contain" instead to
// avoid "cover" cropping them down to a narrow, unreadable center sliver;
// swap a project back to "contain" here if a future screenshot goes wide
// again. None of these screenshots have an OS status bar baked in (checked
// each one directly), so the overlay below is still doing real work — its
// light/dark color is chosen per screenshot's own top-band brightness,
// since it sits directly on that content.
const PROJECTS = [
  {
    id: "jps",
    name: "JustPickSomething",
    img: "/assets/JustPickSomething.webp",
    fit: "cover",
    statusBar: "light",
    tagKey: "work.p1.tag",
    tagFallback: "Movie & TV picker",
    descKey: "work.p1.desc",
    descFallback:
      "A tool for groups who can't agree on what to watch. Spin a wheel, describe a mood, or swipe through picks together. Includes four built-in games, works offline as an installable app, and is available in three languages.",
    stack: "Vanilla JS · TMDB API · PWA",
    link: "https://eljonenesi123.github.io/JustPickSomething/",
  },
  {
    id: "top",
    name: "Top Level Performance",
    img: "/assets/TopLevelPerformance.webp",
    fit: "cover",
    statusBar: "light",
    tagKey: "work.p2.tag",
    tagFallback: "Coaching platform",
    descKey: "work.p2.desc",
    descFallback:
      "A site for a coach offering online and 1-on-1 sessions, built so a new visitor can understand the offer and book a session without friction.",
    stack: "HTML · CSS · JavaScript · Bilingual (EN/AL)",
    link: "https://eljonenesi123.github.io/TopLevelPerformance/",
  },
  {
    id: "kafeneja",
    name: "Kafeneja",
    img: "/assets/Kafeneja.webp",
    fit: "cover",
    statusBar: "dark",
    tagKey: "work.p3.tag",
    tagFallback: "Coffee shop concept",
    descKey: "work.p3.desc",
    descFallback:
      "A specialty coffee shop concept in Blloku, Tirana. Includes a homepage, menu, about/journal page, and contact/reservation forms, with an EN/Albanian toggle and Wolt/Glovo order-ahead links.",
    stack: "Next.js · React · TypeScript · Tailwind · GSAP",
    link: "https://eljonenesi123.github.io/kafeneja/",
  },
  {
    id: "mymoney",
    name: "MyMoney",
    img: "/assets/MyMoney.png",
    fit: "cover",
    statusBar: "light",
    tagKey: "work.p4.tag",
    tagFallback: "Expense tracker",
    descKey: "work.p4.desc",
    descFallback:
      "Snap a photo of a receipt and it auto-fills the amount and item via OCR. Savings goals, bill reminders, live currency rates, and spending insights.",
    stack: "React · Node/Express · MongoDB · Tesseract.js OCR",
    link: "https://eljonenesi123.github.io/mymoney-app/",
  },
  {
    id: "stayfit",
    name: "StayFit",
    img: "/assets/StayFit.png",
    fit: "cover",
    statusBar: "dark",
    tagKey: "work.p5.tag",
    tagFallback: "Fitness app",
    descKey: "work.p5.desc",
    descFallback:
      "An exercise library with instructional GIFs, an interval timer accurate enough to survive screen lock, and BMI/weight/calorie tracking.",
    stack: "React · TypeScript · Vite · Supabase · PWA",
    link: "https://eljonenesi123.github.io/StayFit/",
  },
  {
    id: "cv",
    name: "The Long Version",
    img: "/assets/CV.png",
    fit: "cover",
    statusBar: "light",
    tagKey: "work.p6.tag",
    tagFallback: "About & background",
    descKey: "work.p6.desc",
    descFallback:
      "For anyone who wants more than the portfolio shows. Background, timeline, and a way to reach me, all on one page that stays current.",
    stack: "HTML · CSS · JavaScript · Responsive layout",
    link: "https://eljonenesi123.github.io/CV/",
  },
  {
    id: "straka",
    name: "Straka Apartments",
    img: "/assets/Straka.png",
    fit: "cover",
    statusBar: "dark",
    tagKey: "work.p7.tag",
    tagFallback: "Apartment rental site",
    descKey: "work.p7.desc",
    descFallback:
      "A booking site for a short-term rental apartment, with a photo tour of each room, amenities, and a clear path to book a stay.",
    stack: "HTML · CSS · JavaScript",
    link: "https://eljonenesi123.github.io/StrakaApartments/",
  },
];

const TOTAL = PROJECTS.length;
const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 40;

// iPhone status-bar glyphs — signal bars, wifi arcs, ~100% battery. Filled/
// stroked with currentColor so the .is-light / .is-dark class on the status
// bar (picked per screenshot, see PROJECTS above) recolors all three at once.
function SignalIcon() {
  return (
    <svg viewBox="0 0 18 12" aria-hidden="true" className="status-icon-signal">
      <rect x="0" y="7" width="3" height="5" rx="0.6" />
      <rect x="5" y="4.5" width="3" height="7.5" rx="0.6" />
      <rect x="10" y="2" width="3" height="10" rx="0.6" />
      <rect x="15" y="0" width="3" height="12" rx="0.6" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" aria-hidden="true" className="status-icon-wifi">
      <path d="M1 4.2a10.6 10.6 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.4 7a7 7 0 0 1 9.2 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.9 9.7a3.4 3.4 0 0 1 4.2 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.9" fill="currentColor" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg viewBox="0 0 25 12" aria-hidden="true" className="status-icon-battery">
      <rect x="0.75" y="0.75" width="20.5" height="10.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <rect x="2.25" y="2.25" width="16.7" height="7.5" rx="1.3" fill="currentColor" />
      <rect x="22.2" y="4" width="1.8" height="4" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5v11l10-5.5-10-5.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3.5" y="2.5" width="3.2" height="11" />
      <rect x="9.3" y="2.5" width="3.2" height="11" />
    </svg>
  );
}

// Shortest signed distance from `current` to slide `i` around the 6-slide
// loop, e.g. current=0 -> i=5 reads as -1 (one step left) instead of +5.
function relativeOffset(i, current) {
  let diff = i - current;
  const half = TOTAL / 2;
  if (diff > half) diff -= TOTAL;
  if (diff < -half) diff += TOTAL;
  return diff;
}

export default function WorkCarousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [inView, setInView] = useState(true);
  const [hovering, setHovering] = useState(false);
  const stageRef = useRef(null);
  const touchStartX = useRef(0);
  const touchActive = useRef(false);

  const goTo = useCallback((i) => {
    setCurrent(((i % TOTAL) + TOTAL) % TOTAL);
  }, []);

  // Pause autoplay once the carousel scrolls out of view, same
  // pause-when-offscreen pattern used by DeskMock/GlobeSection.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView || hovering) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % TOTAL), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, inView, hovering, current]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchActive.current = true;
  };
  const onTouchEnd = (e) => {
    if (!touchActive.current) return;
    touchActive.current = false;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    goTo(current + (dx < 0 ? 1 : -1));
  };

  // Hover tilt for any phone (center or peeking): sets --tilt-rx/--tilt-ry
  // on the button, read by .phone-mock-tilt's own transform in CSS — kept
  // off .phone-mock itself since that element's transform already carries
  // the coverflow position/scale/rotateY from .cf-*, and writing a second,
  // different transform there would just replace it instead of combining.
  // rAF-throttled and mouse-only (pointerType check) for the same reasons
  // as the shared useCursorTilt hook, which can't be reused directly here
  // since it needs one ref per element and these are built in a .map().
  const tiltRaf = useRef(null);
  const onPhonePointerMove = (e) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (tiltRaf.current) return;
    tiltRaf.current = requestAnimationFrame(() => {
      tiltRaf.current = null;
      const rect = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      // rotateY (side-to-side, driven by horizontal position) is the
      // dominant axis for a "full 3D card tilt" feel; rotateX (driven by
      // vertical position) stays smaller so it reads as a secondary,
      // following-the-cursor detail rather than competing with it.
      // px/py range 0-1, so (px - 0.5) alone only swings ±0.5 — the *2
      // is what makes maxRotateY/maxRotateX the true angle reached at the
      // element's actual edge, not just half of it.
      const maxRotateY = 22;
      const maxRotateX = 12;
      el.style.setProperty("--tilt-rx", `${((0.5 - py) * 2 * maxRotateX).toFixed(2)}deg`);
      el.style.setProperty("--tilt-ry", `${((px - 0.5) * 2 * maxRotateY).toFixed(2)}deg`);
    });
  };
  const onPhonePointerLeave = (e) => {
    e.currentTarget.style.setProperty("--tilt-rx", "0deg");
    e.currentTarget.style.setProperty("--tilt-ry", "0deg");
  };

  const active = PROJECTS[current];

  return (
    <section className="work" id="work">
      <h2 className="section-title">{t("work.title", "Work")}</h2>

      <div
        className="work-coverflow-stage"
        id="work-carousel"
        data-on-last-slide={current === TOTAL - 1}
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {PROJECTS.map((p, i) => {
          const offset = relativeOffset(i, current);
          const clamped = Math.max(-2, Math.min(2, offset));
          const posClass = clamped === 0 ? "cf-0" : clamped < 0 ? `cf-n${Math.abs(clamped)}` : `cf-${clamped}`;
          const isPeek = Math.abs(clamped) === 1;
          const isHidden = Math.abs(clamped) >= 2;
          return (
            <button
              type="button"
              key={p.id}
              className={"phone-mock " + posClass}
              style={{ zIndex: 10 - Math.abs(clamped) }}
              onClick={isPeek ? () => goTo(i) : undefined}
              aria-label={p.name}
              aria-current={offset === 0}
              tabIndex={isPeek ? 0 : -1}
              aria-hidden={isHidden}
              onPointerMove={onPhonePointerMove}
              onPointerLeave={onPhonePointerLeave}
            >
              <span className="phone-mock-tilt">
                <span className="phone-mock-screen">
                  <img
                    src={asset(p.img)}
                    alt=""
                    loading={Math.abs(clamped) <= 1 ? "eager" : "lazy"}
                    className={p.fit === "contain" ? "is-contain" : undefined}
                  />
                  <span className={"phone-status-bar is-" + p.statusBar} aria-hidden="true">
                    <span className="phone-status-time">9:41</span>
                    <span className="phone-status-icons">
                      <SignalIcon />
                      <WifiIcon />
                      <BatteryIcon />
                    </span>
                  </span>
                </span>
                <span className="phone-mock-island" aria-hidden="true"></span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="work-controls">
        <button type="button" className="work-arrow work-arrow-prev" aria-label={t("work.prev", "Previous project")} onClick={() => goTo(current - 1)}>
          ←
        </button>
        <button
          type="button"
          className="work-play-pause"
          aria-label={playing ? t("work.pause", "Pause autoplay") : t("work.play", "Play autoplay")}
          aria-pressed={playing}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="work-arrow work-arrow-next" aria-label={t("work.next", "Next project")} onClick={() => goTo(current + 1)}>
          →
        </button>
      </div>

      <div className="work-caption" key={active.id}>
        <p className="project-tag">{t(active.tagKey, active.tagFallback)}</p>
        <h3>{active.name}</h3>
        <p className="project-desc">{t(active.descKey, active.descFallback)}</p>
        <p className="project-stack">{active.stack}</p>
        <div className="project-links">
          {active.link ? (
            <a href={active.link} target="_blank" rel="noopener" onClick={() => trackEvent("project_click", { project: active.name })}>
              {t("work.live", "Live site ↗")}
            </a>
          ) : (
            <span className="project-links-soon">{t("work.comingsoon", "Live site coming soon")}</span>
          )}
        </div>
      </div>

      <div className="work-dots" id="work-dots">
        {PROJECTS.map((p, i) => (
          <button key={p.id} type="button" className={current === i ? "active" : ""} aria-label={p.name} onClick={() => goTo(i)}></button>
        ))}
      </div>
    </section>
  );
}
