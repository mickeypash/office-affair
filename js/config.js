'use strict';
/* Game rules, states and constants */
const CONFIG = {
  duration: 75,          // seconds in a workday
  maxStrikes: 3,
  romanceRate: 3.75,     // % per second (calibrated from the 2%/s spec value)
  detectMs: 150,         // continuous kissing while watched before a strike
  freeze: 1.0,           // caught reaction freeze
  returning: 0.4,
  tiers: [
    { name: 'easy',   until: 30,  distracted: [3.5, 5.0], suspicious: [0.95, 1.1], watching: [1.5, 2.3], fake: 0 },
    { name: 'medium', until: 70,  distracted: [2.6, 4.6], suspicious: [0.8, 1.0],  watching: [1.5, 3.0], fake: 0 },
    { name: 'hard',   until: 999, distracted: [2.5, 3.6], suspicious: [0.65, 0.8], watching: [1.8, 3.0], fake: 0.32 },
  ],
};
const S = { MENU: 'MENU', COUNTDOWN: 'COUNTDOWN', PLAYING: 'PLAYING', PAUSED: 'PAUSED', WON: 'WON', LOST: 'LOST' };
const M = { DISTRACTED: 'DISTRACTED', SUSPICIOUS: 'SUSPICIOUS', WATCHING: 'WATCHING', RETURNING: 'RETURNING' };
const INK = '#2B2340';
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
