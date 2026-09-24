import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const publicRoot = path.join(frontendRoot, 'public');
const mock = fs.readFileSync(path.join(frontendRoot, 'src/lib/mock-data.ts'), 'utf8');
const img = fs.readFileSync(path.join(frontendRoot, 'src/lib/image-paths.ts'), 'utf8');

const used = new Set();
for (const m of (img + '\n' + mock).matchAll(/["'`](\/images\/[^"'`$]+)["'`]/g)) {
  used.add(m[1]);
}
for (const m of mock.matchAll(/propertyPhoto\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g)) {
  used.add(`/images/properties/${m[1]}/${m[2]}`);
}
for (const m of mock.matchAll(/propertyPhotos\(\s*"([^"]+)"\s*,\s*\[([^\]]+)\]/g)) {
  const folder = m[1];
  for (const f of m[2].matchAll(/"([^"]+)"/g)) {
    used.add(`/images/properties/${folder}/${f[1]}`);
  }
}

function toPublicId(localPath) {
  let rel = localPath.replace(/^\/images\//, '');
  rel = rel
    .replace(/patricia pics\//gi, 'patricia-pics/')
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/'/g, '');
  rel = rel.replace(/\.(jpe?g|png|webp|gif|avif)$/i, '');
  rel = rel.replace(/-+/g, '-').replace(/\/-/g, '/').replace(/-\//g, '/');
  return `homestay-by-patricia/${rel}`;
}

const inventory = [];
const missing = [];
const skipped = [];
for (const p of [...used].sort()) {
  if (p.includes('${')) { skipped.push(p); continue; }
  const file = path.join(publicRoot, p.replace(/^\//, ''));
  if (!fs.existsSync(file)) { missing.push(p); continue; }
  const st = fs.statSync(file);
  if (!st.isFile()) { skipped.push(p + ' (dir)'); continue; }
  if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(p)) { skipped.push(p); continue; }
  inventory.push({
    localPath: p,
    absolutePath: file,
    publicId: toPublicId(p),
    size: st.size,
  });
}

const byAbs = new Map();
for (const item of inventory) {
  const key = item.absolutePath.toLowerCase();
  if (!byAbs.has(key)) byAbs.set(key, item);
}
const unique = [...byAbs.values()];
const out = {
  generatedAt: new Date().toISOString(),
  usedCount: used.size,
  existingCount: inventory.length,
  uniqueFiles: unique.length,
  missing,
  skipped,
  items: unique,
};
fs.writeFileSync(path.join(frontendRoot, 'scripts/cloudinary-inventory.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify({
  usedCount: used.size,
  existing: inventory.length,
  unique: unique.length,
  missing: missing.length,
  skipped,
  totalMB: Math.round(unique.reduce((s,i)=>s+i.size,0)/1024/1024*10)/10,
}, null, 2));
