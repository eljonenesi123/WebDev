import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Bounds, Center } from "@react-three/drei";
import * as THREE from "three";
import { asset } from "../asset";

// A little "typing code" loop drawn on an offscreen canvas and fed to the
// screen mesh as a live texture — avoids the whole photo/UV-orientation
// mess entirely since we author the canvas ourselves, and it's much more
// on-brand for a dev portfolio than a static screenshot.
const CODE_LINES = [
  "const developer = {",
  "  name: 'Eljon Enesi',",
  "  role: 'Web Developer',",
  "  stack: ['React', 'CSS', 'Node'],",
  "  builds: () => 'fast, clean, custom',",
  "};",
];
const FULL_TEXT = CODE_LINES.join("\n");

function useCodeScreenTexture() {
  const canvasRef = useRef(null);
  const textureRef = useRef(null);
  const stateRef = useRef({ charIndex: 0, pausedUntil: 0, cursorOn: true, lastCursorToggle: 0 });

  if (!canvasRef.current) {
    const canvas = document.createElement("canvas");
    canvas.width = 896;
    canvas.height = 560;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = tex;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const lineHeight = 43;

    const sidebarW = 44;
    const gutterW = 54;
    const titleBarH = 40;
    const contentX = sidebarW + gutterW;
    const startX = contentX + 16;

    function draw() {
      // editor body
      ctx.fillStyle = "#121014";
      ctx.fillRect(0, 0, width, height);

      // title bar
      ctx.fillStyle = "#2b2930";
      ctx.fillRect(0, 0, width, titleBarH);
      const dotColors = ["#e5534b", "#e2b93b", "#57ab5e"];
      dotColors.forEach((c, i) => {
        ctx.beginPath();
        ctx.fillStyle = c;
        ctx.arc(20 + i * 22, titleBarH / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.font = "500 15px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#a9a6ad";
      ctx.textBaseline = "middle";
      ctx.fillText("developer.js", contentX + 4, titleBarH / 2 + 1);

      // sidebar (activity bar)
      ctx.fillStyle = "#1c1a20";
      ctx.fillRect(0, titleBarH, sidebarW, height - titleBarH);
      const iconY = [titleBarH + 34, titleBarH + 74, titleBarH + 114];
      iconY.forEach((y, i) => {
        ctx.fillStyle = i === 0 ? "#e8e6e1" : "#55525a";
        ctx.fillRect(sidebarW / 2 - 9, y - 9, 18, 18);
      });

      // gutter
      ctx.fillStyle = "#18161b";
      ctx.fillRect(sidebarW, titleBarH, gutterW, height - titleBarH);
      ctx.strokeStyle = "#2a2830";
      ctx.beginPath();
      ctx.moveTo(contentX, titleBarH);
      ctx.lineTo(contentX, height);
      ctx.stroke();

      const shown = FULL_TEXT.slice(0, stateRef.current.charIndex);
      const lines = shown.split("\n");
      ctx.font = "600 28px 'JetBrains Mono', monospace";
      ctx.textBaseline = "top";
      let y = 63;
      lines.forEach((line, i) => {
        ctx.fillStyle = "#5a5760";
        ctx.textAlign = "right";
        ctx.fillText(String(i + 1), sidebarW + gutterW - 16, y + 2);
        ctx.textAlign = "left";

        let x = startX;
        const tokens = line.split(/('[^']*'|\bconst\b)/g);
        tokens.forEach((tok) => {
          if (!tok) return;
          if (tok.startsWith("'")) ctx.fillStyle = "#c98a5a";
          else if (tok === "const") ctx.fillStyle = "#b5502a";
          else ctx.fillStyle = "#e8e6e1";
          ctx.fillText(tok, x, y);
          x += ctx.measureText(tok).width;
        });
        y += lineHeight;
      });

      const now = performance.now();
      if (now - stateRef.current.lastCursorToggle > 500) {
        stateRef.current.cursorOn = !stateRef.current.cursorOn;
        stateRef.current.lastCursorToggle = now;
      }
      if (stateRef.current.cursorOn) {
        const lastLine = lines[lines.length - 1] || "";
        const cursorX = startX + ctx.measureText(lastLine).width;
        const cursorY = 63 + Math.max(0, lines.length - 1) * lineHeight;
        ctx.fillStyle = "#b5502a";
        ctx.fillRect(cursorX + 3, cursorY, 14, 31);
      }

      textureRef.current.needsUpdate = true;
    }

    draw();
    const id = setInterval(() => {
      const st = stateRef.current;
      const now = performance.now();
      if (st.charIndex >= FULL_TEXT.length) {
        if (st.pausedUntil === 0) st.pausedUntil = now + 1800;
        if (now >= st.pausedUntil) {
          st.charIndex = 0;
          st.pausedUntil = 0;
        }
      } else {
        st.charIndex += 1;
      }
      draw();
    }, 70);
    return () => clearInterval(id);
  }, []);

  return textureRef;
}

function LaptopModel() {
  const { scene } = useGLTF(asset("/assets/laptop-3d.glb"));
  const groupRef = useRef();
  const textureRef = useCodeScreenTexture();

  useEffect(() => {
    const tex = textureRef.current;

    // The frame mesh's own material colour, reused for the screen's back
    // plate below so the closed lid reads as one continuous aluminium shell
    // instead of a mismatched patch.
    let frameColor = 0xb9bac0;
    scene.traverse((child) => {
      if (child.isMesh && /frame/i.test(child.name) && child.material?.color) {
        frameColor = child.material.color.getHex();
      }
    });

    scene.traverse((child) => {
      if (child.isMesh && /screen/i.test(child.name)) {
        // This mesh's own UVs extend outside the normal 0-1 range (an
        // atlas/wrap quirk from the source file), which made any texture we
        // fed it map on as a distorted border. Replace the geometry with a
        // plain, correctly-sized plane (standard 0-1 UVs) instead of fighting
        // the original mapping — same footprint, clean texture coordinates.
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox;
        const w = box.max.x - box.min.x;
        const h = box.max.y - box.min.y;
        const cx = (box.min.x + box.max.x) / 2;
        const cy = (box.min.y + box.max.y) / 2;

        const frontPlane = new THREE.PlaneGeometry(w, h);
        // The node's own transform points this mesh's front face away from
        // the camera, so a plain plane renders its (mirrored) back face —
        // flip it to face forward instead of mirroring the canvas content.
        frontPlane.rotateY(Math.PI);
        frontPlane.translate(cx, cy, box.max.z);
        child.geometry.dispose();
        child.geometry = frontPlane;
        // Swap the PBR material for a fully unlit one so the canvas shows
        // exactly as drawn, regardless of scene lighting.
        child.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });

        // The source model has no actual back-panel geometry behind the
        // screen — without this, rotating the laptop around shows a hole
        // straight through the lid. Add a plain plate facing the opposite
        // way, at the opposite face of the same bounding box, so the lid
        // looks solid from any angle.
        const backPlane = new THREE.PlaneGeometry(w, h);
        backPlane.translate(cx, cy, box.min.z);
        const backMesh = new THREE.Mesh(
          backPlane,
          new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.45, metalness: 0.55 })
        );
        backMesh.position.copy(child.position);
        backMesh.rotation.copy(child.rotation);
        backMesh.scale.copy(child.scale);
        child.parent.add(backMesh);
      }
    });
  }, [scene, textureRef]);

  // Gentle idle sway on top of whatever the visitor has dragged it to —
  // full free rotation is handled separately by OrbitControls below.
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function WorkLaptop3D() {
  return (
    <Canvas dpr={1} camera={{ fov: 32, position: [0, 0, 5] }} gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 3]} intensity={1.3} />
      <directionalLight position={[-3, -1, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.08}>
          <Center>
            <LaptopModel />
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} enableDamping={false} />
    </Canvas>
  );
}
