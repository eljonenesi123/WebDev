import { useState } from "react";
import { useTranslation } from "../i18n";

// Cost estimator: rough, honest ballpark based on the same pricing logic as
// the pricing cards above. Never claims to be a final price. Presented as an
// itemized receipt — each choice becomes a line item with a running total,
// instead of a flat form with a number at the bottom.

// Low/high per type, matching the Services price sheet's own published
// ranges (Landing page is explicitly "€100 – 150" there) rather than a
// flat "+20%" applied to whatever was picked — that flat multiplier used
// to undercut the real quoted range (€100–120 instead of €100–150) once
// prices were updated to the new sheet. Multi-page site is only quoted
// as "€150+" with no upper bound given, so it gets the same 1.5x spread
// as Landing for consistency rather than an invented different ratio.
const TYPE_PRICES = {
  landing: { low: 100, high: 150 },
  multi: { low: 150, high: 225 },
};

// Same reasoning for the two add-ons that have their own quoted ranges in
// the Services sheet (Extra language / Booking-contact form system, both
// "€40–60") — using their real high end instead of the low end doubling
// as both. "Ongoing content updates" has no equivalent one-time line on
// the sheet (only the monthly Maintenance plans do), so it stays a flat
// single price with no separate high.
const EXTRAS = {
  lang: { labelKey: "estimator.extraLang", labelFallback: "Multiple languages", low: 40, high: 60 },
  form: { labelKey: "estimator.extraForm", labelFallback: "Contact / booking form", low: 40, high: 60 },
  updates: { labelKey: "estimator.extraUpdates", labelFallback: "Ongoing content updates", low: 30, high: 30 },
};

// Every option button shows its own price impact (not just the receipt),
// so the cost of a choice is visible right where you make it.
function OptionButton({ active, onClick, label, price }) {
  return (
    <button type="button" className={"estimator-option" + (active ? " active" : "")} onClick={onClick}>
      <span className="option-label">{label}</span>
      <span className="option-price">{price}</span>
    </button>
  );
}

export default function Estimator() {
  const { t } = useTranslation();
  const [type, setType] = useState("landing");
  const [pages, setPages] = useState(0);
  const [pagesValue, setPagesValue] = useState("3");
  const [extraKeys, setExtraKeys] = useState([]); // e.g. ["lang", "form"]

  const PAGES_LABELS = {
    "3": t("estimator.pages23Full", "2–3 pages"),
    "6": t("estimator.pages46Full", "4–6 pages"),
    "10": t("estimator.pages7plusFull", "7+ pages"),
  };

  const typePrice = TYPE_PRICES[type];
  const selectedExtras = extraKeys.map((k) => EXTRAS[k]);
  const extrasLow = selectedExtras.reduce((sum, e) => sum + e.low, 0);
  const extrasHigh = selectedExtras.reduce((sum, e) => sum + e.high, 0);
  const low = typePrice.low + pages + extrasLow;
  const high = typePrice.high + pages + extrasHigh;

  const handleType = (value) => {
    setType(value);
    if (value === "landing") {
      setPages(0);
      setPagesValue("3");
    }
  };

  const handlePages = (value, price) => {
    setPagesValue(value);
    setPages(price);
  };

  const toggleExtra = (key) => {
    setExtraKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const typeLabel = type === "landing" ? t("estimator.landing", "Landing page") : t("estimator.multi", "Multi-page site");
  const items = [{ label: typeLabel, price: typePrice.low }];
  if (type === "multi" && pages > 0) items.push({ label: PAGES_LABELS[pagesValue], price: pages });
  extraKeys.forEach((k) => items.push({ label: t(EXTRAS[k].labelKey, EXTRAS[k].labelFallback), price: EXTRAS[k].low }));

  return (
    <section className="estimator-section" id="estimator-section">
      <h2 className="section-title">{t("estimator.title", "Cost Estimator")}</h2>
      <p className="estimator-label">{t("estimator.label", "Not sure where you land? Build your order below.")}</p>

      <div className="estimator-layout">
        <div className="estimator-controls">
          <div className="estimator-row">
            <span className="estimator-question">{t("estimator.q1", "What are you building?")}</span>
            <div className="estimator-options" data-group="type">
              <OptionButton active={type === "landing"} onClick={() => handleType("landing")} label={t("estimator.landing", "Landing page")} price="€100 – 150" />
              <OptionButton active={type === "multi"} onClick={() => handleType("multi")} label={t("estimator.multi", "Multi-page site")} price="€150+" />
            </div>
          </div>

          <div className="estimator-row" style={{ display: type === "multi" ? "flex" : "none" }}>
            <span className="estimator-question">{t("estimator.q2", "How many pages, roughly?")}</span>
            <div className="estimator-options" data-group="pages">
              <OptionButton active={pagesValue === "3"} onClick={() => handlePages("3", 0)} label={t("estimator.pages23", "2–3")} price={t("estimator.included", "Included")} />
              <OptionButton active={pagesValue === "6"} onClick={() => handlePages("6", 45)} label={t("estimator.pages46", "4–6")} price="+€45" />
              <OptionButton active={pagesValue === "10"} onClick={() => handlePages("10", 90)} label={t("estimator.pages7plus", "7+")} price="+€90" />
            </div>
          </div>

          <div className="estimator-row">
            <span className="estimator-question">{t("estimator.q3", "Anything extra?")}</span>
            <div className="estimator-options estimator-options-multi" data-group="extras">
              <OptionButton
                active={extraKeys.includes("lang")}
                onClick={() => toggleExtra("lang")}
                label={t("estimator.extraLang", "Multiple languages")}
                price="+€40–60"
              />
              <OptionButton
                active={extraKeys.includes("form")}
                onClick={() => toggleExtra("form")}
                label={t("estimator.extraForm", "Contact / booking form")}
                price="+€40–60"
              />
              <OptionButton
                active={extraKeys.includes("updates")}
                onClick={() => toggleExtra("updates")}
                label={t("estimator.extraUpdates", "Ongoing content updates")}
                price="+€30"
              />
            </div>
          </div>
        </div>

        <div className="receipt">
          <p className="receipt-title">{t("estimator.receiptTitle", "Receipt").toUpperCase()}</p>
          <div className="receipt-items">
            {items.map((it) => (
              <div className="receipt-item" key={it.label}>
                <span className="receipt-item-label">{it.label}</span>
                <span className="receipt-item-dots" aria-hidden="true" />
                <span className="receipt-item-price">€{it.price}</span>
              </div>
            ))}
          </div>
          <div className="receipt-total-row">
            <span>{t("estimator.total", "Total").toUpperCase()}</span>
            <span className="receipt-item-dots" aria-hidden="true" />
            <span>
              €{low}–{high}
            </span>
          </div>
          <p className="receipt-note">
            {t(
              "estimator.note",
              "Rough starting point, not a final price. I'll confirm the exact number once we talk about what you actually need."
            )}
          </p>
          <a href="#contact" className="btn-line receipt-cta">
            {t("estimator.cta", "Get my exact quote")}
          </a>
        </div>
      </div>
    </section>
  );
}
