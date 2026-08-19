import { asset } from "../asset";
import { useTranslation } from "../i18n";

export default function CtrlBrand() {
  const { t } = useTranslation();

  function handlePress() {
    document.querySelector(".why-stats")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="ctrl-brand" aria-label={t("ctrlBrand.ariaLabel", "CTRL Your Brand")}>
      <h2 className="ctrl-brand-title">
        <span className="ctrl-brand-bold">CTRL</span> <span className="ctrl-brand-light">{t("ctrlBrand.titleLight", "Your Brand.")}</span>
      </h2>

      <button
        type="button"
        className="ctrl-hand-card"
        onClick={handlePress}
        aria-label={t("ctrlBrand.pressAria", "Press Ctrl to jump to Why This Matters")}
      >
        <img className="ctrl-hand-img" src={asset("/assets/ctrl-hand-cutout.webp")} alt={t("ctrlBrand.imgAlt", "A hand poised over Ctrl and Z keys")} />
      </button>

      <p className="ctrl-brand-sub">
        <strong>{t("ctrlBrand.subControl", "Control")}</strong> {t("ctrlBrand.subControlRest", "how the world sees your brand.")}
        <br />
        <strong>{t("ctrlBrand.subTransform", "Transform")}</strong> {t("ctrlBrand.subTransformRest", "ideas into influence.")}
      </p>
    </section>
  );
}
