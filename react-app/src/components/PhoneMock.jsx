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

  return (
    <>
      <div className="phone-tilt" ref={tiltRef}>
        <div className="phone-mock">
          <img className="phone-img" src={asset("/assets/intro.png")} alt="" loading="eager" />

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

      <div className="phone-anno phone-anno-1" aria-hidden="true">
        <span className="phone-anno-line"></span>
        <span>Content adapts per client</span>
      </div>
      <div className="phone-anno phone-anno-2" aria-hidden="true">
        <span>Real, working buttons</span>
        <span className="phone-anno-line"></span>
      </div>
    </>
  );
}
