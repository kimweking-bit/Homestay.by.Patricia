import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const inventoryPath = path.join(frontendRoot, 'scripts/cloudinary-inventory.json');
const mapPath = path.join(frontendRoot, 'scripts/cloudinary-url-map.json');
const CLOUD = 'j8fnep3s';
const PRESET = 'dzwxevbe';
const ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;

const inv = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const items = inv.items.filter(i => fs.existsSync(i.absolutePath) && fs.statSync(i.absolutePath).isFile());

const concurrency = 3;
const results = [];
let idx = 0;
let ok = 0, fail = 0;

async function uploadOne(item, attempt = 1) {
  const form = new FormData();
  const buf = fs.readFileSync(item.absolutePath);
  const blob = new Blob([buf]);
  const filename = path.basename(item.absolutePath);
  form.append('file', blob, filename);
  form.append('upload_preset', PRESET);
  form.append('public_id', item.publicId);

  const res = await fetch(ENDPOINT, { method: 'POST', body: form });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: { message: text.slice(0, 500) } }; }
  if (!res.ok || data.error) {
    const msg = data.error?.message || String(res.status);
    // rate limit retry
    if ((res.status === 420 || res.status === 429 || /rate/i.test(msg)) && attempt < 5) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
      return uploadOne(item, attempt + 1);
    }
    fail++;
    console.error('FAIL', item.localPath, msg);
    return { ...item, success: false, error: msg };
  }
  ok++;
  if (ok % 10 === 0 || ok === 1) console.log('OK', ok + '/' + items.length, item.publicId, `${data.width}x${data.height}`);
  return {
    localPath: item.localPath,
    publicId: data.public_id,
    version: data.version,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
    secureUrl: data.secure_url,
    success: true,
  };
}

async function worker() {
  while (idx < items.length) {
    const i = idx++;
    const item = items[i];
    try {
      results.push(await uploadOne(item));
    } catch (e) {
      fail++;
      console.error('EXC', item.localPath, e.message);
      results.push({ ...item, success: false, error: e.message });
    }
  }
}

console.log('Uploading', items.length, 'images to', CLOUD);
const t0 = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const map = {};
for (const r of results) {
  if (r.success) {
    map[r.localPath] = {
      publicId: r.publicId,
      version: r.version,
      width: r.width,
      height: r.height,
      format: r.format,
      secureUrl: r.secureUrl,
    };
  }
}
fs.writeFileSync(mapPath, JSON.stringify({
  cloud: CLOUD,
  preset: PRESET,
  uploadedAt: new Date().toISOString(),
  durationMs: Date.now() - t0,
  ok, fail,
  map,
}, null, 2));
console.log(JSON.stringify({ ok, fail, mapEntries: Object.keys(map).length, ms: Date.now()-t0 }, null, 2));
if (fail) process.exitCode = 1;
