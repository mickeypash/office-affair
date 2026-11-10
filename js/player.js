'use strict';
/* Player input state */
class Player {
  constructor() { this.sources = new Set(); this.locked = false; }
  press(src) { this.sources.add(src); }
  release(src) { this.sources.delete(src); if (this.sources.size === 0) this.locked = false; }
  clear() { this.sources.clear(); this.locked = false; }
  lock() { this.locked = true; } // after a strike: player must let go of everything first
  get holding() { return this.sources.size > 0; }
  get wantsKiss() { return this.holding && !this.locked; }
}
const player = new Player();
