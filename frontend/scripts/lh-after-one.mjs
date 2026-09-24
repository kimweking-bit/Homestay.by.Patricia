import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const url = process.argv[2];
const name = process.argv[3];
const mobile = process.argv[4] !== 'desktop';
const outDir = 'perf-reports/after';
fs.mkdirSync(outDir, { recursive: true });

function summarize(lhr) {
  const a = lhr.audits;
  const net = a['network-requests']?.details?.items || [];
  const images = net.filter(n => n.resourceType === 'Image' || (n.mimeType||'').startsWith('image/'));
  const cld = images.filter(n => (n.url||'').includes('cloudinary'));
  const oversized = a['uses-responsive-images']?.details?.items || [];
  return {
    metrics: {
      performance: Math.round((lhr.categories.performance?.score||0)*100),
      fcp_ms: a['first-contentful-paint']?.numericValue,
      lcp_ms: a['largest-contentful-paint']?.numericValue,
      tbt_ms: a['total-blocking-time']?.numericValue,
      cls: a['cumulative-layout-shift']?.numericValue,
      ttfb_ms: a['server-response-time']?.numericValue,
      si_ms: a['speed-index']?.numericValue,
      inp_ms: a['interaction-to-next-paint']?.numericValue ?? null,
    },
    lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0] || null,
    requests: net.length,
    imageRequests: images.length,
    imageBytes: images.reduce((s,n)=>s+(n.transferSize||0),0),
    totalBytes: net.reduce((s,n)=>s+(n.transferSize||0),0),
    cloudinaryImageRequests: cld.length,
    localImageRequests: images.filter(n => (n.url||'').includes('/images/') && !(n.url||'').includes('cloudinary')).length,
    oversized,
    oversizedWaste: oversized.reduce((s,i)=>s+(i.wastedBytes||0),0),
    duplicates: (()=>{ const c={}; for (const i of images) c[i.url]=(c[i.url]||0)+1; return Object.entries(c).filter(([,n])=>n>1).map(([url,count])=>({url,count})); })(),
    imageSummary: images.map(n=>({url:n.url,transfer:n.transferSize,mime:n.mimeType,priority:n.priority,status:n.statusCode})),
    cloudinarySample: cld.slice(0,8).map(n=>({url:n.url,transfer:n.transferSize,mime:n.mimeType,priority:n.priority})),
  };
}

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new','--no-sandbox','--disable-gpu'] });
try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
    formFactor: mobile ? 'mobile' : 'desktop',
    screenEmulation: mobile
      ? { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false }
      : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttlingMethod: 'simulate',
    throttling: mobile ? undefined : { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    maxWaitForLoad: 40000,
  });
  const summary = summarize(result.lhr);
  fs.writeFileSync(`${outDir}/AFTER_${name}.summary.json`, JSON.stringify(summary, null, 2));
  console.log(name, summary.metrics.performance, 'LCP', Math.round(summary.metrics.lcp_ms), 'imgKB', Math.round(summary.imageBytes/1024), 'wasteKB', Math.round(summary.oversizedWaste/1024), 'imgs', summary.imageRequests, 'cld', summary.cloudinaryImageRequests);
} finally {
  await chrome.kill();
}
