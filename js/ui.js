'use strict';
/* UI: HUD, menus, results, toasts */
const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 9l6 6M22 9l-6 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
const CHANCE_SVG = '<svg class="chance" viewBox="-18 -24 36 34" aria-hidden="true"><path class="fillp" d="M0 8 C -4 4 -16 -2 -16 -10 C -16 -17 -10 -21 -5 -21 C -2 -21 0 -19 0 -16 C 0 -19 2 -21 5 -21 C 10 -21 16 -17 16 -10 C 16 -2 4 4 0 8 Z" fill="#FF4F86" stroke="#2B2340" stroke-width="3" stroke-linejoin="round"/><path class="crack" d="M0 -16 L-4 -8 L3 -3 L-2 6" fill="none" stroke="#2B2340" stroke-width="3" stroke-linejoin="round"/></svg>';

// Win endings, keyed by CONFIG.endings. sub gets the plain names; re gets the girl's name already escaped for HTML.
const INK_LINE = 'stroke="#2B2340" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const ENDINGS = {
  drinks: {
    n: 1, name: 'Drinks with the boss', title: 'THE BOSS IS BUYING', stamp: 'AWKWARD',
    from: 'Your boss', re: g => `Drinks after work (just ${g})`,
    sub: (g, b) => `The boss asked ${g} out for drinks. ${b} went home alone.`,
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 9h34L24 27Z" fill="#E9F6FA" ${INK_LINE}/><path d="M12.5 14h23L24 27Z" fill="#FF8FAB"/><path d="M7 9h34L24 27Z" fill="none" ${INK_LINE}/><path d="M24 27v13M15 42h18" fill="none" ${INK_LINE}/><path d="M31 3 21 18" fill="none" ${INK_LINE} stroke-width="2.5"/><circle cx="22.5" cy="15.5" r="4" fill="#7DBA4A" ${INK_LINE} stroke-width="2.5"/></svg>`,
  },
  rose: {
    n: 2, name: 'A rose at 7', title: "IT'S A DATE!", stamp: '7:00 PM',
    from: 'Department of Hearts', re: () => 'Leaving together at 7 pm',
    sub: (g, b) => `${g} & ${b} left together at 7 pm. ${b} brought a rose.`,
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 25c0 7-1 12 0 19" fill="none" stroke="#2B2340" stroke-width="7" stroke-linecap="round"/><path d="M24 25c0 7-1 12 0 19" fill="none" stroke="#5DB58C" stroke-width="3" stroke-linecap="round"/><path d="M24 35c4-5 10-6 13-4-3 5-9 6-13 4Z" fill="#5DB58C" ${INK_LINE} stroke-width="2.5"/><path d="M12 12c4-3 8-2 12 1 4-3 8-4 12-1 1 9-4 15-12 15S11 21 12 12Z" fill="#E8364F" ${INK_LINE}/><path d="M18 13c3-3 9-3 10 1 1 4-4 5-6 3m-4-4c-1 4 2 8 7 8" fill="none" ${INK_LINE} stroke-width="2.2"/></svg>`,
  },
  concert: {
    n: 3, name: 'Concert night', title: 'FRONT ROW!', stamp: 'ENCORE!',
    from: 'Department of Hearts', re: () => 'Two tickets, tonight',
    sub: (g, b) => `${g} & ${b} are off to a concert. Two tickets, no boss.`,
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><g transform="rotate(-14 24 28)"><path d="M7 18h34v6a4 4 0 0 0 0 8v6H7v-6a4 4 0 0 0 0-8Z" fill="#FFC23A" ${INK_LINE}/><path d="M32 19v18" fill="none" stroke="#2B2340" stroke-width="2" stroke-dasharray="3 3"/><path d="M15 34V24l9-2v10" fill="none" ${INK_LINE} stroke-width="2.5"/><ellipse cx="13" cy="34" rx="3" ry="2.4" fill="#2B2340"/><ellipse cx="22" cy="32" rx="3" ry="2.4" fill="#2B2340"/></g><path d="M37 13V3l6 3" fill="none" ${INK_LINE} stroke-width="2.5"/><ellipse cx="34.5" cy="13" rx="3" ry="2.4" fill="#FF4F86" ${INK_LINE} stroke-width="2"/></svg>`,
  },
};
const fmtPts = n => Math.round(n).toLocaleString('en-US');

const ui = {
  el: {},
  init() {
    ['hud', 'controls', 'stage', 'meter', 'meterFill', 'meterPct', 'meterHeart', 'timer', 'timerText', 'strikes', 'btnSoundHud', 'btnPause',
      'toast', 'countdown', 'menu', 'pause', 'result', 'btnPlay', 'btnSoundMenu', 'bestLine', 'btnResume', 'btnRestart', 'btnQuit',
      'btnAgain', 'btnMenu', 'resultHead', 'resultTitle', 'resultSub', 'resultEnding', 'resultStats', 'resultStamp', 'kissBtn']
      .forEach(id => { this.el[id] = $(id); });
    this.el.strikes.innerHTML = CHANCE_SVG.repeat(game.rules.lives.max);
    this.shownRomance = 0; this.lastPct = -1; this.lastTime = ''; this.lastTimerCls = ''; this.lastPulse = 0; this.toastTimer = null; this.toastPri = 0;
    this.syncSound();
    this.showBest();
    this.reset();
  },
  syncSound() {
    const on = sfx.enabled;
    this.el.btnSoundHud.innerHTML = on ? ICON_SOUND_ON : ICON_SOUND_OFF;
    this.el.btnSoundHud.setAttribute('aria-label', on ? 'Sound on. Turn off' : 'Sound off. Turn on');
    this.el.btnSoundMenu.textContent = on ? 'Sound: on' : 'Sound: off';
    this.el.btnSoundMenu.setAttribute('aria-pressed', String(on));
  },
  showBest() {
    const b = store.get('best.' + game.levelId, null);
    const end = b && ENDINGS[b.ending];
    this.el.bestLine.textContent = end ? `Best: ${end.name}, ${fmtPts(b.score)} pts` : '';
  },
  reset() {
    this.shownRomance = 0; this.lastPct = -1; this.lastTime = ''; this.lastPulse = 0;
    // Start lives are filled; the rest are dashed outlines until earned
    const start = game.rules.lives.start;
    this.el.strikes.querySelectorAll('.chance').forEach((c, i) => { c.classList.remove('lost', 'flash', 'gain'); c.classList.toggle('empty', i >= start); });
    this.livesLabel(start);
    this.el.countdown.innerHTML = '';
    this.hideToast(true);
  },
  update(dt, g) {
    // romance meter (smoothed)
    this.shownRomance += (g.romance - this.shownRomance) * (1 - Math.exp(-10 * dt));
    if (Math.abs(g.romance - this.shownRomance) < 0.05) this.shownRomance = g.romance;
    this.el.meterFill.style.transform = `scaleX(${(this.shownRomance / 100).toFixed(4)})`;
    const pct = Math.floor(g.romance);
    if (pct !== this.lastPct) {
      this.el.meterPct.textContent = pct + '%';
      this.el.meter.setAttribute('aria-valuenow', String(pct));
      if (pct > this.lastPct && this.lastPct >= 0 && Math.floor(pct / 4) !== Math.floor(this.lastPulse / 4)) {
        const h = this.el.meterHeart; h.classList.remove('pulse'); void h.getBoundingClientRect(); h.classList.add('pulse');
        this.lastPulse = pct;
      }
      this.lastPct = pct;
    }
    // timer
    const txt = fmtTime(g.timeLeft);
    if (txt !== this.lastTime) { this.el.timerText.textContent = txt; this.lastTime = txt; }
    const cls = g.timeLeft <= 10 ? 'red' : g.timeLeft <= 20 ? 'amber' : '';
    if (cls !== this.lastTimerCls) { this.el.timer.className = 'timer ' + cls; this.lastTimerCls = cls; }
    // kiss button pressed look
    this.el.kissBtn.classList.toggle('pressed', player.holding && (g.state === S.PLAYING || g.state === S.COUNTDOWN));
  },
  livesLabel(n) { this.el.strikes.setAttribute('aria-label', n === 1 ? '1 life' : `${n} lives`); },
  // Hearts always read left to right: filled (current lives), then cracked (lost), then dashed (not earned yet).
  arrangeLives(filled, lost, anim) {
    [...this.el.strikes.querySelectorAll('.chance')].forEach((c, i) => {
      c.classList.remove('lost', 'empty', 'flash', 'gain');
      if (i >= filled + lost) c.classList.add('empty');
      else if (i >= filled) c.classList.add('lost');
      if (anim === 'gain' && i === filled - 1 && !REDUCED) { void c.getBoundingClientRect(); c.classList.add('gain'); }
      if (anim === 'flash' && i === filled) c.classList.add('flash');
    });
  },
  lifeCounts() {
    const all = [...this.el.strikes.querySelectorAll('.chance')];
    const lost = all.filter(c => c.classList.contains('lost')).length, empty = all.filter(c => c.classList.contains('empty')).length;
    return { filled: all.length - lost - empty, lost };
  },
  loseLife(n) {
    const { filled, lost } = this.lifeCounts();
    if (filled > 0) this.arrangeLives(filled - 1, lost + 1, 'flash');
    this.livesLabel(n);
  },
  gainLife(n) {
    // Use a slot not yet earned if there is one, otherwise heal a cracked heart.
    const { filled, lost } = this.lifeCounts();
    const slots = this.el.strikes.querySelectorAll('.chance').length;
    if (filled + lost < slots) this.arrangeLives(filled + 1, lost, 'gain');
    else if (lost > 0) this.arrangeLives(filled + 1, lost - 1, 'gain');
    this.livesLabel(n);
  },
  toast(msg, kind = '', pri = 1, ms = 1700) {
    if (this.toastTimer && pri < this.toastPri) return;
    const t = this.el.toast;
    t.textContent = msg; t.className = 'show ' + kind;
    this.toastPri = pri;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.hideToast(), ms);
  },
  hideToast(now) {
    clearTimeout(this.toastTimer); this.toastTimer = null; this.toastPri = 0;
    this.el.toast.className = now ? '' : this.el.toast.className.replace('show', '').trim();
  },
  countdown(v) {
    const span = document.createElement('span');
    span.textContent = v;
    if (v === 'GO!') span.className = 'go';
    this.el.countdown.innerHTML = '';
    this.el.countdown.appendChild(span);
    if (v === 'GO!') setTimeout(() => { if (span.parentNode) span.remove(); }, 900);
  },
  showOverlay(name) {
    ['menu', 'select', 'pause', 'result', 'customise'].forEach(n => $(n).classList.toggle('show', n === name));
    document.body.classList.toggle('customising', name === 'customise' || name === 'select');
    if (typeof layout === 'function') layout();
    const focusMap = { menu: 'btnPlay', pause: 'btnResume', result: 'btnAgain', select: 'btnStart', customise: 'custDone' };
    if (name && focusMap[name]) setTimeout(() => $(focusMap[name]).focus({ preventScroll: true }), 30);
  },
  showResult(r) {
    const e = this.el;
    const rows = [];
    if (r.kind === 'win') {
      const end = ENDINGS[r.ending], g = cast.girlName(), b = cast.guyName();
      e.resultHead.innerHTML = `<div><b>TO:</b> ${esc(g)} &amp; ${esc(b)}</div><div><b>FROM:</b> ${end.from}</div><div><b>RE:</b> ${end.re(esc(g))}</div>`;
      e.resultTitle.textContent = end.title;
      e.resultSub.textContent = end.sub(g, b);
      e.resultEnding.innerHTML = `${end.icon}<div><small>Ending ${end.n} of 3</small>${end.name}` + (r.newBest ? '<span class="newbest">New best</span>' : '') + '</div>';
      e.resultEnding.style.display = '';
      rows.push(['Time remaining', fmtTime(r.timeLeft)], ['Times caught', String(r.strikes)], ['Score', `${fmtPts(r.score)} pts`]);
      const bestEnd = r.best && ENDINGS[r.best.ending];
      if (bestEnd) rows.push(['Best result', `${bestEnd.name}, ${fmtPts(r.best.score)} pts`]);
      e.resultStamp.textContent = end.stamp; e.resultStamp.className = 'stamp';
    } else if (r.kind === 'hr') {
      e.resultHead.innerHTML = `<div><b>TO:</b> ${esc(cast.girlName())}</div>` + '<div><b>FROM:</b> Human Resources</div><div><b>RE:</b> Mandatory meeting, 9 am</div>';
      e.resultTitle.textContent = 'MEETING WITH HR 📋';
      e.resultSub.textContent = 'Your workplace conduct is under review.';
      e.resultEnding.style.display = 'none';
      rows.push(['Final romance', `${Math.floor(r.romance)}%`], ['Times caught', String(r.strikes)], ['Time remaining', fmtTime(r.timeLeft)]);
      e.resultStamp.textContent = 'UNDER REVIEW'; e.resultStamp.className = 'stamp red';
    } else {
      e.resultHead.innerHTML = '<div><b>TO:</b> All staff</div><div><b>FROM:</b> Facilities</div><div><b>RE:</b> Building closes at 5 pm</div>';
      e.resultTitle.textContent = 'CLOCKED OUT 💔';
      e.resultSub.textContent = 'Another day, another missed connection.';
      e.resultEnding.style.display = 'none';
      rows.push(['Final romance', `${Math.floor(r.romance)}%`], ['Times caught', String(r.strikes)]);
      e.resultStamp.textContent = '5:00 PM'; e.resultStamp.className = 'stamp red';
    }
    e.resultStats.innerHTML = rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('');
    this.showOverlay('result');
  },
};
