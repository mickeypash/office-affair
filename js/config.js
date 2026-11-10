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
   Tuned with a simulation of an attentive player: median time left at the win is
   about 45 s on Friday, 31 s on Wednesday and 12 s on Monday. */
const LEVELS = {
  friday: {
    name: 'Friday', difficulty: 'Easy', blurb: 'The boss has mentally left for the weekend.',
    duration: 85, romanceRate: 4.0, scoreBonus: -300,
    tiers: [
      { until: 30,  distracted: [4.0, 5.5], suspicious: [1.1, 1.3],  watching: [1.3, 2.0], fake: 0 },
      { until: 70,  distracted: [3.4, 5.0], suspicious: [1.0, 1.2],  watching: [1.4, 2.4], fake: 0 },
      { until: 999, distracted: [3.0, 4.4], suspicious: [0.9, 1.1],  watching: [1.5, 2.6], fake: 0.15 },
    ],
  },
  wednesday: {
    name: 'Wednesday', difficulty: 'Normal', blurb: 'Hump day. Standard surveillance.',
    duration: 75, romanceRate: 3.75, scoreBonus: 0,   // romanceRate calibrated up from the 2%/s spec value
    tiers: [
      { until: 30,  distracted: [3.5, 5.0], suspicious: [0.95, 1.1], watching: [1.5, 2.3], fake: 0 },
      { until: 70,  distracted: [2.6, 4.6], suspicious: [0.8, 1.0],  watching: [1.5, 3.0], fake: 0 },
      { until: 999, distracted: [2.5, 3.6], suspicious: [0.65, 0.8], watching: [1.8, 3.0], fake: 0.32 },
    ],
  },
  monday: {
    name: 'Monday', difficulty: 'Hard', blurb: 'Quarterly targets. The boss sees everything.',
    duration: 62, romanceRate: 3.4, scoreBonus: 250,
    tiers: [
      { until: 30,  distracted: [2.8, 4.2], suspicious: [0.8, 0.95], watching: [1.6, 2.6], fake: 0 },
      { until: 70,  distracted: [2.5, 3.8], suspicious: [0.7, 0.85], watching: [1.8, 3.0], fake: 0.15 },
      { until: 999, distracted: [2.2, 3.2], suspicious: [0.6, 0.72], watching: [2.0, 3.2], fake: 0.4 },
    ],
  },
};
const LEVEL_ORDER = ['friday', 'wednesday', 'monday'];
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
