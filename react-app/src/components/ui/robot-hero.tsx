import { useMemo, useRef, useState, useEffect, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// Suspense only catches the *pending* state of Environment's async HDRI
// load — a load that actively fails (network error, CORS, or the CDN
// rate-limiting after repeated dev-server reloads, which is exactly what
// happened here: raw.githubusercontent.com started returning 429) throws
// past it. With no error boundary anywhere in the tree, that uncaught
// error doesn't just drop the environment map — it unmounts the *entire*
// React app, which is what "loading screen disappears, then nothing"
// actually was. React error boundaries have to be class components; there's
// no hook equivalent. Scoped tightly around just Environment (not the
// whole Canvas) so a failed/blocked HDRI fetch only costs the studio
// lighting, not the robot itself — the lights/shadows/materials below
// already render sensibly without it.
class EnvironmentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("Environment map failed to load — continuing without it.", error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

class HeartCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    t = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    return optionalTarget.set(x * 0.002, (y + 6) * 0.002, 0);
  }
}

const sharedHeartCurve = new HeartCurve();

function ResponsiveGroup({
  children,
  scale = 1,
  positionX = 0,
  positionY = 0,
  isMobile = false,
}: {
  children: React.ReactNode;
  scale?: number;
  positionX?: number;
  positionY?: number;
  isMobile?: boolean;
}) {
  const { viewport, size } = useThree();
  // For a fixed-FOV perspective camera, the vertical world-space extent the
  // camera can see is constant (2 * distance * tan(fov/2)) — it does NOT
  // shrink just because the canvas is short in pixels. What DOES change on
  // a short/wide canvas is viewport.width (world units), which grows with
  // aspect ratio — and since scale is derived from viewport.width, the
  // robot actually gets *bigger* on a short/wide browser window at the
  // exact moment it has less headroom to work with. That combination —
  // bigger robot, same fixed vertical budget, pushed further down by a
  // positionY that also scales with `s` — is what pushed it (and its
  // shadow) outside the camera's frustum and made it look clipped. There's
  // no equivalent "shrink on short viewports" signal in viewport.height
  // (it's ~constant), so this uses size.height — the canvas's actual pixel
  // height — directly instead.
  // The text block above the robot (badge + 2-line headline + subline +
  // buttons) is vertically centered in the same box and its own height
  // barely changes with viewport height (font sizes key off vw, not vh) —
  // so on a short canvas the *margin* left over for the robot below it
  // shrinks much faster than the canvas height itself does. A gentle
  // reduction wasn't enough (verified empirically at 650-700px canvas
  // heights, not just reasoned about): the robot needs to shrink hard and
  // fast as height drops, with a floor so it never disappears entirely.
  const heightFactor = Math.max(0.42, Math.min(1, (size.height - 580) / 228));
  // "Mobile" here is the same 760px CSS breakpoint the rest of the site
  // uses (passed down from a DOM matchMedia check in RobotHero), not a
  // Three.js viewport-aspect guess. An aspect-based guess (viewport.width
  // under some world-unit threshold) doesn't actually track window CSS
  // width 1:1 — display scaling, browser zoom, and the canvas's own
  // resize-observer timing can all shift it, and when it misfires on a
  // wide desktop window the "mobile" scale-down and extra downward push
  // below fire together, which is exactly what produced a robot that
  // was both shrunk and still overlapping the CTAs. Driving this off the
  // same CSS breakpoint the layout itself uses guarantees the two agree.
  // The aspect-driven `viewport.width / 3.5` term already shrinks the robot
  // plenty on a narrow phone canvas on its own — an extra flat multiplier
  // here on top of that was compounding into a robot that read as much
  // smaller than intended, not just "clear of the buttons".
  const s = Math.min(1.0, viewport.width / 3.5) * heightFactor * scale;
  // On narrow/portrait screens the button row wraps taller relative to the
  // robot's own (already smaller, via `s`) scale than it does on desktop,
  // so the same positionY that clears the buttons on desktop lands the
  // robot's head right behind them on mobile.
  // Applied *after* the `s` multiplication (not baked into positionY before
  // it) so a short canvas — where heightFactor has already shrunk `s` —
  // doesn't also shrink the extra push meant to compensate for that same
  // shortness. Scaling both by `s` was cancelling the drop out on exactly
  // the viewports it was meant to fix (verified against the reported
  // overlap with the CTA row, not just reasoned about).
  // heightFactor's shrink isn't only a mobile-phone thing — a completely
  // ordinary 1366x768 laptop window lands well under the 808px canvas
  // height heightFactor treats as "full size" (header eats ~90px of it),
  // so a *wide* desktop window can end up just as squeezed as a phone,
  // while `isMobile` (a CSS-width breakpoint) stays false for it the whole
  // time. Compensating drop by how much heightFactor has shrunk — not just
  // by the mobile flag — is what actually matches the two cases that were
  // reported broken (a narrow phone and an ordinary laptop, not just narrow
  // screens).
  const extraDrop = (1 - heightFactor) * 2.4 + (isMobile ? 1.0 : 0);
  // positionX/positionY are in the same normalized units as the
  // cursor-follow lerp target in RobotPrototype (state.pointer.x *
  // viewport.width/3.5), so an offset here shifts the robot's *idle*
  // resting position off-center while cursor-follow keeps working the same
  // way relative to that new rest point — the robot still tracks the
  // pointer, just around a different anchor instead of true center.
  return <group scale={s} position={[positionX * s, positionY * s - extraDrop, 0]}>{children}</group>;
}

function GlassCapsule({
  color,
  power,
  intensity,
}: {
  color: string;
  power: number;
  intensity: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      color: { value: new THREE.Color("#ffffff") },
      power: { value: 2.5 },
      intensity: { value: 0.6 },
    }),
    [],
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.color.value.set(color);
      materialRef.current.uniforms.power.value = power;
      materialRef.current.uniforms.intensity.value = intensity;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[0.3, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float power;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
            fresnel = pow(fresnel, power);
            gl_FragColor = vec4(color, fresnel * intensity);
          }
        `}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const earBaseMat = new THREE.MeshStandardMaterial({
  color: "#f0f0f0",
  roughness: 0.5,
});
const earRingMat = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.3,
});
const earCenterMat = new THREE.MeshStandardMaterial({
  color: "#cccccc",
  roughness: 0.8,
});
const antennaBaseMat = new THREE.MeshStandardMaterial({
  color: "#999999",
  roughness: 0.4,
  metalness: 0.5,
});
const antennaStickMat = new THREE.MeshStandardMaterial({
  color: "#d0d0d0",
  roughness: 0.4,
  metalness: 0.2,
});
const antennaTipMat = new THREE.MeshStandardMaterial({
  color: "#ff3366",
  roughness: 0.2,
  toneMapped: false,
});

function RobotEar({
  position,
  scale = 1,
  isLeft = false,
}: {
  position: [number, number, number];
  scale?: number;
  isLeft?: boolean;
}) {
  const dir = isLeft ? -1 : 1;

  return (
    <group position={position} scale={scale}>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={earBaseMat}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.025, 32]} />
      </mesh>

      <mesh
        position={[dir * 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={earRingMat}
      >
        <torusGeometry args={[0.032, 0.008, 16, 32]} />
      </mesh>

      <mesh
        position={[dir * 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={earCenterMat}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.005, 32]} />
      </mesh>

      <group position={[dir * 0.015, 0.035, 0]} rotation={[-0.4, 0, 0]}>
        <mesh
          position={[0, 0.01, 0]}
          castShadow
          receiveShadow
          material={antennaBaseMat}
        >
          <cylinderGeometry args={[0.006, 0.008, 0.02, 16]} />
        </mesh>
        <mesh
          position={[0, 0.06, 0]}
          castShadow
          receiveShadow
          material={antennaStickMat}
        >
          <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
        </mesh>
        <mesh
          position={[0, 0.11, 0]}
          castShadow
          receiveShadow
          material={antennaTipMat}
        >
          <sphereGeometry args={[0.006, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
}

const eyeMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color(2, 2, 2),
  toneMapped: false,
  transparent: true,
});
const heartMat = new THREE.MeshBasicMaterial({
  color: "#ff3366",
  toneMapped: false,
});

function RobotEye({
  position,
  rotation,
  scale = 1,
  blinkDuration = 0.15,
  blinkCycle = 3.0,
  isLovedRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  blinkDuration?: number;
  blinkCycle?: number;
  isLovedRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const normalEyesRef = useRef<THREE.Group>(null);
  const heartEyeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !normalEyesRef.current || !heartEyeRef.current)
      return;

    const isHeart = isLovedRef.current;

    normalEyesRef.current.visible = !isHeart;
    heartEyeRef.current.visible = isHeart;

    const cycle = clock.getElapsedTime() % blinkCycle;

    let targetScaleY = 1;

    if (cycle < blinkDuration && !isHeart) {
      const progress = cycle / blinkDuration;
      const blinkClose = Math.sin(progress * Math.PI);

      targetScaleY = Math.max(0.05, 1.0 - blinkClose);
    }

    groupRef.current.scale.set(scale, scale * targetScaleY, scale);
  });

  const { topPath, bottomPath } = useMemo(() => {
    const w = 0.025;
    const h = 0.035;
    const r = 0.02;
    const g = 0.005;

    const tPath = new THREE.CurvePath<THREE.Vector3>();
    tPath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-w, g, 0),
        new THREE.Vector3(-w, h - r, 0),
      ),
    );
    tPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-w, h - r, 0),
        new THREE.Vector3(-w, h, 0),
        new THREE.Vector3(-w + r, h, 0),
      ),
    );
    tPath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-w + r, h, 0),
        new THREE.Vector3(w - r, h, 0),
      ),
    );
    tPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(w - r, h, 0),
        new THREE.Vector3(w, h, 0),
        new THREE.Vector3(w, h - r, 0),
      ),
    );
    tPath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(w, h - r, 0),
        new THREE.Vector3(w, g, 0),
      ),
    );

    const bPath = new THREE.CurvePath<THREE.Vector3>();
    bPath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-w, -g, 0),
        new THREE.Vector3(-w, -(h - r), 0),
      ),
    );
    bPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-w, -(h - r), 0),
        new THREE.Vector3(-w, -h, 0),
        new THREE.Vector3(-w + r, -h, 0),
      ),
    );
    bPath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-w + r, -h, 0),
        new THREE.Vector3(w - r, -h, 0),
      ),
    );
    bPath.add(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(w - r, -h, 0),
        new THREE.Vector3(w, -h, 0),
        new THREE.Vector3(w, -(h - r), 0),
      ),
    );
    bPath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(w, -(h - r), 0),
        new THREE.Vector3(w, -g, 0),
      ),
    );

    return { topPath: tPath, bottomPath: bPath };
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={heartEyeRef} visible={false} material={heartMat}>
        <tubeGeometry args={[sharedHeartCurve, 64, 0.0035, 8, true]} />
      </mesh>

      <group ref={normalEyesRef}>
        <mesh material={eyeMat}>
          <tubeGeometry args={[topPath, 20, 0.0035, 8, false]} />
        </mesh>
        <mesh material={eyeMat}>
          <tubeGeometry args={[bottomPath, 20, 0.0035, 8, false]} />
        </mesh>
      </group>
    </group>
  );
}

function generatePbrTexturesAsync(): Promise<{
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = 512;
      const canvasC = document.createElement("canvas");
      const canvasB = document.createElement("canvas");
      canvasC.width = canvasB.width = size;
      canvasC.height = canvasB.height = size;
      const ctxC = canvasC.getContext("2d");
      const ctxB = canvasB.getContext("2d");

      if (ctxC && ctxB) {
        ctxC.fillStyle = "#dcdcdc";
        ctxC.fillRect(0, 0, size, size);
        ctxB.fillStyle = "#808080";
        ctxB.fillRect(0, 0, size, size);

        for (let i = 0; i < 10000; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const r = 0.5 + Math.random() * 1.5;
          const isDark = Math.random() > 0.15;

          ctxC.beginPath();
          ctxC.arc(x, y, r, 0, Math.PI * 2);
          ctxC.fillStyle = isDark ? "#222222" : "#dddddd";
          ctxC.fill();

          ctxB.beginPath();
          ctxB.arc(x, y, r, 0, Math.PI * 2);
          ctxB.fillStyle = isDark ? "#000000" : "#ffffff";
          ctxB.fill();
        }
      }

      const texC = new THREE.CanvasTexture(canvasC);
      const texB = new THREE.CanvasTexture(canvasB);
      texC.wrapS = texB.wrapS = THREE.RepeatWrapping;
      texC.wrapT = texB.wrapT = THREE.RepeatWrapping;

      texC.repeat.set(6, 3);
      texB.repeat.set(6, 3);
      texC.needsUpdate = true;
      texB.needsUpdate = true;

      resolve({ colorMap: texC, bumpMap: texB });
    }, 0);
  });
}

function RobotPrototype({
  neckParams = {
    baseR: 0.25,
    baseH: -0.01,
    midR: 0.23,
    midH: 0.02,
    lipBottomR: 0.27,
    lipBottomH: 0.025,
    lipTopR: 0.28,
    lipTopH: 0.05,
    innerR: 0.24,
    innerDropH: 0.03,
  },
  bodyParams = { bodyBevelR: 0.21, bodyBevelY: 0.38, bodyBevelT: 0.015 },
  color = "#c4c4c4",
  pantallaColor = "#00ffc6",
  pantallaBrillo = 1.2,
  blinkCycle = 3.0,
  metalness = 0.0,
  onActivate,
  assistantStage,
}: {
  neckParams?: Record<string, number>;
  bodyParams?: Record<string, number>;
  color?: string;
  pantallaColor?: string;
  pantallaBrillo?: number;
  blinkCycle?: number;
  metalness?: number;
  onActivate?: () => void;
  assistantStage?: AssistantStage;
}) {
  const isLovedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const [textures, setTextures] = useState<{
    colorMap: THREE.CanvasTexture | null;
    bumpMap: THREE.CanvasTexture | null;
  }>({ colorMap: null, bumpMap: null });

  const design = {
    pantallaColor: pantallaColor,
    pantallaGrosor: 3.8,
    pantallaBrillo: pantallaBrillo,
    separacionOjos: 0.07,
    tamañoOrejas: 1.3,
    escalaOjos: 1.1,
    parpadeoFrecuencia: blinkCycle,
    parpadeoDuracion: 0.45,
    colorChasis: color,
    alturaCabeza: 0.6,
  };

  const config = {
    moveSpeed: 0.35,
    bodyRotSpeed: 10.0,
    headRotSpeed: 20.0,
    bodyTiltX: 0.0,
    bodyTiltY: 0.95,
    headLookX: 0.3,
    headLookY: 1.8,
  };

  useFrame((state, delta) => {
    if (!bodyRef.current || !headRef.current) return;

    const dt = Math.min(delta, 0.1);

    const tx = state.pointer.x;
    const ty = state.pointer.y;

    const maxMoveX = state.viewport.width / 3.5;
    const targetPosX = tx * maxMoveX;
    bodyRef.current.position.x = THREE.MathUtils.lerp(
      bodyRef.current.position.x,
      targetPosX,
      config.moveSpeed * dt,
    );

    const relativeX = tx - bodyRef.current.position.x / 2.5;

    const bodyTargetRotY = -relativeX * config.bodyTiltY;

    const bodyTargetRotX = relativeX * relativeX * config.bodyTiltX - ty * 0.25;

    const bodyTargetRotZ = -relativeX * 0.15;

    bodyRef.current.rotation.y = THREE.MathUtils.lerp(
      bodyRef.current.rotation.y,
      bodyTargetRotY,
      config.bodyRotSpeed * dt,
    );
    bodyRef.current.rotation.x = THREE.MathUtils.lerp(
      bodyRef.current.rotation.x,
      bodyTargetRotX,
      config.bodyRotSpeed * dt,
    );
    bodyRef.current.rotation.z = THREE.MathUtils.lerp(
      bodyRef.current.rotation.z,
      bodyTargetRotZ,
      config.bodyRotSpeed * dt,
    );

    const headTargetRotY = relativeX * config.headLookY;
    const headTargetRotX = -ty * config.headLookX;

    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y,
      headTargetRotY,
      config.headRotSpeed * dt,
    );
    headRef.current.rotation.x = THREE.MathUtils.lerp(
      headRef.current.rotation.x,
      headTargetRotX,
      config.headRotSpeed * dt,
    );
  });

  useEffect(() => {
    let mounted = true;
    let generatedMaps: {
      colorMap: THREE.CanvasTexture;
      bumpMap: THREE.CanvasTexture;
    } | null = null;

    generatePbrTexturesAsync().then((res) => {
      if (mounted) {
        generatedMaps = res;
        setTextures(res);
      } else {
        res.colorMap.dispose();
        res.bumpMap.dispose();
      }
    });

    return () => {
      mounted = false;

      if (generatedMaps) {
        generatedMaps.colorMap.dispose();
        generatedMaps.bumpMap.dispose();
      }
    };
  }, []);

  const handlePointerDown = (
    e: import("@react-three/fiber").ThreeEvent<PointerEvent>,
  ) => {
    e.stopPropagation();
    isLovedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isLovedRef.current = false;
    }, 2000);
    onActivate?.();
  };

  const neckProfile = useMemo(() => {
    const points = [];

    points.push(new THREE.Vector2(neckParams.innerR, neckParams.baseH));

    points.push(new THREE.Vector2(neckParams.baseR, neckParams.baseH));

    points.push(new THREE.Vector2(neckParams.midR, neckParams.midH));

    points.push(
      new THREE.Vector2(neckParams.lipBottomR, neckParams.lipBottomH),
    );

    points.push(new THREE.Vector2(neckParams.lipTopR, neckParams.lipTopH));

    points.push(new THREE.Vector2(neckParams.innerR, neckParams.lipTopH));

    points.push(
      new THREE.Vector2(
        neckParams.innerR,
        neckParams.lipTopH - neckParams.innerDropH,
      ),
    );
    return points;
  }, [neckParams]);

  const headMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  if (!textures.colorMap) return null;

  return (
    <group
      ref={bodyRef}
      position={[0, -0.3, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry
          args={[0.43, 64, 64, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]}
        />
        <meshStandardMaterial
          color={design.colorChasis}
          map={textures.colorMap || undefined}
          bumpMap={textures.bumpMap || undefined}
          bumpScale={0.005}
          roughness={1.0}
          metalness={metalness}
          envMapIntensity={0.0}
        />
      </mesh>

      {bodyParams.bodyBevelT > 0 && (
        <mesh
          position={[0, bodyParams.bodyBevelY, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <torusGeometry
            args={[bodyParams.bodyBevelR, bodyParams.bodyBevelT, 32, 64]}
          />
          <meshStandardMaterial
            color={design.colorChasis}
            map={textures.colorMap || undefined}
            bumpMap={textures.bumpMap || undefined}
            bumpScale={0.005}
            roughness={1.0}
            metalness={metalness}
            envMapIntensity={0.0}
          />
        </mesh>
      )}

      <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
        <latheGeometry args={[neckProfile, 64]} />
        <meshStandardMaterial
          color={design.colorChasis}
          map={textures.colorMap || undefined}
          bumpMap={textures.bumpMap || undefined}
          bumpScale={0.005}
          roughness={1.0}
          metalness={metalness}
          envMapIntensity={0.0}
        />
      </mesh>

      <group ref={headRef} position={[0, design.alturaCabeza, 0]}>
        <mesh material={headMat} castShadow receiveShadow>
          <sphereGeometry args={[0.28, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
        </mesh>

        <GlassCapsule
          color={design.pantallaColor}
          power={design.pantallaGrosor}
          intensity={design.pantallaBrillo}
        />

        <group position={[0, -0.02, 0.29]}>
          <RobotEye
            position={[-design.separacionOjos, 0, 0]}
            rotation={[0, -0.2, 0]}
            scale={design.escalaOjos}
            blinkDuration={design.parpadeoDuracion}
            blinkCycle={design.parpadeoFrecuencia}
            isLovedRef={isLovedRef}
          />
          <RobotEye
            position={[design.separacionOjos, 0, 0]}
            rotation={[0, 0.2, 0]}
            scale={design.escalaOjos}
            blinkDuration={design.parpadeoDuracion}
            blinkCycle={design.parpadeoFrecuencia}
            isLovedRef={isLovedRef}
          />
        </group>

        <RobotEar
          position={[-0.29, 0, 0]}
          isLeft={true}
          scale={design.tamañoOrejas}
        />
        <RobotEar
          position={[0.29, 0, 0]}
          isLeft={false}
          scale={design.tamañoOrejas}
        />
      </group>

      {assistantStage && <RobotSpeechBubble stage={assistantStage} />}
    </group>
  );
}

export interface RobotHeroProps {
  badgeText?: string;
  headline?: string;
  subline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  color?: string;
  scale?: number;
  pantallaColor?: string;
  pantallaBrillo?: number;
  blinkCycle?: number;
  metalness?: number;
  className?: string;
}

// Idle "press me" prompt -> (on robot click) nav bubble with a couple of
// section links -> auto-fades after a few seconds back to plain idle
// blinking. "fading" is a distinct stage (not just removing "nav" straight
// to "dismissed") because the fade-out is a CSS opacity transition, which
// needs the element to stay mounted while the class changes rather than
// disappearing the instant state flips.
type AssistantStage = "prompt" | "nav" | "fading" | "dismissed";
const NAV_BUBBLE_VISIBLE_MS = 6000;
const NAV_BUBBLE_FADE_MS = 500;

// Rendered via drei's <Html>, as a child of the robot's own group (see
// RobotPrototype below) rather than as a plain absolutely-positioned DOM
// element in RobotHero's outer tree. The previous version used fixed CSS
// percentages, entirely disconnected from the robot's actual Three.js
// position — since the robot drifts on cursor-follow, the bubble visibly
// separated from it the moment the cursor moved after a click. <Html>
// re-projects this content to the correct 2D screen position every frame
// based on the anchor's real 3D transform, so it can't drift out of sync.
// transform={false} (the default) deliberately ignores the parent's
// *rotation* — the bubble stays flat/upright rather than tilting with the
// head, tracking position only.
function RobotSpeechBubble({ stage }: { stage: AssistantStage }) {
  if (stage === "dismissed") return null;

  return (
    <Html position={[0, 1.05, 0]} center transform={false} style={{ zIndex: 30, pointerEvents: "none" }}>
      {stage === "prompt" && (
        <div className="animate-pulse">
          <div
            className="rounded-2xl px-4 py-2 font-mono text-sm font-semibold shadow-lg border whitespace-nowrap"
            style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--line)" }}
          >
            Press me
          </div>
          <div className="w-3 h-3 mx-auto -mt-1.5 rotate-45 border-r border-b" style={{ background: "var(--surface)", borderColor: "var(--line)" }} />
        </div>
      )}

      {(stage === "nav" || stage === "fading") && (
        <div
          className="transition-opacity"
          style={{
            opacity: stage === "fading" ? 0 : 1,
            transitionDuration: `${NAV_BUBBLE_FADE_MS}ms`,
            pointerEvents: stage === "fading" ? "none" : "auto",
          }}
        >
          <div
            className="rounded-2xl px-5 py-4 text-center shadow-lg w-[240px] border"
            style={{ background: "var(--surface)", color: "var(--text)", borderColor: "var(--line)" }}
          >
            <p className="font-sans text-sm mb-3">Looking for something? Try:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <a href="#services" className="rounded-full px-3 py-1.5 font-mono text-xs font-bold" style={{ background: "var(--text)", color: "var(--bg)" }}>
                Services
              </a>
              <a href="#contact" className="rounded-full px-3 py-1.5 font-mono text-xs font-bold border" style={{ borderColor: "var(--text)", color: "var(--text)" }}>
                Contact
              </a>
            </div>
          </div>
          <div className="w-3 h-3 mx-auto -mt-1.5 rotate-45 border-r border-b" style={{ background: "var(--surface)", borderColor: "var(--line)" }} />
        </div>
      )}
    </Html>
  );
}

export function RobotHero({
  badgeText,
  headline = "We build websites that actually work.",
  subline = "Design, build, and support after launch.",
  primaryCta = { label: "Get in touch", href: "#contact" },
  secondaryCta = { label: "See our work", href: "#work" },
  color = "#c4c4c4",
  scale = 1,
  pantallaColor = "#00ffc6",
  pantallaBrillo = 1.2,
  blinkCycle = 3.0,
  metalness = 0.0,
  className,
}: RobotHeroProps = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const [assistantStage, setAssistantStage] = useState<AssistantStage>("prompt");

  // Same 760px breakpoint the rest of the site's CSS uses (see the
  // .robot-hero / .hero-content media queries below) — kept in sync via a
  // matchMedia listener rather than derived from the Three.js scene, so the
  // robot's "mobile" sizing/position can't disagree with the DOM layout's.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleRobotActivate = () => {
    setAssistantStage((stage) => (stage === "prompt" ? "nav" : stage));
  };

  useEffect(() => {
    if (assistantStage !== "nav") return;
    const t = setTimeout(() => setAssistantStage("fading"), NAV_BUBBLE_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [assistantStage]);

  useEffect(() => {
    if (assistantStage !== "fading") return;
    const t = setTimeout(() => setAssistantStage("dismissed"), NAV_BUBBLE_FADE_MS);
    return () => clearTimeout(t);
  }, [assistantStage]);

  // Without this, R3F's default frameloop="always" keeps calling
  // useFrame on every RobotPrototype/RobotEye/GlassCapsule instance (the
  // cursor lerp, the blink clock, the shader uniform sync) and re-rendering
  // the WebGL scene at 60fps *continuously*, even with the hero scrolled
  // completely out of view — e.g. while reading the Contact section at the
  // bottom of the page. Flipping the Canvas's frameloop to "never" when
  // offscreen stops both the rendering and the useFrame work together,
  // without unmounting the Canvas — the procedurally-generated PBR
  // textures, the loaded environment map, and the robot's current
  // position/blink-cycle phase all survive the pause instead of having to
  // regenerate when it scrolls back into view.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const entorno = {
    luzAmbiente: 0.75,
    luzPrincipal: 0.0,
    luzPrincipalColor: "#00ffe2",
    luzRelleno: 0.0,
    luzRellenoColor: "#dbdbdb",
    sombraOpacidad: 0.85,
    sombraBlur: 1.2,
  };

  return (
    <section
      ref={containerRef}
      // No background here at all, intentionally — every other section on
      // this site relies on body's own `background: var(--bg)` showing
      // through (see .ambient-shapes/site-wide comments in style.css), and
      // this section previously being the one exception (first a gray
      // gradient, then a hardcoded dark fill + grid texture) was exactly
      // the mismatch being reported. Because the page background now
      // actually varies with the light/dark toggle instead of being
      // pinned dark, every color below was switched from hardcoded
      // hex to the same var(--text)/var(--bg)/var(--line) tokens the rest
      // of the site uses, so it stays legible in both themes rather than
      // becoming cream-on-cream in light mode.
      className={cn("relative w-full min-h-[600px] overflow-hidden", className)}
      style={{ height: "calc(100dvh - var(--header-h))" }}
    >
      {/* One-time entrance animation (transform+opacity only, GPU-composited,
          finishes in under a second and then costs nothing) — staggered
          per element so the text reads as a deliberate sequence rather than
          a single block appearing at once. `both` fill-mode holds the
          "from" state before each element's delay elapses and the "to"
          state after it finishes. Respects prefers-reduced-motion the same
          way LoadingSplash does elsewhere on this site, just via CSS media
          query here instead of a JS matchMedia check since there's no
          other logic this needs to branch on. */}
      <style>{`
        @keyframes hero-rise-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-rise-in { animation: hero-rise-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise-in { animation: none; opacity: 1; transform: none; }
        }
        /* Fixed 100dvh-minus-header height is fine on desktop, where the
           text block is short relative to the viewport. On phones the
           headline wraps to 3 lines and eats most of that budget, leaving
           the robot no room to sit below the CTAs without overlapping them
           — so below the site's mobile breakpoint the section grows past
           the viewport instead of the robot being squeezed to fit inside it. */
        @media (max-width: 760px) {
          .robot-hero { height: auto !important; min-height: 780px; padding-bottom: 64px; }
          .hero-content { position: static !important; transform: none !important; min-height: 420px; padding-top: 48px; }
        }
      `}</style>
      {/* Centered content column — badge, headline, subline, CTAs — sits
          above the robot (z-20 vs the canvas's z-10) so the robot reads as
          peeking out from behind it wherever the two overlap, rather than
          the text sitting on top of an opaque card. Switches to static/flow
          positioning on mobile (see the media query above) since the robot
          there is no longer occupying the same box — it flows in below,
          inside the section's now-auto height. */}
      <div className="hero-content absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none" style={{ transform: "translateY(-6vh)" }}>
        {badgeText && (
          <span
            className="hero-rise-in pointer-events-auto rounded-full px-4 py-1.5 font-mono text-xs font-bold tracking-wide mb-6"
            style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)", border: "1px solid var(--line)", animationDelay: "0ms" }}
          >
            {badgeText}
          </span>
        )}
        <h2
          className="hero-rise-in font-sans font-black max-w-4xl"
          style={{
            color: "var(--text)",
            fontSize: "clamp(2.4rem, 5.6vw, 4.2rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            // Soft halo in the page's own background color, not a literal
            // drop-shadow — reinforces --bg locally behind the letterforms
            // so the headline stays readable as the ambient blob layer
            // (see .ambient-shapes in style.css) drifts different tints
            // underneath it, without reading as an added graphic effect.
            textShadow: "0 2px 28px color-mix(in srgb, var(--bg) 85%, transparent)",
            animationDelay: "90ms",
          }}
        >
          {headline}
        </h2>
        <p
          className="hero-rise-in mt-5 font-mono max-w-md"
          style={{
            color: "var(--text-dim)",
            fontSize: "1rem",
            textShadow: "0 2px 20px color-mix(in srgb, var(--bg) 80%, transparent)",
            animationDelay: "180ms",
          }}
        >
          {subline}
        </p>
        <div className="hero-rise-in mt-9 flex flex-wrap gap-4 justify-center pointer-events-auto" style={{ animationDelay: "270ms" }}>
          <a
            href={primaryCta.href}
            className="rounded-full px-7 py-3 font-mono text-sm font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className="rounded-full px-7 py-3 font-mono text-sm font-bold border-2 transition-transform hover:-translate-y-0.5"
            style={{ borderColor: "var(--text)", color: "var(--text)" }}
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>


      <div className="absolute inset-0 z-10">
        <Canvas
          shadows
          camera={{ position: [0, 0.2, 6], fov: 40 }}
          frameloop={inView ? "always" : "never"}
          // Uncapped devicePixelRatio renders at full native resolution on
          // high-DPI screens — a 3x-DPR laptop would otherwise push 9x the
          // pixels of a 1x display through this whole scene (shaders,
          // shadows, PBR textures) every frame for a visual difference
          // that's essentially imperceptible past ~1.5x on a page this
          // size. [1, 1.5] keeps low-DPI screens at their native 1x and
          // caps everything else at 1.5x instead of R3F's own [1, 2] default.
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={entorno.luzAmbiente} color="#ffffff" />

          {/* intensity is 0 (entorno.luzPrincipal) — this light contributes
              nothing to the final shading either way, but it was still
              configured with castShadow + a 2048x2048 shadow map, which
              three.js renders every frame regardless of the light's
              intensity (shadow-map generation isn't gated on intensity).
              That's a real, continuous cost for a shadow that can never be
              visible, since intensity=0 zeroes out its contribution
              whether or not a given pixel is in shadow. Dropped the shadow
              config entirely; the light itself is left as-is (0 intensity,
              same as the reference) in case it's ever turned back on. */}
          <directionalLight
            position={[0, 6, 3]}
            intensity={entorno.luzPrincipal}
            color={entorno.luzPrincipalColor}
          />

          <directionalLight
            position={[-5, 2, -5]}
            intensity={entorno.luzRelleno}
            color={entorno.luzRellenoColor}
          />

          {/* Suspense handles the *pending* state of Environment's async HDRI
              load — without it, an uncaught suspense blocks React's commit
              for the entire app (including unrelated components like the
              loading splash) until the fetch resolves or fails. The outer
              EnvironmentErrorBoundary handles the *failed* state, which
              Suspense doesn't catch on its own — see its definition above
              for what that actually broke. fallback={null} on both: the
              robot's own lighting/shadows render fine without the
              environment map, so there's nothing useful to show in its
              place either way. */}
          <EnvironmentErrorBoundary>
            <Suspense fallback={null}>
              <Environment preset="studio" blur={0.5} />
            </Suspense>
          </EnvironmentErrorBoundary>

          <ResponsiveGroup scale={scale} positionY={-1.55} isMobile={isMobile}>
            {/* resolution/blur cut roughly in half from the reference
                (1024->512, 1.7->1.2) — this shadow re-renders every frame
                (it has to, to track the robot's cursor-follow motion, so
                frames={1} wasn't an option without it visibly lagging
                behind), so its per-frame cost scales with resolution. Kept
                un-capped otherwise since a static/low-res shadow blob is
                one of the more noticeable things to get wrong. */}
            <ContactShadows
              position={[0, -0.79, 0]}
              opacity={entorno.sombraOpacidad}
              scale={15}
              resolution={512}
              blur={entorno.sombraBlur}
              far={2.5}
              color="#000000"
            />
            <RobotPrototype
              neckParams={{
                baseR: 0.215,
                baseH: -0.05,
                midR: 0.28,
                midH: 0.02,
                lipBottomR: 0.295,
                lipBottomH: 0.045,
                lipTopR: 0.27,
                lipTopH: 0.055,
                innerR: 0.1,
                innerDropH: 0.0,
              }}
              bodyParams={{
                bodyBevelR: 0.235,
                bodyBevelY: 0.34,
                bodyBevelT: 0.025,
              }}
              color={color}
              pantallaColor={pantallaColor}
              pantallaBrillo={pantallaBrillo}
              blinkCycle={blinkCycle}
              metalness={metalness}
              onActivate={handleRobotActivate}
              assistantStage={assistantStage}
            />
          </ResponsiveGroup>
        </Canvas>
      </div>
    </section>
  );
}

export default RobotHero;
