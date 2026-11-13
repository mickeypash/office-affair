const { chromium } = require('playwright');
const path = require('path');
// Gabi and Vix live in the office story; these suites test it whatever the default story is.
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html') + '?story=office');
const out = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url);
  const G = () => page.evaluate(() => {
    const { game, player } = window.__officeAffair; const hs = [...document.querySelectorAll('#strikes .chance')];
    return {
      st: game.state, r: game.romance, s: game.strikes, lives: game.lives, locked: player.locked,
      full: hs.filter(h => !h.classList.contains('lost') && !h.classList.contains('empty')).length,
      empty: hs.filter(h => h.classList.contains('empty')).length, lost: hs.filter(h => h.classList.contains('lost')).length,
      slots: hs.length, label: document.getElementById('strikes').getAttribute('aria-label'),
      toast: document.getElementById('toast').textContent, toastCls: document.getElementById('toast').className,
    };
  });
  const set = (fn, arg) => page.evaluate(fn, arg);
  const hud = name => page.locator('#hud').screenshot({ path: out(name) });
  // hold Shift with the boss forced away, starting from romance r
  const kissFrom = async (r, ms = 300) => {
    await set(r0 => { const g = window.__officeAffair.game; g.romance = r0; g.manager.enter('DISTRACTED', 999, {}); }, r);
    await page.keyboard.down('Shift'); await page.waitForTimeout(ms); await page.keyboard.up('Shift');
  };
  const getCaught = async () => {
    await set(() => window.__officeAffair.game.manager.enter('WATCHING', 999, {}));
    await page.keyboard.down('Shift'); await page.waitForTimeout(250); await page.keyboard.up('Shift');
  };
  // count calls to the new chime
  const spyChime = () => set(() => { window.__chimes = 0; const orig = sfx.life.bind(sfx); sfx.life = () => { window.__chimes++; orig(); }; });

  ok(await page.evaluate(() => typeof sfx.life === 'function'), 'Sfx has a life() chime');
  ok(await page.evaluate(() => { const c = window.__officeAffair.CONFIG; return c.startLives === 1 && c.maxLives === 3 && c.lifeAt.join() === '35,70' && !('maxStrikes' in c); }), 'CONFIG: startLives 1, maxLives 3, lifeAt [35, 70], no maxStrikes');

  // ---- start with 1 life ----
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(3300);
  let g = await G();
  ok(g.st === 'PLAYING' && g.lives === 1, 'round starts with 1 life');
  ok(g.slots === 3 && g.full === 1 && g.empty === 2 && g.lost === 0, `HUD: 1 filled + 2 outline (${g.full}/${g.empty}/${g.lost})`);
  ok(g.label === '1 life', `aria-label "${g.label}"`);
  const look = await page.evaluate(() => {
    const [a, e] = [...document.querySelectorAll('#strikes .chance .fillp')].filter((_, i) => i === 0 || i === 2).map(p => getComputedStyle(p));
    return { fullFill: a.fill, fullDash: a.strokeDasharray, emptyFill: e.fill, emptyDash: e.strokeDasharray };
  });
  ok(look.emptyFill === 'none' && look.emptyDash !== 'none' && look.fullFill !== 'none' && look.fullDash === 'none', 'outline slot is unfilled and dashed (shape, not just colour) ' + JSON.stringify(look));
  await hud('shot-hud-1-life.png');

  // ---- one catch at 1 life -> HR ----
  await getCaught();
  g = await G(); ok(g.s === 1 && g.lives === 0 && g.full === 0 && g.lost === 1 && g.toast === 'HR would like a word.', 'catch at 1 life: life cracked, HR toast');
  await page.waitForTimeout(1300);
  ok((await G()).st === 'LOST', 'one catch at 1 life -> LOST after the freeze');
  await page.waitForTimeout(1700);
  ok(await page.evaluate(() => document.getElementById('result').classList.contains('show') && document.getElementById('resultTitle').textContent.includes('HR')
    && /Times caught1/.test(document.getElementById('resultStats').textContent)), 'HR memo shown with Times caught 1');

  // ---- restart resets ----
  await page.click('#btnAgain'); await page.waitForTimeout(3300);
  g = await G(); ok(g.st === 'PLAYING' && g.lives === 1 && g.s === 0 && g.full === 1 && g.empty === 2 && g.lost === 0 && g.label === '1 life', 'restart: 1 life, HUD reset');
  await spyChime();

  // ---- cross 35% -> +1 life, once ----
  await kissFrom(34.5);
  g = await G();
  ok(g.lives === 2, 'crossing 35% gives a life');
  ok(g.toast === '+1 life. Keep going.' && /\bshow\b/.test(g.toastCls) && /\blove\b/.test(g.toastCls), `toast "${g.toast}" in love style (${g.toastCls})`);
  ok(g.full === 2 && g.empty === 1 && g.label === '2 lives', `HUD: 2 filled + 1 outline, label "${g.label}"`);
  ok(await page.evaluate(() => document.querySelectorAll('#strikes .chance.gain').length === 1), 'gained heart pops');
  ok(await page.evaluate(() => window.__chimes === 1), 'chime played once');
  await page.screenshot({ path: out('shot-gain-35.png') });
  await hud('shot-hud-2-lives.png');
  await kissFrom(40); await kissFrom(34.6);
  g = await G(); ok(g.lives === 2 && await page.evaluate(() => window.__chimes === 1), 'crossing 35% again does not give another life');

  // ---- catch at 2 lives -> still playing with 1 ----
  await getCaught();
  g = await G(); ok(g.st === 'PLAYING' && g.lives === 1 && g.s === 1, 'catch at 2 lives -> 1 life');
  await page.waitForTimeout(1300);
  g = await G();
  ok(g.st === 'PLAYING' && g.lives === 1, 'still playing after the freeze with 1 life');
  ok(g.full === 1 && g.lost === 1 && g.empty === 1 && g.label === '1 life', `HUD: 1 filled + 1 cracked + 1 outline (${g.full}/${g.lost}/${g.empty})`);
  await hud('shot-hud-after-catch.png');

  // ---- cross 70% -> another life ----
  await kissFrom(69.5);
  g = await G();
  ok(g.lives === 2 && g.toast === '+1 life. Keep going.' && await page.evaluate(() => window.__chimes === 2), 'crossing 70% gives another life (toast + chime)');
  ok(g.full === 2 && g.lost === 1 && g.empty === 0 && g.label === '2 lives', `HUD: 2 filled + 1 cracked (${g.full}/${g.lost}/${g.empty})`);
  await hud('shot-hud-70-after-catch.png');

  // ---- never more than 3 ----
  await page.evaluate(() => window.__officeAffair.game.start()); await page.waitForTimeout(3300);
  await kissFrom(34.5); await kissFrom(69.5);
  g = await G(); ok(g.lives === 3 && g.full === 3 && g.empty === 0 && g.label === '3 lives', 'no catches: 35% + 70% -> 3 lives, 3 filled');
  await hud('shot-hud-3-lives.png');
  await set(() => window.__officeAffair.game.gainLife());
  await set(() => { const g = window.__officeAffair.game; g.nextLife = 0; }); await kissFrom(34.5);
  g = await G(); ok(g.lives === 3 && g.slots === 3 && g.full === 3 && await page.evaluate(() => window.__chimes === 4), 'never more than 3 lives (no extra chime)');

  // ---- win still counts catches in the score ----
  await set(() => window.__officeAffair.game.lives = 3);
  await getCaught(); await page.waitForTimeout(1300);
  await set(() => { window.__officeAffair.game.timeLeft = 31; }); await kissFrom(99.5);
  await page.waitForTimeout(2300);
  ok(await page.evaluate(() => window.__officeAffair.game.result.strikes === 1 && /Times caught1/.test(document.getElementById('resultStats').textContent)), 'win memo shows Times caught 1');

  // ---- main menu resets ----
  await page.click('#btnAgain'); await page.waitForTimeout(3300);
  await kissFrom(34.5);
  await page.keyboard.press('Escape'); await page.click('#btnQuit');
  g = await G(); ok(g.st === 'MENU' && g.lives === 1 && g.full === 1 && g.empty === 2 && g.lost === 0 && g.label === '1 life', 'main menu: lives and HUD reset');
  ok(await page.evaluate(() => window.__officeAffair.game.nextLife === 0 && document.querySelectorAll('#strikes .chance.gain').length === 0), 'main menu: thresholds re-armed, no pop class');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));

  // ---- reduced motion: no pop ----
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await ctx.newPage(); rp.on('pageerror', e => errs.push(e.message));
  await rp.goto(url);
  await rp.click('#btnPlay'); await rp.click('#btnStart'); await rp.waitForTimeout(3300);
  await rp.evaluate(() => { const g = window.__officeAffair.game; g.romance = 34.5; g.manager.enter('DISTRACTED', 999, {}); });
  await rp.keyboard.down('Shift'); await rp.waitForTimeout(300); await rp.keyboard.up('Shift');
  ok(await rp.evaluate(() => window.__officeAffair.game.lives === 2 && document.querySelectorAll('#strikes .chance.gain').length === 0), 'reduced motion: life gained without the pop');
  ok(errs.length === 0, 'no page errors (reduced motion)');
  await b.close();
})();
