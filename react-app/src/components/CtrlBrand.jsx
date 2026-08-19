import { asset } from "../asset";

export default function CtrlBrand() {
  function handlePress() {
    document.querySelector(".why-stats")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="ctrl-brand" aria-label="CTRL Your Brand">
      <h2 className="ctrl-brand-title">
        <span className="ctrl-brand-bold">CTRL</span> <span className="ctrl-brand-light">Your Brand.</span>
      </h2>

      <button
        type="button"
        className="ctrl-hand-card"
        onClick={handlePress}
        aria-label="Press Ctrl — jump to Why This Matters"
      >
        <img className="ctrl-hand-img" src={asset("/assets/ctrl-hand-cutout.webp")} alt="A hand poised over Ctrl and Z keys" />
      </button>

      <p className="ctrl-brand-sub">
        <strong>Control</strong> how the world sees your brand.
        <br />
        <strong>Transform</strong> ideas into influence.
      </p>
    </section>
  );
}
