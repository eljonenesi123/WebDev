import { asset } from "../asset";
import { useTranslation } from "../i18n";

export default function CookieBanner({ visible, onAccept, onDecline }) {
  const { t } = useTranslation();
  return (
    <div className={"cookie-banner" + (visible ? " visible" : "")} id="cookie-banner">
      <p>
        {t("cookie.text", "This site uses cookies for basic analytics, to see how many people visit and what they click. No personal data is sold or shared.")}{" "}
        <a href={asset("/privacy.html")} target="_blank" rel="noopener">
          {t("cookie.readPolicy", "Read the full policy ↗")}
        </a>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" id="cookie-decline" onClick={onDecline}>
          {t("cookie.decline", "Decline")}
        </button>
        <button type="button" id="cookie-accept" className="btn-primary" onClick={onAccept}>
          {t("cookie.accept", "Accept")}
        </button>
      </div>
    </div>
  );
}
