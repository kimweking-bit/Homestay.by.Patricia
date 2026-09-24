import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const url = 'http://127.0.0.1:3020/gallery';
const outDir = 'perf-reports/gallery-p0';
fs.mkdirSync(outDir, { recursive: true });

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});
try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false },
    throttlingMethod: 'simulate',
    maxWaitForLoad: 45000,
  });
  const a = result.lhr.audits;
  const net = a['network-requests']?.details?.items || [];
  const images = net.filter(n => n.resourceType === 'Image' || (n.mimeType||'').startsWith('image/'));
  const cld = images.filter(n => (n.url||'').includes('cloudinary'));
  const summary = {
    metrics: {
      performance: Math.round((result.lhr.categories.performance?.score||0)*100),
      fcp_ms: a['first-contentful-paint']?.numericValue,
      lcp_ms: a['largest-contentful-paint']?.numericValue,
      tbt_ms: a['total-blocking-time']?.numericValue,
      cls: a['cumulative-layout-shift']?.numericValue,
      ttfb_ms: a['server-response-time']?.numericValue,
      si_ms: a['speed-index']?.numericValue,
    },
    requests: net.length,
    imageRequests: images.length,
    imageBytes: images.reduce((s,n)=>s+(n.transferSize||0),0),
    totalBytes: net.reduce((s,n)=>s+(n.transferSize||0),0),
    cloudinaryImageRequests: cld.length,
    imageSummary: images.map(n=>({url:n.url,transfer:n.transferSize,mime:n.mimeType,priority:n.priority})),
    lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0] || null,
  };
  fs.writeFileSync(`${outDir}/AFTER_gallery-mobile.summary.json`, JSON.stringify(summary, null, 2));
  fs.writeFileSync(`${outDir}/AFTER_gallery-mobile.json`, JSON.stringify(result.lhr));
  console.log(JSON.stringify({
    perf: summary.metrics.performance,
    LCP: Math.round(summary.metrics.lcp_ms),
    CLS: summary.metrics.cls,
    imgKB: Math.round(summary.imageBytes/1024),
    totKB: Math.round(summary.totalBytes/1024),
    imgs: summary.imageRequests,
    cld: summary.cloudinaryImageRequests,
  }, null, 2));
  console.log('tops:');
  for (const i of summary.imageSummary.slice().sort((a,b)=>(b.transfer||0)-(a.transfer||0)).slice(0,10)) {
    console.log(Math.round((i.transfer||0)/1024)+'KB', i.priority, i.mime, (i.url||'').split('/upload/')[1]?.slice(0,70));
  }
} finally {
  try { await chrome.kill(); } catch {}
}
