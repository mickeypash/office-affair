'use strict';
/* Scene overrides for stories (see `scene` in js/stories.js). Parts swap one piece of the office; palettes repaint the walls
   and carpet. The office itself stays in index.html. Ids inside a part start with s<Name> so they cannot clash with the page,
   except the ids the renderer animates, which a part must keep (listed per slot below). */
const SCENE_PARTS = {
  // Inner markup of <g id="printer">, in scene coordinates (the printer sits at x 1394-1546, y 364-520).
  // Keep printerBody (shakes), printerLight (blinks), jamText (shown; its words come from COPY.scene.jam), jamPapers with jp0..2 (fly out).
  printer: {
    // A GPU server rack. Its "jam" is an overheat: it shakes, the status light blinks and it puffs smoke and a warning sign.
    gpuRack: `
    <g stroke="#2B2340" stroke-width="4.5" stroke-linejoin="round">
      <rect x="1408" y="506" width="22" height="14" rx="3" fill="#1C1B21"/><rect x="1510" y="506" width="22" height="14" rx="3" fill="#1C1B21"/>
    </g>
    <g id="printerBody" stroke="#2B2340" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
      <rect x="1396" y="320" width="148" height="192" rx="10" fill="#2C2A33"/>
      <path d="M1408 329 H1532" stroke="#4B4855" stroke-width="3"/>
      <rect x="1403" y="336" width="9" height="168" rx="3" fill="#76B900" stroke-width="2.5"/>
      ${[0, 1, 2, 3, 4].map(i => {
        const y = 336 + i * 35;
        return `
      <rect x="1418" y="${y}" width="118" height="29" rx="4" fill="#3E3B48" stroke-width="3"/>
      <path d="M1427 ${y + 8} v13 M1434 ${y + 8} v13 M1441 ${y + 8} v13 M1448 ${y + 8} v13 M1455 ${y + 8} v13 M1462 ${y + 8} v13" stroke="#1E1C24" stroke-width="3.5"/>
      <rect x="1470" y="${y + 10}" width="36" height="9" rx="4.5" fill="${i === 2 ? '#5E9600' : '#76B900'}" stroke-width="2"/>
      ${i ? `<circle cx="1523" cy="${y + 14.5}" r="4" fill="${i === 3 ? '#FFC23A' : '#8FE03C'}" stroke-width="2"/>` : ''}`;
      }).join('')}
      <circle id="printerLight" cx="1523" cy="350.5" r="5" fill="#8FE03C" stroke-width="2.5"/>
    </g>
    <g id="jamPapers" display="none" stroke="#2B2340" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <path id="jp0" d="M-22,13 A11,11 0 0 1 -19,-7 A14,14 0 0 1 6,-15 A12,12 0 0 1 23,1 A10,10 0 0 1 16,13 Z" fill="#E6E8EC"/>
      <g id="jp1"><path d="M0,-19 L20,16 L-20,16 Z" fill="#FFC23A"/><path d="M0,-6 V5" stroke-width="4"/><circle cy="10.5" r="2.4" fill="#2B2340" stroke="none"/></g>
      <path id="jp2" d="M-22,13 A11,11 0 0 1 -19,-7 A14,14 0 0 1 6,-15 A12,12 0 0 1 23,1 A10,10 0 0 1 16,13 Z" fill="#FFB199"/>
    </g>
    <g id="jamText" display="none">
      <path d="M1418 318 q-7 -7 0 -14 q7 -7 0 -14 M1522 318 q-7 -7 0 -14 q7 -7 0 -14" fill="none" stroke="#FF5A2B" stroke-width="4" stroke-linecap="round"/>
      <text data-copy="scene.jam" x="1470" y="308" text-anchor="middle" font-family="Arial Rounded MT Bold, ui-rounded, system-ui, sans-serif" font-size="32" fill="#FF5A2B" stroke="#2B2340" stroke-width="1.5"></text>
    </g>`,
  },
  // Inner markup of <g id="screenR">: the guy's desk monitor, in the monitor's own coordinates (screen at 9,9, 172×104).
  // The guy's hand and the "lunch?" note cover the bottom left, so the words sit top and right.
  screenR: {
    // Training a model: a falling loss curve, the final loss and the epoch bar.
    aiTraining: `
    <rect x="9" y="9" width="172" height="104" rx="3" fill="#15171C" stroke="none"/>
    <rect x="9" y="9" width="172" height="17" fill="#76B900" stroke="none"/>
    <text x="95" y="22" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-weight="800" font-size="11.5" fill="#15171C" stroke="none">train_love.py</text>
    <path d="M40 46 H176 M40 64 H176" stroke="#2A2F38" stroke-width="1.5"/>
    <path d="M42 32 C58 58 74 64 100 68 S150 72 174 73" fill="none" stroke="#8FE03C" stroke-width="4" stroke-linecap="round"/>
    <use href="#heartShape" transform="translate(166,58) scale(.42)" fill="#FF4F86" stroke="none"/>
    <text x="176" y="92" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-weight="900" font-size="17" fill="#FFFFFF" stroke="none">loss 0.02</text>
    <rect x="70" y="99" width="106" height="9" rx="4.5" fill="#2A2F38" stroke="none"/>
    <rect x="70" y="99" width="95" height="9" rx="4.5" fill="#76B900" stroke="none"/>`,
  },
  // What the walker carries (walkerSVG's load): inner markup of #wCups in the walker's coordinates, stacked up from y 0.
  walkerLoad: {
    // A tower of graphics cards: black shrouds, two fans, a green edge, a silver bracket.
    gpus: [0, 1, 2, 3].map(i => `
    <g transform="translate(${[0, -6, 5, -3][i]},${-i * 42})" stroke="#2B2340" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect x="-64" y="-40" width="12" height="40" rx="2" fill="#C9CBD3" stroke-width="3"/>
      <rect x="-54" y="-40" width="118" height="40" rx="6" fill="#24222A"/>
      <path d="M-48,-36 H58" stroke="#76B900" stroke-width="4"/>
      ${[-18, 30].map(x => `<circle cx="${x}" cy="-18" r="14" fill="#3E3B48" stroke-width="3"/>
      <path d="M${x},-18 L${x},-30 M${x},-18 L${x + 11},-12 M${x},-18 L${x - 11},-12" stroke="#8C8899" stroke-width="3.5"/>
      <circle cx="${x}" cy="-18" r="3.5" fill="#76B900" stroke-width="2"/>`).join('')}
    </g>`).join(''),
  },
};

/* Palettes: the wall pattern (a 64×64 tile), the carpet (a 30×30 tile), and the fills of the wall bands
   (wallBand and wallTrim up top, seen on tall screens; wallRail, wallPanel and wallBase above the floor). */
const SCENE_PALETTES = {
  // Cool light grey with a faint green-grey grid, a green rail, a charcoal carpet with green flecks.
  nvidiaLight: {
    wallpaper: `<rect width="64" height="64" fill="#E9ECE8"/>
      <path d="M0 .75 H64 M.75 0 V64 M0 32.75 H64 M32.75 0 V64" stroke="#DEE3DC" stroke-width="1.5"/>
      <path d="M32.75 26 l4 6.75 -4 6.75 -4 -6.75z" fill="#D4DECF"/>`,
    carpet: `<rect width="30" height="30" fill="#3C4049"/>
      <circle cx="7" cy="7" r="2.2" fill="#4F6235"/><circle cx="22" cy="22" r="2.2" fill="#464B55"/>`,
    fills: { wallBand: '#D9DED7', wallTrim: '#76B900', wallRail: '#76B900', wallPanel: '#CFD5CD', wallBase: '#2C2E35' },
  },
  // Charcoal data-centre walls with a faint grid, green trim, a dark floor.
  nvidiaDark: {
    wallpaper: `<rect width="64" height="64" fill="#2D3037"/>
      <path d="M0 .75 H64 M.75 0 V64 M0 32.75 H64 M32.75 0 V64" stroke="#363A42" stroke-width="1.5"/>
      <circle cx="32.75" cy="32.75" r="2" fill="#3F5228"/>`,
    carpet: `<rect width="30" height="30" fill="#1E2025"/>
      <circle cx="7" cy="7" r="2.2" fill="#2E3A20"/><circle cx="22" cy="22" r="2.2" fill="#272A30"/>`,
    fills: { wallBand: '#24272D', wallTrim: '#76B900', wallRail: '#76B900', wallPanel: '#26292F', wallBase: '#16171B' },
  },
};

/* The art the story picks for one slot of SCENE_PARTS, or null to keep the office's. */
function scenePart(slot) {
  const id = STORY.scene && STORY.scene.parts && STORY.scene.parts[slot];
  return (id && SCENE_PARTS[slot] && SCENE_PARTS[slot][id]) || null;
}

/* Swap in the story's parts and palette. Runs at boot, before the renderer looks up the scene's ids.
   (walkerLoad is drawn by the renderer through walkerSVG.) */
function applyScene() {
  ['printer', 'screenR'].forEach(slot => { const art = scenePart(slot); if (art) $(slot).innerHTML = art; });
  const pal = STORY.scene && SCENE_PALETTES[STORY.scene.palette];
  if (!pal) return;
  $('wallpaper').innerHTML = pal.wallpaper;
  $('carpet').innerHTML = pal.carpet;
  Object.entries(pal.fills).forEach(([id, fill]) => $(id).setAttribute('fill', fill));
}
