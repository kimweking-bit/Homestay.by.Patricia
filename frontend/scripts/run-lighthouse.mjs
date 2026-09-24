import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const BASE = process.env.PERF_BASE || 'http://127.0.0.1:3000';
const outDir = path.resolve('perf-reports');
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { id: 'home', path: '/' },
  { id: 'stays', path: '/properties' },
  { id: 'gallery', path: '/gallery' },
  { id: 'property', path: '/properties/patricia-modern-terrace-homestay' },
];

const formFactors = [
  {
    id: 'mobile',
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false },
    throttlingMethod: 'simulate',
    // default mobile throttling
  },
  {
    id: 'desktop',
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    throttlingMethod: 'simulate',
  },
];

function pick(audits, id) {
  return audits[id];
}

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

  const lcpEl = a['largest-contentful-paint-element'];
  const lcpDetails = lcpEl?.details?.items?.[0] || null;

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

  // LCP image request
  let lcpImage = null;
  const lcpAudit = a['largest-contentful-paint'];
  // try to find from network by matching lcp element snippet
  const snippet = JSON.stringify(lcpDetails || {});
  for (const img of images) {
    if (snippet.includes(img.url) || (lhr.audits['lcp-lazy-loaded'] && false)) {
      // fallthrough
    }
  }

  // From prior Lighthouse: lcp-details-element often nested
  const lcpNode = lcpDetails?.node || lcpDetails?.items?.[0]?.node || null;

  // Collect image request summary
  const imageSummary = images.map((n) => ({
    url: n.url,
    status: n.statusCode,
    mime: n.mimeType,
    transfer: n.transferSize,
    resource: n.resourceSize,
    priority: n.priority,
    protocol: n.protocol,
  }));

  // Duplicate URLs
  const counts = {};
  for (const img of images) {
    counts[img.url] = (counts[img.url] || 0) + 1;
  }
  const duplicates = Object.entries(counts).filter(([, c]) => c > 1).map(([url, c]) => ({ url, count: c }));

  return {
    metrics,
    lcpElement: lcpDetails,
    lcpNodeSnippet: lcpNode,
    requests: network.length,
    imageRequests: images.length,
    imageBytes,
    totalBytes,
    cloudinaryImageRequests: cloudinary.length,
    localImageRequests: localImages.length,
    cloudinarySample: cloudinary.slice(0, 8).map((n) => ({
      url: n.url,
      transfer: n.transferSize,
      resource: n.resourceSize,
      mime: n.mimeType,
      status: n.statusCode,
      priority: n.priority,
    })),
    localSample: localImages.slice(0, 5).map((n) => n.url),
    oversized: oversized.slice(0, 10),
    offscreen: offscreen.slice(0, 10),
    modernFormats: modern.slice(0, 8),
    unoptimized: efficient.slice(0, 8),
    duplicates,
    imageSummary: imageSummary.slice(0, 40),
    scoreBreakdown: Object.fromEntries(
      Object.entries(lhr.categories.performance?.auditRefs || {})
        .filter(([, r]) => r.weight > 0)
        .map(([, r]) => [r.id, { weight: r.weight, score: a[r.id]?.score, display: a[r.id]?.displayValue }])
    ),
  };
}

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

const all = {};

try {
  for (const ff of formFactors) {
    all[ff.id] = {};
    for (const page of pages) {
      const url = BASE + page.path;
      console.log('LH', ff.id, page.id, url);
      const result = await lighthouse(url, {
        port: chrome.port,
        output: ['json', 'html'],
        logLevel: 'error',
        onlyCategories: ['performance'],
        formFactor: ff.formFactor,
        screenEmulation: ff.screenEmulation,
        throttling: ff.throttling,
        throttlingMethod: ff.throttlingMethod,
        disableStorageReset: false,
      });
      const lhr = result.lhr;
      const summary = summarize(lhr);
      all[ff.id][page.id] = { url, ...summary };
      const baseName = `${page.id}-${ff.id}`;
      fs.writeFileSync(path.join(outDir, `${baseName}.json`), JSON.stringify(lhr, null, 2));
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
  }
} finally {
  await chrome.kill();
}

fs.writeFileSync(path.join(outDir, 'AUDIT_SUMMARY.json'), JSON.stringify(all, null, 2));
console.log('WROTE', path.join(outDir, 'AUDIT_SUMMARY.json'));
