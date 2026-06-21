import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const url = process.argv[2] || 'http://localhost:4321/tools/';
const threshold = Number(process.argv[3] || 90);

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  });
  const categories = result.lhr.categories;
  const rows = Object.entries(categories).map(([k, v]) => ({ category: k, score: Math.round(v.score * 100) }));
  console.log(JSON.stringify({ url, threshold, scores: rows }, null, 2));
  const failing = rows.filter(r => r.score < threshold);
  if (failing.length) {
    console.error('FAIL: below threshold:', JSON.stringify(failing));
    process.exitCode = 1;
  } else {
    console.log('ALL_PASS');
  }
} finally {
  await chrome.kill();
}
