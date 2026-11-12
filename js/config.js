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

/* ---- Characters ----
   Colours are [hex, accessible name]. Style ids match HAIR_ART / OUTFIT_ART in art.js. */
const SKIN_TONES = [
  ['#6B432B', 'Deep brown'], ['#8A5A3C', 'Brown'], ['#A86B45', 'Tan'], ['#C98A5E', 'Caramel'],
  ['#E0A877', 'Honey'], ['#F2C3A0', 'Peach'], ['#FAD9C0', 'Fair'],
];
const HAIR_COLOURS = [
  ['#1F1A24', 'Black'], ['#3A2730', 'Dark brown'], ['#7A4A2E', 'Brown'], ['#E0773D', 'Ginger'],
  ['#F2C76B', 'Blonde'], ['#B3B0C6', 'Grey'], ['#FF8FAB', 'Pink'], ['#6F86D6', 'Blue'],
];
const OUTFIT_COLOURS = [
  ['#E9B44C', 'Mustard'], ['#3E9C92', 'Teal'], ['#FF8C69', 'Coral'], ['#8B9BD6', 'Periwinkle'],
  ['#FF4F86', 'Pink'], ['#5DB58C', 'Green'], ['#4A4560', 'Charcoal'], ['#F3F0FA', 'White'],
];
// Styles offered on the "Make your own" screen. Ids match HAIR_ART / OUTFIT_ART in art.js.
const HAIR_STYLES = { wavy: 'Long waves', sleek: 'Sleek', bob: 'Bob', bun: 'Bun', curls: 'Curls', crop: 'Crop' };
const OUTFITS = { laceTop: 'Lace top', blazer: 'Blazer', cardigan: 'Cardigan', turtleneck: 'Turtleneck' };
const NAME_MAX = 14;

/* ---- The two leads. Fixed looks, drawn from the reference photo. ---- */
const GIRLS = {
  gabi: {
    name: 'Gabi', skin: '#F2CBAE', hairStyle: 'wavy', hair: 'url(#hairGabi)', outfit: 'laceTop', outfitColour: '#211C27',
    glasses: false, makeup: true, mouth: 'pout',
  },
  vix: {
    name: 'Vix', skin: '#F5D3BC', hairStyle: 'wavy', hair: 'url(#hairVix)', outfit: 'blazer', outfitColour: '#18151C',
    glasses: false, makeup: true, mouth: 'smirk', mood: 'mean',   // resting mean face; never tongue out
  },
};
const DEFAULT_CUSTOM = {
  name: 'Jo', skin: '#E0A877', hairStyle: 'bob', hair: '#1F1A24', outfit: 'turtleneck', outfitColour: '#FF4F86',
  glasses: false, makeup: true, mouth: null,
};

/* ---- The guy: a new random one every round ---- */
const GUY_NAMES = ['Banana', 'Smoothie', 'Straw', 'Tree', 'Pickle', 'Mango'];
const GUY_SKIN = ['#F7DCC8', '#F2CCB0', '#EDC1A1', '#E8B896', '#F5D5BE'];
const GUY_HAIR = ['#2A1E1A', '#4A3226', '#6B4A33', '#8C6A45', '#C9A06A', '#9A4E2C', '#1C1A1F'];
const GUY_HAIR_STYLES = ['quiff', 'curtains', 'slick', 'tousled', 'crop', 'shaved', 'curls'];
const GUY_COLOURS = ['#7C8A6A', '#3E5068', '#C8B79A', '#8C3B3B', '#2F4A3E', '#E9E1D3', '#6B5B8C', '#B5651D'];
const GUY_GLASSES = ['#2B2340', '#7A4A2E', '#1C1A1F'];
