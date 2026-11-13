const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const url = process.env.GAME_URL || ('file://' + path.join(root, 'index.html'));
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const page = await b.newPage(); page.on('pageerror', e => errs.push(e.message));
  await page.goto(url); await page.waitForTimeout(300);
  const m = await page.evaluate(() => {
    const get = sel => { const e = document.querySelector(sel); return e ? e.getAttribute('content') || e.getAttribute('href') : null; };
    return {
      title: document.title, desc: get('meta[name="description"]'), icon: get('link[rel="icon"]'),
      ogTitle: get('meta[property="og:title"]'), ogDesc: get('meta[property="og:description"]'), ogUrl: get('meta[property="og:url"]'),
      ogImage: get('meta[property="og:image"]'), ogW: get('meta[property="og:image:width"]'), ogH: get('meta[property="og:image:height"]'),
      ogAlt: get('meta[property="og:image:alt"]'), card: get('meta[name="twitter:card"]'), twImage: get('meta[name="twitter:image"]'),
    };
  });
  ok(m.title === 'Office Affair 💋' && m.ogTitle === m.title, 'title and og:title');
  ok(m.desc && m.desc.length >= 50 && m.desc.length <= 200 && m.ogDesc === m.desc, 'description (50-200 chars) matches og:description');
  ok(m.ogUrl === 'https://mickey.sh/office-affair/', 'og:url is the live address');
  ok(m.ogImage === 'https://mickey.sh/office-affair/img/og.jpg' && m.twImage === m.ogImage && m.card === 'summary_large_image', 'og:image and the X card point at the live preview image');
  ok(m.ogW === '1200' && m.ogH === '630' && !!m.ogAlt, 'og:image is 1200×630 with alt text');
  ok(/^data:image\/svg\+xml,/.test(m.icon) && decodeURIComponent(m.icon).includes('💋'), 'favicon is the 💋 emoji');
  // The image ships with the site: it exists, is a small JPEG of the right size, and the deploy copies img/
  const file = path.join(root, 'img', 'og.jpg');
  const buf = fs.existsSync(file) ? fs.readFileSync(file) : null;
  const jpegSize = b => { for (let i = 2; i < b.length;) { const len = b.readUInt16BE(i + 2); if (b[i + 1] >= 0xC0 && b[i + 1] <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + len; } return null; };
  ok(buf && buf[0] === 0xFF && buf[1] === 0xD8 && buf.length < 300 * 1024, `img/og.jpg is a JPEG under 300 KB (${buf ? Math.round(buf.length / 1024) : 0} KB)`);
  ok(buf && String(jpegSize(buf)) === '1200,630', 'img/og.jpg is 1200×630');
  ok(/cp -r index\.html css js img _site\//.test(fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8')), 'the deploy publishes img/');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})();
