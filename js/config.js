'use strict';
/* Game rules, states and constants */
/* Rules shared by every level. */
const CONFIG = {
  maxStrikes: 3,
  detectMs: 150,         // continuous kissing while watched before a strike
  freeze: 1.0,           // caught reaction freeze
  returning: 0.4,        // seconds the boss takes to turn back
};

/* Levels. Each tier applies until the romance meter reaches `until` %.
   distracted / suspicious / watching are [min, max] seconds. fake = chance of a bluff warning.
   A simulated attentive player wins with about 31 s left, so this is on the easy side. */
const LEVELS = {
  wednesday: {
    name: 'Wednesday', duration: 75, romanceRate: 3.75, scoreBonus: 0,   // romanceRate calibrated up from the 2%/s spec value
    tiers: [
      { until: 30,  distracted: [3.5, 5.0], suspicious: [0.95, 1.1], watching: [1.5, 2.3], fake: 0.10 },
      { until: 70,  distracted: [2.6, 4.6], suspicious: [0.8, 1.0],  watching: [1.5, 3.0], fake: 0.20 },
      { until: 999, distracted: [2.5, 3.6], suspicious: [0.65, 0.8], watching: [1.8, 3.0], fake: 0.35 },
    ],
  },
};
// Only one level for now. Friday (easy) and Monday (hard) are in git history (PR #3) if levels come back.
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
