import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n";
import { asset } from "../asset";
import HeroTitle from "./HeroTitle";

const POINTS = [
  { key: "hero.point1", fallback: "Custom design, not a template", icon: "✦" },
  { key: "hero.point2", fallback: "Fast load times, built to convert", icon: "⚡" },
  { key: "hero.point3", fallback: "A site you'll actually be proud to share", icon: "♥" },
];

// The hero's whole payload — headline, selling points, CTAs — lives inside
// the screen area of the phone photo (assets/intro.png), positioned as %
// zones matching that photo's baked-in status bar / dot row / card shapes.
export default function PhoneMock() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const tiltRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % POINTS.length), 2600);
    return () => clearInterval(id);
  }, []);

  // Cursor-follow tilt (desktop only). Lives on a separate wrapper from
  // .phone-mock so this JS-driven transform doesn't fight the CSS
  // phoneFloat/phoneFadeIn keyframe animations, which also animate transform.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)").matches) return;
    const el = tiltRef.current;
    if (!el) return;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      el.style.transform = `rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg)`;
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

  // Mobile: tilt via device orientation (gyroscope) instead of the cursor —
  // gives phones/tablets their own ambient 3D interaction (tilt your actual
  // phone to tilt the mockup) rather than no tilt effect at all.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1000px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = tiltRef.current;
    if (!el) return;

    let baseline = null;
    function onOrientation(e) {
      if (e.beta == null || e.gamma == null) return;
      if (!baseline) baseline = { beta: e.beta, gamma: e.gamma };
      const dBeta = Math.max(-16, Math.min(16, e.beta - baseline.beta));
      const dGamma = Math.max(-16, Math.min(16, e.gamma - baseline.gamma));
      el.style.transform = `rotateX(${(-dBeta / 16) * 8}deg) rotateY(${(dGamma / 16) * 8}deg)`;
    }
    function startListening() {
      window.addEventListener("deviceorientation", onOrientation);
    }
    function requestAndStart() {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === "function") {
        DOE.requestPermission()
          .then((state) => {
            if (state === "granted") startListening();
          })
          .catch(() => {});
      } else {
        startListening();
      }
    }
    // iOS requires a user gesture to grant motion permission — piggyback on
    // the visitor's first tap/scroll anywhere on the page instead of adding
    // a dedicated "enable motion" button to the hero.
    function onFirstGesture() {
      requestAndStart();
      window.removeEventListener("touchend", onFirstGesture);
      window.removeEventListener("click", onFirstGesture);
    }
    window.addEventListener("touchend", onFirstGesture, { once: true });
    window.addEventListener("click", onFirstGesture, { once: true });

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("touchend", onFirstGesture);
      window.removeEventListener("click", onFirstGesture);
    };
  }, []);

  return (
    <div className="phone-tilt" ref={tiltRef}>
      <div className="phone-mock">
        <img className="phone-img" src={asset("/assets/intro.webp")} alt="" loading="eager" />

        <div className="phone-topzone">
          <p className="eyebrow phone-eyebrow">{t("hero.eyebrow", "WEB DEVELOPMENT")}</p>
          <HeroTitle text={t("hero.title", "A website that makes clients trust your brand.")} />
        </div>

        <p className="phone-caption" key={active}>
          {t(POINTS[active].key, POINTS[active].fallback)}
        </p>

        <div className="phone-card-zone">
          <a href="#contact" className="phone-btn phone-btn-primary">
            {t("hero.cta1", "Get in touch")}
          </a>
          <a href="#work" className="phone-btn phone-btn-line">
            {t("hero.cta2", "See my work")}
          </a>
        </div>
      </div>
    </div>
  );
}
