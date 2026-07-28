import { useEffect, useRef, useState } from "react";
import { asset } from "../asset";

// Three independent instances of a real Lottie walk-cycle (not a hand-
// built SVG stick figure) — same source animationData object reused per
// instance (lottie-web clones its own render tree per container, so this
// doesn't re-fetch/re-parse the JSON three times). Each instance starts
// at a different frame offset so they don't step in lockstep. lottie-web
// itself is only imported, and the JSON only fetched, once this section
// is near the viewport (mirrors GlobeSection's lazy-load-when-nearby
// pattern for its own heavy Three.js scene) — and every instance is
// paused/played together via one IntersectionObserver on the section,
// reusing the same on/off-screen pattern already used for the globe.
function LottieWalkers() {
  const sectionRef = useRef(null);
  const slotRefs = [useRef(null), useRef(null), useRef(null)];
  const animsRef = useRef([]);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNearby(true);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduceMotion) animsRef.current.forEach((a) => (entry.isIntersecting ? a.play() : a.pause()));
      },
      { rootMargin: "600px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearby) return;
    let cancelled = false;
    Promise.all([
      import("lottie-web"),
      fetch(asset("/assets/ctrl-walker.json")).then((r) => r.json()),
    ]).then(([{ default: lottie }, animationData]) => {
      if (cancelled) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const startFrames = [0, 14, 27];
      animsRef.current = slotRefs.map((ref, i) => {
        const anim = lottie.loadAnimation({
          container: ref.current,
          renderer: "svg",
          loop: true,
          autoplay: false,
          animationData,
        });
        if (reduceMotion) anim.goToAndStop(startFrames[i], true);
        else anim.goToAndPlay(startFrames[i], true);
        return anim;
      });
    });
    return () => {
      cancelled = true;
      animsRef.current.forEach((a) => a.destroy());
      animsRef.current = [];
    };
  }, [nearby]);

  return (
    <div className="ctrl-lottie-walkers" ref={sectionRef} aria-hidden="true">
      <div className="ctrl-lottie-walker ctrl-lottie-walker-1" ref={slotRefs[0]} />
      <div className="ctrl-lottie-walker ctrl-lottie-walker-2" ref={slotRefs[1]} />
      <div className="ctrl-lottie-walker ctrl-lottie-walker-3" ref={slotRefs[2]} />
    </div>
  );
}

export default function CtrlBrand() {
  const [pressed, setPressed] = useState(false);

  function handlePress() {
    setPressed(true);
    document.querySelector(".why-stats")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => setPressed(false), 260);
  }

  return (
    <section className="ctrl-brand" aria-label="CTRL Your Brand">
      <h2 className="ctrl-brand-title">
        <span className="ctrl-brand-bold">CTRL</span> <span className="ctrl-brand-light">Your Brand.</span>
      </h2>

      <div className="ctrl-key-stage">
        {/* Outer div carries the slow "walk toward the key, fade, reset"
            drift loop; each Lottie instance underneath plays its own
            independent walk cycle. */}
        <div className="ctrl-key-figures-drift">
          <LottieWalkers />
        </div>
        <button
          type="button"
          className="ctrl-key-pulse"
          onClick={handlePress}
          aria-label="Press Ctrl — jump to Why This Matters"
        >
          <span className="ctrl-key-glow" aria-hidden="true" />
          <span className={"ctrl-key-press" + (pressed ? " is-pressed" : "")}>
            <img className="ctrl-key-img" src={asset("/assets/ctrl-key.webp")} alt="" />
          </span>
        </button>
      </div>

      <p className="ctrl-brand-sub">
        <strong>Control</strong> how the world sees your brand.
        <br />
        <strong>Transform</strong> ideas into influence.
      </p>
    </section>
  );
}
