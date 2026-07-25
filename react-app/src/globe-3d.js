// Real 3D wireframe dotted globe — Three.js loaded at runtime from a CDN
// (esm.sh, which auto-resolves Three's internal bare imports) rather than
// as an npm dependency, so it never touches this project's own build or
// bundle. Only ever imported from GlobeSection.jsx once the section is
// near the viewport. initGlobe3D(container) returns a cleanup function
// that fully disposes the scene/renderer/listeners.

const THREE_VERSION = "0.160.0";
const THREE_URL = `https://esm.sh/three@${THREE_VERSION}`;
const ORBIT_URL = `https://esm.sh/three@${THREE_VERSION}/examples/jsm/controls/OrbitControls.js`;

// Simplified, decorative continent silhouettes as [lon, lat] rings — not
// surveyed GIS data, just enough for a recognizable stippled world.
const CONTINENTS = [
  [[-17,15],[-10,5],[10,4],[9,-5],[13,-18],[18,-34],[26,-33],[32,-25],[35,-15],[40,-2],[45,10],[43,15],[35,22],[32,31],[25,32],[10,37],[-6,35],[-17,15]],
  [[-10,36],[0,43],[10,45],[20,42],[30,45],[45,42],[60,55],[75,50],[90,50],[100,55],[110,52],[130,45],[140,45],[150,60],[170,65],[178,68],[150,72],[100,78],[60,78],[40,70],[20,68],[0,65],[-10,55],[-10,36]],
  [[-170,66],[-160,70],[-140,70],[-120,70],[-95,68],[-80,60],[-65,50],[-60,45],[-70,25],[-82,22],[-97,18],[-105,20],[-115,30],[-125,40],[-130,55],[-155,60],[-170,66]],
  [[-80,10],[-70,10],[-60,5],[-50,0],[-35,-8],[-38,-20],[-45,-25],[-58,-35],[-68,-45],[-72,-40],[-75,-20],[-80,-5],[-80,10]],
  [[113,-22],[122,-18],[130,-12],[137,-12],[142,-11],[145,-17],[150,-22],[153,-28],[150,-33],[145,-38],[140,-37],[135,-35],[128,-32],[118,-35],[113,-26],[113,-22]],
];

function pointInPoly(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const hit = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
function isLand(lon, lat) {
  return CONTINENTS.some((poly) => pointInPoly(lon, lat, poly));
}

function buildLandPositions(THREE, count) {
  const out = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (Math.atan2(z, x) * 180) / Math.PI;
    if (isLand(lon, lat)) out.push(x, y, z);
  }
  return new THREE.BufferAttribute(new Float32Array(out), 3);
}

function themeColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#0A0A0A";
}

export async function initGlobe3D(container) {
  const [THREE, { OrbitControls }] = await Promise.all([
    import(/* @vite-ignore */ THREE_URL),
    import(/* @vite-ignore */ ORBIT_URL),
  ]);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const wireGeo = new THREE.SphereGeometry(1, 24, 16);
  const wireMat = new THREE.MeshBasicMaterial({
    color: themeColor(), wireframe: true, transparent: true, opacity: 0.16,
  });
  const wireSphere = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireSphere);

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", buildLandPositions(THREE, 9000));
  const dotMat = new THREE.PointsMaterial({ color: themeColor(), size: 0.015, sizeAttenuation: true });
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
    wireGeo.dispose();
    wireMat.dispose();
    dotGeo.dispose();
    dotMat.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };
}
