import { useEffect, useState } from "react";
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

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % POINTS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
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
  );
}
