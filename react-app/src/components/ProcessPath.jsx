import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n";

// "How it works" as a scroll-driven S-curve: each wheel/swipe tick while
// this section fills the screen draws the next segment of the line and
// reveals the step beside it — only once fully drawn does scrolling fall
// through to the next section normally. Same behavior on mobile.
const STEPS = [
  { h: "process.s1.h", hd: "Brief", p: "process.s1.p", pd: "You tell us what you need and who it's for. We ask questions until the scope, pages, and features are clear, then send you a fixed quote before anything starts.", side: "left" },
  { h: "process.s2.h", hd: "Domain & hosting", p: "process.s2.p", pd: "You purchase your own domain name. We'll point you to a registrar and help pick one if needed, so it stays fully in your name and under your control. We handle connecting it to the finished website.", side: "right" },
  { h: "process.s3.h", hd: "Build", p: "process.s3.p", pd: "We build it, and you see progress along the way instead of just a reveal at the end.", side: "left" },
  { h: "process.s4.h", hd: "Launch", p: "process.s4.p", pd: "Your website goes live on your domain. We stay reachable after launch for fixes and small changes.", side: "right" },
];
const TOTAL = STEPS.length;
const STEP_MS = 700;

export default function ProcessPath() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const sectionRef = useRef(null);
  const isActiveRef = useRef(false);
  const isSteppingRef = useRef(false);
  const touchStartY = useRef(0);
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);
  const mobilePathRef = useRef(null);
  const [mobilePathLen, setMobilePathLen] = useState(0);
  const pointRefs = useRef([]);
  const isMobileRef = useRef(false);

  useEffect(() => {
    isMobileRef.current = window.matchMedia("(max-width: 700px)").matches;
  }, []);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
    if (mobilePathRef.current) setMobilePathLen(mobilePathRef.current.getTotalLength());
  }, []);

  // Desktop: the section fills the screen and wheel/swipe steps through it
  // like a slide deck. Mobile instead flows normally down the page (see the
  // other effect below) — cramming the S-curve into a small screen made the
  // step text overlap, so mobile trades the hijack for a plain scroll reveal.
  useEffect(() => {
    if (isMobileRef.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isActiveRef.current = entry.intersectionRatio > 0.85; },
      { threshold: [0, 0.85, 0.95, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mobile: each step (and its slice of the spine) reveals as it naturally
  // scrolls into view — no hijacking, the page just keeps scrolling.
  useEffect(() => {
    if (!isMobileRef.current) return;
    const els = pointRefs.current.filter(Boolean);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number(entry.target.dataset.index);
          setStep((s) => Math.max(s, i + 1));
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isMobileRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function tryStep(forward) {
      if (isSteppingRef.current) return false;
      if (forward && step >= TOTAL) return false;
      if (!forward && step <= 0) return false;
      isSteppingRef.current = true;
      setTimeout(() => { isSteppingRef.current = false; }, STEP_MS);
      setStep((s) => Math.max(0, Math.min(TOTAL, s + (forward ? 1 : -1))));
      return true;
    }

    function onWheel(e) {
      if (!isActiveRef.current) return;
      if (Math.abs(e.deltaY) < 10) return;
      if (tryStep(e.deltaY > 0)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (isSteppingRef.current) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      // else: already at 0/TOTAL in that direction — let it bubble to the
      // page's normal section-to-section snap.
    }
    function onTouchStart(e) {
      touchStartY.current = e.touches[0].clientY;
    }
    function onTouchMove(e) {
      if (!isActiveRef.current) return;
      const dy = touchStartY.current - e.touches[0].clientY;
      const forward = dy > 0;
      if (forward && step >= TOTAL) return;
      if (!forward && step <= 0) return;
      // Must preventDefault from the first sample of the gesture — once a
      // mobile browser commits to a native scroll it can't be stopped mid-way.
      e.preventDefault();
      if (Math.abs(dy) < 40) return;
      if (tryStep(forward)) touchStartY.current = e.touches[0].clientY;
    }

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [step]);

  const dashOffset = pathLen - (pathLen * step) / TOTAL;

  return (
    <section className="process" id="process" ref={sectionRef}>
      <h2 className="section-title">{t("process.title", "How it works")}</h2>
      <div className="process-path">
        <svg className="process-path-svg" viewBox="0 0 300 900" preserveAspectRatio="none" aria-hidden="true">
          <filter id="pencilRough" x="-50%" y="-5%" width="200%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.025 0.06" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
          <path
            className="process-path-ghost"
            d="M90,90 C90,180 210,180 210,320 C210,410 90,410 90,550 C90,640 210,640 210,780"
          />
          <path
            ref={pathRef}
            className="process-path-line"
            d="M90,90 C90,180 210,180 210,320 C210,410 90,410 90,550 C90,640 210,640 210,780"
            style={{ strokeDasharray: pathLen, strokeDashoffset: dashOffset }}
          />
          <path
            className="process-path-arrowhead"
            d="M198,772 L210,798 L222,772 Z"
            style={{ opacity: step >= TOTAL ? 1 : 0 }}
          />
          {step === 0 && (
            // An rx/ry ellipse, not a circle: the SVG stretches non-uniformly
            // (preserveAspectRatio="none") to fill the tall container, so a
            // true circle here would render as a squashed oval on screen.
            <ellipse className="process-path-start-dot" cx="90" cy="90" rx="1.8" ry="7" />
          )}
        </svg>
        <svg className="process-path-svg-mobile" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
          <filter id="pencilRoughV" filterUnits="userSpaceOnUse" x="-20" y="-10" width="80" height="1020">
            <feTurbulence type="fractalNoise" baseFrequency="0.025 0.06" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
          <path className="process-path-ghost" d="M20,10 L20,990" />
          <path
            ref={mobilePathRef}
            className="process-path-line"
            d="M20,10 L20,990"
            style={{ filter: "url(#pencilRoughV)", strokeDasharray: mobilePathLen, strokeDashoffset: mobilePathLen - (mobilePathLen * step) / TOTAL }}
          />
        </svg>
        {step === 0 && (
          <p className="process-hint sketch-text">
            {t("process.scrollHint", "Scroll to begin")}
            <br />
            <strong>↓</strong>
          </p>
        )}
        {STEPS.map((s, i) => (
          <div
            key={s.h}
            ref={(el) => (pointRefs.current[i] = el)}
            data-index={i}
            className={`process-point process-point-${i + 1} process-point-${s.side}` + (step > i ? " is-revealed" : "")}
          >
            <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3>{t(s.h, s.hd)}</h3>
              <p>{t(s.p, s.pd)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
