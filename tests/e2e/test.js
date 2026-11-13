const { chromium, devices } = require('playwright');
const path = require('path');
// Gabi and Vix live in the office story; these suites test it whatever the default story is.
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html') + '?story=office');
const out = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url);
  const G = () => page.evaluate(() => { const { game, player } = window.__officeAffair; return { st: game.state, r: game.romance, t: game.timeLeft, s: game.strikes, m: game.manager.state, kiss: game.kissingNow, src: [...player.sources], locked: player.locked }; });
  const set = fn => page.evaluate(fn);
  await page.click('#btnPlay'); await page.click('#btnStart');
  ok((await G()).st === 'COUNTDOWN', 'play -> COUNTDOWN');
  await page.waitForTimeout(3200);
  ok((await G()).st === 'PLAYING', 'countdown -> PLAYING');
  // keep manager distracted for input tests
  await set(() => { const m = window.__officeAffair.game.manager; m.enter('DISTRACTED', 999, {}); });
  // shift + mouse combo
  await page.keyboard.down('Shift'); await page.waitForTimeout(100);
  ok((await G()).kiss, 'shift kisses');
  const box = await page.locator('#stage').boundingBox();
  await page.mouse.move(box.x + 200, box.y + 200); await page.mouse.down();
  await page.keyboard.up('Shift'); await page.waitForTimeout(100);
  ok((await G()).kiss, 'still kissing with mouse held after shift released');
  await page.mouse.move(5, 5); await page.mouse.up(); await page.waitForTimeout(100);
  ok(!(await G()).kiss, 'mouse released outside stage stops kissing');
  // space
  await page.keyboard.down('Space'); await page.waitForTimeout(100);
  ok((await G()).kiss, 'space kisses');
  const sy = await page.evaluate(() => window.scrollY);
  await page.keyboard.up('Space'); await page.waitForTimeout(50);
  ok(!(await G()).kiss && sy === 0, 'space release stops, no scroll');
  // kiss button
  const kb = await page.locator('#kissBtn').boundingBox();
  await page.mouse.move(kb.x + 50, kb.y + 30); await page.mouse.down(); await page.waitForTimeout(150);
  ok((await G()).kiss, 'kiss button hold kisses');
  ok(await page.evaluate(() => document.getElementById('kissBtn').classList.contains('pressed')), 'button shows pressed');
  await page.mouse.up(); await page.waitForTimeout(50);
  ok(!(await G()).kiss, 'kiss button release stops');
  // romance rises
  const r0 = (await G()).r; await page.keyboard.down('Shift'); await page.waitForTimeout(1000); await page.keyboard.up('Shift');
  const r1 = (await G()).r; ok(r1 - r0 > 3 && r1 - r0 < 4.6, `romance +${(r1 - r0).toFixed(2)} in ~1s`);
  // blur clears input and pauses
  await page.keyboard.down('Shift'); await page.waitForTimeout(50);
  await set(() => window.dispatchEvent(new Event('blur')));
  let g = await G(); ok(g.st === 'PAUSED' && g.src.length === 0, 'blur pauses + clears inputs');
  await page.keyboard.up('Shift');
  const tPaused = g.t; await page.waitForTimeout(500);
  ok((await G()).t === tPaused, 'timer frozen while paused');
  await page.screenshot({ path: out('shot-pause.png') });
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  ok((await G()).st === 'PLAYING', 'Esc resumes');
  // detection: grace < 150ms means no strike
  await set(() => { const g = window.__officeAffair.game; g.lives = 3; g.manager.enter('WATCHING', 999, {}); }); // lives rules: 1 life at start, so give spares
  await page.keyboard.down('Shift'); await page.waitForTimeout(60); await page.keyboard.up('Shift'); await page.waitForTimeout(50);
  ok((await G()).s === 0, 'release within 150ms -> no strike');
  // sustained kiss while watched -> strike, lock until release
  await page.keyboard.down('Shift'); await page.waitForTimeout(300);
  g = await G(); ok(g.s === 1 && !g.kiss && g.locked && await page.evaluate(() => window.__officeAffair.game.lives === 2), 'caught after 150ms (3 -> 2 lives), kissing stopped, input locked');
  await page.waitForTimeout(1200);
  g = await G(); ok(g.m === 'DISTRACTED' && !g.kiss, 'after freeze: manager distracted, still locked while held');
  await page.keyboard.up('Shift'); await page.keyboard.down('Shift'); await page.waitForTimeout(80);
  ok((await G()).kiss, 'fresh press kisses again'); await page.keyboard.up('Shift');
  // SUSPICIOUS is safe
  await set(() => window.__officeAffair.game.manager.enter('SUSPICIOUS', 999, {}));
  await page.keyboard.down('Shift'); await page.waitForTimeout(400); await page.keyboard.up('Shift');
  ok((await G()).s === 1, 'kissing in SUSPICIOUS is safe');
  // natural cycle check: run state machine and record sequence
  await set(() => { const m = window.__officeAffair.game.manager; m.enter('DISTRACTED', 0.5, {}); window.__seq = []; const orig = m.enter.bind(m); m.enter = (s, d, i) => { window.__seq.push(s + (i && i.fake ? '(fake)' : '')); orig(s, d, i); }; });
  await page.waitForTimeout(9000);
  const seq = await page.evaluate(() => window.__seq);
  console.log('   seq:', seq.join(' > '));
  let valid = true; const nxt = { DISTRACTED: ['SUSPICIOUS'], SUSPICIOUS: ['WATCHING', 'DISTRACTED'], WATCHING: ['RETURNING'], RETURNING: ['DISTRACTED'] };
  for (let i = 1; i < seq.length; i++) { const a = seq[i - 1].replace('(fake)', ''), bb = seq[i].replace('(fake)', ''); if (!nxt[a].includes(bb)) valid = false; if (a === 'SUSPICIOUS' && bb === 'DISTRACTED' && !seq[i - 1].includes('fake')) valid = false; }
  ok(valid && seq.length >= 3, 'manager transitions valid (WATCHING always preceded by SUSPICIOUS)');
  // strikes -> HR loss
  await set(() => { const g = window.__officeAffair.game; g.lives = 1; g.manager.enter('WATCHING', 999, {}); });
  await page.keyboard.down('Shift'); await page.waitForTimeout(250); await page.keyboard.up('Shift');
  await page.waitForTimeout(1300);
  ok((await G()).st === 'LOST', 'catch at last life -> LOST');
  await page.waitForTimeout(1700);
  ok(await page.evaluate(() => document.getElementById('result').classList.contains('show') && document.getElementById('resultTitle').textContent.includes('HR')), 'HR result shown');
  await page.screenshot({ path: out('shot-lose-hr.png') });
  // restart -> clean state
  await page.click('#btnAgain'); await page.waitForTimeout(3300);
  g = await G(); ok(g.st === 'PLAYING' && g.s === 0 && g.r === 0 && g.t > 74, 'restart resets state');
  ok(await page.evaluate(() => document.querySelectorAll('.chance.lost').length === 0 && document.querySelectorAll('.chance.empty').length === 2), 'lives HUD reset (no cracks, 2 outlines)');
  // timeout loss
  await set(() => { const g = window.__officeAffair.game; g.timeLeft = 0.3; g.romance = 42; });
  await page.waitForTimeout(2200);
  ok(await page.evaluate(() => document.getElementById('resultTitle').textContent.includes('CLOCKED OUT')), 'time out -> CLOCKED OUT');
  await page.screenshot({ path: out('shot-lose-time.png') });
  // win
  await page.click('#btnAgain'); await page.waitForTimeout(3300);
  await set(() => { const g = window.__officeAffair.game; g.romance = 99.5; g.manager.enter('DISTRACTED', 999, {}); g.timeLeft = 31; g.strikes = 0; });
  await page.keyboard.down('Space'); await page.waitForTimeout(300); await page.keyboard.up('Space');
  ok((await G()).st === 'WON', 'romance 100 -> WON');
  await page.waitForTimeout(900);
  await page.screenshot({ path: out('shot-win-anim.png') });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: out('shot-win.png') });
  ok(await page.evaluate(() => document.getElementById('resultEnding').textContent.includes('Drinks with the boss') && window.__officeAffair.game.result.ending === 'drinks'), 'drinks ending for a short kiss, 30s left (endings replace ranks)');
  ok(await page.evaluate(() => !!localStorage.getItem('officeAffair.best.office')), 'best score stored');
  // repeated restarts
  for (let i = 0; i < 5; i++) { await page.evaluate(() => window.__officeAffair.game.start()); await page.waitForTimeout(80); }
  await page.waitForTimeout(3300);
  ok((await G()).st === 'PLAYING', 'repeated restarts ok');
  // menu + sound persistence
  await page.keyboard.press('Escape'); await page.click('#btnQuit');
  ok((await G()).st === 'MENU', 'quit to menu');
  await page.click('#btnSoundMenu');
  await page.reload(); await page.waitForTimeout(300);
  ok((await page.textContent('#btnSoundMenu')) === 'Sound: off', 'sound toggle persists');
  await page.click('#btnSoundMenu');
  // visibility hidden pauses
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(3300);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  ok((await G()).st === 'PAUSED', 'hidden tab pauses');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));

  // mobile portrait
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const mp = await ctx.newPage(); mp.on('pageerror', e => errs.push(e.message));
  await mp.goto(url); await mp.waitForTimeout(500);
  await mp.screenshot({ path: out('shot-mobile-menu.png') });
  await mp.tap('#btnPlay'); await mp.tap('#btnStart'); await mp.waitForTimeout(3400);
  await mp.evaluate(() => window.__officeAffair.game.manager.enter('DISTRACTED', 999, {}));
  const k = await mp.locator('#kissBtn').boundingBox();
  const cdp = await ctx.newCDPSession(mp);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: k.x + k.width / 2, y: k.y + k.height / 2 }] });
  await mp.waitForTimeout(700);
  const mk = await mp.evaluate(() => window.__officeAffair.game.kissingNow);
  await mp.screenshot({ path: out('shot-mobile-kiss.png') });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mp.waitForTimeout(100);
  const mk2 = await mp.evaluate(() => window.__officeAffair.game.kissingNow);
  ok(mk && !mk2, 'touch hold kisses, release stops');
  const ov = await mp.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(), c = document.getElementById('controls').getBoundingClientRect(), h = document.getElementById('hud').getBoundingClientRect(); return { stage: [s.top, s.bottom], ctrl: [c.top, c.bottom], hud: [h.top, h.bottom], vh: innerHeight }; });
  ok(ov.ctrl[0] >= ov.stage[1] && ov.hud[1] <= ov.stage[0] && ov.ctrl[1] <= ov.vh, 'mobile: no overlap ' + JSON.stringify(ov));
  ok(errs.length === 0, 'no page errors (mobile)');
  await b.close();
})();
