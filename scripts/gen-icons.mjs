// Генерира PWA иконите на Bungalooo без външни зависимости (чист Node).
// Рисува буквата „B" в бяло върху морскосин фон и записва PNG файлове.
//
// Стартиране:  node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// ── CRC32 ────────────────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter type 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Рисуване ─────────────────────────────────────────────────────
const bg = [14, 165, 183, 255] // #0ea5b7
const ink = [255, 255, 255, 255]

// Буквата „B" в 5×7 матрица.
const B = [
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
]

function makeIcon(size, coverage) {
  const rgba = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = bg[0]
    rgba[i * 4 + 1] = bg[1]
    rgba[i * 4 + 2] = bg[2]
    rgba[i * 4 + 3] = bg[3]
  }
  const cols = 5
  const rows = 7
  const cell = Math.floor(Math.min((size * coverage) / cols, (size * coverage) / rows))
  const glyphW = cell * cols
  const glyphH = cell * rows
  const ox = Math.floor((size - glyphW) / 2)
  const oy = Math.floor((size - glyphH) / 2)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!B[r][c]) continue
      for (let dy = 0; dy < cell; dy++) {
        for (let dx = 0; dx < cell; dx++) {
          const x = ox + c * cell + dx
          const y = oy + r * cell + dy
          const idx = (y * size + x) * 4
          rgba[idx] = ink[0]
          rgba[idx + 1] = ink[1]
          rgba[idx + 2] = ink[2]
          rgba[idx + 3] = ink[3]
        }
      }
    }
  }
  return encodePNG(size, size, rgba)
}

const targets = [
  { name: 'pwa-192x192.png', size: 192, coverage: 0.6 },
  { name: 'pwa-512x512.png', size: 512, coverage: 0.6 },
  { name: 'pwa-maskable-512x512.png', size: 512, coverage: 0.46 },
  { name: 'apple-touch-icon.png', size: 180, coverage: 0.6 },
]

for (const t of targets) {
  writeFileSync(join(outDir, t.name), makeIcon(t.size, t.coverage))
  console.log('✓', t.name)
}
console.log('Готово — иконите са в public/icons/')
