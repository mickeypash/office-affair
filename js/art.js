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
  <g class="cw">
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
      <circle r="70" fill="${o.skin}" ${SW()}/>
      <g class="ear-profile" display="none">
        <path d="M${X(-30)},-6 q${X(-16)},2 ${X(-14)},16 q${X(2)},12 ${X(14)},10" fill="${o.skin}" ${SW(5)}/>
      </g>
      <g class="f-front">
        <g class="blush-f" opacity=".3">
          <ellipse cx="-44" cy="24" rx="13" ry="8" fill="#FF6F91"/><ellipse cx="44" cy="24" rx="13" ry="8" fill="#FF6F91"/>
        </g>
        <g class="eyes-open"><g class="pupils">
          <ellipse cx="-26" cy="0" rx="7.5" ry="10.5" fill="${INK}"/><ellipse cx="26" cy="0" rx="7.5" ry="10.5" fill="${INK}"/>
          <circle cx="-23.5" cy="-4" r="2.8" fill="#fff"/><circle cx="28.5" cy="-4" r="2.8" fill="#fff"/>
        </g></g>
        <g class="eyes-blink" display="none"><path d="M-35,1 L-17,1 M17,1 L35,1" ${SW(5)}/></g>
        <g class="eyes-happy" display="none"><path d="M-36,4 Q-26,-8 -16,4 M16,4 Q26,-8 36,4" fill="none" ${SW(5)}/></g>
        <g class="eyes-wide" display="none">
          <circle cx="-26" cy="-2" r="14" fill="#fff" ${SW(4)}/><circle cx="26" cy="-2" r="14" fill="#fff" ${SW(4)}/>
          <circle cx="-26" cy="-2" r="5" fill="${INK}"/><circle cx="26" cy="-2" r="5" fill="${INK}"/>
        </g>
        <path class="brows" d="M-37,-27 Q-27,-34 -16,-28 M16,-28 Q27,-34 37,-27" fill="none" ${SW(5)}/>
        <path class="brows-sad" display="none" d="M-36,-24 Q-28,-30 -16,-34 M16,-34 Q28,-30 36,-24" fill="none" ${SW(5)}/>
        <path d="M-5,14 Q0,21 5,14" fill="none" ${SW(4)}/>
        <path class="m-smile" d="M-17,32 Q0,47 17,32" fill="none" ${SW(5)}/>
        <path class="m-grin" display="none" d="M-22,30 Q0,58 22,30 Z" fill="#7A2840" ${SW(4)}/>
        <ellipse class="m-o" display="none" cx="0" cy="40" rx="10" ry="13" fill="#7A2840" ${SW(4)}/>
        <path class="m-nerv" display="none" d="M-20,37 L-10,32 L0,37 L10,32 L20,37" fill="none" ${SW(4)}/>
        <path class="m-sad" display="none" d="M-15,43 Q0,32 15,43" fill="none" ${SW(5)}/>
        <path class="sweat" display="none" d="M${X(-60)},-34 q-9,14 0,18 q9,-4 0,-18 Z" fill="#9AD8F5" ${SW(3)}/>
        ${o.glassesFront || ''}
      </g>
      <g class="f-profile" display="none">
        <ellipse cx="${X(32)}" cy="24" rx="14" ry="8" fill="#FF6F91" opacity=".55"/>
        <path d="M${X(18)},-2 Q${X(28)},7 ${X(40)},-2" fill="none" ${SW(5)}/>
        <path d="M${X(14)},-25 Q${X(28)},-32 ${X(42)},-24" fill="none" ${SW(5)}/>
        <path d="M${X(64)},-4 Q${X(84)},10 ${X(66)},18" fill="${o.skin}" ${SW(4.5)}/>
        <ellipse cx="${X(66)}" cy="35" rx="9" ry="8" fill="#E8466F" ${SW(3.5)}/>
        ${o.glassesProfile || ''}
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

/* ---- Customisable parts. Each builder takes colours and returns SVG. ---- */
// Hair is drawn in head space (head centre = 0,0, radius 70).
// "back" goes behind the face, "front" goes over the forehead.
const HAIR_ART = {
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
  long: {
    back: h => `<path d="M-86,134 L-86,-8 C-92,-72 -48,-92 0,-92 C48,-92 92,-72 86,-8 L86,134 Q66,146 52,126 L52,30 L-52,30 L-52,126 Q-66,146 -86,134 Z" fill="${h}" ${SW(6)}/>`,
    front: h => `<path d="M-70,-4 C-72,-66 -32,-86 0,-86 C32,-86 72,-66 70,-4 C58,-40 30,-58 4,-60 L0,-48 L-4,-60 C-30,-58 -58,-40 -70,-4 Z" fill="${h}" ${SW(5)}/>`,
  },
  shaved: {
    back: () => '',
    front: h => `<path d="M-68,-18 C-64,-70 -30,-76 0,-76 C30,-76 64,-70 68,-18 C42,-48 -42,-48 -68,-18 Z" fill="${h}" opacity=".6"/>`,
  },
};

// Outfits are drawn in body space (hip = 0,0). "sleeve" is the arm colour.
const OUTFIT_ART = {
  cardigan: {
    sleeve: c => c,
    svg: c => `
    <path d="M-34,-190 L0,-150 L34,-190 Z" fill="#FFFFFF" ${SW(5)}/>
    <path d="M0,-150 L0,80" ${SW(5)}/>
    <circle cx="14" cy="-112" r="5" fill="${INK}"/><circle cx="14" cy="-66" r="5" fill="${INK}"/><circle cx="14" cy="-20" r="5" fill="${INK}"/>
    <path d="M-80,-60 h40 v26 h-40 Z" fill="${shade(c, -0.12)}" ${SW(4)}/>
    <path d="M-66,-60 v-14" stroke="#FF4F86" stroke-width="5" stroke-linecap="round"/>`,
  },
  vest: {
    sleeve: () => '#F3F0FA',
    svg: c => `
    <path d="M-44,-190 L0,-118 L44,-190 Z" fill="#F3F0FA" ${SW(5)}/>
    <path d="M-30,-190 L-12,-174 L0,-186 L12,-174 L30,-190" fill="#FFFFFF" ${SW(4)}/>
    <path d="M-8,-182 L8,-182 L12,-140 L0,-124 L-12,-140 Z" fill="#FF4F86" ${SW(4)}/>
    <g fill="${shade(c, 0.14)}"><path d="M-70,-90 l14,-18 l14,18 l-14,18 Z"/><path d="M56,-90 l14,-18 l14,18 l-14,18 Z"/><path d="M-70,-30 l14,-18 l14,18 l-14,18 Z"/><path d="M56,-30 l14,-18 l14,18 l-14,18 Z"/></g>`,
  },
  turtleneck: {
    sleeve: c => c,
    svg: c => `
    <rect x="-34" y="-206" width="68" height="30" rx="13" fill="${shade(c, -0.1)}" ${SW(5)}/>
    <path d="M-20,-200 v18 M-7,-202 v22 M7,-202 v22 M20,-200 v18" stroke="${shade(c, -0.25)}" stroke-width="3" stroke-linecap="round"/>
    <path d="M-60,-120 Q0,-106 60,-120" fill="none" stroke="${shade(c, -0.12)}" stroke-width="5" stroke-linecap="round"/>`,
  },
};

const GLASSES_FRONT = `<g fill="#fff" fill-opacity=".18" ${SW(4)}>
  <circle cx="-26" cy="0" r="20"/><circle cx="26" cy="0" r="20"/><path d="M-6,-2 Q0,-7 6,-2" fill="none"/></g>`;
const glassesProfile = d => `<g fill="#fff" fill-opacity=".18" ${SW(4)}>
  <circle cx="${30 * d}" cy="0" r="20"/><path d="M${10 * d},-2 L${-30 * d},-6" fill="none"/></g>`;

/* Turn a cast member's settings (see DEFAULT_CAST) into options for the builders above. */
function coworkerOpts(m, dir) {
  const hair = HAIR_ART[m.hairStyle] || HAIR_ART.curls;
  const outfit = OUTFIT_ART[m.outfit] || OUTFIT_ART.cardigan;
  return {
    dir, skin: m.skin, top: m.outfitColour, sleeve: outfit.sleeve(m.outfitColour),
    outfit: outfit.svg(m.outfitColour),
    hairBack: hair.back(m.hair), hairFront: hair.front(m.hair),
    glassesFront: m.glasses ? GLASSES_FRONT : '', glassesProfile: m.glasses ? glassesProfile(dir) : '',
  };
}

function managerSVG() {
  const skin = '#E8B896', hair = '#B3B0C6', blazer = '#4A4560', chair = '#5E527F';
  const head = `<circle cx="0" cy="-255" r="70" fill="${skin}" ${SW(7)}/>`;
  return `
  <g id="mgrChairBase" ${SW(7)}>
    <path d="M0,10 L0,112" stroke-width="20"/><path d="M0,10 L0,112" stroke="#3D3557" stroke-width="10"/>
    <path d="M-80,124 L80,124" stroke-width="16"/>
    <circle cx="-80" cy="132" r="11" fill="#3D3557"/><circle cx="80" cy="132" r="11" fill="#3D3557"/><circle cx="0" cy="132" r="11" fill="#3D3557"/>
  </g>
  <!-- BACK VIEW -->
  <g id="mgrBack">
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
      <rect x="66" y="-300" width="30" height="66" rx="9" fill="#3D3557" ${SW(6)}/>
      <circle cx="92" cy="-250" r="17" fill="${skin}" ${SW(6)}/>
    </g>
  </g>
  <!-- SIDE VIEW (turning toward the couple) -->
  <g id="mgrSide" display="none">
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

