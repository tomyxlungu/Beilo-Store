const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8,
    connectionType: 'cellular4g',
  });
  const t0 = Date.now();
  await page.goto('https://beilo.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  console.log('DCL reached in', Date.now() - t0, 'ms');
  await new Promise((r) => setTimeout(r, 25000));
  const perf = await page.evaluate(() => {
    const res = performance.getEntriesByType('resource')
      .map((r) => ({ name: (r.name.split('/').pop() || r.name).split('?')[0].slice(0, 60), size: Math.round(r.transferSize || 0), dur: Math.round(r.duration) }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 18);
    return { totalBytes: Math.round(res.reduce((s, r) => s + r.size, 0)), top: res };
  });
  console.log(JSON.stringify(perf, null, 1));
  await browser.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
