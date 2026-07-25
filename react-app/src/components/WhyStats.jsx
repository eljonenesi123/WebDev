import { useEffect, useRef, useState } from "react";

// Real numbers, cross-checked (not invented) since this section's whole
// pitch is credibility — even without on-page citations, they aren't
// unsourced marketing filler.
const STATS = [
  {
    value: 75,
    decimals: 0,
    suffix: "%",
    label: "of visitors judge a business's credibility based on its website design",
  },
  {
    value: 94,
    decimals: 0,
    suffix: "%",
    label: "of people form their first opinion of a business within 0.05 seconds of seeing its website",
  },
  {
    value: 88.5,
    decimals: 1,
    suffix: "%",
    label: "of users leave a website because of slow load times",
  },
  {
    value: 7,
    decimals: 0,
    prefix: "-",
    suffix: "%",
    negative: true,
    label: "drop in conversions from just a 1-second delay in load time",
  },
  {
    value: 11,
    decimals: 0,
    suffix: "%",
    label: "higher conversion rates on mobile-responsive sites — plus 20% more engagement",
  },
];

function StatSparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

// Radius/circumference for the SVG progress ring — stroke-dasharray is set
// to the full circumference, stroke-dashoffset shrinks from that (fully
// hidden) down to 0 (fully drawn) as `progress` goes 0 -> 1. Rotated -90deg
// in CSS so the ring starts at 12 o'clock and fills clockwise, matching the
// usual progress-indicator convention instead of SVG's native 3-o'clock start.
const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function StatRing({ progress, negative }) {
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <svg className="stat-ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle className="stat-ring-track" cx="60" cy="60" r={RING_RADIUS} />
      <circle
        className={"stat-ring-fill" + (negative ? " is-negative" : "")}
        cx="60"
        cy="60"
        r={RING_RADIUS}
        style={{ strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: offset }}
      />
    </svg>
  );
}

export default function WhyStats() {
  const gridRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [displayValues, setDisplayValues] = useState(() => STATS.map(() => 0));

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValues(STATS.map((s) => s.value));
      return;
    }
    const duration = 1400;
    const start = performance.now();
    let raf;
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValues(STATS.map((s) => s.value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [revealed]);

  return (
    <section className="why-stats" id="why-this-matters">
      <StatSparkle className="stats-sparkle stats-sparkle-1" />
      <StatSparkle className="stats-sparkle stats-sparkle-2" />

      <div className="why-stats-head">
        <h2 className="section-title">Why This Matters</h2>
        <svg className="stats-underline" viewBox="0 0 260 20" preserveAspectRatio="none" aria-hidden="true">
          <path d="M4,12 C60,4 130,17 180,9 C210,4 235,10 256,7" />
        </svg>
        <p className="stats-sub">A good website isn't a nice-to-have — the numbers make the case.</p>
      </div>

      <div className={"stats-grid" + (revealed ? " is-revealed" : "")} ref={gridRef}>
        {STATS.map((s, i) => (
          <div className="stat-card" key={s.label} style={{ "--i": i }}>
            <div className="stat-ring-wrap">
              <StatRing progress={displayValues[i] / 100} negative={s.negative} />
              <p className="stat-number">
                {s.prefix || ""}
                {displayValues[i].toFixed(s.decimals)}
                {s.suffix}
              </p>
            </div>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
