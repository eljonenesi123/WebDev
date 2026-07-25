import { useEffect, useRef, useState } from "react";

export default function GlobeSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const [nearby, setNearby] = useState(false);

  // Only fetch Three.js (from a CDN, not our own bundle) once this section
  // is close to the viewport — it's a real WebGL scene, not worth loading
  // on every page view regardless of whether anyone scrolls this far.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNearby(true); },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearby || !containerRef.current) return;
    let cleanup = null;
    let cancelled = false;
    import("../globe-3d.js").then(({ initGlobe3D }) => {
      if (cancelled || !containerRef.current) return;
      initGlobe3D(containerRef.current).then((fn) => {
        if (cancelled) fn();
        else cleanup = fn;
      });
    });
    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [nearby]);

  return (
    <section className="globe-section" id="global-reach" ref={sectionRef}>
      <h2 className="section-title">Global Reach</h2>
      <p className="globe-sub">Remote-first — I build for clients wherever they are. Drag to rotate, scroll to zoom.</p>
      <div className="globe-canvas-wrap" ref={containerRef} aria-hidden="true"></div>
    </section>
  );
}
