const { chromium } = require('playwright');
const path = require('path');
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html'));
const shot = p => path.resolve(__dirname, 'shots', p);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(url);

  // 1. Tier chances
  const chances = await page.evaluate(() => LEVELS.wednesday.tiers.map(t => t.fake));
  ok(JSON.stringify(chances) === JSON.stringify([0.1, 0.2, 0.35]), `tier bluff chances 0.10/0.20/0.35 (got ${chances.join('/')})`);

  // 2. Drive the state machine over many cycles in each tier (game is on the menu, so no toasts or sounds)
  const sims = await page.evaluate(() => {
    const { game } = window.__officeAffair, m = game.manager, out = [];
    for (const romance of [10, 50, 90]) {
      game.romance = romance; m.reset();
      const log = [];
      m.enter = (s, d, i = {}) => { const before = m.activity; Manager.prototype.enter.call(m, s, d, i); log.push({ s, fake: !!i.fake, kind: i.kind || '', fromFake: !!i.fromFake, before, act: m.activity, hand: m.phoneHand }); };
      for (let n = 0; n < 80000; n++) m.update(0.05);
      delete m.enter;
      let twoInRow = 0, badWatch = 0, badTrans = 0, kindMismatch = 0, phoneAfter = 0, phoneAfterBad = 0, real = 0, fakes = 0, susp = 0, dist = 0, phone = 0, phoneFakes = 0, stretchFakes = 0, lastSusp = null;
      const nxt = { DISTRACTED: ['SUSPICIOUS'], SUSPICIOUS: ['WATCHING', 'DISTRACTED'], WATCHING: ['RETURNING'], RETURNING: ['DISTRACTED'] };
      for (let i = 0; i < log.length; i++) {
        const e = log[i], p = log[i - 1];
        if (p && !nxt[p.s].includes(e.s)) badTrans++;
        if (e.s === 'SUSPICIOUS') {
          susp++;
          if (e.fake) { fakes++; if (lastSusp && lastSusp.fake) twoInRow++; if (e.kind !== (e.before === 'phone' ? 'phone' : 'stretch')) kindMismatch++; e.kind === 'phone' ? phoneFakes++ : stretchFakes++; }
          lastSusp = e;
        }
        if (e.s === 'WATCHING' && !(p && p.s === 'SUSPICIOUS' && !p.fake)) badWatch++;
        if (e.s === 'DISTRACTED' && p && p.s === 'SUSPICIOUS' && !p.fake) badTrans++;
        if (e.s === 'DISTRACTED' && e.fromFake && e.kind === 'phone') { phoneAfter++; if (e.act !== 'phone' || e.hand !== 'left') phoneAfterBad++; }
        if (e.s === 'DISTRACTED' && !e.fromFake) { dist++; if (e.act === 'phone') phone++; if (e.hand !== 'right') phoneAfterBad++; }
      }
      out.push({ romance, n: log.length, susp, fakes, twoInRow, badWatch, badTrans, kindMismatch, phoneAfter, phoneAfterBad, dist, phone, phoneFakes, stretchFakes });
    }
    game.romance = 0; m.reset();
    return out;
  });
  const expect = [0.1, 0.2, 0.35].map(p => p / (1 + p)); // share of SUSPICIOUS phases that are bluffs when two in a row are banned
  sims.forEach((r, i) => {
    console.log(`   tier ${i + 1}: ${r.susp} suspicious, ${r.fakes} bluffs (${r.phoneFakes} phone, ${r.stretchFakes} stretch), phone ${(r.phone / r.dist * 100).toFixed(0)}% of ${r.dist} distracted phases`);
    ok(r.twoInRow === 0, `tier ${i + 1}: never two bluffs in a row`);
    ok(r.badWatch === 0 && r.badTrans === 0, `tier ${i + 1}: valid transitions, WATCHING always after a real SUSPICIOUS`);
    ok(Math.abs(r.fakes / r.susp - expect[i]) < 0.06, `tier ${i + 1}: bluff share ${(r.fakes / r.susp).toFixed(3)} near ${expect[i].toFixed(3)}`);
    ok(r.kindMismatch === 0 && r.phoneFakes > 0 && r.stretchFakes > 0, `tier ${i + 1}: both bluff kinds happen; phone bluff only when on the phone`);
    ok(r.phoneAfter > 0 && r.phoneAfterBad === 0, `tier ${i + 1}: after a phone bluff he stays on the phone, left hand; new activity resets to right`);
  });
  const ph = sims.reduce((a, r) => a + r.phone, 0) / sims.reduce((a, r) => a + r.dist, 0);
  ok(ph > 0.34 && ph < 0.46, `phone is about 40% of distracted phases (${(ph * 100).toFixed(1)}%)`);

  // 3. In-game forced bluffs
  await page.click('#btnPlay'); await page.click('#btnStart');
  await page.waitForTimeout(3300);
  ok(await page.evaluate(() => game.state) === 'PLAYING', 'game is playing');
  await page.evaluate(() => {
    window.__toasts = []; const t = ui.toast.bind(ui); ui.toast = (msg, ...a) => { window.__toasts.push(msg); t(msg, ...a); };
    window.__hmm = 0; const h = sfx.hmm.bind(sfx); sfx.hmm = () => { window.__hmm++; h(); };
    window.__savedFake = LEVELS.wednesday.tiers.map(t => t.fake);
  });
  const view = () => page.evaluate(() => {
    const shown = id => { for (let n = document.getElementById(id); n && n.id !== 'scene'; n = n.parentElement) if (getComputedStyle(n).display === 'none') return false; return true; };
    const m = game.manager;
    return { st: m.state, fake: m.fake, kind: m.fakeKind, act: m.activity, hand: m.phoneHand, strikes: game.strikes, kiss: game.kissingNow,
      fakeIcon: shown('fakeIcon'), warnIcon: shown('warnIcon'), back: shown('mgrBack'), side: shown('mgrSide'), cone: shown('cone'),
      phoneR: shown('actPhone'), phoneL: shown('actPhoneL'), stretch: shown('actStretchArms') };
  });
  const box = await page.locator('#mgr').boundingBox();
  const clip = { x: box.x - 120, y: box.y - 140, width: box.width + 240, height: box.height + 200 };

  // Phone bluff: on the phone (right hand), bluff forced through advance()
  await page.evaluate(() => {
    const m = game.manager; m.enter('DISTRACTED', 999, {}); m.activity = 'phone'; m.phoneHand = 'right'; m.lastFake = false;
    LEVELS.wednesday.tiers.forEach(t => { t.fake = 1; });
    m.advance(); m.dur = 2.4;
    LEVELS.wednesday.tiers.forEach((t, i) => { t.fake = window.__savedFake[i]; });
  });
  await page.keyboard.down('Shift');
  let v = await view();
  ok(v.st === 'SUSPICIOUS' && v.fake && v.kind === 'phone', 'phone bluff starts when he is on the phone');
  await page.waitForTimeout(150);
  v = await view();
  ok(v.fakeIcon && !v.warnIcon && v.back && !v.side && !v.cone, 'phone bluff: dashed ? icon, back view, no ! and no cone');
  ok(v.phoneR && !v.phoneL, 'phone bluff starts with the right-hand phone');
  await page.waitForTimeout(800); // ~40% in: phone lowered
  await page.screenshot({ path: shot('bluff-phone-lowered.png'), clip });
  v = await view();
  ok(v.phoneR && !v.phoneL && v.fakeIcon, 'phone bluff middle: right-hand phone lowered, ? still shown');
  await page.waitForTimeout(900); // ~80% in: left ear
  await page.screenshot({ path: shot('bluff-phone-left.png'), clip });
  v = await view();
  ok(v.phoneL && !v.phoneR && v.fakeIcon && v.st === 'SUSPICIOUS', 'phone bluff end: phone at the left ear, ? still shown');
  await page.waitForTimeout(700);
  v = await view();
  ok(v.st === 'DISTRACTED' && v.act === 'phone' && v.hand === 'left' && v.phoneL && !v.phoneR && !v.fakeIcon, 'after phone bluff: still on the phone, left hand');
  await page.screenshot({ path: shot('bluff-phone-after.png'), clip });
  ok(v.strikes === 0 && v.kiss, 'kissing through the phone bluff: no strike');
  let toasts = await page.evaluate(() => window.__toasts);
  ok(toasts.includes('False alarm. He switched ears.'), 'phone bluff toast: "False alarm. He switched ears."');
  ok(await page.evaluate(() => window.__hmm) === 1, 'phone bluff plays the hmm sound');

  // Next suspicious phase is never a bluff, even at 100% chance: real turn shows ! and the side head
  await page.evaluate(() => {
    LEVELS.wednesday.tiers.forEach(t => { t.fake = 1; });
    game.manager.advance(); game.manager.dur = 999;
    LEVELS.wednesday.tiers.forEach((t, i) => { t.fake = window.__savedFake[i]; });
  });
  await page.keyboard.up('Shift');
  await page.waitForTimeout(150);
  v = await view();
  ok(v.st === 'SUSPICIOUS' && !v.fake && v.warnIcon && !v.fakeIcon && v.side && !v.back, 'real turn right after a bluff: solid ! and side-profile head');
  await page.screenshot({ path: shot('bluff-real-turn.png'), clip });

  // Stretch bluff: not on the phone
  await page.evaluate(() => {
    const m = game.manager; m.enter('DISTRACTED', 999, {}); m.activity = 'coffee'; m.lastFake = false;
    LEVELS.wednesday.tiers.forEach(t => { t.fake = 1; });
    m.advance(); m.dur = 1.2;
    LEVELS.wednesday.tiers.forEach((t, i) => { t.fake = window.__savedFake[i]; });
  });
  await page.keyboard.down('Shift');
  await page.waitForTimeout(400);
  v = await view();
  ok(v.st === 'SUSPICIOUS' && v.fake && v.kind === 'stretch', 'stretch bluff when not on the phone');
  ok(v.fakeIcon && !v.warnIcon && v.back && !v.side && v.stretch && !v.cone, 'stretch bluff: dashed ?, back view, arms up');
  await page.screenshot({ path: shot('bluff-stretch.png'), clip });
  await page.waitForTimeout(1000);
  v = await view();
  ok(v.st === 'DISTRACTED' && !v.fakeIcon && !v.stretch, 'stretch bluff ends back to distracted');
  ok(v.strikes === 0 && v.kiss, 'kissing through the stretch bluff: no strike');
  await page.keyboard.up('Shift');
  toasts = await page.evaluate(() => window.__toasts);
  ok(toasts.includes('False alarm. Just a stretch.'), 'stretch bluff toast kept');

  // Kissing through many natural bluffs: hold Shift only while a bluff is on, never a strike
  const res = await page.evaluate(() => new Promise(done => {
    const { game, player } = window.__officeAffair, m = game.manager;
    const tiers = LEVELS.wednesday.tiers, saved = tiers.map(t => ({ fake: t.fake, distracted: t.distracted, watching: t.watching }));
    tiers.forEach(t => { t.fake = 0.9; t.distracted = [0.4, 0.6]; t.watching = [0.3, 0.4]; });
    game.romance = 50; m.enter('DISTRACTED', 0.2, {});
    let seen = 0, kissedTicks = 0, wasFake = false, kinds = {};
    const iv = setInterval(() => {
      const bluff = m.state === 'SUSPICIOUS' && m.fake;
      if (bluff) player.press('test'); else player.release('test');
      if (bluff && !wasFake) { seen++; kinds[m.fakeKind] = 1; }
      if (bluff && game.kissingNow) kissedTicks++;
      wasFake = bluff;
    }, 10);
    setTimeout(() => {
      clearInterval(iv); player.release('test');
      tiers.forEach((t, i) => Object.assign(t, saved[i]));
      done({ seen, kissedTicks, kinds: Object.keys(kinds), strikes: game.strikes, state: game.state });
    }, 15000);
  }));
  console.log(`   natural bluffs kissed through: ${res.seen} (${res.kinds.join(', ')}), kissing ticks ${res.kissedTicks}`);
  ok(res.seen >= 2 && res.kissedTicks > 50 && res.strikes === 0 && res.state === 'PLAYING', 'kissing during natural bluffs never causes a strike');

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
})();
