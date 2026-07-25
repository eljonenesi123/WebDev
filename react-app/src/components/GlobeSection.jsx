import { useEffect, useRef } from "react";
import { initDottedGlobe } from "../dotted-globe.js";

export default function GlobeSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    return initDottedGlobe(canvasRef.current);
  }, []);

  return (
    <section className="globe-section" id="global-reach">
      <h2 className="section-title">Global Reach</h2>
      <p className="globe-sub">Remote-first — I build for clients wherever they are.</p>
      <div className="globe-canvas-wrap">
        <canvas ref={canvasRef} className="globe-canvas" aria-hidden="true"></canvas>
      </div>
    </section>
  );
}
