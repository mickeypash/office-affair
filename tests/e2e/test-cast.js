const { chromium, devices } = require('playwright');
const path = require('path');
// Gabi and Vix live in the office story; these suites test it whatever the default story is.
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html') + '?story=office');
const out = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const NAMES = ['Banana', 'Smoothie', 'Straw', 'Tree', 'Pickle', 'Mango'];
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300);
  ok(!(await page.$('#levels')) && !(await page.$('#btnCustomise')), 'level picker and old Customise button are gone');
  ok(await page.textContent('#plateL') === 'Gabi', 'Gabi is the default pick');
  await page.click('#btnPlay');
  ok(await page.isVisible('#select .select-panel') && (await page.textContent('#selectTitle')) === "Who's clocking in?", 'Play opens "Who\'s clocking in?"');
  ok(await page.$$eval('.pick-card', els => els.map(e => e.dataset.pick).join()) === 'gabi,vix,custom', 'three cards: Gabi, Vix, Make your own');
  ok(!(await page.isVisible('#btnRestyle')) && (await page.textContent('#pickCustomName')) === 'Make your own', 'no custom girl yet');
  // Vix: never tongue out; Gabi: pout
  await page.click('[data-pick="vix"]');
  ok(await page.textContent('#plateL') === 'Vix' && await page.getAttribute('[data-pick="vix"]', 'aria-checked') === 'true', 'picking Vix updates the scene live');
  const vixMouth = await page.evaluate(() => document.querySelector('#charL .m-smile').innerHTML);
  ok(!/F08AA0|tongue/i.test(vixMouth) && /M-13,37 Q2,40 15,30/.test(vixMouth), 'Vix smirks (mean resting face), no tongue');
  ok(await page.evaluate(() => document.querySelector('#charL .eyes-open').innerHTML.includes('Q-26,-7 -16,-4')), 'Vix has heavy lids');
  await page.click('[data-pick="gabi"]');
  ok(await page.evaluate(() => document.querySelector('#charL .m-smile').innerHTML.includes('#D9667F') && document.querySelector('#charL .m-smile').innerHTML.includes('Q-12,26')), 'Gabi pouts');
  await page.click('[data-pick="vix"]');
  // Make your own
  await page.click('[data-pick="custom"]');
  ok(await page.isVisible('#customise .cust-panel') && !(await page.$('#custTeam')) && !(await page.$('#tabPartner')), 'Make your own opens the one-girl editor (no Team, no tabs)');
  await page.fill('#custName', 'Bea');
  ok(await page.textContent('#plateL') === 'Bea', 'name updates the plate live');
  await page.click('[data-key="hairStyle"] [data-value="sleek"]'); await page.click('[data-key="outfit"] [data-value="laceTop"]'); await page.click('#custGlasses');
  for (const hs of ['wavy', 'bob', 'bun', 'curls', 'crop', 'sleek']) await page.click(`[data-key="hairStyle"] [data-value="${hs}"]`);
  for (const of of ['blazer', 'cardigan', 'turtleneck', 'laceTop']) await page.click(`[data-key="outfit"] [data-value="${of}"]`);
  await page.waitForTimeout(300); await page.screenshot({ path: out('shot-make.png') });
  await page.keyboard.press('Escape');
  ok(await page.isVisible('#select .select-panel') && (await page.textContent('#pickCustomName')) === 'Bea' && await page.isVisible('#btnRestyle'), 'Esc returns to the picker; card shows Bea and the hanger badge');
  await page.screenshot({ path: out('shot-select.png') });
  await page.click('#btnRestyle');
  ok(await page.isVisible('#customise .cust-panel'), 'hanger badge opens the wardrobe');
  await page.keyboard.press('Escape');
  await page.click('[data-pick="custom"]');
  ok(await page.isVisible('#customise .cust-panel'), 'tapping the selected custom card again opens the wardrobe');
  await page.keyboard.press('Escape');
  // persistence
  await page.reload(); await page.waitForTimeout(300);
  const saved = await page.evaluate(() => ({ pick: cast.pick, girl: cast.custom }));
  ok(saved.pick === 'custom' && saved.girl.name === 'Bea' && saved.girl.hairStyle === 'sleek' && saved.girl.glasses === true, 'custom girl and pick persist after reload');
  ok(await page.textContent('#plateL') === 'Bea', 'scene shows Bea after reload');
  // the guy
  const sample = await page.evaluate(() => Array.from({ length: 600 }, () => randomGuy()));
  ok(sample.every(g => NAMES.includes(g.name)) && !sample.some(g => ['Crouton', 'Kiwi', 'Oat Milk', 'Waffle'].includes(g.name)), 'guy names come only from the list (no Crouton, Kiwi, Oat Milk or Waffle)');
  ok(NAMES.every(n => sample.some(g => g.name === n)), 'every listed name can appear');
  ok(sample.every(g => ['#F7DCC8', '#F2CCB0', '#EDC1A1', '#E8B896', '#F5D5BE'].includes(g.skin)) , 'guy skin tones from the white palette');
  ok(await page.evaluate(() => !!document.querySelector('#charR .cw[data-male]') && document.querySelector('#charR .blush-f').getAttribute('opacity') === '0'), 'guy drawn with masculine features (no blush)');
  // rounds: girl stays, guy changes
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(300);
  const guys = new Set([await page.textContent('#plateR')]);
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => { const g = window.__officeAffair.game; g.timeLeft = 0.05; });
    await page.waitForTimeout(1900);
    await page.click('#btnAgain'); await page.waitForTimeout(150);
    guys.add(await page.textContent('#plateR'));
  }
  ok(await page.textContent('#plateL') === 'Bea', 'Play again keeps your girl');
  ok(guys.size >= 3, `Play again brings new guys (${[...guys].join(', ')})`);
  ok(await page.evaluate(() => window.__officeAffair.game.state) === 'COUNTDOWN', 'Play again skips the picker');
  // memos
  await page.waitForTimeout(3300);
  await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 99.9; g.manager.enter('DISTRACTED', 999, {}); });
  await page.keyboard.down('Shift'); await page.waitForTimeout(200); await page.keyboard.up('Shift'); await page.waitForTimeout(2300);
  const guyNow = await page.textContent('#plateR');
  ok((await page.textContent('#resultHead')).includes(`Bea & ${guyNow}`), 'win memo: "TO: Bea & <guy>"');
  ok(!(await page.textContent('#resultStats')).includes('Level'), 'no level row in the memo');
  // kiss pose hides the face-side curtain
  await page.click('#btnMenu'); await page.click('#btnPlay'); await page.click('[data-pick="gabi"]'); await page.click('#btnStart'); await page.waitForTimeout(3300);
  await page.evaluate(() => window.__officeAffair.game.manager.enter('DISTRACTED', 999, {}));
  await page.keyboard.down('Space'); await page.waitForTimeout(800);
  ok(await page.evaluate(() => document.querySelector('#charL .curtain-r').style.display === 'none'), 'face-side hair hidden while kissing');
  await page.screenshot({ path: out('shot-kiss-gabi.png') });
  await page.keyboard.up('Space');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  // mobile
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const mp = await ctx.newPage(); mp.on('pageerror', e => errs.push(e.message));
  await mp.goto(url); await mp.tap('#btnPlay'); await mp.waitForTimeout(400);
  await mp.screenshot({ path: out('shot-select-mobile.png') });
  const fit = await mp.evaluate(() => { const r = document.getElementById('btnStart').getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; });
  ok(fit, 'mobile: Play on the picker is on screen');
  ok(errs.length === 0, 'no page errors (mobile)');
  await b.close();
})();
