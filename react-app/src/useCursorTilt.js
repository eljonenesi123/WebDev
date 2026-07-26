import { useEffect } from "react";

// Cursor-follow 3D tilt, shared by the hero phone and the work carousel's
// photo-stack/laptop/iPad mockups. Each of those used to run its own
// `window.addEventListener("pointermove", ...)` doing a getBoundingClientRect
// (forced layout read) + style.transform write on *every* raw mousemove
// event, for the lifetime of the page, regardless of whether that element
// was even scrolled into view — five separate listeners all paying that
// cost on every pixel of mouse movement anywhere on the page. This batches
// the read+write to at most once per animation frame (via rAF) and skips
// the work entirely while the element isn't on screen (via IntersectionObserver).
export function useCursorTilt(ref, maxDeg = 14) {
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px), (prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let visible = false;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    io.observe(el);

    let raf = null;
    let lastEvent = null;
    function apply() {
      raf = null;
      if (!lastEvent) return;
      const rect = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (lastEvent.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (lastEvent.clientY - rect.top) / rect.height));
      el.style.transform = `rotateX(${(0.5 - py) * maxDeg}deg) rotateY(${(px - 0.5) * maxDeg}deg)`;
    }
    function onMove(e) {
      if (!visible) return;
      lastEvent = e;
      if (raf == null) raf = requestAnimationFrame(apply);
    }
    function onLeave() {
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, maxDeg]);
}
