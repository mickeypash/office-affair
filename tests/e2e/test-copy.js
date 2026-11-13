const path = require('path');
const { chromium } = require('playwright');
// Gabi and Vix live in the office story; these suites test it whatever the default story is.
const url = process.env.GAME_URL || ('file://' + path.resolve(__dirname, '../../index.html') + '?story=office');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300);

  // The table
  const t = await page.evaluate(() => {
    const leaves = (o, p = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) ? leaves(v, p + k + '.') : [[p + k, v]]);
    const all = leaves(COPY_DEFAULT);
    return {
      same: COPY === COPY_DEFAULT || JSON.stringify(COPY) === JSON.stringify(COPY_DEFAULT),
      empty: all.filter(([, v]) => Array.isArray(v) ? !v.length || v.some(s => typeof s !== 'string' || !s.trim()) : typeof v !== 'string' || !v.trim()).map(([k]) => k),
      endings: CONFIG.endings.length === 3 && CONFIG.endings.every(({ key: k }) => COPY.endings[k] && ['name', 'title', 'stamp', 'to', 'from', 're', 'sub'].every(f => COPY.endings[k][f])),
      endingObjs: Object.keys(ENDINGS).every(k => ENDINGS[k].name === COPY.endings[k].name && typeof ENDINGS[k].sub === 'string' && ENDINGS[k].icon),
    };
  });
  ok(t.same, 'the office story uses the default copy');
  ok(t.empty.length === 0, 'no empty lines in the copy table ' + JSON.stringify(t.empty));
  ok(t.endings && t.endingObjs, 'every ending has its words, and ENDINGS picks them up');

  // Static text in index.html comes from the table
  const s = await page.evaluate(() => ({
    title: [...document.querySelectorAll('#gameTitle span')].map(e => e.textContent).join(' '),
    tagline: document.querySelector('.subtitle').textContent, kiss: document.querySelector('[data-copy-html="menu.howtoKiss"]').innerHTML,
    boss: document.querySelector('[data-copy="menu.howtoBoss"]').textContent, select: document.getElementById('selectTitle').textContent,
    pause: document.querySelector('#pause .memo').textContent.replace(/\s+/g, ' '),
    blank: [...document.querySelectorAll('[data-copy], [data-copy-html]')].filter(e => !e.textContent.trim()).map(e => e.dataset.copy || e.dataset.copyHtml),
  }));
  ok(s.title === 'OFFICE AFFAIR' && s.tagline === 'Love is a full-time job.', 'menu title and tagline');
  ok(s.kiss === 'Hold <b>Space</b>, <b>Shift</b> or the mouse to kiss.' && s.boss === 'Let go before the boss turns around.', 'how-to lines (the first keeps its bold keys)');
  ok(s.select === "Who's clocking in?", 'picker title');
  ok(s.pause.includes('FROM: The break room') && s.pause.includes('RE: Coffee break') && s.pause.includes('Paused') && s.pause.includes("The boss can't see you. Probably."), 'pause memo');
  ok(s.blank.length === 0, 'every data-copy element got text ' + JSON.stringify(s.blank));

  // Helpers
  const h = await page.evaluate(() => {
    const over = buildCopy(COPY_DEFAULT, { toasts: { win: 'Ship it.', caught: ['Busted.'] }, menu: { title: ['GPU', 'LOVE'] } });
    return {
      win: over.toasts.win, kept: over.toasts.timeUp === COPY_DEFAULT.toasts.timeUp && over.endings === COPY_DEFAULT.endings,
      list: over.toasts.caught.join(), title: over.menu.title.join(' '), tagline: over.menu.tagline === COPY_DEFAULT.menu.tagline,
      untouched: COPY_DEFAULT.toasts.win === 'Love wins. Productivity loses.' && COPY_DEFAULT.toasts.caught.length === 4,
      none: buildCopy(COPY_DEFAULT, undefined) === COPY_DEFAULT,
      fill: fill('{girl} & {guy}, {other}', { girl: 'A', guy: '{girl}' }),
      head: memoHead({ to: '{girl} & {guy}', from: 'X', re: 'just {girl}' }, { girl: 'Zo <3', guy: 'B"' }),
    };
  });
  ok(h.win === 'Ship it.' && h.kept && h.tagline, 'a story override changes only the lines it names');
  ok(h.list === 'Busted.' && h.title === 'GPU LOVE', 'an override list replaces the whole list');
  ok(h.untouched && h.none, 'the defaults are never changed; no override gives the defaults');
  ok(h.fill === 'A & {girl}, {other}', 'fill() replaces names once and leaves unknown {keys}');
  ok(h.head === '<div><b>TO:</b> Zo &lt;3 &amp; B&quot;</div><div><b>FROM:</b> X</div><div><b>RE:</b> just Zo &lt;3</div>', 'memoHead() escapes names and text');

  // A real round uses the table: the toast after GO! and the win memo
  await page.click('#btnPlay'); await page.click('#btnStart'); await page.waitForTimeout(4300);
  ok((await page.textContent('#toast')).includes('The boss is distracted...'), 'first toast comes from COPY.toasts.distracted');
  await page.evaluate(() => { const g = window.__officeAffair.game; g.romance = 99.9; g.manager.enter('DISTRACTED', 999, {}); });
  await page.keyboard.down('Shift'); await page.waitForTimeout(200); await page.keyboard.up('Shift'); await page.waitForTimeout(2300);
  const memo = await page.evaluate(() => ({ head: document.getElementById('resultHead').textContent, sub: document.getElementById('resultSub').textContent,
    ending: document.getElementById('resultEnding').textContent, guy: cast.guyName() }));
  ok(memo.head.includes('TO: Gabi & ' + memo.guy) && !/[{}]/.test(memo.head + memo.sub + memo.ending), 'win memo is filled (no {placeholders} left)');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})();
