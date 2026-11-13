const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const url = process.env.GAME_URL || ('file://' + path.join(root, 'index.html'));
const LIVE = 'https://mickey.sh/office-affair/';
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };

// Serve the repo as if it were the live site, and catch everything sent to PostHog (nothing leaves the machine).
async function liveContext(b, init) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const sent = [];
  await ctx.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.hostname.endsWith('posthog.com')) {
      if (route.request().method() === 'POST') { try { sent.push(JSON.parse(route.request().postData())); } catch (e) { sent.push({ bad: true }); } }
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"status":"Ok"}' });
    }
    if (u.origin === 'https://mickey.sh' && u.pathname.startsWith('/office-affair/')) {
      const rel = u.pathname.slice('/office-affair/'.length) || 'index.html';
      const file = path.join(root, rel);
      if (fs.existsSync(file)) return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
      return route.fulfill({ status: 404, body: '' });
    }
    return route.abort();
  });
  if (init) await ctx.addInitScript(init);
  return { ctx, sent };
}
const winRound = async page => {
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(3300);
  await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 99.9; g.manager.enter('DISTRACTED', 999, {}); });
  await page.keyboard.down('Shift'); await page.waitForTimeout(200); await page.keyboard.up('Shift'); await page.waitForTimeout(2300);
};

(async () => {
  const b = await chromium.launch();
  const errs = [];

  // 1. Locally (file://): off, nothing sent
  {
    const page = await b.newPage({ viewport: { width: 1440, height: 900 } }); page.on('pageerror', e => errs.push(e.message));
    let calls = 0; await page.route('**/*posthog.com/**', r => { calls++; r.abort(); });
    await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300);
    await winRound(page);
    const s = await page.evaluate(() => ({ enabled: analytics.enabled, log: analytics.log.length }));
    ok(!s.enabled && s.log === 0 && calls === 0, 'file://: analytics off, nothing recorded or sent');
    const rules = await page.evaluate(() => {
      const nav = { doNotTrack: null, globalPrivacyControl: undefined }, win = {};
      const at = (protocol, hostname) => analytics.enabledFor({ protocol, hostname }, nav, win);
      return { live: at('https:', 'mickey.sh'), http: at('http:', 'mickey.sh'), local: at('http:', 'localhost'), other: at('https:', 'example.com'),
        dnt: analytics.enabledFor({ protocol: 'https:', hostname: 'mickey.sh' }, { doNotTrack: '1' }, {}),
        gpc: analytics.enabledFor({ protocol: 'https:', hostname: 'mickey.sh' }, { globalPrivacyControl: true }, {}) };
    });
    ok(rules.live && !rules.http && !rules.local && !rules.other, 'only https://mickey.sh is live');
    ok(!rules.dnt && !rules.gpc, 'Do Not Track and Global Privacy Control turn it off');
    await page.close();
  }

  // 2. ?analytics=debug: events recorded in memory, never sent
  {
    const page = await b.newPage({ viewport: { width: 1440, height: 900 } }); page.on('pageerror', e => errs.push(e.message));
    let calls = 0; await page.route('**/*posthog.com/**', r => { calls++; r.abort(); });
    await page.goto(url.replace('?story=office', '') + (url.includes('?') ? '&' : '?') + 'analytics=debug'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300);
    await winRound(page);
    const log = await page.evaluate(() => analytics.log);
    const names = log.map(e => e.event);
    ok(names[0] === '$pageview' && names.includes('round_start') && names.includes('round_end') && calls === 0, 'debug: $pageview, round_start, round_end recorded; nothing sent (' + names.join() + ')');
    const start = log.find(e => e.event === 'round_start'), end = log.find(e => e.event === 'round_end');
    ok(start.properties.app === 'office-affair' && start.properties.story === 'nvidia' && start.properties.girl === 'alice' && start.properties.guy === 'jensen' && start.properties.round === 1, 'round_start: app, story, built-in girl and guy, round number');
    ok(end.properties.result === 'win' && ['drinks', 'rose', 'concert'].includes(end.properties.ending) && Number.isInteger(end.properties.score_band) && end.properties.score_band % 500 === 0
      && Number.isInteger(end.properties.seconds) && Number.isInteger(end.properties.time_left), 'round_end: result, ending, score band, seconds, time left');
    ok(log.every(e => e.properties.$process_person_profile === false && e.properties.app === 'office-affair' && /^[0-9a-f-]{36}$/.test(e.distinct_id)), 'every event is anonymous (no person profile) and tagged app');
    // A custom girl's name never leaves the page
    await page.evaluate(() => { cast.custom = { ...DEFAULT_CUSTOM, name: 'Zelda Secret' }; cast.pick = 'custom'; });
    await page.click('#btnAgain'); await page.waitForTimeout(500);
    const after = await page.evaluate(() => analytics.log.slice(-1)[0]);
    ok(after.event === 'round_start' && after.properties.girl === 'custom' && after.properties.round === 2, 'custom girl is sent as "custom"');
    ok(!JSON.stringify(await page.evaluate(() => analytics.log)).includes('Zelda'), 'the custom name is never in any event');
    await page.close();
  }

  // 3. On the live site (served locally): events go to PostHog, nothing is stored
  {
    const { ctx, sent } = await liveContext(b);
    const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
    await page.goto(LIVE); await page.waitForTimeout(500);
    ok(await page.evaluate(() => analytics.enabled), 'https://mickey.sh/office-affair/: analytics on');
    await winRound(page);
    await page.click('#btnMenu'); await page.waitForTimeout(200); await page.click('#btnPlay'); await page.click('#pickCustom'); await page.waitForTimeout(300);
    const evs = sent.map(e => e.event);
    ok(evs[0] === '$pageview' && evs.includes('round_start') && evs.includes('round_end') && evs.includes('wardrobe_open'), 'sent: ' + evs.join());
    const pv = sent[0];
    ok(/^phc_\w{20,}$/.test(pv.api_key) && pv.properties.$current_url === LIVE && pv.properties.$host === 'mickey.sh' && pv.properties.$process_person_profile === false
      && pv.properties.$session_id && pv.timestamp, 'pageview payload: project key, url, host, session id, anonymous');
    ok(sent.every(e => e.distinct_id === pv.distinct_id && e.properties.$session_id === pv.properties.$session_id), 'one visit id and one session id per page load');
    const stored = await page.evaluate(() => ({ cookie: document.cookie, ls: Object.keys(localStorage).filter(k => !k.startsWith('officeAffair.')) }));
    const cookies = await ctx.cookies();
    ok(stored.cookie === '' && cookies.length === 0 && stored.ls.length === 0, 'no cookies and no analytics keys in localStorage');
    await page.reload(); await page.waitForTimeout(400);
    const again = sent.filter(e => e.event === '$pageview');
    ok(again.length === 2 && again[1].distinct_id !== again[0].distinct_id, 'a reload is a new anonymous visitor (nothing remembered)');
    await ctx.close();
  }

  // 4. Global Privacy Control / Do Not Track on the live site: nothing sent
  for (const [label, init] of [['Global Privacy Control', () => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true })],
                               ['Do Not Track', () => Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' })]]) {
    const { ctx, sent } = await liveContext(b, init);
    const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
    await page.goto(LIVE); await page.waitForTimeout(400);
    await winRound(page);
    ok(sent.length === 0 && !(await page.evaluate(() => analytics.enabled)), `${label}: nothing sent`);
    await ctx.close();
  }

  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})();
