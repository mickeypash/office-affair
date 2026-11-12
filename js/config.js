'use strict';
/* Game rules, states and constants */
/* True constants, shared by every mode. */
const CONFIG = {
  detectMs: 150,         // continuous kissing while watched before a strike
  freeze: 1.0,           // caught reaction freeze
  returning: 0.4,        // seconds the boss takes to turn back
  // Win score = love points + `perSecondLeft` per second left - `perCatch` per time caught.
  score: { perSecondLeft: 20, perCatch: 500 },
  // Win endings, best first. A simulated player who never builds a streak scores about 2,950, a normal one about 4,050,
  // and a greedy one who rides x3 streaks about 4,400 (simulated with no catches).
  endings: [
    { min: 4250, key: 'concert' },
    { min: 3400, key: 'rose' },
    { min: -1e9, key: 'drinks' },
  ],
  // Old names, now aliases to the standard mode. Game code reads game.rules instead.
  get startLives() { return MODES.standard.lives.start; },
  get maxLives() { return MODES.standard.lives.max; },
  get lifeAt() { return MODES.standard.lives.earnAt; },
  get streak() { return MODES.standard.streak; },
};

/* Modes: everything a difficulty can change. game.rules is built from the active mode at the start of each round.
   Each tier applies until the romance meter reaches `until` %.
   distracted / suspicious / watching are [min, max] seconds. fake = chance of a bluff warning.
   A simulated attentive player wins standard with about 31 s left, so it is on the easy side. */
const MODES = {
  standard: {
    name: 'Standard', duration: 75, romanceRate: 3.75, scoreBonus: 0,   // romanceRate calibrated up from the 2%/s spec value
    tiers: [
      { until: 30,  distracted: [3.5, 5.0], suspicious: [0.95, 1.1], watching: [1.5, 2.3], fake: 0.10 },
      { until: 70,  distracted: [2.6, 4.6], suspicious: [0.8, 1.0],  watching: [1.5, 3.0], fake: 0.20 },
      { until: 999, distracted: [2.5, 3.6], suspicious: [0.65, 0.8], watching: [1.8, 3.0], fake: 0.35 },
    ],
    // start with 1 life (one catch ends the round at first); earnAt = romance % that each earn +1 life, once per round
    lives: { start: 1, max: 3, earnAt: [35, 70] },
    // Unbroken kiss: x2 from `at2` s, x3 (fever) from `at3` s. fill = romance speed per multiplier; points = love points per second at x1.
    streak: { enabled: true, at2: 2, at3: 4, fill: [1, 1.3, 1.6], points: 100 },
    cone: true,            // sight cone while the boss turns and watches
    warningToasts: true,   // "Uh-oh. Someone's watching." / "Act natural!"
  },
};
const DEFAULT_MODE = 'standard';
// Standard is the old Wednesday level. Best scores are still saved under best.wednesday.
// Friday (easy) and Monday (hard) levels are in git history (PR #3).
const LEVELS = { wednesday: MODES.standard };
const DEFAULT_LEVEL = 'wednesday';

const S = { MENU: 'MENU', COUNTDOWN: 'COUNTDOWN', PLAYING: 'PLAYING', PAUSED: 'PAUSED', WON: 'WON', LOST: 'LOST' };
const M = { DISTRACTED: 'DISTRACTED', SUSPICIOUS: 'SUSPICIOUS', WATCHING: 'WATCHING', RETURNING: 'RETURNING' };
const INK = '#2B2340';
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
