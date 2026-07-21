// Hand-drawn-style callouts floating around the hero phone — a wobbly SVG
// oval (hand-adjusted bezier path, not a perfect ellipse) behind each claim,
// plus small sparkle marks, mimicking a pencil-annotated screenshot.
const BADGES = [
  { key: "b1", pos: "1", lines: ["Higher", "customer trust"] },
  { key: "b2", pos: "2", lines: ["Higher", "market trust"] },
  { key: "b3", pos: "3", lines: ["Better online", "visibility"] },
  { key: "b4", pos: "4", lines: ["Faster", "load times"] },
];

function SketchOval() {
  return (
    <svg className="sketch-oval" viewBox="0 0 240 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M20,60 C18,28 68,9 120,8 C172,7 221,16 220,55 C219,90 166,111 115,112 C61,113 22,94 20,60 Z" />
    </svg>
  );
}

function Sparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

export default function SketchBadges() {
  return (
    <div className="sketch-badges" aria-hidden="true">
      {BADGES.map((b) => (
        <div className={`sketch-badge sketch-badge-${b.pos}`} key={b.key}>
          <SketchOval />
          <p className="sketch-text">
            {b.lines[0]}
            <br />
            <strong>{b.lines[1]}</strong>
          </p>
        </div>
      ))}
      <Sparkle className="sketch-sparkle sketch-sparkle-1" />
      <Sparkle className="sketch-sparkle sketch-sparkle-2" />
      <Sparkle className="sketch-sparkle sketch-sparkle-3" />
      <Sparkle className="sketch-sparkle sketch-sparkle-4" />
    </div>
  );
}
