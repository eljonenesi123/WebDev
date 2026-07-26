// Real 3D wireframe dotted globe — Three.js loaded at runtime from a CDN
// (esm.sh, which auto-resolves Three's internal bare imports) rather than
// as an npm dependency, so it never touches this project's own build or
// bundle. Continent dot placement uses real land polygon data (Natural
// Earth 1:110m land, via jsDelivr's GitHub mirror) instead of a hand-drawn
// approximation, so it actually traces recognizable landmasses. Only ever
// imported from GlobeSection.jsx once the section is near the viewport.
// initGlobe3D(container) returns a cleanup function that fully disposes
// the scene/renderer/listeners.

const THREE_VERSION = "0.160.0";
const THREE_URL = `https://esm.sh/three@${THREE_VERSION}`;
const ORBIT_URL = `https://esm.sh/three@${THREE_VERSION}/examples/jsm/controls/OrbitControls.js`;
const LAND_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson";

// Ray-casting point-in-ring test on plain [lon, lat] pairs — a flat 2D
// test, not spherical, which is a fine approximation at this decorative
// scale (same simplification the site's earlier hand-drawn version used).
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    const hit = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

function ringBounds(ring) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLon, maxLon, minLat, maxLat };
}

// Each polygon feature: outer ring (land) minus any hole rings (lakes etc),
// each with a precomputed bbox so most point tests short-circuit cheaply
// instead of ray-casting against every ring of every one of the 127 land
// masses for every candidate point.
function buildPolygons(geojson) {
  const polys = [];
  for (const feature of geojson.features) {
    if (feature.geometry.type !== "Polygon") continue;
    const [outer, ...holes] = feature.geometry.coordinates;
    polys.push({
      outer,
      outerBounds: ringBounds(outer),
      holes: holes.map((h) => ({ ring: h, bounds: ringBounds(h) })),
    });
  }
  return polys;
}

function isLand(lon, lat, polygons) {
  for (const poly of polygons) {
    const b = poly.outerBounds;
    if (lon < b.minLon || lon > b.maxLon || lat < b.minLat || lat > b.maxLat) continue;
    if (!pointInRing(lon, lat, poly.outer)) continue;
    let inHole = false;
    for (const hole of poly.holes) {
      const hb = hole.bounds;
      if (lon < hb.minLon || lon > hb.maxLon || lat < hb.minLat || lat > hb.maxLat) continue;
      if (pointInRing(lon, lat, hole.ring)) { inHole = true; break; }
    }
    if (!inHole) return true;
  }
  return false;
}

function buildLandPositions(THREE, polygons, count) {
  const out = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    // atan2(x, z) — not atan2(z, x) — so that lon=0 (Greenwich, through
    // Africa/Europe) lands on the point directly facing the camera
    // (x=0, z=1) by default, with lon increasing eastward toward the
    // camera's right (matching +x) and going negative toward the Americas
    // on the camera's left. The swapped argument order previously put
    // lon=+90 at screen-center and confined the entire Western Hemisphere
    // to the hidden back face, which is why Africa (real lon ~0-20°E)
    // rendered where the Americas (~-60 to -130°W) should have been.
    const lon = (Math.atan2(x, z) * 180) / Math.PI;
    if (isLand(lon, lat, polygons)) out.push(x, y, z);
  }
  return new THREE.BufferAttribute(new Float32Array(out), 3);
}

function themeColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#0A0A0A";
}

// A proper graticule — latitude rings + longitude meridians as actual
// circles, not a triangulated SphereGeometry wireframe (which draws every
// diagonal edge of every quad and reads as a dense mesh, not a globe grid).
function buildGraticule(THREE, color) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22 });
  const segments = 64;

  for (let lat = -60; lat <= 60; lat += 30) {
    const latRad = (lat * Math.PI) / 180;
    const r = Math.cos(latRad);
    const y = Math.sin(latRad);
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  for (let lon = 0; lon < 180; lon += 30) {
    const lonRad = (lon * Math.PI) / 180;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const phi = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(lonRad),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(lonRad)
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  return { group, material: mat };
}

export async function initGlobe3D(container) {
  const [[THREE, { OrbitControls }], geojson] = await Promise.all([
    Promise.all([import(/* @vite-ignore */ THREE_URL), import(/* @vite-ignore */ ORBIT_URL)]),
    fetch(LAND_GEOJSON_URL).then((r) => r.json()),
  ]);

  const polygons = buildPolygons(geojson);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const { group: graticule, material: wireMat } = buildGraticule(THREE, themeColor());
  scene.add(graticule);

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", buildLandPositions(THREE, polygons, 20000));
  const dotMat = new THREE.PointsMaterial({ color: themeColor(), size: 0.017, sizeAttenuation: true });
  const dots = new THREE.Points(dotGeo, dotMat);
  scene.add(dots);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.6;
  controls.enablePan = false;
  controls.minDistance = 1.6;
  controls.maxDistance = 4;

  let raf = null;
  function resize() {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
  }
  function tick() {
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf) tick(); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

  resize();
  start();

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // Only spend GPU/CPU while the globe is actually on screen.
  const io = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) start(); else stop(); },
    { threshold: 0.1 }
  );
  io.observe(container);

  // Live theme updates — no reload needed when the toggle is used.
  const mo = new MutationObserver(() => {
    const c = new THREE.Color(themeColor());
    wireMat.color.copy(c);
    dotMat.color.copy(c);
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return function cleanup() {
    stop();
    ro.disconnect();
    io.disconnect();
    mo.disconnect();
    controls.dispose();
    graticule.children.forEach((line) => line.geometry.dispose());
    wireMat.dispose();
    dotGeo.dispose();
    dotMat.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };
}
