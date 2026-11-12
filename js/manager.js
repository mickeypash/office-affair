'use strict';
/* Manager AI state machine */
const ACTIVITIES = ['type', 'coffee', 'read', 'phone'];
const PHONE_CHANCE = 0.4;   // share of distracted phases spent on the phone (the phone bluff needs one)
class Manager {
  constructor(game) { this.game = game; this.reset(); }
  reset() {
    this.state = M.DISTRACTED; this.t = 0; this.dur = rand(3.6, 5.0);
    this.fake = false; this.lastFake = false; this.fakeKind = ''; this.activity = 'type'; this.phoneHand = 'right';
  }
  nextActivity() {
    if (Math.random() < PHONE_CHANCE) return 'phone';
    return pick(ACTIVITIES.filter(a => a !== 'phone' && a !== this.activity));
  }
  enter(state, dur, info = {}) {
    const prev = this.state;
    this.state = state; this.t = 0; this.dur = dur;
    // After a phone bluff he keeps talking, now with the phone at his left ear.
    if (state === M.DISTRACTED && info.fromFake && info.kind === 'phone') this.phoneHand = 'left';
    else if (state === M.DISTRACTED) { this.activity = this.nextActivity(); this.phoneHand = 'right'; }
    this.game.onManager(state, prev, info);
  }
  advance() {
    const tier = this.game.tier();
    switch (this.state) {
      case M.DISTRACTED:
        this.fake = !this.lastFake && Math.random() < tier.fake;
        this.lastFake = this.fake;
        // Bluff kinds: on the phone he swaps ears, otherwise he stretches.
        this.fakeKind = !this.fake ? '' : this.activity === 'phone' ? 'phone' : 'stretch';
        this.enter(M.SUSPICIOUS, rand(...tier.suspicious), { fake: this.fake, kind: this.fakeKind });
        break;
      case M.SUSPICIOUS:
        if (this.fake) { this.fake = false; this.enter(M.DISTRACTED, rand(...tier.distracted), { fromFake: true, kind: this.fakeKind }); }
        else this.enter(M.WATCHING, rand(...tier.watching));
        break;
      case M.WATCHING: this.enter(M.RETURNING, CONFIG.returning); break;
      case M.RETURNING: this.enter(M.DISTRACTED, rand(...tier.distracted)); break;
    }
  }
  update(dt) {
    this.t += dt;
    let guard = 0;
    while (this.t >= this.dur && guard++ < 4) { const over = this.t - this.dur; this.advance(); this.t = over; }
  }
  get unsafe() { return this.state === M.WATCHING || this.state === M.RETURNING; }
  get progress() { return clamp(this.t / this.dur, 0, 1); }
}
