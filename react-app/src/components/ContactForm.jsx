import { useState } from "react";
import { trackEvent } from "../analytics";
import { useTranslation } from "../i18n";

// Contact form: submits via fetch instead of a real page navigation, so the
// visitor never leaves the site or lands on Formspree's own generic "Thanks!"
// page. Shows an inline success/error message instead. Ported 1:1 from
// script.js's contact-form IIFE — same endpoint, same fields, same statuses.
const FORM_ACTION = "https://formspree.io/f/xvzeaydo";

export default function ContactForm() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ text: "", kind: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setSending(true);
    setStatus({ text: "", kind: "" });

    try {
      const response = await fetch(FORM_ACTION, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setStatus({
          text: "Thanks — your message is on its way. I'll reply within a day or two.",
          kind: "success",
        });
        trackEvent("form_submit_success");
      } else {
        setStatus({
          text: "Something went wrong sending that. Try again, or message me directly on WhatsApp.",
          kind: "error",
        });
      }
    } catch {
      setStatus({
        text: "Couldn't send that — check your connection, or message me directly on WhatsApp.",
        kind: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="New message from portfolio site" />

      <label htmlFor="cf-name">Name *</label>
      <input type="text" id="cf-name" name="Name" required />

      <label htmlFor="cf-company">Company / Business (optional)</label>
      <input type="text" id="cf-company" name="Company" />

      <label htmlFor="cf-email">{t("contact.email", "Email")} *</label>
      <input type="email" id="cf-email" name="Email" required />

      <label htmlFor="cf-phone">Phone *</label>
      <input type="tel" id="cf-phone" name="Phone" required />

      <label htmlFor="cf-message">{t("contact.msg", "What do you need built?")} *</label>
      <textarea id="cf-message" name="Message" rows="5" required></textarea>

      <label className="terms-check">
        <input type="checkbox" id="cf-terms" name="Agreed" required />
        <span>
          I agree to the{" "}
          <a href="/terms.html" target="_blank" rel="noopener">
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy.html" target="_blank" rel="noopener">
            Privacy Policy
          </a>{" "}
          *
        </span>
      </label>

      <button type="submit" className="btn-primary" disabled={sending}>
        {sending ? "Sending..." : t("contact.send", "Send message")}
      </button>
      <p className={"form-status" + (status.kind ? " " + status.kind : "")} id="form-status" aria-live="polite">
        {status.text}
      </p>
    </form>
  );
}
