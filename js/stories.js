'use strict';
/* Stories: which cast and poster a game uses. Pick one with ?story=<id>; without it (or with an unknown id) you get DEFAULT_STORY.
   - girls: CHARACTERS ids for "Who's clocking in?" (hidden girls are allowed here), or null for every visible girl.
   - guy: { mode: 'random' } for a new random guy every round, or { mode: 'named', id } for one guy from GUY_CHARACTERS.
   - poster: a POSTERS id from js/posters.js, or null to keep the office poster in index.html.
   - copy: lines that differ from js/copy.js (same keys); everything else keeps the default words.
   - scene (optional): office pieces to swap, from js/scenes.js. parts: { slot: id } picks art from SCENE_PARTS
     (printer, screenR = the guy's monitor, walkerLoad = what the walker carries); palette: a SCENE_PALETTES id for the
     walls and carpet. Leave it out (or leave out a slot) to keep the office as drawn in index.html.
   Each story saves under its own keys: pick.<id> and best.<id>. */
const STORIES = {
  office: { id: 'office', girls: null, guy: { mode: 'random' }, poster: null },
  nvidia: {
    id: 'nvidia', girls: ['alice', 'kimberly'], guy: { mode: 'named', id: 'jensen' }, poster: 'nvidia',
    // A GPU rack for the printer, GPUs for the coffee tower, model training on Jensen's screen. Palette: nvidiaLight or nvidiaDark.
    scene: { parts: { printer: 'gpuRack', walkerLoad: 'gpus', screenR: 'aiTraining' }, palette: 'nvidiaDark' },
    // The watcher is a board member, not the boss.
    copy: {
      menu: { tagline: 'Love runs in parallel.', howtoBoss: 'Let go before the board member turns around.' },
      pause: { sub: "The board member can't see you. Probably." },
      toasts: {
        distracted: 'The board member is distracted...',
        almost: 'So close. The board member is getting twitchy.',
        caught: ['HR would like a word.', "That benchmark won't save you.", 'The board would like a word.', 'Caught red-lipped!'],
        win: 'Love wins. The stock goes up anyway.',
      },
      scene: { jam: 'HOT!' }, // the GPU rack overheats instead of jamming
      thoughts: {
        idle: ["Where's the earnings deck?", 'Is it keynote day yet?', 'Interesting...', 'I sense a supply issue.', 'Why is everyone smiling?', 'Need more compute.', 'Who moved my stock options?'],
        phone: ['Mm-hmm. Love that for the share price.', "Let's take this offline.", 'Per my last board memo...'],
      },
      endings: {
        drinks: {
          name: 'Drinks with the board member', title: 'THE BOARD IS BUYING', from: 'A board member',
          sub: 'The board member asked {girl} out for drinks. {guy} went home alone.',
        },
        concert: { sub: '{girl} & {guy} are off to a concert. Two tickets, no board meeting.' },
      },
    },
  },
};
/* The story you get with no ?story= in the URL. Change this one line to change the default game. */
const DEFAULT_STORY = 'nvidia';
const STORY = (id => Object.prototype.hasOwnProperty.call(STORIES, id) ? STORIES[id] : STORIES[DEFAULT_STORY])(
  new URLSearchParams(location.search).get('story'));
/* A save key for this story: key.<id>. */
const storyKey = k => `${k}.${STORY.id}`;
