// One-off generator for the site favicon set, derived from the "SL"
// (Scriptline) brand mark (black rounded square, bold white "SL").
// Not part of the build — run manually with `node scripts/gen-favicons.js`.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "assets");

// Simplified for legibility at 16px: a first serif-italic attempt (matching
// the header's Abril Fatface look) tested fine at 32px+ but the thin serif
// hairlines merged into an illegible blob once actually downscaled to 16px
// and checked pixel-for-pixel — confirmed visually, not assumed. Swapped to
// a bold, uniform-stroke sans-serif, which is what survives that scale.
const SIZE = 512;
const svg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" rx="112" fill="#0A0A0A"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, Helvetica, sans-serif" font-weight="800"
        font-size="220" letter-spacing="2" fill="#F2F0EB">SL</text>
</svg>`;

const targets = [
  { file: "favicon-16x16.png", size: 16 },
  { file: "favicon-32x32.png", size: 32 },
  { file: "favicon-48x48.png", size: 48 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "android-chrome-192x192.png", size: 192 },
  { file: "android-chrome-512x512.png", size: 512 },
];

async function main() {
  const svgBuf = Buffer.from(svg);
  const pngs = {};
  for (const t of targets) {
    const buf = await sharp(svgBuf).resize(t.size, t.size).png().toBuffer();
    pngs[t.size] = buf;
    fs.writeFileSync(path.join(OUT, t.file), buf);
    console.log("wrote", t.file);
  }

  // Pack a favicon.ico containing the 16/32/48 PNGs — modern ICO supports
  // embedding PNG data directly (Chrome/Firefox/Edge/Safari and Windows
  // Explorer all accept this), no separate BMP encoding needed.
  const icoSizes = [16, 32, 48];
  const images = icoSizes.map((s) => pngs[s]);
  const headerSize = 6 + 16 * images.length;
  let offset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const dirEntries = [];
  images.forEach((buf, i) => {
    const s = icoSizes[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0);
    entry.writeUInt8(s === 256 ? 0 : s, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buf.length;
    dirEntries.push(entry);
  });

  const ico = Buffer.concat([header, ...dirEntries, ...images]);
  fs.writeFileSync(path.join(OUT, "favicon.ico"), ico);
  console.log("wrote favicon.ico");
}

main();
