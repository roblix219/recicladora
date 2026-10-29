import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, drawFn) {
  // RGBA buffer with 1 extra filter byte per scanline
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
      raw[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([lenBuf, body, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Drawing logic: Modern Emerald / Teal gradient with recycling scale badge
function drawIcon(isMaskable) {
  return (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;
    const cx = 0.5;
    const cy = 0.5;
    const dx = nx - cx;
    const dy = ny - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Rounded rectangle / squircle for regular icon, full bleed for maskable
    if (!isMaskable) {
      // Corner radius ~ 22%
      const r = 0.22;
      const qx = Math.max(Math.abs(dx) - (0.5 - r), 0);
      const qy = Math.max(Math.abs(dy) - (0.5 - r), 0);
      const cornerDist = Math.sqrt(qx * qx + qy * qy);
      if (cornerDist > r) {
        return [0, 0, 0, 0]; // Transparent outside squircle
      }
    }

    // Emerald gradient background
    // #0f766e (15, 118, 110) to #064e3b (6, 78, 59)
    const gradT = (nx + ny) / 2;
    let r = Math.round(15 * (1 - gradT) + 6 * gradT);
    let g = Math.round(118 * (1 - gradT) + 78 * gradT);
    let b = Math.round(110 * (1 - gradT) + 59 * gradT);

    // Decorative subtle circular ring
    if (Math.abs(dist - 0.36) < 0.006) {
      r = Math.min(255, r + 40);
      g = Math.min(255, g + 60);
      b = Math.min(255, b + 50);
    }

    // Scale / Recycling symbol representation in safe zone (within dist < 0.28)
    const scale = isMaskable ? 0.75 : 1.0;
    const sDist = dist / scale;

    // Center circular badge
    if (sDist < 0.24) {
      // Triangle nodes angle
      const angle = Math.atan2(dy, dx);
      // 3-way symmetry for recycling symbol
      const modAngle = ((angle + Math.PI) % ((2 * Math.PI) / 3)) - Math.PI / 3;
      if (sDist > 0.12 && sDist < 0.23 && Math.abs(modAngle) < 0.8) {
        // Bright emerald/mint
        return [52, 211, 153, 255]; // #34d399
      }
      if (sDist <= 0.08) {
        // Inner white eco leaf
        return [255, 255, 255, 255];
      }
    }

    // Platform scale bar below center
    if (ny >= 0.65 && ny <= 0.70 && Math.abs(dx) <= 0.26 * scale) {
      return [15, 23, 42, 255]; // Dark slate platform
    }
    if (ny >= 0.70 && ny <= 0.73 && Math.abs(dx) <= 0.06 * scale) {
      return [30, 41, 59, 255]; // Stem
    }
    if (ny >= 0.73 && ny <= 0.76 && Math.abs(dx) <= 0.18 * scale) {
      return [15, 23, 42, 255]; // Base
    }

    return [r, g, b, 255];
  };
}

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });

console.log('Generating PNG icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, drawIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, drawIcon(false)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, drawIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, drawIcon(true)));
console.log('Done generating icons!');
