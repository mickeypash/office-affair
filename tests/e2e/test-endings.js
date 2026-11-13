const { chromium, devices } = require('playwright');
const path = require('path');
// Gabi and Vix live in the office story; these suites test it whatever the default story is.
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html') + '?story=office');
const out = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const EXPECT = {
  drinks:  { title: 'THE BOSS IS BUYING', stamp: 'AWKWARD',     name: 'Drinks with the boss', n: 1 },
  rose:    { title: "IT'S A DATE!",       stamp: '7:00 PM',     name: 'A rose at 7',          n: 2 },
  concert: { title: 'FRONT ROW!',         stamp: 'ENCORE!',     name: 'Concert night',        n: 3 },
};
(async () => {
  const b = await chromium.launch();

  // Read the result memo as plain data
  const memo = pg => pg.evaluate(() => {
    const t = id => document.getElementById(id).textContent;
    const en = document.getElementById('resultEnding');
    return {
      shown: document.getElementById('result').classList.contains('show'),
      head: t('resultHead'), headHtml: document.getElementById('resultHead').innerHTML, title: t('resultTitle'), sub: t('resultSub'),
      stamp: t('resultStamp'), stampCls: document.getElementById('resultStamp').className,
      ending: en.style.display === 'none' ? null : en.textContent, icon: !!en.querySelector('svg'), newBest: !!en.querySelector('.newbest'),
      rows: [...document.querySelectorAll('#resultStats tr')].map(tr => [...tr.children].map(td => td.textContent)),
      text: document.getElementById('result').innerText,
    };
  });
  // Start a round, set the meter to almost full with the given love points, and kiss to win.
  const forceWin = async (pg, lp, timeLeft, strikes = 0) => {
    await pg.evaluate(() => window.__officeAffair.game.start()); await pg.waitForTimeout(3300);
    await pg.evaluate(([lp, timeLeft, strikes]) => {
      const g = window.__officeAffair.game;
      g.manager.enter('DISTRACTED', 999, {}); g.romance = 99.95; g.lovePoints = lp; g.timeLeft = timeLeft; g.strikes = strikes;
    }, [lp, timeLeft, strikes]);
    await pg.keyboard.down('Space'); await pg.waitForTimeout(120); await pg.keyboard.up('Space');
    const st = await pg.evaluate(() => {
      const g = window.__officeAffair.game;
      return { state: g.state, r: g.result, lp: g.lovePoints, confetti: confetti.rainT > 0 || confetti.parts.length > 0 };
    });
    await pg.waitForTimeout(2800);   // memo shows 2 s after the win, then animates in
    return { ...st, m: await memo(pg) };
  };
  const expectScore = s => Math.max(0, Math.round(s.lp + s.r.timeLeft * 20 - s.r.strikes * 500));

  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url);
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload(); await page.waitForTimeout(200);

  // config
  const cfg = await page.evaluate(() => ({ e: window.__officeAffair.CONFIG.endings, s: window.__officeAffair.CONFIG.score, ranks: typeof RANKS }));
  ok(cfg.e.map(x => x.key).join() === 'concert,rose,drinks' && cfg.e[0].min > cfg.e[1].min, `CONFIG.endings best first (${cfg.e.map(x => x.key + '>=' + x.min).join(', ')})`);
  ok(cfg.s.perSecondLeft === 20 && cfg.s.perCatch === 500, 'CONFIG.score: 20 per second left, 500 per catch');
  ok(cfg.ranks === 'undefined', 'RANKS removed');
  ok((await page.textContent('#bestLine')) === '', 'no best line on a fresh start');

  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(200);
  const names = await page.evaluate(() => ({ g: cast.girlName() }));

  // 1. low score -> drinks with the boss
  let w = await forceWin(page, 2700, 10);
  let guy = await page.evaluate(() => cast.guyName());
  ok(w.state === 'WON' && w.r.ending === 'drinks', `low score -> drinks (score ${w.r.score})`);
  ok(w.r.score === expectScore(w), `score = love points + 20/s left - 500/catch (${w.r.score} = ${w.lp.toFixed(0)} + ${w.r.timeLeft.toFixed(1)}s x 20)`);
  ok(w.confetti, 'confetti on a low-score win');
  ok(w.m.shown && w.m.title === EXPECT.drinks.title && w.m.stamp === EXPECT.drinks.stamp && w.m.stampCls === 'stamp', 'drinks: headline + stamp');
  ok(w.m.sub === `The boss asked ${names.g} out for drinks. ${guy} went home alone.`, 'drinks: subtitle names both: ' + w.m.sub);
  ok(w.m.head.includes(`TO: ${names.g} & ${guy}`) && w.m.head.includes('FROM: Your boss') && w.m.head.includes(`RE: Drinks after work (just ${names.g})`), 'drinks: memo from the boss, just for the girl');
  ok(w.m.icon && w.m.ending.startsWith('Ending 1 of 3Drinks with the boss') && w.m.newBest, 'drinks: icon, ending line, New best (first win)');
  ok(w.m.rows.map(r => r[0]).join() === 'Time remaining,Times caught,Score,Best result', 'stats table rows kept');
  ok(w.m.rows[2][1] === `${w.r.score.toLocaleString('en-US')} pts` && w.m.rows[3][1] === `Drinks with the boss, ${w.r.score.toLocaleString('en-US')} pts`, 'score + best rows: ' + w.m.rows.slice(2).map(r => r[1]).join(' | '));
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('officeAffair.best.office')));
  ok(saved && saved.ending === 'drinks' && saved.score === w.r.score && !('rank' in saved), 'best saved with ending: ' + JSON.stringify(saved));
  await page.screenshot({ path: out('shot-ending-drinks.png') });

  // 2. middle score -> a rose at 7
  w = await forceWin(page, 3500, 25);
  guy = await page.evaluate(() => cast.guyName());
  ok(w.r.ending === 'rose' && w.m.title === EXPECT.rose.title && w.m.stamp === EXPECT.rose.stamp, `middle score -> rose (score ${w.r.score})`);
  ok(w.m.sub === `${names.g} & ${guy} left together at 7 pm. ${guy} brought a rose.`, 'rose: subtitle: ' + w.m.sub);
  ok(w.m.head.includes(`TO: ${names.g} & ${guy}`), 'rose: memo to both');
  ok(w.m.icon && w.m.ending.startsWith('Ending 2 of 3A rose at 7') && w.m.newBest, 'rose: icon, ending line, New best (beat drinks)');
  ok(w.confetti, 'confetti on a middle win');
  await page.screenshot({ path: out('shot-ending-rose.png') });

  // 3. high score -> concert
  w = await forceWin(page, 4000, 35);
  guy = await page.evaluate(() => cast.guyName());
  const hi = w.r.score;
  ok(w.r.ending === 'concert' && w.m.title === EXPECT.concert.title && w.m.stamp === EXPECT.concert.stamp, `high score -> concert (score ${hi})`);
  ok(w.m.sub === `${names.g} & ${guy} are off to a concert. Two tickets, no boss.`, 'concert: subtitle: ' + w.m.sub);
  ok(w.m.icon && w.m.ending.startsWith('Ending 3 of 3Concert night') && w.m.newBest, 'concert: icon, ending line, New best');
  await page.screenshot({ path: out('shot-ending-concert.png') });

  // catches cost points: same play with 2 catches drops to the rose
  w = await forceWin(page, 4000, 35, 2);
  ok(w.r.ending === 'rose' && w.r.score === expectScore(w) && Math.abs(hi - w.r.score - 1000) < 30, `2 catches: -1,000 -> rose (score ${w.r.score})`);
  ok(!w.m.newBest, 'no New best when the best is not beaten');
  ok(w.m.rows[3][1] === `Concert night, ${hi.toLocaleString('en-US')} pts`, 'best row still shows the concert: ' + w.m.rows[3][1]);
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('officeAffair.best.office')));
  ok(saved.ending === 'concert' && saved.score === hi, 'saved best unchanged by a lower score');

  // menu best line
  await page.click('#btnMenu');
  ok((await page.textContent('#bestLine')) === `Best: Concert night, ${hi.toLocaleString('en-US')} pts`, 'menu best line: ' + (await page.textContent('#bestLine')));
  await page.reload(); await page.waitForTimeout(200);
  ok((await page.textContent('#bestLine')) === `Best: Concert night, ${hi.toLocaleString('en-US')} pts`, 'menu best line after reload');
  ok(!/rank/i.test(await page.evaluate(() => document.body.innerText)), 'no rank text on the menu');

  // no rank anywhere in a win result
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(200);
  w = await forceWin(page, 5000, 40);
  ok(w.r.rank === undefined && w.r.title === undefined && !/rank/i.test(w.m.text), 'no rank in the result object or memo');
  ok(w.m.newBest && w.r.score > hi, 'beating the best again shows New best');

  // HR memo exactly as before
  await page.evaluate(() => window.__officeAffair.game.start()); await page.waitForTimeout(3300);
  await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 40; g.strikes = 3; g.timeLeft = 20; g.end('hr'); });
  await page.waitForTimeout(1800);
  let m = await memo(page);
  ok(m.head === `TO: ${names.g}FROM: Human ResourcesRE: Mandatory meeting, 9 am` && m.title === 'MEETING WITH HR 📋' && m.sub === 'Your workplace conduct is under review.', 'HR memo text unchanged');
  ok(m.stamp === 'UNDER REVIEW' && m.stampCls === 'stamp red' && m.ending === null, 'HR stamp unchanged, no ending line');
  ok(JSON.stringify(m.rows) === JSON.stringify([['Final romance', '40%'], ['Times caught', '3'], ['Time remaining', '00:20']]), 'HR stats unchanged');
  await page.screenshot({ path: out('shot-ending-hr.png') });

  // clocked out memo exactly as before
  await page.evaluate(() => window.__officeAffair.game.start()); await page.waitForTimeout(3300);
  await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 42; g.strikes = 1; g.timeLeft = 0.1; });
  await page.waitForTimeout(1900);
  m = await memo(page);
  ok(m.head === 'TO: All staffFROM: FacilitiesRE: Building closes at 5 pm' && m.title === 'CLOCKED OUT 💔' && m.sub === 'Another day, another missed connection.', 'clocked-out memo text unchanged');
  ok(m.stamp === '5:00 PM' && m.stampCls === 'stamp red' && m.ending === null, 'clocked-out stamp unchanged, no ending line');
  ok(JSON.stringify(m.rows) === JSON.stringify([['Final romance', '42%'], ['Times caught', '1']]), 'clocked-out stats unchanged');
  await page.screenshot({ path: out('shot-ending-time.png') });
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));

  // old bests (with a rank, on the old scale) are replaced
  await page.evaluate(() => localStorage.setItem('officeAffair.best.office', JSON.stringify({ score: 1400, rank: 'S-Rank', timeLeft: 30, strikes: 0 })));
  await page.reload(); await page.waitForTimeout(200);
  ok((await page.textContent('#bestLine')) === '', 'old rank best: no best line');
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(200);
  w = await forceWin(page, 2700, 5);
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('officeAffair.best.office')));
  ok(w.m.newBest && saved.ending === 'drinks' && !('rank' in saved), 'old rank best replaced by the first ending');

  // custom girl: names escaped in the memo head
  await page.evaluate(() => { cast.custom = cleanGirl({ name: 'Zo <3' }); cast.saveCustom(); cast.setPick('custom'); });
  w = await forceWin(page, 3500, 25);
  guy = await page.evaluate(() => cast.guyName());
  ok(w.m.head.includes(`TO: Zo <3 & ${guy}`) && w.m.headHtml.includes('Zo &lt;3') && w.m.sub.startsWith(`Zo <3 & ${guy} left`), 'custom name shown and escaped');
  await page.evaluate(() => cast.setPick('gabi'));

  // reduced motion: icon shown, no pop animation; confetti still runs briefly
  const rctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage(); rp.on('pageerror', e => errs.push(e.message));
  await rp.goto(url); await rp.click('#btnPlay'); await rp.click('#btnStart');
  w = await forceWin(rp, 4000, 35);
  const anim = await rp.evaluate(() => getComputedStyle(document.querySelector('#resultEnding svg')).animationName);
  ok(w.m.icon && anim === 'none' && w.confetti, `reduced motion: icon without animation (${anim}), confetti on`);

  // mobile screenshots of each ending
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const mp = await ctx.newPage(); mp.on('pageerror', e => errs.push(e.message));
  await mp.goto(url); await mp.tap('#btnPlay'); await mp.tap('#btnStart');
  for (const [lp, tl, key] of [[2700, 10, 'drinks'], [3500, 25, 'rose'], [4000, 35, 'concert']]) {
    w = await forceWin(mp, lp, tl);
    const fit = await mp.evaluate(() => {
      const m = document.getElementById('resultMemo').getBoundingClientRect(), s = document.getElementById('resultStamp').getBoundingClientRect();
      const t = document.getElementById('resultTitle').getBoundingClientRect();
      const ic = document.querySelector('#resultEnding svg').getBoundingClientRect(), tx = document.querySelector('#resultEnding div').getBoundingClientRect();
      return { inView: m.top >= 0 && m.bottom <= innerHeight && m.right <= innerWidth, titleClear: t.top >= s.bottom - 4, iconBeside: tx.left >= ic.right && tx.top < ic.bottom, icon: Math.round(ic.width) };
    });
    ok(w.r.ending === key && fit.inView && fit.titleClear && fit.iconBeside && fit.icon >= 50, `mobile ${key}: memo fits the screen ${JSON.stringify(fit)}`);
    await mp.screenshot({ path: out(`shot-ending-${key}-mobile.png`) });
  }
  ok(errs.length === 0, 'no page errors (reduced motion + mobile) ' + JSON.stringify(errs));
  await b.close();
})();
