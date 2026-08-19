import { useState } from "react";

// Cost estimator: rough, honest ballpark based on the same pricing logic as
// the pricing cards above. Never claims to be a final price. Presented as an
// itemized receipt — each choice becomes a line item with a running total,
// instead of a flat form with a number at the bottom.
const PAGES_LABELS = { "3": "2–3 pages", "6": "4–6 pages", "10": "7+ pages" };

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
  const [type, setType] = useState("landing");
  const [typeBase, setTypeBase] = useState(100);
  const [pages, setPages] = useState(0);
  const [pagesValue, setPagesValue] = useState("3");
  const [extras, setExtras] = useState({}); // { value: price }

  const extrasSum = Object.values(extras).reduce((sum, p) => sum + p, 0);
  const low = typeBase + pages + extrasSum;
  const high = Math.round(low * 1.2);

  const handleType = (value, price) => {
    setType(value);
    setTypeBase(price);
    if (value === "landing") {
      setPages(0);
      setPagesValue("3");
    }
  };

  const handlePages = (value, price) => {
    setPagesValue(value);
    setPages(price);
  };

  const toggleExtra = (value, price) => {
    setExtras((prev) => {
      const next = { ...prev };
      if (next[value] !== undefined) delete next[value];
      else next[value] = price;
      return next;
    });
  };

  const items = [{ label: type === "landing" ? "Landing page" : "Multi-page site", price: typeBase }];
  if (type === "multi" && pages > 0) items.push({ label: PAGES_LABELS[pagesValue], price: pages });
  if (extras.lang !== undefined) items.push({ label: "Multiple languages", price: extras.lang });
  if (extras.form !== undefined) items.push({ label: "Contact / booking form", price: extras.form });
  if (extras.updates !== undefined) items.push({ label: "Ongoing content updates", price: extras.updates });

  return (
    <section className="estimator-section" id="estimator-section">
      <h2 className="section-title">Cost Estimator</h2>
      <p className="estimator-label">Not sure where you land? Build your order below.</p>

      <div className="estimator-layout">
        <div className="estimator-controls">
          <div className="estimator-row">
            <span className="estimator-question">What are you building?</span>
            <div className="estimator-options" data-group="type">
              <OptionButton active={type === "landing"} onClick={() => handleType("landing", 100)} label="Landing page" price="€100" />
              <OptionButton active={type === "multi"} onClick={() => handleType("multi", 150)} label="Multi-page site" price="€150" />
            </div>
          </div>

          <div className="estimator-row" style={{ display: type === "multi" ? "flex" : "none" }}>
            <span className="estimator-question">How many pages, roughly?</span>
            <div className="estimator-options" data-group="pages">
              <OptionButton active={pagesValue === "3"} onClick={() => handlePages("3", 0)} label="2–3" price="Included" />
              <OptionButton active={pagesValue === "6"} onClick={() => handlePages("6", 45)} label="4–6" price="+€45" />
              <OptionButton active={pagesValue === "10"} onClick={() => handlePages("10", 90)} label="7+" price="+€90" />
            </div>
          </div>

          <div className="estimator-row">
            <span className="estimator-question">Anything extra?</span>
            <div className="estimator-options estimator-options-multi" data-group="extras">
              <OptionButton
                active={extras.lang !== undefined}
                onClick={() => toggleExtra("lang", 40)}
                label="Multiple languages"
                price="+€40"
              />
              <OptionButton
                active={extras.form !== undefined}
                onClick={() => toggleExtra("form", 40)}
                label="Contact / booking form"
                price="+€40"
              />
              <OptionButton
                active={extras.updates !== undefined}
                onClick={() => toggleExtra("updates", 30)}
                label="Ongoing content updates"
                price="+€30"
              />
            </div>
          </div>
        </div>

        <div className="receipt">
          <p className="receipt-title">RECEIPT</p>
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
            <span>TOTAL</span>
            <span className="receipt-item-dots" aria-hidden="true" />
            <span>
              €{low}–{high}
            </span>
          </div>
          <p className="receipt-note">
            Rough starting point, not a final price. I'll confirm the exact number once we talk
            about what you actually need.
          </p>
          <a href="#contact" className="btn-line receipt-cta">
            Get my exact quote
          </a>
        </div>
      </div>
    </section>
  );
}
