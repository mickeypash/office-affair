'use strict';
/* SVG art builders for the characters */
const SW = (w = 6) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const limb = (d, color, w = 40) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 12}" stroke-linecap="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

function coworkerBody(o) {
  const d = o.dir;
  const X = v => v * d;
  return `
  <g class="cw"${o.male ? ' data-male="1"' : ''}>
    ${limb('M-86,-150 Q-114,-112 -108,-62', o.sleeve)}
    ${limb('M86,-150 Q114,-112 108,-62', o.sleeve)}
    <rect x="-19" y="-216" width="38" height="40" fill="${o.skin}" ${SW()}/>
    <path d="M-106,80 L-96,-142 Q-92,-184 -50,-190 L50,-190 Q92,-184 96,-142 L106,80 Z" fill="${o.top}" ${SW()}/>
    ${o.outfit}
    <g class="cw-head" transform="translate(0,-266)">
      ${o.hairBack}
      <g class="ears-front">
        <circle cx="-70" cy="8" r="14" fill="${o.skin}" ${SW()}/><circle cx="70" cy="8" r="14" fill="${o.skin}" ${SW()}/>
      </g>
      ${o.head || `<circle r="70" fill="${o.skin}" ${SW()}/>`}
      <g class="ear-profile" display="none">
        <path d="M${X(-30)},-6 q${X(-16)},2 ${X(-14)},16 q${X(2)},12 ${X(14)},10" fill="${o.skin}" ${SW(5)}/>
      </g>
      <g class="f-front">
        <g class="blush-f" opacity="${o.male ? 0 : '.3'}">
          <ellipse cx="-44" cy="24" rx="13" ry="8" fill="#FF6F91"/><ellipse cx="44" cy="24" rx="13" ry="8" fill="#FF6F91"/>
        </g>
        ${o.faceUnder || ''}
        <g class="eyes-open"><g class="pupils">
          <ellipse cx="-26" cy="0" rx="7.5" ry="10.5" fill="${INK}"/><ellipse cx="26" cy="0" rx="7.5" ry="10.5" fill="${INK}"/>
          <circle cx="-23.5" cy="-4" r="2.8" fill="#fff"/><circle cx="28.5" cy="-4" r="2.8" fill="#fff"/>
        </g>${o.eyeLids || ''}</g>
        <g class="eyes-blink" display="none"><path d="M-35,1 L-17,1 M17,1 L35,1" ${SW(5)}/></g>
        <g class="eyes-happy" display="none"><path d="M-36,4 Q-26,-8 -16,4 M16,4 Q26,-8 36,4" fill="none" ${SW(5)}/></g>
        <g class="eyes-wide" display="none">
          <circle cx="-26" cy="-2" r="14" fill="#fff" ${SW(4)}/><circle cx="26" cy="-2" r="14" fill="#fff" ${SW(4)}/>
          <circle cx="-26" cy="-2" r="5" fill="${INK}"/><circle cx="26" cy="-2" r="5" fill="${INK}"/>
        </g>
        ${o.brows || `<path class="brows" d="M-37,-27 Q-27,-34 -16,-28 M16,-28 Q27,-34 37,-27" fill="none" ${SW(5)}/>`}
        <path class="brows-sad" display="none" d="M-36,-24 Q-28,-30 -16,-34 M16,-34 Q28,-30 36,-24" fill="none" ${SW(5)}/>
        <path d="M-5,14 Q0,21 5,14" fill="none" ${SW(4)}/>
        <g class="m-smile">${o.smile || `<path d="M-17,32 Q0,47 17,32" fill="none" ${SW(5)}/>`}</g>
        <path class="m-grin" display="none" d="M-22,30 Q0,58 22,30 Z" fill="#7A2840" ${SW(4)}/>
        <ellipse class="m-o" display="none" cx="0" cy="40" rx="10" ry="13" fill="#7A2840" ${SW(4)}/>
        <path class="m-nerv" display="none" d="M-20,37 L-10,32 L0,37 L10,32 L20,37" fill="none" ${SW(4)}/>
        <path class="m-sad" display="none" d="M-15,43 Q0,32 15,43" fill="none" ${SW(5)}/>
        <path class="sweat" display="none" d="M${X(-60)},-34 q-9,14 0,18 q9,-4 0,-18 Z" fill="#9AD8F5" ${SW(3)}/>
        ${o.faceExtra || ''}
      </g>
      <g class="f-profile" display="none">
        ${o.profileUnder || ''}
        ${o.male ? '' : `<ellipse cx="${X(32)}" cy="24" rx="14" ry="8" fill="#FF6F91" opacity=".55"/>`}
        <path d="M${X(18)},-2 Q${X(28)},7 ${X(40)},-2" fill="none" ${SW(5)}/>
        ${o.profileBrow || `<path d="M${X(14)},-25 Q${X(28)},-32 ${X(42)},-24" fill="none" ${SW(5)}/>`}
        <path d="M${X(64)},-4 Q${X(84)},10 ${X(66)},18" fill="${o.skin}" ${SW(4.5)}/>
        <ellipse cx="${X(66)}" cy="35" rx="9" ry="8" fill="#E8466F" ${SW(3.5)}/>
        ${o.profileExtra || ''}
      </g>
      ${o.hairFront}
    </g>
  </g>`;
}

function coworkerHands(o) {
  const d = o.dir;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="16" fill="${o.skin}" ${SW(5)}/>`;
  return `
  <g class="h-type">
    ${[0, 1].map(i => `<g class="${i ? 'h-right' : 'h-left'}">
      <path class="fo" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/>
      <path class="fc" fill="none" stroke="${o.sleeve}" stroke-width="32" stroke-linecap="round"/>
      <circle class="hc" r="16" fill="${o.skin}" ${SW(5)}/></g>`).join('')}
  </g>
  <g class="h-doc" display="none">
    ${limb('M-108,-62 Q-104,-100 -66,-118', o.sleeve, 32)}${limb('M108,-62 Q104,-100 66,-118', o.sleeve, 32)}
    <g transform="rotate(${-5 * d})">
      <rect x="-74" y="-184" width="148" height="104" rx="5" fill="#fff" ${SW(5)}/>
      <rect x="-60" y="-170" width="70" height="10" rx="3" fill="#8B9BD6"/>
      <path d="M-60,-146 H58 M-60,-130 H58 M-60,-114 H30" stroke="#C3C8EE" stroke-width="5" stroke-linecap="round"/>
      <path d="M20,-104 l12,-16 l10,8 l14,-22" fill="none" stroke="#FF4F86" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${hand(-66, -118)}${hand(66, -118)}
  </g>
  <g class="h-hug" display="none">
    ${limb(`M${44 * d},-150 Q${150 * d},-226 ${232 * d},-150`, o.sleeve, 34)}
    ${hand(232 * d, -150)}
  </g>`;
}

/* ---- Customisable parts. Each builder takes colours and returns SVG. ----
   Hair is drawn in head space (head centre = 0,0, radius 70): "back" goes behind the face,
   "front" goes over the forehead. Curtains of hair that frame the face carry the classes
   curtain-l / curtain-r so the renderer can hide the one on the face side in profile. */
const HAIR_ART = {
  // Long, wavy, centre part (Gabi and Vix). h can be a colour or url(#gradient).
  wavy: {
    back: h => `<path d="M0,-94 C-56,-94 -88,-60 -86,-14 C-84,14 -100,30 -92,56 C-84,80 -104,96 -96,124 C-88,150 -102,166 -88,184 C-76,196 -58,190 -56,176 C-54,160 -68,148 -62,128 C-56,108 -70,94 -62,72 C-58,58 -62,46 -58,34 L58,34 C62,46 58,58 62,72 C70,94 56,108 62,128 C68,148 54,160 56,176 C58,190 76,196 88,184 C102,166 88,150 96,124 C104,96 84,80 92,56 C100,30 84,14 86,-14 C88,-60 56,-94 0,-94 Z" fill="${h}" ${SW(6)}/>
      <path d="M-80,50 C-90,72 -74,92 -84,118 C-92,140 -78,156 -84,172 M80,50 C90,72 74,92 84,118 C92,140 78,156 84,172" fill="none" stroke="${INK}" stroke-opacity=".22" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M-72,-40 C-80,-10 -70,10 -78,36 M72,-40 C80,-10 70,10 78,36" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>`,
    front: h => `<path class="curtain-l" d="M-2,-80 C-36,-82 -64,-60 -70,-24 C-74,0 -64,18 -72,40 C-62,34 -58,18 -56,0 C-52,-28 -30,-56 -2,-66 Z" fill="${h}" ${SW(5)}/>
      <path class="curtain-r" d="M2,-80 C36,-82 64,-60 70,-24 C74,0 64,18 72,40 C62,34 58,18 56,0 C52,-28 30,-56 2,-66 Z" fill="${h}" ${SW(5)}/>`,
  },
  // Sleek, straight, centre part, to the shoulders.
  sleek: {
    back: h => `<path d="M0,-90 C-50,-90 -80,-62 -80,-16 L-82,70 Q-60,84 -46,70 L-46,30 L46,30 L46,70 Q60,84 82,70 L80,-16 C80,-62 50,-90 0,-90 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path class="curtain-l" d="M-2,-80 C-38,-80 -64,-60 -68,-20 L-70,40 L-58,40 L-54,-6 C-48,-36 -28,-60 -2,-66 Z" fill="${h}" ${SW(5)}/>
      <path class="curtain-r" d="M2,-80 C38,-80 64,-60 68,-20 L70,40 L58,40 L54,-6 C48,-36 28,-60 2,-66 Z" fill="${h}" ${SW(5)}/>`,
  },
  curls: {
    back: h => `<g fill="${h}" ${SW(6)}>
      <circle cx="-62" cy="-30" r="30"/><circle cx="-42" cy="-60" r="30"/><circle cx="-12" cy="-78" r="30"/><circle cx="20" cy="-76" r="30"/>
      <circle cx="48" cy="-58" r="30"/><circle cx="64" cy="-28" r="29"/><circle cx="-74" cy="0" r="22"/><circle cx="74" cy="0" r="22"/></g>`,
    front: h => `<g fill="${h}" ${SW(5)}>
      <circle cx="-40" cy="-54" r="20"/><circle cx="-10" cy="-64" r="22"/><circle cx="22" cy="-62" r="21"/><circle cx="48" cy="-46" r="16"/></g>`,
  },
  bun: {
    back: h => `<circle cx="0" cy="-86" r="30" fill="${h}" ${SW(6)}/>
      <rect x="-18" y="-64" width="36" height="11" rx="5" fill="#FF4F86" ${SW(4)}/>
      <path d="M-78,20 C-86,-58 -46,-84 0,-84 C46,-84 86,-58 78,20 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-68,-14 C-62,-62 -12,-84 40,-66 C64,-56 74,-32 68,-6 C52,-40 22,-50 -8,-44 C-36,-40 -56,-30 -68,-14 Z" fill="${h}" ${SW(5)}/>`,
  },
  bob: {
    back: h => `<path d="M-84,44 C-92,-62 -50,-88 0,-88 C50,-88 92,-62 84,44 Q70,56 56,40 L-56,40 Q-70,56 -84,44 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-70,-16 C-68,-70 -32,-84 0,-84 C32,-84 68,-70 70,-16 Q36,-36 0,-34 Q-36,-36 -70,-16 Z" fill="${h}" ${SW(5)}/>`,
  },
  crop: {
    back: h => `<path d="M-72,0 C-80,-66 -40,-86 0,-86 C40,-86 80,-66 72,0 Q66,-26 50,-36 L-50,-36 Q-66,-26 -72,0 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-62,-34 C-52,-78 10,-94 52,-66 C66,-56 70,-42 68,-30 C42,-58 -18,-62 -62,-34 Z" fill="${h}" ${SW(5)}/>`,
  },
  shaved: {
    back: () => '',
    front: h => `<path d="M-68,-18 C-64,-70 -30,-76 0,-76 C30,-76 64,-70 68,-18 C42,-48 -42,-48 -68,-18 Z" fill="${h}" opacity=".6"/>`,
  },
  // Men only
  quiff: {
    back: h => `<path d="M-70,0 C-78,-60 -44,-88 0,-88 C44,-88 78,-60 70,0 Q64,-24 50,-34 L-50,-34 Q-64,-24 -70,0 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-64,-28 C-62,-72 -20,-104 30,-98 C64,-94 76,-70 68,-34 C60,-58 40,-70 14,-68 C-20,-66 -46,-50 -64,-28 Z" fill="${h}" ${SW(5)}/>
      <path d="M-10,-86 Q20,-96 46,-82" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/>`,
  },
  curtains: {
    back: h => `<path d="M-74,6 C-82,-62 -44,-90 0,-90 C44,-90 82,-62 74,6 Q66,-22 52,-30 L-52,-30 Q-66,-22 -74,6 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-2,-82 C-36,-82 -64,-62 -70,-14 C-58,-36 -36,-50 -6,-52 Z" fill="${h}" ${SW(5)}/><path d="M2,-82 C36,-82 64,-62 70,-14 C58,-36 36,-50 6,-52 Z" fill="${h}" ${SW(5)}/>`,
  },
  slick: {
    back: h => `<path d="M-72,-4 C-80,-66 -42,-90 0,-90 C42,-90 80,-66 72,-4 Q66,-30 50,-40 L-50,-40 Q-66,-30 -72,-4 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-66,-30 C-60,-74 -20,-92 20,-90 C54,-88 72,-66 68,-30 C56,-56 30,-66 0,-64 C-28,-62 -50,-50 -66,-30 Z" fill="${h}" ${SW(5)}/>
      <path d="M-36,-70 Q0,-84 40,-72 M-30,-58 Q4,-70 44,-60" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="4" stroke-linecap="round"/>`,
  },
  tousled: {
    back: h => `<path d="M-74,4 C-84,-60 -46,-92 0,-92 C46,-92 84,-60 74,4 Q66,-24 52,-32 L-52,-32 Q-66,-24 -74,4 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-68,-20 C-70,-50 -58,-64 -44,-60 C-44,-82 -22,-90 -8,-78 C2,-96 30,-94 36,-76 C54,-80 70,-62 62,-46 C72,-40 72,-28 68,-22 C50,-48 22,-56 -4,-54 C-30,-52 -52,-40 -68,-20 Z" fill="${h}" ${SW(5)}/>`,
  },
};

// Outfits are drawn in body space (hip = 0,0). "sleeve" is the arm colour.
const OUTFIT_ART = {
  laceTop: { // sheer black lace with wide bell sleeves (Gabi)
    sleeve: () => 'url(#lace)', top: () => 'url(#lace)',
    svg: () => `<path d="M-30,-190 Q0,-170 30,-190" fill="none" stroke="${INK}" stroke-width="4"/>
      <path d="M-104,-60 Q-150,-20 -140,30 L-96,10 Z M104,-60 Q150,-20 140,30 L96,10 Z" fill="url(#lace)" ${SW(5)}/>
      <path d="M-60,-120 Q0,-100 60,-120 M-70,-60 Q0,-40 70,-60" fill="none" stroke="#4B4356" stroke-width="3"/>`,
  },
  blazer: { // high-neck top under an oversized blazer (Vix)
    sleeve: c => c,
    svg: c => `<rect x="-30" y="-208" width="60" height="30" rx="12" fill="${shade(c, 0.06)}" ${SW(5)}/>
      <path d="M-48,-190 L-14,-80 L-60,80 L-106,80 L-96,-142 Q-92,-184 -48,-190 Z" fill="${c}" ${SW(5)}/>
      <path d="M48,-190 L14,-80 L60,80 L106,80 L96,-142 Q92,-184 48,-190 Z" fill="${c}" ${SW(5)}/>
      <path d="M-48,-190 L-26,-130 L-42,-120 L-14,-80 M48,-190 L26,-130 L42,-120 L14,-80" fill="none" stroke="${shade(c, 0.18)}" stroke-width="4"/>`,
  },
  cardigan: {
    sleeve: c => c,
    svg: c => `<path d="M-34,-190 L0,-150 L34,-190 Z" fill="#FFFFFF" ${SW(5)}/>
      <path d="M0,-150 L0,80" ${SW(5)}/>
      <circle cx="14" cy="-112" r="5" fill="${INK}"/><circle cx="14" cy="-66" r="5" fill="${INK}"/><circle cx="14" cy="-20" r="5" fill="${INK}"/>
      <path d="M-80,-60 h40 v26 h-40 Z" fill="${shade(c, -0.12)}" ${SW(4)}/>`,
  },
  turtleneck: {
    sleeve: c => c,
    svg: c => `<rect x="-34" y="-206" width="68" height="30" rx="13" fill="${shade(c, -0.1)}" ${SW(5)}/>
      <path d="M-20,-200 v18 M-7,-202 v22 M7,-202 v22 M20,-200 v18" stroke="${shade(c, -0.25)}" stroke-width="3" stroke-linecap="round"/>`,
  },
};

// The guy's outfits. Each returns { sleeve, top, svg }.
const GUY_OUTFITS = {
  overshirt: c => ({ sleeve: c, top: c, svg: `<path d="M-36,-190 L-6,-150 L-20,-196 Z M36,-190 L6,-150 L20,-196 Z" fill="${shade(c, -0.15)}" ${SW(4)}/>
      <path d="M-18,-160 L18,-160 L0,-130 Z" fill="#F3F0EA" ${SW(3)}/><path d="M0,-150 L0,80" ${SW(4)}/>
      <rect x="-70" y="-120" width="40" height="34" rx="4" fill="${shade(c, -0.08)}" ${SW(4)}/><rect x="30" y="-120" width="40" height="34" rx="4" fill="${shade(c, -0.08)}" ${SW(4)}/>` }),
  leather: () => ({ sleeve: '#1C1A1F', top: '#1C1A1F', svg: `<path d="M-26,-192 L0,-150 L26,-192 Z" fill="#F3F0EA" ${SW(4)}/>
      <path d="M-50,-190 L-70,-120 L-30,-110 L-8,-150 Z M50,-190 L70,-120 L30,-110 L8,-150 Z" fill="#2B272F" ${SW(4)}/>
      <path d="M6,-150 L18,80" stroke="#C9C2B4" stroke-width="4"/>` }),
  knitPolo: c => ({ sleeve: c, top: c, svg: `<path d="M-34,-190 L0,-160 L34,-190 L24,-170 L0,-150 L-24,-170 Z" fill="${shade(c, 0.25)}" ${SW(4)}/>
      <path d="M0,-158 L0,-110" ${SW(3)}/><circle cx="0" cy="-140" r="3" fill="${INK}"/><circle cx="0" cy="-122" r="3" fill="${INK}"/>
      <path d="M-100,-60 L100,-60 M-100,-40 L100,-40" stroke="${shade(c, -0.18)}" stroke-width="6"/>` }),
  openShirt: c => ({ sleeve: c, top: c, svg: `<path d="M-24,-190 L0,-110 L24,-190 Z" fill="#F3F0EA" ${SW(4)}/>
      <path d="M-40,-192 L-60,-150 L-10,-120 L0,-110 Z M40,-192 L60,-150 L10,-120 L0,-110 Z" fill="${shade(c, -0.12)}" ${SW(4)}/>
      <path d="M-14,-160 Q0,-140 14,-160" fill="none" stroke="#D9B45C" stroke-width="3"/>` }),
  turtleneckJacket: c => ({ sleeve: '#3C3A44', top: '#3C3A44', svg: `<rect x="-32" y="-206" width="64" height="30" rx="12" fill="${c}" ${SW(4)}/>
      <path d="M-48,-190 L-14,-80 L-60,80 L-106,80 L-96,-142 Q-92,-184 -48,-190 Z" fill="#3C3A44" ${SW(5)}/>
      <path d="M48,-190 L14,-80 L60,80 L106,80 L96,-142 Q92,-184 48,-190 Z" fill="#3C3A44" ${SW(5)}/>` }),
  suede: () => ({ sleeve: '#A9744B', top: '#A9744B', svg: `<path d="M-30,-190 Q0,-170 30,-190" fill="none" ${SW(4)}/>
      <path d="M-100,60 L100,60" stroke="#8C5E3B" stroke-width="10"/><path d="M0,-180 L0,60" stroke="#8C5E3B" stroke-width="4"/>` }),
};

/* Face extras */
const ROUND_GLASSES = col => `<g fill="#fff" fill-opacity=".2" stroke="${col}" stroke-width="5">
  <circle cx="-26" cy="0" r="19"/><circle cx="26" cy="0" r="19"/><path d="M-7,-2 Q0,-7 7,-2" fill="none"/></g>`;
const roundGlassesProfile = (d, col) => `<g fill="#fff" fill-opacity=".2" stroke="${col}" stroke-width="5">
  <circle cx="${30 * d}" cy="0" r="19"/><path d="M${11 * d},-2 L${-30 * d},-6" fill="none"/></g>`;
const MAKEUP = `<g fill="none" stroke="${INK}" stroke-linecap="round">
  <path d="M-33,-6 L-44,-12 M33,-6 L44,-12" stroke-width="4"/>
  <path d="M-30,-10 l-4,-6 M-24,-12 l-2,-7 M30,-10 l4,-6 M24,-12 l2,-7" stroke-width="2.5"/></g>`;
const makeupProfile = d => `<path d="M${40 * d},-3 L${50 * d},-10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
const POUT = `<path d="M-9,34 Q-12,26 -4,27 Q0,24 4,27 Q12,26 9,34 Q6,44 0,44 Q-6,44 -9,34 Z" fill="#D9667F" ${SW(3.5)}/>
  <path d="M-6,34 Q0,36 6,34" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
const LIP_SMILE = `<path d="M-17,32 Q0,47 17,32" fill="none" ${SW(5)}/><path d="M-10,37 Q0,43 10,37" fill="none" stroke="#D9667F" stroke-width="3" stroke-linecap="round"/>`;
// Vix's resting "mean" face: heavy lids, brows that slope in, and a one-sided smirk.
const meanLids = skin => `<g><path d="M-36,-17 L-16,-17 L-16,-4 Q-26,-7 -36,-4 Z M16,-17 L36,-17 L36,-4 Q26,-7 16,-4 Z" fill="${skin}"/>
  <path d="M-36,-4 Q-26,-7 -16,-4 M16,-4 Q26,-7 36,-4" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/></g>`;
const MEAN_BROWS = `<path class="brows" d="M-39,-30 Q-28,-30 -15,-23 M15,-23 Q28,-30 39,-30" fill="none" ${SW(5.5)}/>`;
const SMIRK = `<path d="M-13,37 Q2,40 15,30" fill="none" ${SW(5)}/><path d="M-6,39 Q4,40 10,36" fill="none" stroke="#C9566E" stroke-width="3" stroke-linecap="round"/>`;
const MALE_HEAD = skin => `<path d="M-70,-2 C-70,-42 -40,-72 0,-72 C40,-72 70,-42 70,-2 L67,30 Q60,68 0,76 Q-60,68 -67,30 Z" fill="${skin}" ${SW()}/>`;
const maleBrows = h => `<path class="brows" d="M-40,-26 L-14,-24 M14,-24 L40,-26" stroke="${h}" stroke-width="8" stroke-linecap="round"/>`;
const maleBrowProfile = (d, h) => `<path d="M${14 * d},-24 L${44 * d},-26" stroke="${h}" stroke-width="8" stroke-linecap="round"/>`;
// Facial hair sits under the eyes and mouth. The beard leaves a skin-coloured gap round the lips.
const BEARD = h => `<path fill-rule="evenodd" d="M-69,4 L-66,32 Q-58,72 0,80 Q58,72 66,32 L69,4 C58,26 44,34 28,34 Q0,26 -28,34 C-44,34 -58,26 -69,4 Z M-19,38 a19,11 0 1,0 38,0 a19,11 0 1,0 -38,0 Z" fill="${h}" ${SW(5)}/>
  <path d="M-22,29 Q-11,21 0,26 Q11,21 22,29 Q11,32 0,29 Q-11,32 -22,29 Z" fill="${h}" ${SW(3)}/>`;
const STUBBLE = h => `<path fill-rule="evenodd" d="M-64,14 Q-58,62 0,72 Q58,62 64,14 C52,34 38,40 24,38 Q0,30 -24,38 C-38,40 -52,34 -64,14 Z M-18,38 a18,10 0 1,0 36,0 a18,10 0 1,0 -36,0 Z" fill="${h}" opacity=".26"/>
  <path d="M-20,28 Q0,22 20,28" fill="none" stroke="${h}" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`;
const beardProfile = (d, h) => `<path d="M${-34 * d},8 C${-30 * d},52 ${0 * d},78 ${30 * d},78 C${48 * d},76 ${60 * d},64 ${60 * d},50 C${52 * d},52 ${42 * d},46 ${36 * d},36 C${18 * d},40 ${-10 * d},30 ${-34 * d},8 Z" fill="${h}" ${SW(5)}/>
  <path d="M${50 * d},26 Q${60 * d},20 ${72 * d},26" fill="none" stroke="${h}" stroke-width="7" stroke-linecap="round"/>`;
const stubbleProfile = (d, h) => `<path d="M${-30 * d},14 C${-24 * d},54 ${0 * d},72 ${30 * d},72 C${52 * d},70 ${62 * d},60 ${64 * d},46 C${52 * d},50 ${40 * d},44 ${34 * d},36 C${16 * d},40 ${-8 * d},32 ${-30 * d},14 Z" fill="${h}" opacity=".28"/>`;

/* A girl's settings (see GIRLS / DEFAULT_CUSTOM in config.js) -> options for coworkerBody. */
function girlOpts(m, dir) {
  const hair = HAIR_ART[m.hairStyle] || HAIR_ART.wavy;
  const outfit = OUTFIT_ART[m.outfit] || OUTFIT_ART.turtleneck;
  return {
    dir, skin: m.skin, top: outfit.top ? outfit.top(m.outfitColour) : m.outfitColour, sleeve: outfit.sleeve(m.outfitColour),
    outfit: outfit.svg(m.outfitColour), hairBack: hair.back(m.hair), hairFront: hair.front(m.hair),
    smile: m.mouth === 'pout' ? POUT : m.mouth === 'smirk' ? SMIRK : (m.makeup ? LIP_SMILE : null),
    brows: m.mood === 'mean' ? MEAN_BROWS : null,
    eyeLids: m.mood === 'mean' ? meanLids(m.skin) : '',
    faceExtra: (m.makeup ? MAKEUP : '') + (m.glasses ? ROUND_GLASSES(INK) : ''),
    profileExtra: (m.makeup ? makeupProfile(dir) : '') + (m.glasses ? roundGlassesProfile(dir, INK) : ''),
  };
}

/* A random guy: white skin tones, varied hair, facial hair, glasses and outfit. */
function randomGuy() {
  const outfitKey = pick(Object.keys(GUY_OUTFITS)), r = Math.random();
  return {
    name: pick(GUY_NAMES), skin: pick(GUY_SKIN), hair: pick(GUY_HAIR), hairStyle: pick(GUY_HAIR_STYLES),
    outfitKey, colour: pick(GUY_COLOURS), facial: r < 0.35 ? 'stubble' : r < 0.55 ? 'beard' : 'none',
    glasses: Math.random() < 0.4 ? pick(GUY_GLASSES) : null,
  };
}
function guyOpts(g, dir) {
  const hair = HAIR_ART[g.hairStyle] || HAIR_ART.crop;
  const o = GUY_OUTFITS[g.outfitKey](g.colour);
  const facial = g.facial === 'stubble' ? STUBBLE(g.hair) : g.facial === 'beard' ? BEARD(g.hair) : '';
  const facialP = g.facial === 'stubble' ? stubbleProfile(dir, g.hair) : g.facial === 'beard' ? beardProfile(dir, g.hair) : '';
  return {
    dir, male: true, skin: g.skin, top: o.top, sleeve: o.sleeve, outfit: o.svg,
    hairBack: hair.back(g.hair), hairFront: hair.front(g.hair), head: MALE_HEAD(g.skin),
    brows: maleBrows(g.hair), profileBrow: maleBrowProfile(dir, g.hair),
    faceUnder: facial, profileUnder: facialP,
    faceExtra: g.glasses ? ROUND_GLASSES(g.glasses) : '',
    profileExtra: g.glasses ? roundGlassesProfile(dir, g.glasses) : '',
  };
}

function managerSVG() {
  const skin = '#E8B896', hair = '#B3B0C6', blazer = '#4A4560', chair = '#5E527F';
  const head = `<circle cx="0" cy="-255" r="70" fill="${skin}" ${SW(7)}/>`;
  const trousers = '#35304A', shoe = '#1E1A22';
  const seat = `<rect x="-104" y="10" width="208" height="26" rx="11" fill="${chair}" ${SW(6)}/>`;
  // Shins and shoes carry classes so the renderer can keep the feet on the floor when the boss stands up.
  const shoes = (pts, rx) => `<g class="shoes">${pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="13" fill="${shoe}" ${SW(5)}/><path d="M${x - rx * 0.5},${y - 6} q${rx * 0.3},-4 ${rx * 0.6},-2" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>`;
  const shins = (top, rects) => `<g class="shins" data-top="${top}" data-len="${120 - top}">${rects.map(([x, w]) => `<rect x="${x}" y="${top}" width="${w}" height="${120 - top}" rx="12" fill="${trousers}" ${SW(6)}/>`).join('')}</g>`;
  const legsFront = `<g class="legs">${seat}${shins(36, [[-66, 44], [22, 44]])}
    <rect x="-80" y="-4" width="74" height="52" rx="24" fill="${trousers}" ${SW(6)}/><rect x="6" y="-4" width="74" height="52" rx="24" fill="${trousers}" ${SW(6)}/>
    ${shoes([[-46, 124], [46, 124]], 32)}</g>`;
  const legsBack = `<g class="legs">${shins(44, [[-62, 34], [28, 34]])}${shoes([[-46, 124], [46, 124]], 22)}${seat}</g>`;
  const legsSide = `<g class="legs">${seat}${shins(22, [[-100, 44]])}
    <rect x="-100" y="-8" width="112" height="46" rx="22" fill="${trousers}" ${SW(6)}/>
    ${shoes([[-96, 124]], 38)}</g>`;
  return `
  <g id="mgrChairBase" ${SW(7)}>
    <path d="M0,10 L0,112" stroke-width="20"/><path d="M0,10 L0,112" stroke="#3D3557" stroke-width="10"/>
    <path d="M-80,124 L80,124" stroke-width="16"/>
    <circle cx="-80" cy="132" r="11" fill="#3D3557"/><circle cx="80" cy="132" r="11" fill="#3D3557"/><circle cx="0" cy="132" r="11" fill="#3D3557"/>
  </g>
  <!-- BACK VIEW -->
  <g id="mgrBack">
    ${legsBack}
    <g id="actStretchArms" display="none">
      ${limb('M-80,-168 Q-150,-230 -150,-322', blazer, 38)}${limb('M80,-168 Q150,-230 150,-322', blazer, 38)}
      <circle cx="-150" cy="-332" r="18" fill="${skin}" ${SW(6)}/><circle cx="150" cy="-332" r="18" fill="${skin}" ${SW(6)}/>
    </g>
    <path d="M-110,20 L-102,-150 Q-98,-186 -56,-192 L56,-192 Q98,-186 102,-150 L110,20 Z" fill="${blazer}" ${SW(7)}/>
    <path d="M0,-192 L0,-120" stroke="#3D3557" stroke-width="5"/>
    <rect x="-22" y="-214" width="44" height="30" fill="${skin}" ${SW(6)}/>
    <circle cx="-74" cy="-246" r="14" fill="${skin}" ${SW(6)}/><circle cx="74" cy="-246" r="14" fill="${skin}" ${SW(6)}/>
    <path d="M-80,-232 Q-88,-332 0,-334 Q88,-332 80,-232 Q78,-198 50,-194 L-50,-194 Q-78,-198 -80,-232 Z" fill="${hair}" ${SW(7)}/>
    <path d="M-40,-300 Q-50,-250 -44,-206 M0,-312 L0,-200 M40,-300 Q50,-250 44,-206" fill="none" stroke="#9894B0" stroke-width="5" stroke-linecap="round"/>
    <rect x="-102" y="-142" width="204" height="166" rx="46" fill="${chair}" ${SW(7)}/>
    <rect x="-80" y="-120" width="160" height="120" rx="34" fill="#6C5F90"/>
    <g id="actType">
      <ellipse id="elbowL" cx="-112" cy="-88" rx="22" ry="27" fill="${blazer}" ${SW(6)}/>
      <ellipse id="elbowR" cx="112" cy="-88" rx="22" ry="27" fill="${blazer}" ${SW(6)}/>
    </g>
    <g id="actCoffee" display="none">
      ${limb('M88,-150 Q138,-170 118,-232', blazer, 36)}
      <g id="mug">
        <path d="M150,-276 q16,0 16,14 q0,14 -16,12" fill="none" ${SW(6)}/>
        <rect x="100" y="-294" width="52" height="52" rx="8" fill="#7B5CC4" ${SW(6)}/>
        <text x="126" y="-260" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-weight="900" font-size="20" fill="#fff">#1</text>
      </g>
      <circle cx="116" cy="-238" r="17" fill="${skin}" ${SW(6)}/>
    </g>
    <g id="actRead" display="none">
      ${limb('M-88,-150 Q-140,-180 -118,-236', blazer, 36)}
      <g id="paper" transform="rotate(-8 -150 -280)">
        <rect x="-214" y="-350" width="120" height="150" rx="5" fill="#fff" ${SW(6)}/>
        <path d="M-196,-320 H-112 M-196,-298 H-112 M-196,-276 H-130 M-196,-254 H-112 M-196,-232 H-150" stroke="#C3C8EE" stroke-width="7" stroke-linecap="round"/>
      </g>
      <circle cx="-116" cy="-240" r="17" fill="${skin}" ${SW(6)}/>
    </g>
    <g id="actPhone" display="none">
      ${limb('M88,-150 Q132,-196 92,-244', blazer, 36)}
      <g class="phone-hand">
        <rect x="66" y="-300" width="30" height="66" rx="9" fill="#3D3557" ${SW(6)}/>
        <circle cx="92" cy="-250" r="17" fill="${skin}" ${SW(6)}/>
      </g>
    </g>
    <!-- Left-hand phone: the mirror of actPhone, used after the phone bluff -->
    <g id="actPhoneL" display="none">
      ${limb('M-88,-150 Q-132,-196 -92,-244', blazer, 36)}
      <g class="phone-hand">
        <rect x="-96" y="-300" width="30" height="66" rx="9" fill="#3D3557" ${SW(6)}/>
        <circle cx="-92" cy="-250" r="17" fill="${skin}" ${SW(6)}/>
      </g>
    </g>
  </g>
  <!-- SIDE VIEW (turning toward the couple) -->
  <g id="mgrSide" display="none">
    ${legsSide}
    <path d="M-100,20 L-94,-150 Q-90,-186 -50,-192 L50,-192 Q86,-186 90,-150 L96,20 Z" fill="${blazer}" ${SW(7)}/>
    <path d="M-60,-192 L-38,-140 L-26,-192 Z" fill="#fff" ${SW(5)}/>
    <rect x="-20" y="-214" width="40" height="30" fill="${skin}" ${SW(6)}/>
    ${head}
    <path d="M-64,-298 Q0,-346 62,-306 Q90,-280 82,-230 Q78,-198 44,-194 L22,-194 Q36,-236 14,-262 Q-18,-292 -64,-298 Z" fill="${hair}" ${SW(7)}/>
    <path d="M12,-262 q-14,0 -14,14 q0,14 14,12" fill="${skin}" ${SW(6)}/>
    <rect x="-74" y="-272" width="34" height="26" rx="4" fill="#fff" fill-opacity=".35" ${SW(6)}/>
    <path d="M-40,-262 L10,-262" ${SW(5)}/>
    <circle cx="-56" cy="-258" r="6" fill="${INK}"/>
    <path id="sideBrow" d="M-78,-288 L-40,-294" ${SW(8)}/>
    <path d="M-68,-246 L-90,-226 L-66,-222" fill="${skin}" ${SW(6)}/>
    <path d="M-66,-206 L-46,-208" ${SW(6)}/>
    <rect x="-42" y="-138" width="164" height="160" rx="44" fill="${chair}" ${SW(7)}/>
    <rect x="-22" y="-116" width="124" height="114" rx="32" fill="#6C5F90"/>
  </g>
  <!-- FRONT VIEW (watching) -->
  <g id="mgrFront" display="none">
    <rect x="-106" y="-150" width="212" height="174" rx="48" fill="${chair}" ${SW(7)}/>
    ${legsFront}
    <path d="M-110,20 L-102,-150 Q-98,-186 -56,-192 L56,-192 Q98,-186 102,-150 L110,20 Z" fill="${blazer}" ${SW(7)}/>
    <path d="M-36,-192 L0,-112 L36,-192 Z" fill="#fff" ${SW(5)}/>
    <path d="M-10,-186 L10,-186 L15,-130 L0,-112 L-15,-130 Z" fill="#C2385A" ${SW(5)}/>
    <path d="M-56,-192 L-14,-120 M56,-192 L14,-120" ${SW(5)}/>
    <rect x="-22" y="-214" width="44" height="30" fill="${skin}" ${SW(6)}/>
    <rect x="-100" y="-120" width="200" height="52" rx="26" fill="#433E58" ${SW(7)}/>
    <circle cx="-74" cy="-94" r="17" fill="${skin}" ${SW(6)}/><circle cx="74" cy="-94" r="17" fill="${skin}" ${SW(6)}/>
    <path d="M-86,-200 Q-96,-336 0,-336 Q96,-336 86,-200 Q60,-188 50,-200 L-50,-200 Q-60,-188 -86,-200 Z" fill="${hair}" ${SW(7)}/>
    <circle cx="-71" cy="-250" r="13" fill="${skin}" ${SW(6)}/><circle cx="71" cy="-250" r="13" fill="${skin}" ${SW(6)}/>
    ${head}
    <path d="M-68,-262 Q-62,-322 0,-326 Q62,-322 68,-262 Q40,-300 0,-296 Q-36,-298 -68,-262 Z" fill="${hair}" ${SW(6)}/>
    <g id="mgrEyes"><circle cx="-33" cy="-252" r="7.5" fill="${INK}"/><circle cx="33" cy="-252" r="7.5" fill="${INK}"/></g>
    <g id="mgrLids" fill="${skin}"><rect x="-48" y="-268" width="30" height="14"/><rect x="18" y="-268" width="30" height="14"/></g>
    <g fill="#fff" fill-opacity=".3" ${SW(6)}>
      <rect x="-58" y="-272" width="48" height="36" rx="6"/><rect x="10" y="-272" width="48" height="36" rx="6"/><path d="M-10,-256 L10,-256" fill="none"/>
    </g>
    <path id="mgrBrowStern" d="M-62,-288 L-14,-276 M62,-288 L14,-276" ${SW(9)}/>
    <path id="mgrBrowUp" display="none" d="M-60,-292 Q-38,-306 -14,-296 M60,-292 Q38,-306 14,-296" fill="none" ${SW(9)}/>
    <path d="M-6,-238 Q0,-226 6,-238" fill="none" ${SW(5)}/>
    <path id="mgrMouthFlat" d="M-22,-208 Q0,-213 22,-208" fill="none" ${SW(6)}/>
    <ellipse id="mgrMouthO" display="none" cx="0" cy="-206" rx="13" ry="17" fill="#7A2840" ${SW(5)}/>
  </g>`;
}

function walkerSVG() {
  const cups = Array.from({ length: 6 }, (_, i) => `
    <g transform="translate(0,${-i * 36})">
      <path d="M-22,0 L22,0 L18,-34 L-18,-34 Z" fill="#fff" ${SW(4)}/>
      <rect x="-21" y="-22" width="42" height="11" fill="#C98A5E" ${SW(3)}/>
      <rect x="-22" y="-40" width="44" height="8" rx="3" fill="${['#FF8FAB','#8ED8C4','#FFE08A'][i % 3]}" ${SW(3)}/>
    </g>`).join('');
  return `
    <g id="wLegs">
      <g id="wLegA">${limb('M0,-96 L0,-6', '#3D3557', 16)}</g>
      <g id="wLegB">${limb('M0,-96 L0,-6', '#3D3557', 16)}</g>
    </g>
    ${limb('M-30,-176 L-34,-250', '#FF8C69', 18)}${limb('M30,-176 L34,-250', '#FF8C69', 18)}
    <path d="M-44,-90 Q-48,-196 0,-200 Q48,-196 44,-90 Z" fill="#FF8C69" ${SW(6)}/>
    <circle cx="0" cy="-232" r="32" fill="#A86B45" ${SW(6)}/>
    <path d="M-30,-244 Q-24,-276 6,-272 Q30,-268 32,-240 Q14,-256 -30,-244 Z" fill="${INK}"/>
    <path d="M-12,-226 L-12,-220 M12,-226 L12,-220" ${SW(5)}/>
    <ellipse cx="0" cy="-210" rx="6" ry="5" fill="#7A2840"/>
    <g id="wCups" transform="translate(0,-262)">${cups}</g>`;
}

