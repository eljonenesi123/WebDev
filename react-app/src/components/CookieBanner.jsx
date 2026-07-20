import { asset } from "../asset";

export default function CookieBanner({ visible, onAccept, onDecline }) {
  return (
    <div className={"cookie-banner" + (visible ? " visible" : "")} id="cookie-banner">
      <p>
        This site uses cookies for basic analytics — to see how many people visit and what
        they click. No personal data is sold or shared.{" "}
        <a href={asset("/privacy.html")} target="_blank" rel="noopener">
          Read the full policy ↗
        </a>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" id="cookie-decline" onClick={onDecline}>
          Decline
        </button>
        <button type="button" id="cookie-accept" className="btn-primary" onClick={onAccept}>
          Accept
        </button>
      </div>
    </div>
  );
}
