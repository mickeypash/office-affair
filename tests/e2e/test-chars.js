const { chromium, devices } = require('playwright');
const path = require('path');
// Gabi and Vix live in the office story; these suites test it whatever the default story is.
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html') + '?story=office');
const withQ = q => url + (url.includes('?') ? '&' : '?') + q;   // add a query to the game URL
const shot = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const cards = page => page.$$eval('.pick-card', els => els.map(e => e.dataset.pick).join());
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300);

  // The repository
  const repo = await page.evaluate(() => ({
    ids: CHARACTERS.map(c => c.id),
    shape: CHARACTERS.every(c => typeof c.id === 'string' && typeof c.name === 'string' && typeof c.hidden === 'boolean' && c.look && typeof c.notes === 'string'),
    hidden: CHARACTERS.filter(c => c.hidden).map(c => c.id),
    visible: CHARACTERS.filter(c => !c.hidden).map(c => c.id),
    playable: PLAYABLE.map(c => c.id), picks: PICKS,
  }));
  ok(repo.shape, 'every CHARACTERS entry has id, name, hidden, look and notes');
  ok(repo.visible.join() === 'gabi,vix', 'visible characters are Gabi then Vix');
  ok(repo.hidden.join() === 'kimberly,alice', 'Kimberly and Alice are hidden');
  ok(repo.playable.join() === 'gabi,vix' && repo.picks.join() === 'gabi,vix,custom', 'PLAYABLE and PICKS leave hidden characters out');

  // Old globals still match the new data
  const g = await page.evaluate(() => ({
    girls: CHARACTERS.every(c => JSON.stringify(GIRLS[c.id]) === JSON.stringify({ name: c.name, ...c.look })),
    gabi: GIRLS.gabi, vix: GIRLS.vix, custom: DEFAULT_CUSTOM,
    customMatch: JSON.stringify(DEFAULT_CUSTOM) === JSON.stringify({ name: CUSTOM_GIRL.name, ...CUSTOM_GIRL.look }),
    guys: GUY_NAMES === GUYS.names && GUY_SKIN === GUYS.skin && GUY_HAIR === GUYS.hair && GUY_HAIR_STYLES === GUYS.hairStyles &&
      GUY_COLOURS === GUYS.colours && GUY_GLASSES === GUYS.glasses,
    names: GUY_NAMES.join(),
  }));
  ok(g.girls, 'GIRLS[id] is { name, ...look } for every character');
  ok(JSON.stringify(g.gabi) === JSON.stringify({ name: 'Gabi', skin: '#F2CBAE', hairStyle: 'wavy', hair: 'url(#hairGabi)', outfit: 'laceTop', outfitColour: '#211C27', glasses: false, makeup: true, mouth: 'pout' }), 'Gabi\'s look is unchanged');
  ok(JSON.stringify(g.vix) === JSON.stringify({ name: 'Vix', skin: '#F5D3BC', hairStyle: 'wavy', hair: 'url(#hairVix)', outfit: 'blazer', outfitColour: '#18151C', glasses: false, makeup: true, mouth: 'smirk', mood: 'mean' }), 'Vix\'s look is unchanged');
  ok(g.customMatch && JSON.stringify(g.custom) === JSON.stringify({ name: 'Jo', skin: '#E0A877', hairStyle: 'bob', hair: '#1F1A24', outfit: 'turtleneck', outfitColour: '#FF4F86', glasses: false, makeup: true, mouth: null }), 'DEFAULT_CUSTOM matches CUSTOM_GIRL and is unchanged');
  ok(g.guys && g.names === 'Banana,Smoothie,Straw,Tree,Pickle,Mango', 'GUY_* globals are the GUYS pools');

  // Picker: exactly the visible characters + Make your own
  await page.click('#btnPlay');
  ok(await cards(page) === 'gabi,vix,custom', 'picker shows the visible characters then Make your own');
  ok(await page.$$eval('.pick-card:not(#pickCustom)', els => els.map(e => e.querySelector('.pick-name').textContent + ':' + !!e.querySelector(`[data-face="${e.dataset.pick}"] svg`)).join()) === 'Gabi:true,Vix:true', 'generated cards have names and portraits');
  ok(await page.$eval('#pickCustom', e => !!e.closest('.pick-slot') && !!e.parentElement.querySelector('#btnRestyle') && e.parentElement === e.closest('.pick-cards').lastElementChild), 'Make your own stays last, with the hanger badge in its slot');
  ok(!(await page.$('[data-pick="alice"]')), 'hidden character is not on the picker');
  await page.evaluate(() => cast.setPick('alice'));
  ok(await page.evaluate(() => cast.pick) === 'gabi', 'a hidden character cannot be picked');

  // A saved pick of a hidden character is not restored
  await page.evaluate(() => localStorage.setItem('officeAffair.pick', JSON.stringify('alice')));
  await page.reload(); await page.waitForTimeout(300);
  ok(await page.evaluate(() => cast.pick) === 'gabi' && await page.textContent('#plateL') === 'Gabi', 'saved hidden pick falls back to the first visible character');

  // ?cast=all shows hidden characters; they can be picked, restored and played
  await page.goto(withQ('cast=all')); await page.waitForTimeout(300);
  await page.click('#btnPlay');
  ok(await cards(page) === 'gabi,vix,kimberly,alice,custom', '?cast=all adds Kimberly and Alice before Make your own');
  await page.click('[data-pick="alice"]');
  ok(await page.getAttribute('[data-pick="alice"]', 'aria-checked') === 'true' && await page.textContent('#plateL') === 'Alice', 'hidden character can be picked with ?cast=all');
  await page.reload(); await page.waitForTimeout(300);
  ok(await page.evaluate(() => cast.pick) === 'alice', 'her pick is restored with ?cast=all');
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(3300);
  ok(await page.evaluate(() => window.__officeAffair.game.state) === 'PLAYING', 'a round starts with her');
  await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 99.9; g.manager.enter('DISTRACTED', 999, {}); });
  await page.keyboard.down('Shift'); await page.waitForTimeout(200); await page.keyboard.up('Shift'); await page.waitForTimeout(2300);
  ok(await page.evaluate(() => window.__officeAffair.game.state) === 'WON' && (await page.textContent('#resultHead')).includes('Alice & '), 'she can win a round (memo: "Alice & <guy>")');
  await page.goto(withQ('x=1&cast=all')); await page.waitForTimeout(300);
  ok(await page.evaluate(() => cast.pick) === 'alice' && !!(await page.$('[data-pick="alice"]')), '&cast=all works too');
  await page.goto(url); await page.waitForTimeout(300);
  ok(await page.evaluate(() => cast.pick) === 'gabi' && !(await page.$('[data-pick="alice"]')), 'without ?cast=all she is hidden again and Gabi is picked');
  // Named guys: Jensen is in the roster, hidden, and only rolls with ?cast=all
  const ng = await page.evaluate(() => ({
    ids: GUY_CHARACTERS.map(c => c.id).join(), hidden: GUY_CHARACTERS.every(c => c.hidden === true),
    shape: GUY_CHARACTERS.every(c => typeof c.id === 'string' && typeof c.name === 'string' && c.look && typeof c.notes === 'string' && c.look.hairStyle in HAIR_ART && c.look.outfitKey in GUY_OUTFITS),
    named: NAMED_GUYS.length, jensen: Array.from({ length: 400 }, () => cast.rollGuy().name).filter(n => n === 'Jensen').length,
  }));
  ok(ng.ids === 'jensen' && ng.hidden && ng.shape, 'GUY_CHARACTERS has Jensen, hidden, with valid art ids');
  ok(ng.named === 0 && ng.jensen === 0, 'without ?cast=all Jensen is never tonight\'s guy');
  await page.goto(withQ('cast=all')); await page.waitForTimeout(300);
  const ng2 = await page.evaluate(() => {
    const n = Array.from({ length: 400 }, () => cast.rollGuy().name).filter(n => n === 'Jensen').length;
    const g = GUY_CHARACTERS[0]; cast.guy = { id: g.id, name: g.name, ...g.look }; window.__officeAffair.renderer.buildChar('R');
    return { n, plate: document.getElementById('plateR').textContent, male: !!document.querySelector('#charR .cw[data-male]'),
      rect: document.querySelectorAll('#charR .f-front rect[rx="7"]').length };
  });
  ok(ng2.n > 40 && ng2.n < 170, `with ?cast=all Jensen is tonight's guy about 1 in 4 rounds (${ng2.n}/400)`);
  ok(ng2.plate === 'Jensen' && ng2.male && ng2.rect === 2, 'Jensen draws: name plate, masculine face, rectangular glasses');
  await page.goto(url); await page.waitForTimeout(300);
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));

  // Layout of the picker players see (hidden characters off): one row, nothing cut off, Play on screen
  const layout = async (p, label) => {
    await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    await p.click('#btnPlay'); await p.waitForTimeout(500);
    await p.screenshot({ path: shot(`shot-chars-${label}.png`) });
    const r = await p.evaluate(() => {
      const box = e => e.getBoundingClientRect();
      const grid = document.querySelector('.pick-cards'), panel = document.querySelector('.select-panel'), g = box(grid);
      const cs = [...grid.children].map(box), play = box(document.getElementById('btnStart'));
      return {
        n: cs.length,
        inside: cs.every(c => c.left >= g.left - 0.5 && c.right <= g.right + 0.5),
        oneRow: cs.every(c => Math.abs(c.top - cs[0].top) < 1),
        gridFits: grid.scrollWidth <= grid.clientWidth,
        panelFits: panel.scrollHeight <= panel.clientHeight + 1 && panel.scrollWidth <= panel.clientWidth,
        names: [...grid.querySelectorAll('.pick-name')].every(e => e.scrollWidth <= e.clientWidth + 1),
        play: play.top >= 0 && play.bottom <= innerHeight && play.right <= innerWidth,
        page: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    ok(r.n === 3 && r.inside && r.oneRow && r.gridFits, `${label}: 3 cards in one row inside the panel`);
    ok(r.names, `${label}: no card name is cut off`);
    ok(r.panelFits && r.page, `${label}: panel and page do not overflow`);
    ok(r.play, `${label}: Play is on screen`);
  };
  await layout(page, 'desktop');
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const mp = await ctx.newPage(); mp.on('pageerror', e => errs.push(e.message));
  await layout(mp, 'iphone');
  ok(errs.length === 0, 'no page errors (layout) ' + JSON.stringify(errs));
  await b.close();
})();
