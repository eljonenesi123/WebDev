// Self-contained rotating wireframe dotted globe — plain Canvas 2D, no
// Three.js or any other dependency. Reads the site's --text CSS variable
// each frame so it automatically matches whichever theme (light/dark) is
// active, including live toggles. Exported initDottedGlobe(canvas) returns
// a cleanup function.
export function initDottedGlobe(canvas) {
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sphere points: latitude rings + longitude rings, unit sphere — the
  // classic wireframe-globe look, built once and reused every frame.
  const points = [];
  const LAT_RINGS = 10;
  const LON_RINGS = 14;
  for (let i = 0; i <= LAT_RINGS; i++) {
    const lat = (Math.PI * i) / LAT_RINGS - Math.PI / 2;
    const ringR = Math.cos(lat);
    const y = Math.sin(lat);
    const n = Math.max(6, Math.round(34 * ringR));
    for (let j = 0; j < n; j++) {
      const lon = (2 * Math.PI * j) / n;
      points.push([ringR * Math.cos(lon), y, ringR * Math.sin(lon)]);
    }
  }
  for (let i = 0; i < LON_RINGS; i++) {
    const lon = (2 * Math.PI * i) / LON_RINGS;
    const n = 30;
    for (let j = 0; j <= n; j++) {
      const lat = (Math.PI * j) / n - Math.PI / 2;
      const ringR = Math.cos(lat);
      points.push([ringR * Math.cos(lon), Math.sin(lat), ringR * Math.sin(lon)]);
    }
  }

  let angle = 0;
  let raf = null;
  let w = 0, h = 0;
  const tilt = 0.36;
  const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.max(1, w * dpr);
    canvas.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) / 2 * 0.82;
    const dotColor = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#0A0A0A";
    const cosA = Math.cos(angle), sinA = Math.sin(angle);

    const projected = points.map(([x, y, z]) => {
      const rx = x * cosA + z * sinA;
      let rz = -x * sinA + z * cosA;
      const ry = y * cosT - rz * sinT;
      rz = y * sinT + rz * cosT;
      return { sx: cx + rx * radius, sy: cy + ry * radius, z: rz };
    });
    projected.sort((a, b) => a.z - b.z);

    ctx.fillStyle = dotColor;
    projected.forEach((p) => {
      const depth = (p.z + 1) / 2;
      const size = 0.6 + depth * 1.5;
      ctx.globalAlpha = 0.12 + depth * 0.78;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function tick() {
    angle += 0.0022;
    draw();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (raf || reduceMotion) return;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  resize();
  draw();

  const ro = new ResizeObserver(() => { resize(); draw(); });
  ro.observe(canvas);

  // Only spend CPU while the globe is actually visible on screen.
  const io = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) start(); else stop(); },
    { threshold: 0.1 }
  );
  io.observe(canvas);

  return function cleanup() {
    stop();
    ro.disconnect();
    io.disconnect();
  };
}
