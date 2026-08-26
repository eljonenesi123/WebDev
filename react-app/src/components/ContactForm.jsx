import { useState } from "react";
import { trackEvent } from "../analytics";
import { useTranslation } from "../i18n";
import { asset } from "../asset";

// Contact form: submits via fetch instead of a real page navigation, so the
// visitor never leaves the site or lands on Formspree's own generic "Thanks!"
// page. Shows an inline success/error message instead. Ported 1:1 from
// script.js's contact-form IIFE — same endpoint, same fields, same statuses.
const FORM_ACTION = "https://formspree.io/f/xvzeaydo";

export default function ContactForm() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ textKey: "", textFallback: "", kind: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setSending(true);
    setStatus({ textKey: "", textFallback: "", kind: "" });

    try {
      const formData = new FormData(form);
      formData.set("_replyto", formData.get("Email"));

      const response = await fetch(FORM_ACTION, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setStatus({
          textKey: "contact.successMsg",
          textFallback: "Thanks. Your message is on its way. We'll reply within a day or two.",
          kind: "success",
        });
        trackEvent("form_submit_success");
      } else {
        setStatus({
          textKey: "contact.errorMsg",
          textFallback: "Something went wrong sending that. Try again, or message us directly on WhatsApp.",
          kind: "error",
        });
      }
    } catch {
      setStatus({
        textKey: "contact.networkErrorMsg",
        textFallback: "Couldn't send that. Check your connection, or message us directly on WhatsApp.",
        kind: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="New message from portfolio site" />

      <div className="field">
        <input type="text" id="cf-name" name="Name" placeholder=" " required />
        <label htmlFor="cf-name">{t("contact.name", "Name")} *</label>
      </div>

      <div className="field">
        <input type="text" id="cf-company" name="Company" placeholder=" " />
        <label htmlFor="cf-company">{t("contact.company", "Company / Business (optional)")}</label>
      </div>

      <div className="field">
        <input type="email" id="cf-email" name="Email" placeholder=" " required />
        <label htmlFor="cf-email">{t("contact.email", "Email")} *</label>
      </div>

      <div className="field">
        <input type="tel" id="cf-phone" name="Phone" placeholder=" " required />
        <label htmlFor="cf-phone">{t("contact.phone", "Phone")} *</label>
      </div>

      <div className="field">
        <textarea id="cf-message" name="Message" rows="4" placeholder=" " required></textarea>
        <label htmlFor="cf-message">{t("contact.msg", "What do you need built?")} *</label>
      </div>

      <label className="terms-check">
        <input type="checkbox" id="cf-terms" name="Agreed" required />
        <span>
          {t("contact.agreePrefix", "I agree to the")}{" "}
          <a href={asset("/terms.html")} target="_blank" rel="noopener">
            {t("contact.terms", "Terms & Conditions")}
          </a>{" "}
          {t("contact.agreeAnd", "and")}{" "}
          <a href={asset("/privacy.html")} target="_blank" rel="noopener">
            {t("contact.privacy", "Privacy Policy")}
          </a>
          {t("contact.termsSuffix", "") && " " + t("contact.termsSuffix", "")} *
        </span>
      </label>

      <button type="submit" className="btn-primary" disabled={sending}>
        {sending ? t("contact.sending", "Sending...") : t("contact.send", "Send message")}
      </button>
      <p className={"form-status" + (status.kind ? " " + status.kind : "")} id="form-status" aria-live="polite">
        {status.textKey ? t(status.textKey, status.textFallback) : ""}
      </p>
    </form>
  );
}
