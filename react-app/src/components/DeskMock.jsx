import { useTranslation } from "../i18n";
import { asset } from "../asset";
import HeroTitle from "./HeroTitle";

// The hero's whole "mock website" payload is overlaid as a % zone onto the
// monitor's screen area in assets/hero-desk.webp. That file is a pre-cropped
// version of the original 1536x1024 source (cropped to y:[170,760], so
// 1536x590) — trimming the empty transparent margin above/below the desk
// scene so the graphic doesn't carry dead vertical space when it's sized to
// fit within one viewport. Screen bounds were re-measured against this
// cropped frame (pixel-scanned for the teal-placeholder region, not
// eyeballed): x:[444,1089] / y:[83,427], i.e. left 28.91% / top 14.07% /
// width 41.99% / height 58.31% of the cropped frame. .desk-screen carries
// those numbers so every overlay element inside it positions relative to
// the screen itself, not the whole image.
export default function DeskMock() {
  const { t } = useTranslation();

  return (
    <div className="desk-mock">
      <img className="desk-img" src={asset("/assets/hero-desk.webp")} alt="" loading="eager" />

      <div className="desk-screen">
        <div className="desk-browserbar" aria-hidden="true">
          <span className="desk-browserbar-dot" />
          <span className="desk-browserbar-dot" />
          <span className="desk-browserbar-dot" />
          <span className="desk-browserbar-url" />
        </div>

        <div className="desk-nav" aria-hidden="true">
          <span className="desk-nav-mark">EE</span>
          <span className="desk-nav-links">
            <span>Work</span>
            <span>Services</span>
            <span>Contact</span>
          </span>
        </div>

        <div className="desk-hero">
          <HeroTitle text={t("hero.title", "A website that makes clients trust your brand.")} />
          <p className="desk-hero-sub">{t("hero.point1", "Custom design, not a template")}</p>

          <div className="desk-cta-row">
            <a href="#contact" className="mock-btn mock-btn-primary">
              {t("hero.cta1", "Get in touch")}
            </a>
            <a href="#work" className="mock-btn mock-btn-line">
              {t("hero.cta2", "See my work")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
