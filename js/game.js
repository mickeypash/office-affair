'use strict';
/* Game: lifecycle, finite-state machine */
const RANKS = [
  { min: 1400, rank: 'S-Rank', title: 'Corporate Casanova' },
  { min: 1150, rank: 'A-Rank', title: 'Office Heartthrob' },
  { min: 900,  rank: 'B-Rank', title: 'Romantic Intern' },
  { min: -1e9, rank: 'C-Rank', title: 'HR Liability' },
];
const CAUGHT_LINES = ['HR would like a word.', "That spreadsheet won't save you.", 'HR would like a word.', 'Caught red-lipped!'];

class Game {
  constructor() {
    this.state = S.MENU; this.resumeTo = null;
    this.levelId = LEVELS[store.get('level', DEFAULT_LEVEL)] ? store.get('level', DEFAULT_LEVEL) : DEFAULT_LEVEL;
    // Older versions kept one best score. Treat it as the Wednesday (normal) best.
    const legacy = store.get('best', null);
    if (legacy && !store.get('best.wednesday', null)) store.set('best.wednesday', legacy);
    this.manager = new Manager(this);
    this.resetValues();
  }
  resetValues() {
    this.romance = 0; this.timeLeft = this.level.duration; this.strikes = 0;
    this.freezeT = 0; this.watchedMs = 0; this.wasKissing = false; this.kissingNow = false;
    this.cdT = 0; this.lastCd = null; this.endT = 0; this.result = null; this.lastSec = 999; this.said50 = false; this.said85 = false;
  }
  get level() { return LEVELS[this.levelId]; }
  setLevel(id) { if (LEVELS[id]) { this.levelId = id; store.set('level', id); if (this.state === S.MENU) this.timeLeft = this.level.duration; } }
  setState(s) { this.state = s; document.body.dataset.state = s; }
  tier() { const t = this.level.tiers; return t.find(x => this.romance < x.until) || t[t.length - 1]; }

  start() {
    sfx.unlock();
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
    player.clear();
    $('pauseTo').textContent = cast.fullName('player');
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
          setTimeout(() => { if (this.state === S.PLAYING) ui.toast('The boss is distracted...', '', 1, 1600); }, 650);
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
        if (this.strikes >= CONFIG.maxStrikes) { this.end('hr'); return; }
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

    if (kissing) this.romance = Math.min(100, this.romance + this.level.romanceRate * dt);

    if (!this.said50 && this.romance >= 50) { this.said50 = true; ui.toast('Halfway there. Keep it professional.', 'love', 1); }
    if (!this.said85 && this.romance >= 85) { this.said85 = true; ui.toast('So close. The boss is getting twitchy.', 'love', 1); }

    if (this.romance >= 100) { this.end('win'); return; }
    if (this.timeLeft <= 0) { this.end('time'); return; }

    const sec = Math.ceil(this.timeLeft);
    if (sec !== this.lastSec) { this.lastSec = sec; if (sec <= 10) sfx.tick(); }
  }

  onStopKiss() {
    renderer.actNatural();
    const m = this.manager;
    if (this.watchedMs > 0) ui.toast('Unprofessional. Impressive.', 'love', 2);
    else if (m.state === M.SUSPICIOUS && !m.fake) ui.toast('Act natural!', 'warn', 2);
  }

  onManager(state, prev, info) {
    if (this.state !== S.PLAYING) return;
    if (state === M.SUSPICIOUS) {
      if (info.fake) sfx.hmm();
      else { sfx.warn(); ui.toast("Uh-oh. Someone's watching.", 'warn', 2, 1300); }
    } else if (state === M.DISTRACTED) {
      if (info.fromFake) ui.toast('False alarm. Just a stretch.', '', 1, 1400);
      else if (!info.afterCaught && prev === M.RETURNING) ui.toast('The boss is distracted...', '', 1, 1300);
    }
  }

  caught() {
    this.strikes++;
    this.watchedMs = 0; this.wasKissing = false; this.kissingNow = false;
    player.lock();
    this.freezeT = CONFIG.freeze;
    renderer.caught();
    sfx.caught();
    ui.strike(this.strikes);
    ui.toast(this.strikes >= CONFIG.maxStrikes ? 'HR would like a word.' : pick(CAUGHT_LINES), 'alarm', 3, 1500);
  }

  end(kind) {
    this.wasKissing = false; this.kissingNow = false;
    player.clear();
    const r = { kind, romance: this.romance, timeLeft: this.timeLeft, strikes: this.strikes, level: this.level };
    if (kind === 'win') {
      this.setState(S.WON);
      // Time left is scaled to a 75 s day so scores compare across levels; harder levels add a bonus.
      r.score = Math.round(this.romance * 10 + (this.timeLeft / this.level.duration) * 1500 - this.strikes * 250 + this.level.scoreBonus);
      const rk = RANKS.find(x => r.score >= x.min);
      r.rank = rk.rank; r.title = rk.title;
      const key = 'best.' + this.levelId;
      const best = store.get(key, null);
      if (!best || r.score > best.score) {
        r.newBest = true;
        store.set(key, { score: r.score, rank: r.rank, timeLeft: Math.ceil(r.timeLeft), strikes: r.strikes });
      }
      r.best = store.get(key, null);
      renderer.win(); sfx.win(); confetti.start(3.2);
      ui.toast('Love wins. Productivity loses.', 'love', 3, 2200);
      this.endT = 2.0;
    } else {
      this.setState(S.LOST);
      renderer.lose(kind); sfx.lose();
      if (kind === 'time') ui.toast("It's 5 pm. Everyone's going home.", '', 3, 2000);
      this.endT = 1.5;
    }
    this.result = r;
  }
}
