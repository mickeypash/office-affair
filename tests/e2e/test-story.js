const path = require('path');
const { chromium, devices } = require('playwright');
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html'));
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const cards = page => page.$$eval('.pick-card', els => els.map(e => e.dataset.pick).join());
const sep = url.includes('?') ? '&' : '?';
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errs.push(e.message));
  const go = async q => { await page.goto(url + (q ? sep + q : '')); await page.waitForTimeout(300); };
  const startRound = async () => { await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(3300); };
  const winRound = async () => {
    await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 99.9; g.manager.enter('DISTRACTED', 999, {}); });
    await page.keyboard.down('Shift'); await page.waitForTimeout(200); await page.keyboard.up('Shift'); await page.waitForTimeout(2300);
  };
  await go(); await page.evaluate(() => localStorage.clear()); await go();

  // Default game is unchanged
  ok(await page.evaluate(() => STORY.id) === 'office', 'no ?story: the office story');
  ok((await page.textContent('#poster')).includes('ISABEL MARANT'), 'office poster is unchanged');
  await page.click('#btnPlay');
  ok(await cards(page) === 'gabi,vix,custom', 'office picker: Gabi, Vix, Make your own');
  for (const q of ['story=nope', 'story=toString', 'story=__proto__', 'story=']) {
    await go(q);
    ok(await page.evaluate(() => STORY.id) === 'office' && (await page.textContent('#poster')).includes('ISABEL MARANT'), `?${q} falls back to the office`);
  }

  // ?story=nvidia: Alice and Kimberly, Jensen every round, NVIDIA poster
  await go('story=nvidia');
  ok(await page.evaluate(() => STORY.id) === 'nvidia', '?story=nvidia selects the story');
  ok((await page.textContent('#poster')).includes('NVIDIA') && !(await page.textContent('#poster')).includes('ISABEL'), 'NVIDIA poster replaces the office poster');
  ok(await page.$eval('#poster', g => g.getBBox().width > 230 && g.getBBox().width < 300), 'poster keeps its size on the wall');
  await page.click('#btnPlay');
  ok(await cards(page) === 'alice,kimberly,custom', 'picker: Alice, Kimberly, Make your own');
  ok(await page.$$eval('.pick-card:not(#pickCustom)', els => els.every(e => !!e.querySelector('.pick-face svg'))), 'their cards have portraits');
  ok(await page.textContent('#plateL') === 'Alice', 'Alice is picked first');
  ok(await page.textContent('#plateR') === 'Jensen', 'the guy is Jensen');
  const rolls = await page.evaluate(() => Array.from({ length: 200 }, () => cast.rollGuy().name));
  ok(rolls.every(n => n === 'Jensen'), 'Jensen on every roll (200 rolls)');
  ok(await page.evaluate(() => !!document.querySelector('#charR .cw[data-male]') && document.querySelectorAll('#charR .f-front rect[rx="7"]').length === 2), 'Jensen is drawn (masculine face, rectangular glasses)');
  await page.click('[data-pick="kimberly"]');
  ok(await page.textContent('#plateL') === 'Kimberly', 'Kimberly can be picked');
  ok(!(await page.$('[data-pick="gabi"]')) && !(await page.$('[data-pick="vix"]')), 'Gabi and Vix are not on this picker');
  await page.evaluate(() => cast.setPick('gabi'));
  ok(await page.evaluate(() => cast.pick) === 'kimberly', 'Gabi cannot be picked in this story');

  // Rounds: Jensen stays across Play again; the win memo names both
  await page.click('#btnStart'); await page.waitForTimeout(3300);
  ok(await page.evaluate(() => window.__officeAffair.game.state) === 'PLAYING', 'a round starts');
  await winRound();
  ok(await page.evaluate(() => window.__officeAffair.game.state) === 'WON' && (await page.textContent('#resultHead')).includes('Kimberly & Jensen'), 'win memo: "Kimberly & Jensen"');
  const guys = new Set();
  for (let i = 0; i < 3; i++) {
    await page.click('#btnAgain'); await page.waitForTimeout(3300);
    guys.add(await page.textContent('#plateR'));
    await winRound();
  }
  ok(guys.size === 1 && guys.has('Jensen'), 'Play again keeps Jensen (' + [...guys].join() + ')');

  // Saves are per story
  const keys = await page.evaluate(() => ({ pick: localStorage.getItem('officeAffair.pick.nvidia'), best: localStorage.getItem('officeAffair.best.nvidia'),
    officePick: localStorage.getItem('officeAffair.pick'), officeBest: localStorage.getItem('officeAffair.best.wednesday') }));
  ok(keys.pick === '"kimberly"' && !!keys.best, 'pick and best saved under pick.nvidia and best.nvidia');
  ok(keys.officePick === null && keys.officeBest === null, 'office save keys are untouched');
  await go('story=nvidia');
  ok(await page.evaluate(() => cast.pick) === 'kimberly', 'the story pick is restored');
  await go();
  ok(await page.evaluate(() => cast.pick) === 'gabi' && await page.textContent('#plateL') === 'Gabi', 'the office pick is separate (Gabi)');
  ok((await page.textContent('#plateR')) !== 'Jensen' || await page.evaluate(() => NAMED_GUYS.length === 0), 'the office guy is random again');
  ok(await page.evaluate(() => Array.from({ length: 200 }, () => cast.rollGuy().name).every(n => n !== 'Jensen')), 'office never rolls Jensen while he is hidden');

  // Phone layout with the story
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const mp = await ctx.newPage(); mp.on('pageerror', e => errs.push(e.message));
  await mp.goto(url + sep + 'story=nvidia'); await mp.evaluate(() => localStorage.clear()); await mp.reload(); await mp.waitForTimeout(300);
  await mp.click('#btnPlay'); await mp.waitForTimeout(400);
  const lay = await mp.evaluate(() => {
    const grid = document.querySelector('.pick-cards'), panel = document.querySelector('.select-panel'), play = document.getElementById('btnStart').getBoundingClientRect();
    const cs = [...grid.children].map(e => e.getBoundingClientRect());
    return { n: cs.length, oneRow: cs.every(c => Math.abs(c.top - cs[0].top) < 1), fits: panel.scrollHeight <= panel.clientHeight + 1 && document.documentElement.scrollWidth <= innerWidth,
      play: play.top >= 0 && play.bottom <= innerHeight };
  });
  ok(lay.n === 3 && lay.oneRow && lay.fits && lay.play, 'iPhone: 3 cards in one row, nothing overflows, Play on screen');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})();
