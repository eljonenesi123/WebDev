import { useTranslation } from "../i18n";
import { asset } from "../asset";
import HeroTitle from "./HeroTitle";

// The hero's whole "mock website" payload is overlaid as a % zone onto the
// monitor's screen area in assets/hero-desk.webp. That file is a pre-cropped
// version of the original 1536x1024 source (cropped to y:[187,879], so
// 1536x692) — trimming only the empty transparent margin above/below the
// real content, so the full monitor, keyboard, and mouse are always
// visible, at every breakpoint (object-fit:contain throughout, no cropping
// object-fit:cover trick on mobile). Screen bounds were re-measured against
// this cropped frame (pixel-scanned for the teal-placeholder region, not
// eyeballed): x:[444,1089] / y:[66,410], i.e. left 28.91% / top 9.54% /
// width 41.99% / height 49.71% of the cropped frame. .desk-screen carries
// those numbers so every overlay element inside it positions relative to
// the screen itself, not the whole image.
export default function DeskMock() {
  const { t } = useTranslation();

  return (
    <div className="desk-mock">
      <img className="desk-img" src={asset("/assets/hero-desk.webp")} alt="" loading="eager" />

      <div className="desk-screen">
        <div className="desk-browserbar" aria-hidden="true">
          <div className="desk-tabs">
            <span className="desk-tab desk-tab-active">
              <span className="desk-tab-favicon desk-tab-favicon-site" />
              <span className="desk-tab-label">Eljon Enesi</span>
              <span className="desk-tab-close">×</span>
            </span>
            <span className="desk-tab">
              <span className="desk-tab-favicon desk-tab-favicon-mail" />
              <span className="desk-tab-label">Gmail</span>
            </span>
            <span className="desk-tab">
              <span className="desk-tab-favicon desk-tab-favicon-docs" />
              <span className="desk-tab-label">Docs</span>
            </span>
            <span className="desk-tab-new">+</span>
          </div>
          <div className="desk-toolbar">
            <span className="desk-toolbar-icon">‹</span>
            <span className="desk-toolbar-icon desk-toolbar-icon-dim">›</span>
            <span className="desk-toolbar-icon">⟳</span>
            <span className="desk-toolbar-url">eljonenesi.com</span>
          </div>
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
