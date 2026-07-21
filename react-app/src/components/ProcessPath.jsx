import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n";

// "How it works" as a scroll-driven S-curve: each wheel/swipe tick while
// this section fills the screen draws the next segment of the line and
// reveals the step beside it — only once fully drawn does scrolling fall
// through to the next section normally. Same behavior on mobile.
const STEPS = [
  { h: "process.s1.h", hd: "Brief", p: "process.s1.p", pd: "You tell me what you need and who it's for. I ask questions until the scope, pages, and features are clear, then send you a fixed quote before anything starts.", side: "left" },
  { h: "process.s2.h", hd: "Domain & hosting", p: "process.s2.p", pd: "You purchase your own domain name (I'll point you to a registrar and help pick one if needed) — this keeps it fully in your name and under your control. I handle connecting it to the finished site.", side: "right" },
  { h: "process.s3.h", hd: "Build", p: "process.s3.p", pd: "I build it, and you see progress along the way — not just a reveal at the end.", side: "left" },
  { h: "process.s4.h", hd: "Launch", p: "process.s4.p", pd: "Your site goes live on your domain. I stay reachable after launch for fixes and small changes.", side: "right" },
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

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isActiveRef.current = entry.intersectionRatio > 0.85; },
      { threshold: [0, 0.85, 0.95, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
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
      if (Math.abs(dy) < 40) return;
      if (tryStep(dy > 0)) {
        e.preventDefault();
        touchStartY.current = e.touches[0].clientY;
      }
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
          <filter id="pencilRough">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.03" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
          </filter>
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
        </svg>
        {STEPS.map((s, i) => (
          <div
            key={s.h}
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
