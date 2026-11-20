#!/usr/bin/env node
/* Genera el fitxer de relleu d'un mapa físic MAP-01 per a qualsevol regió.

   Font: Mapzen Terrain Tiles a AWS Open Data (https://registry.opendata.aws/terrain-tiles/),
   format «terrarium» (PNG, alçada = R·256 + G + B/256 − 32768 m). Combinen NASA SRTM,
   GMTED2010, ETOPO1 i altres models; al peu del gràfic cal citar-ho així.

   Ús:
     node scripts/relleu.mjs --bbox 0.1,40.45,3.4,43 --st 0.0125 --var IB59_DEM \
       --out web/articles/<slug>/relleu.js [--mn -100] [--mx 3200] [--zoom 8]

   --bbox  lon0,lat0,lon1,lat1 (oest, sud, est, nord) en graus
   --st    mida de la cel·la en graus (0,0125 ≈ 1,2 km per a una regió; 0,05–0,1 per a un país gran o el Sàhara)
   --var   nom de la variable global (window.<var>)
   --mn/mx rang de quantització en metres (per defecte, el de les dades arrodonit a 100 m)

   Sortida (mateix format que «Jesús i els quatre evangelis»):
     window.<var>={lon0,lat1,st,nx,ny,mn,mx,b64}  · 1 byte per cel·la (0–254), fila a fila de nord a sud.
     Alçada = byte/254·(mx−mn)+mn. Cada cel·la és la mitjana de tots els píxels de tessel·la que hi cauen. */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? a.concat([[v.slice(2), arr[i + 1]]]) : a), []));
if (!args.bbox || !args.out || !args.var) {
  console.error("Cal --bbox lon0,lat0,lon1,lat1 --var NOM --out fitxer.js (opcional: --st, --mn, --mx, --zoom)");
  process.exit(1);
}
const [LON0, LAT0, LON1, LAT1] = args.bbox.split(",").map(Number);
const ST = Number(args.st || 0.0125);
const nx = Math.round((LON1 - LON0) / ST), ny = Math.round((LAT1 - LAT0) / ST);
// zoom: com a mínim ~2 píxels de tessel·la per cel·la a l'equador
const ZOOM = args.zoom ? Number(args.zoom) : Math.min(12, Math.max(1, Math.ceil(Math.log2(360 / (256 * ST / 2)))));
const N = 2 ** ZOOM;

const lon2x = lon => ((lon + 180) / 360) * N;
const lat2y = lat => ((1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2) * N;
const x2lon = x => (x / N) * 360 - 180;
const y2lat = y => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / N))) * 180) / Math.PI;

/* ---------- PNG mínim (8 bits, RGB/RGBA, sense entrellaçat) ---------- */
function decodePNG(buf) {
  let p = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error("PNG no suportat"); }
    else if (type === "IDAT") idat.push(d);
    else if (type === "IEND") break;
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0;
  if (!bpp) throw new Error("Tipus de color PNG no suportat: " + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, o = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[o + i - bpp] : 0, b = y ? out[o - stride + i] : 0, c = i >= bpp && y ? out[o - stride + i - bpp] : 0;
      let v = raw[src + i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[o + i] = v & 255;
    }
  }
  return { w, h, bpp, px: out };
}

async function tile(x, y) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${x}/${y}.png`;
  for (let k = 0; k < 3; k++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status + " " + url);
      return decodePNG(Buffer.from(await r.arrayBuffer()));
    } catch (e) { if (k === 2) throw e; }
  }
}

const x0 = Math.floor(lon2x(LON0)), x1 = Math.floor(lon2x(LON1 - 1e-9)), y0 = Math.floor(lat2y(LAT1)), y1 = Math.floor(lat2y(LAT0 + 1e-9));
console.log(`Zoom ${ZOOM}: ${(x1 - x0 + 1) * (y1 - y0 + 1)} tessel·les, reixa ${nx} × ${ny} cel·les de ${ST}°`);

const sum = new Float64Array(nx * ny), cnt = new Uint32Array(nx * ny);
for (let ty = y0; ty <= y1; ty++) {
  for (let tx = x0; tx <= x1; tx++) {
    const t = await tile(tx, ty);
    for (let py = 0; py < t.h; py++) {
      const lat = y2lat(ty + (py + 0.5) / t.h), j = Math.floor((LAT1 - lat) / ST);
      if (j < 0 || j >= ny) continue;
      for (let px = 0; px < t.w; px++) {
        const lon = x2lon(tx + (px + 0.5) / t.w), i = Math.floor((lon - LON0) / ST);
        if (i < 0 || i >= nx) continue;
        const o = (py * t.w + px) * t.bpp, z = t.px[o] * 256 + t.px[o + 1] + t.px[o + 2] / 256 - 32768;
        sum[j * nx + i] += z; cnt[j * nx + i]++;
      }
    }
  }
}
const z = new Float32Array(nx * ny);
let zmin = Infinity, zmax = -Infinity, empty = 0;
for (let k = 0; k < z.length; k++) {
  if (!cnt[k]) { empty++; continue; }
  z[k] = sum[k] / cnt[k]; zmin = Math.min(zmin, z[k]); zmax = Math.max(zmax, z[k]);
}
if (empty) console.warn(`Atenció: ${empty} cel·les sense cap píxel (puja --zoom).`);
const MN = args.mn != null ? Number(args.mn) : Math.floor(zmin / 100) * 100;
const MX = args.mx != null ? Number(args.mx) : Math.ceil(zmax / 100) * 100;
const q = Buffer.alloc(nx * ny);
for (let k = 0; k < z.length; k++) q[k] = Math.max(0, Math.min(254, Math.round(((z[k] - MN) / (MX - MN)) * 254)));

const head = `/* Relleu MAP-01: Mapzen Terrain Tiles (AWS Open Data; NASA SRTM, GMTED2010, ETOPO1), zoom ${ZOOM}, mitjana per cel·les de ${ST}°, ${LON0}–${LON1} °E, ${LAT0}–${LAT1} °N.
   Generat amb scripts/relleu.mjs. Alçada en m = byte/254·(${MX}−(${MN}))+(${MN}). */\n`;
const body = `window.${args.var}=${JSON.stringify({ lon0: LON0, lat1: LAT1, st: ST, nx, ny, mn: MN, mx: MX, b64: q.toString("base64") })};\n`;
fs.mkdirSync(path.dirname(args.out), { recursive: true });
fs.writeFileSync(args.out, head + body);
console.log(`Alçades: ${Math.round(zmin)} a ${Math.round(zmax)} m (quantitzat ${MN}…${MX} m, ${((MX - MN) / 254).toFixed(1)} m per pas) → ${args.out} (${(fs.statSync(args.out).size / 1024).toFixed(0)} KB)`);
