const { chromium } = require('playwright');
const path = require('path');
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html'));
const out = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url);
  const G = () => page.evaluate(() => {
    const { game } = window.__officeAffair, bd = document.getElementById('streakBadge');
    return { st: game.state, r: game.romance, t: game.timeLeft, s: game.strikes, streak: game.streak, mult: game.multiplier, lp: game.lovePoints,
      badge: bd.style.display === 'inline',
      text: document.getElementById('streakText').textContent, fever: document.getElementById('streakFever').style.display === 'inline',
      tf: bd.getAttribute('transform') };
  });
  const set = fn => page.evaluate(fn);
  const distract = () => set(() => window.__officeAffair.game.manager.enter('DISTRACTED', 999, {}));
  const startRound = async () => { await page.evaluate(() => window.__officeAffair.game.start()); await page.waitForTimeout(3300); await distract(); };

  await page.click('#btnPlay'); await page.click('#btnStart');
  await page.waitForTimeout(3300);
  await distract();
  let g = await G();
  ok(g.st === 'PLAYING' && g.mult === 1 && g.streak === 0 && g.lp === 0 && !g.badge, 'round starts at x1, no badge, 0 love points');

  // build a streak
  await page.keyboard.down('Shift'); await page.waitForTimeout(1000);
  g = await G(); ok(g.mult === 1 && g.streak > 0.8 && g.streak < 1.3 && !g.badge, `~1 s: x1, badge hidden (streak ${g.streak.toFixed(2)})`);
  await page.waitForTimeout(1500);
  g = await G(); ok(g.mult === 2 && g.badge && g.text === '×2' && !g.fever, `~2.5 s: x2, badge "${g.text}"`);
  await page.screenshot({ path: out('shot-streak-x2.png') });
  await page.waitForTimeout(2000);
  g = await G(); ok(g.mult === 3 && g.badge && g.text === '×3' && g.fever, `~4.5 s: x3, badge "${g.text}" + FEVER`);
  ok(await page.evaluate(() => /FEVER/.test(document.getElementById('streakFever').textContent)), 'fever badge says FEVER in text');
  ok(await page.evaluate(() => +document.getElementById('warm').getAttribute('opacity') > 0.1), 'fever warm glow on');
  ok(await page.evaluate(() => window.__officeAffair.renderer.heartPool.filter(h => h.alive).length >= 10), 'fever: more hearts on screen');
  await page.screenshot({ path: out('shot-streak-x3.png') });
  await page.keyboard.up('Shift'); await page.waitForTimeout(100);
  g = await G(); ok(g.mult === 1 && g.streak === 0 && !g.badge, 'release resets to x1 and hides badge');
  await page.waitForTimeout(600);
  ok(await page.evaluate(() => +document.getElementById('warm').getAttribute('opacity') < 0.02), 'fever glow fades after release');

  // romance and love-point rates: x1 vs x3, measured on the game clock (timeLeft)
  await set(() => { window.__officeAffair.game.romance = 0; });
  await page.keyboard.down('Shift'); await page.waitForTimeout(300);
  const a0 = await G(); await page.waitForTimeout(1200); const a1 = await G();
  ok(a1.mult === 1 && a0.mult === 1, 'x1 window stayed at x1');
  const dt1 = a0.t - a1.t, rate1 = (a1.r - a0.r) / dt1, lp1 = (a1.lp - a0.lp) / dt1;
  await page.waitForTimeout(3000);
  const b0 = await G(); await page.waitForTimeout(1200); const b1 = await G();
  ok(b0.mult === 3 && b1.mult === 3, 'x3 window stayed at x3');
  const dt3 = b0.t - b1.t, rate3 = (b1.r - b0.r) / dt3, lp3 = (b1.lp - b0.lp) / dt3;
  await page.keyboard.up('Shift');
  console.log(`   romance/s x1 ${rate1.toFixed(3)}  x3 ${rate3.toFixed(3)}; love pts/s x1 ${lp1.toFixed(1)}  x3 ${lp3.toFixed(1)}`);
  ok(Math.abs(rate1 - 3.75) < 0.05, 'x1 romance rate = level rate (3.75/s)');
  ok(Math.abs(rate3 / rate1 - 1.6) < 0.05, `x3 romance rate is ${(rate3 / rate1).toFixed(3)}x the x1 rate (expect 1.6)`);
  ok(Math.abs(lp1 - 100) < 2 && Math.abs(lp3 / lp1 - 3) < 0.05, 'love points: 100/s at x1, 3x faster at x3');
  ok((await G()).lp > 0, 'love points accumulated');

  await page.waitForTimeout(150); // let at least one frame see the release, so the old streak ends
  // catch resets the streak (fresh meter and 3 lives so the round can't end mid-check)
  await set(() => { const g = window.__officeAffair.game; g.romance = 10; if ('lives' in g) g.lives = 3; });
  await distract();
  await page.keyboard.down('Shift'); await page.waitForTimeout(3000);
  ok((await G()).mult === 2, 'x2 before the catch');
  const lpBefore = (await G()).lp;
  await set(() => window.__officeAffair.game.manager.enter('WATCHING', 999, {}));
  await page.waitForTimeout(250);
  g = await G(); ok(g.s === 1 && g.mult === 1 && g.streak === 0 && !g.badge, 'catch resets streak to 0, x1, badge hidden');
  ok(g.lp >= lpBefore, 'catch keeps love points');
  await page.keyboard.up('Shift'); await page.waitForTimeout(1200);
  await distract();

  // pause resets the streak
  await page.keyboard.down('Shift'); await page.waitForTimeout(2400);
  ok((await G()).mult === 2, 'x2 before pause');
  await set(() => window.dispatchEvent(new Event('blur')));
  g = await G(); ok(g.st === 'PAUSED' && g.mult === 1 && g.streak === 0, 'pause resets streak');
  await page.keyboard.up('Shift');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  g = await G(); ok(g.st === 'PLAYING' && !g.badge, 'after resume: no badge');

  // round end resets the streak but keeps love points
  await page.keyboard.down('Shift'); await page.waitForTimeout(2400);
  await set(() => { window.__officeAffair.game.timeLeft = 0.2; });
  await page.waitForTimeout(400);
  g = await G(); ok(g.st === 'LOST' && g.mult === 1 && g.streak === 0 && g.lp > 0, `round end resets streak, keeps love points (${g.lp.toFixed(0)})`);
  await page.keyboard.up('Shift');
  ok(await page.evaluate(() => { const r = window.__officeAffair.game.result; return r && !('lovePoints' in r) && r.rank === undefined; }), 'result object unchanged (no score/rank use yet)');

  // restart resets love points
  await startRound();
  g = await G(); ok(g.st === 'PLAYING' && g.lp === 0 && g.mult === 1 && !g.badge, 'restart resets love points and multiplier');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));

  // reduced motion: badge shown, no pop / pulse
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await ctx.newPage(); const rerrs = []; rp.on('pageerror', e => rerrs.push(e.message));
  await rp.goto(url);
  await rp.click('#btnPlay'); await rp.click('#btnStart'); await rp.waitForTimeout(3300);
  await rp.evaluate(() => window.__officeAffair.game.manager.enter('DISTRACTED', 999, {}));
  await rp.keyboard.down('Shift'); await rp.waitForTimeout(2100);
  const tf2 = await rp.evaluate(() => document.getElementById('streakBadge').getAttribute('transform'));
  await rp.waitForTimeout(2500);
  const r3 = await rp.evaluate(() => { const bd = document.getElementById('streakBadge'); return { on: bd.style.display === 'inline', tf: bd.getAttribute('transform'), text: document.getElementById('streakText').textContent, mult: window.__officeAffair.game.multiplier }; });
  await rp.waitForTimeout(150);
  const tf3b = await rp.evaluate(() => document.getElementById('streakBadge').getAttribute('transform'));
  ok(/scale\(1\.000\)/.test(tf2), `reduced motion: no pop at x2 (${tf2})`);
  ok(r3.on && r3.mult === 3 && r3.text === '×3' && /scale\(1\.000\)/.test(r3.tf) && tf3b === r3.tf, 'reduced motion: x3 badge shown, no pulse');
  await rp.screenshot({ path: out('shot-streak-x3-reduced.png') });
  await rp.keyboard.up('Shift');
  ok(rerrs.length === 0, 'reduced motion: no page errors ' + JSON.stringify(rerrs));
  await b.close();
})();
