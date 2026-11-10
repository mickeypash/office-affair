'use strict';
/* Manager AI state machine */
const ACTIVITIES = ['type', 'coffee', 'read', 'phone'];
class Manager {
  constructor(game) { this.game = game; this.reset(); }
  reset() {
    this.state = M.DISTRACTED; this.t = 0; this.dur = rand(3.6, 5.0);
    this.fake = false; this.lastFake = false; this.activity = 'type';
  }
  enter(state, dur, info = {}) {
    const prev = this.state;
    this.state = state; this.t = 0; this.dur = dur;
    if (state === M.DISTRACTED) this.activity = pick(ACTIVITIES.filter(a => a !== this.activity));
    this.game.onManager(state, prev, info);
  }
  advance() {
    const tier = this.game.tier();
    switch (this.state) {
      case M.DISTRACTED:
        this.fake = !this.lastFake && Math.random() < tier.fake;
        this.lastFake = this.fake;
        this.enter(M.SUSPICIOUS, rand(...tier.suspicious), { fake: this.fake });
        break;
      case M.SUSPICIOUS:
        if (this.fake) { this.fake = false; this.enter(M.DISTRACTED, rand(...tier.distracted), { fromFake: true }); }
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
