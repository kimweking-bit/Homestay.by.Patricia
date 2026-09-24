import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:3000';
const outDir = path.resolve('perf-reports');
fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  { id: 'property', path: '/properties/patricia-modern-terrace-homestay', form: 'mobile' },
  { id: 'home', path: '/', form: 'desktop' },
  { id: 'stays', path: '/properties', form: 'desktop' },
  { id: 'gallery', path: '/gallery', form: 'desktop' },
  { id: 'property', path: '/properties/patricia-modern-terrace-homestay', form: 'desktop' },
];

function summarize(lhr) {
  const a = lhr.audits;
  const metrics = {
    performance: Math.round((lhr.categories.performance?.score || 0) * 100),
    fcp_ms: a['first-contentful-paint']?.numericValue,
    lcp_ms: a['largest-contentful-paint']?.numericValue,
    tbt_ms: a['total-blocking-time']?.numericValue,
    cls: a['cumulative-layout-shift']?.numericValue,
    si_ms: a['speed-index']?.numericValue,
    tti_ms: a['interactive']?.numericValue,
    ttfb_ms: a['server-response-time']?.numericValue,
    inp_ms: a['interaction-to-next-paint']?.numericValue ?? null,
  };
  const network = a['network-requests']?.details?.items || [];
  const images = network.filter((n) => (n.resourceType === 'Image') || (n.mimeType || '').startsWith('image/'));
  const imageBytes = images.reduce((s, n) => s + (n.transferSize || 0), 0);
  const totalBytes = network.reduce((s, n) => s + (n.transferSize || 0), 0);
  const cloudinary = images.filter((n) => (n.url || '').includes('res.cloudinary.com'));
  const localImages = images.filter((n) => (n.url || '').includes('/images/') && !(n.url || '').includes('cloudinary'));
  const oversized = a['uses-responsive-images']?.details?.items || [];
  const offscreen = a['offscreen-images']?.details?.items || [];
  const modern = a['modern-image-formats']?.details?.items || [];
  const efficient = a['uses-optimized-images']?.details?.items || [];
  const counts = {};
  for (const img of images) counts[img.url] = (counts[img.url] || 0) + 1;
  const duplicates = Object.entries(counts).filter(([, c]) => c > 1).map(([url, c]) => ({ url, count: c }));
  return {
    metrics,
    lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0] || null,
    requests: network.length,
    imageRequests: images.length,
    imageBytes,
    totalBytes,
    cloudinaryImageRequests: cloudinary.length,
    localImageRequests: localImages.length,
    cloudinarySample: cloudinary.slice(0, 10).map((n) => ({
      url: n.url, transfer: n.transferSize, resource: n.resourceSize, mime: n.mimeType, status: n.statusCode, priority: n.priority,
    })),
    localSample: localImages.slice(0, 5).map((n) => n.url),
    oversized: oversized.slice(0, 10),
    offscreen: offscreen.slice(0, 10),
    modernFormats: modern.slice(0, 8),
    unoptimized: efficient.slice(0, 8),
    duplicates,
    imageSummary: images.slice(0, 50).map((n) => ({
      url: n.url, status: n.statusCode, mime: n.mimeType, transfer: n.transferSize, resource: n.resourceSize, priority: n.priority,
    })),
  };
}

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

try {
  for (const job of jobs) {
    const isMobile = job.form === 'mobile';
    const url = BASE + job.path;
    console.log('LH', job.form, job.id, url);
    const opts = {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance'],
      formFactor: isMobile ? 'mobile' : 'desktop',
      screenEmulation: isMobile
        ? { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false }
        : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      throttlingMethod: 'simulate',
    };
    if (!isMobile) {
      opts.throttling = { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 };
    }
    const result = await lighthouse(url, opts);
    const summary = summarize(result.lhr);
    const baseName = `${job.id}-${job.form}`;
    fs.writeFileSync(path.join(outDir, `${baseName}.json`), JSON.stringify(result.lhr, null, 2));
    fs.writeFileSync(path.join(outDir, `${baseName}.html`), result.report[1]);
    fs.writeFileSync(path.join(outDir, `${baseName}.summary.json`), JSON.stringify(summary, null, 2));
    console.log(
      '  perf', summary.metrics.performance,
      'LCP', Math.round(summary.metrics.lcp_ms),
      'CLS', summary.metrics.cls?.toFixed?.(3),
      'imgKB', Math.round(summary.imageBytes / 1024),
      'totKB', Math.round(summary.totalBytes / 1024),
      'imgs', summary.imageRequests,
      'cld', summary.cloudinaryImageRequests,
    );
  }
} finally {
  await chrome.kill();
}
console.log('DONE');
