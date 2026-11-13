'use strict';
/* Game: lifecycle, finite-state machine */

class Game {
  constructor() {
    this.state = S.MENU; this.resumeTo = null;
    this.levelId = STORY.id;   // best scores are saved per story: best.<story id>
    this.modeId = DEFAULT_MODE;
    this.buildRules();
    this.manager = new Manager(this);
    this.resetValues();
  }
  resetValues() {
    this.romance = 0; this.timeLeft = this.rules.duration; this.strikes = 0;
    this.freezeT = 0; this.watchedMs = 0; this.wasKissing = false; this.kissingNow = false;
    this.cdT = 0; this.lastCd = null; this.endT = 0; this.result = null; this.lastSec = 999; this.said50 = false; this.said85 = false;
    lives.onRoundStart(this); streak.onRoundStart(this);
  }
  // This round's rules: a shallow copy of the active mode (tiers, lives and streak objects are shared, not copied).
  buildRules() { this.rules = { ...MODES[this.modeId], id: this.modeId }; }
  get level() { return this.rules; }   // old name
  setState(s) { this.state = s; document.body.dataset.state = s; }
  tier() { const t = this.rules.tiers; return t.find(x => this.romance < x.until) || t[t.length - 1]; }

  start() {
    sfx.unlock();
    cast.rollGuy();            // a new random guy every round
    renderer.buildChar('R');
    this.buildRules();
    this.resetValues();
    this.manager.reset();
    player.clear();
    renderer.reset();
    ui.reset();
    confetti.clear();
    ui.showOverlay(null);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    this.cdT = 3; this.lastCd = null;
    this.setState(S.COUNTDOWN);
  }
  pause() {
    if (this.state !== S.PLAYING && this.state !== S.COUNTDOWN) return;
    this.resumeTo = this.state;
    this.setState(S.PAUSED);
    player.clear(); streak.reset(this);
    $('pauseTo').textContent = cast.girlName();
    ui.showOverlay('pause');
  }
  resume() {
    if (this.state !== S.PAUSED) return;
    player.clear();
    ui.showOverlay(null);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (this.resumeTo === S.COUNTDOWN) { this.cdT = 3; this.lastCd = null; }
    this.setState(this.resumeTo || S.PLAYING);
  }
  toMenu() {
    this.setState(S.MENU);
    this.resetValues(); this.manager.reset(); player.clear(); renderer.reset(); ui.reset(); confetti.clear();
    ui.showBest();
    ui.showOverlay('menu');
  }

  update(dt) {
    switch (this.state) {
      case S.COUNTDOWN: {
        this.cdT -= dt;
        const n = Math.ceil(this.cdT);
        if (n > 0 && n !== this.lastCd) { this.lastCd = n; ui.countdown(String(n)); sfx.count(false); }
        if (this.cdT <= 0) {
          ui.countdown('GO!'); sfx.count(true);
          this.setState(S.PLAYING);
          setTimeout(() => { if (this.state === S.PLAYING) ui.toast(COPY.toasts.distracted, '', 1, 1600); }, 650);
        }
        break;
      }
      case S.PLAYING: this.updatePlaying(dt); break;
      case S.WON:
      case S.LOST:
        if (this.endT > 0) { this.endT -= dt; if (this.endT <= 0) ui.showResult(this.result); }
        break;
    }
  }

  updatePlaying(dt) {
    // Caught freeze: the whole office stops for a beat
    if (this.freezeT > 0) {
      this.freezeT -= dt;
      this.kissingNow = false;
      if (this.freezeT <= 0) {
        if (this.lives <= 0) { this.end('hr'); return; }
        this.manager.enter(M.DISTRACTED, rand(...this.tier().distracted), { afterCaught: true });
      }
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.manager.update(dt);

    const kissing = player.wantsKiss;
    if (kissing && !this.wasKissing) sfx.smooch();
    if (!kissing && this.wasKissing) this.onStopKiss();
    this.wasKissing = kissing;
    this.kissingNow = kissing;

    // Detection: 150 ms of continuous kissing while watched = strike
    if (this.manager.unsafe && kissing) {
      this.watchedMs += dt * 1000;
      if (this.watchedMs >= CONFIG.detectMs) { this.caught(); return; }
    } else {
      this.watchedMs = 0;
    }

    // Streak (js/streak.js) sets the multiplier and love points and says how fast the meter fills
    const fill = streak.onKissFrame(this, dt, kissing);
    if (kissing) this.romance = Math.min(100, this.romance + this.rules.romanceRate * fill * dt);
    lives.onRomance(this);

    if (!this.said50 && this.romance >= 50) { this.said50 = true; ui.toast(COPY.toasts.halfway, 'love', 1); }
    if (!this.said85 && this.romance >= 85) { this.said85 = true; ui.toast(COPY.toasts.almost, 'love', 1); }

    if (this.romance >= 100) { this.end('win'); return; }
    if (this.timeLeft <= 0) { this.end('time'); return; }

    const sec = Math.ceil(this.timeLeft);
    if (sec !== this.lastSec) { this.lastSec = sec; if (sec <= 10) sfx.tick(); }
  }

  onStopKiss() {
    renderer.actNatural();
    const m = this.manager;
    if (this.watchedMs > 0) ui.toast(COPY.toasts.escaped, 'love', 2);
    else if (m.state === M.SUSPICIOUS && !m.fake && this.rules.warningToasts) ui.toast(COPY.toasts.actNatural, 'warn', 2);
  }

  onManager(state, prev, info) {
    if (this.state !== S.PLAYING) return;
    if (state === M.SUSPICIOUS) {
      if (info.fake) sfx.hmm();
      else { sfx.warn(); if (this.rules.warningToasts) ui.toast(COPY.toasts.watching, 'warn', 2, 1300); }
    } else if (state === M.DISTRACTED) {
      if (info.fromFake) ui.toast(info.kind === 'phone' ? COPY.toasts.falseAlarmPhone : COPY.toasts.falseAlarmStretch, '', 1, 1400);
      else if (!info.afterCaught && prev === M.RETURNING) ui.toast(COPY.toasts.distracted, '', 1, 1300);
    }
  }

  gainLife() { lives.gain(this); }

  caught() {
    this.strikes++;
    const out = lives.onCaught(this);
    this.watchedMs = 0; this.wasKissing = false; this.kissingNow = false;
    streak.reset(this);
    player.lock();
    this.freezeT = CONFIG.freeze;
    renderer.caught();
    sfx.caught();
    ui.toast(out ? COPY.toasts.caughtOut : pick(COPY.toasts.caught), 'alarm', 3, 1500);
  }

  end(kind) {
    this.wasKissing = false; this.kissingNow = false;
    streak.reset(this);
    player.clear();
    const r = { kind, romance: this.romance, timeLeft: this.timeLeft, strikes: this.strikes, level: this.level };
    if (kind === 'win') {
      this.setState(S.WON);
      // Long streaks score more love points; harder levels add a bonus. The score picks the ending.
      const sc = CONFIG.score;
      r.score = Math.max(0, Math.round(this.lovePoints + this.timeLeft * sc.perSecondLeft - this.strikes * sc.perCatch + this.rules.scoreBonus));
      r.ending = CONFIG.endings.find(x => r.score >= x.min).key;
      const key = 'best.' + this.levelId;
      const best = store.get(key, null);
      // Bests saved before endings (with a rank) used another scale, so they are replaced.
      if (!best || !best.ending || r.score > best.score) {
        r.newBest = true;
        store.set(key, { score: r.score, ending: r.ending, timeLeft: Math.ceil(r.timeLeft), strikes: r.strikes });
      }
      r.best = store.get(key, null);
      renderer.win(); sfx.win(); confetti.start(3.2);
      ui.toast(COPY.toasts.win, 'love', 3, 2200);
      this.endT = 2.0;
    } else {
      this.setState(S.LOST);
      renderer.lose(kind); sfx.lose();
      if (kind === 'time') ui.toast(COPY.toasts.timeUp, '', 3, 2000);
      this.endT = 1.5;
    }
    this.result = r;
  }
}
