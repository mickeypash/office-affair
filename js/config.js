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
const HAIR_STYLES = { curls: 'Curls', bun: 'Bun', bob: 'Bob', crop: 'Crop', long: 'Long', shaved: 'Shaved' };
const OUTFITS = { cardigan: 'Cardigan', vest: 'Vest and tie', turtleneck: 'Turtleneck' };
const NAME_MAX = 18, TEAM_MAX = 14;

const DEFAULT_CAST = {
  player: {
    name: 'Jules Park', team: 'Accounts', skin: '#C98A5E', hairStyle: 'curls', hair: '#3A2730',
    outfit: 'cardigan', outfitColour: '#E9B44C', glasses: true,
  },
  partner: {
    name: 'Remy Okafor', team: 'HR', skin: '#F2C3A0', hairStyle: 'bun', hair: '#E0773D',
    outfit: 'vest', outfitColour: '#3E9C92', glasses: false,
  },
};
