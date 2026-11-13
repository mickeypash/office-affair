'use strict';
/* The game's words, in one place. Change a line here and the game follows.
   - {girl} and {guy} are replaced with the names. Names are escaped wherever the text goes into HTML.
   - Lines marked "HTML" may contain simple tags (like <b>); the others are plain text.
   - A story can override any line with a `copy` field in js/stories.js, for example
       nvidia: { ..., copy: { toasts: { win: 'Ship it.' } } }
     Objects merge key by key; a list (like toasts.caught) replaces the whole list.
   Control labels (Play, Back, Done, Sound: on, wardrobe labels) stay in index.html and the UI code. */
const COPY_DEFAULT = {
  menu: {
    title: ['OFFICE', 'AFFAIR'],
    tagline: 'Love is a full-time job.',
    howtoKiss: 'Hold <b>Space</b>, <b>Shift</b> or the mouse to kiss.', // HTML
    howtoBoss: 'Let go before the boss turns around.',
  },
  select: { title: "Who's clocking in?" },
  pause: {
    from: 'The break room', re: 'Coffee break',
    title: 'Paused', sub: "The boss can't see you. Probably.",
  },
  toasts: {
    distracted: 'The boss is distracted...',
    halfway: 'Halfway there. Keep it professional.',
    almost: 'So close. The boss is getting twitchy.',
    escaped: 'Unprofessional. Impressive.',            // you let go just as he looks
    actNatural: 'Act natural!',                       // he starts to turn while you kiss
    watching: "Uh-oh. Someone's watching.",            // he turns to look
    falseAlarmPhone: 'False alarm. He switched ears.',
    falseAlarmStretch: 'False alarm. Just a stretch.',
    caught: ['HR would like a word.', "That spreadsheet won't save you.", 'HR would like a word.', 'Caught red-lipped!'],
    caughtOut: 'HR would like a word.',               // the catch that ends the round
    win: 'Love wins. Productivity loses.',
    timeUp: "It's 5 pm. Everyone's going home.",
  },
  // The boss's thought bubbles: idle, and on the phone (or after you win).
  thoughts: {
    idle: ["Where's that report?", 'Is it Friday yet?', 'Interesting...', 'I sense a productivity issue.', 'Why is everyone smiling?', 'Need more synergy.', 'Who moved my stapler?'],
    phone: ['Mm-hmm. Love that for us.', 'Let’s circle back.', 'Per my last email...'],
  },
  // Win endings (keys match CONFIG.endings). The memo goes TO the couple.
  endings: {
    drinks: {
      name: 'Drinks with the boss', title: 'THE BOSS IS BUYING', stamp: 'AWKWARD',
      to: '{girl} & {guy}', from: 'Your boss', re: 'Drinks after work (just {girl})',
      sub: 'The boss asked {girl} out for drinks. {guy} went home alone.',
    },
    rose: {
      name: 'A rose at 7', title: "IT'S A DATE!", stamp: '7:00 PM',
      to: '{girl} & {guy}', from: 'Department of Hearts', re: 'Leaving together at 7 pm',
      sub: '{girl} & {guy} left together at 7 pm. {guy} brought a rose.',
    },
    concert: {
      name: 'Concert night', title: 'FRONT ROW!', stamp: 'ENCORE!',
      to: '{girl} & {guy}', from: 'Department of Hearts', re: 'Two tickets, tonight',
      sub: '{girl} & {guy} are off to a concert. Two tickets, no boss.',
    },
  },
  // Losses: caught too often (hr) or out of time (time).
  losses: {
    hr: {
      to: '{girl}', from: 'Human Resources', re: 'Mandatory meeting, 9 am',
      title: 'MEETING WITH HR 📋', sub: 'Your workplace conduct is under review.', stamp: 'UNDER REVIEW',
    },
    time: {
      to: 'All staff', from: 'Facilities', re: 'Building closes at 5 pm',
      title: 'CLOCKED OUT 💔', sub: 'Another day, another missed connection.', stamp: '5:00 PM',
    },
  },
};

/* Merge a story's overrides onto the defaults. Objects merge key by key; anything else (text, lists) replaces. */
function buildCopy(base, over) {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return base;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    const b = base[k], o = over[k];
    out[k] = b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object' && !Array.isArray(o) ? buildCopy(b, o) : o;
  }
  return out;
}
const COPY = buildCopy(COPY_DEFAULT, STORY.copy);

/* Fill {girl} / {guy} in a line. */
const fill = (text, names = {}) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in names ? names[k] : m));
/* A memo header (TO / FROM / RE) as HTML. Lines are filled, then escaped. */
const memoHead = (m, names) => ['to', 'from', 're'].map(k => `<div><b>${k.toUpperCase()}:</b> ${esc(fill(m[k], names))}</div>`).join('');
