'use strict';
/* Posters for stories (see js/stories.js). Each is the inner markup of <g id="poster">, drawn in the poster's
   own coordinates (242×268, frame and tape included). The office poster stays in index.html.
   Ids inside a poster start with p<Name> so they cannot clash with the page. */
const POSTERS = {
  // NVIDIA: cartoon homage to the green eye-on-square logo over a silver wordmark on dark carbon fibre.
  nvidia: `
  <title>NVIDIA</title>
  <defs>
    <clipPath id="pNvidiaPhoto"><rect x="18" y="20" width="206" height="214"/></clipPath>
    <clipPath id="pNvidiaLeft"><rect x="0" y="0" width="104" height="268"/></clipPath>
    <clipPath id="pNvidiaSquare"><rect x="104" y="40" width="92" height="94"/></clipPath>
    <pattern id="pNvidiaWeave" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#1F1E23"/><rect width="3" height="3" fill="#29282E"/><rect x="3" y="3" width="3" height="3" fill="#29282E"/>
    </pattern>
    <radialGradient id="pNvidiaVignette" cx=".5" cy=".42" r=".7">
      <stop offset="0" stop-color="#3A3940" stop-opacity=".35"/><stop offset=".6" stop-color="#111014" stop-opacity="0"/><stop offset="1" stop-color="#0B0A0D" stop-opacity=".7"/>
    </radialGradient>
    <linearGradient id="pNvidiaChrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F7F7F9"/><stop offset=".55" stop-color="#E6E6E8"/><stop offset=".56" stop-color="#CFCFD5"/><stop offset="1" stop-color="#B4B4BC"/>
    </linearGradient>
  </defs>
  <rect width="242" height="268" fill="#FFFFFF" stroke="#2B2340" stroke-width="5"/>
  <rect x="18" y="20" width="206" height="214" fill="url(#pNvidiaWeave)"/>
  <rect x="18" y="20" width="206" height="214" fill="url(#pNvidiaVignette)"/>
  <g clip-path="url(#pNvidiaPhoto)" stroke="#2B2340" stroke-linejoin="round" stroke-linecap="round">
    <g transform="translate(0,14)">
    <!-- soft drop shadow under the mark -->
    <g fill="#0C0B0E" stroke="none" opacity=".75" transform="translate(3,4)">
      <rect x="104" y="40" width="92" height="94"/>
      <path d="M104,50 C78,51 58,64 46,80 C60,100 80,120 104,122 Z"/>
    </g>
    <!-- left half: green bands on the dark ground -->
    <g clip-path="url(#pNvidiaLeft)" fill="#76B900" stroke-width="2.6">
      <path d="M104,50 C78,51 58,64 46,80 C60,100 80,120 104,122 L104,112 C86,110 72,97 61,80 C70,68 86,60 104,59 Z"/>
      <path d="M104,67 C88,68 78,75 72,83 C78,96 90,106 104,107 L104,97 C96,95 89,90 86,83 C90,78 96,75 104,75 Z"/>
      <path d="M100,55 C84,56 70,64 61,72 M100,71 C92,72 86,75 81,79" fill="none" stroke="#A8DE3E" stroke-width="2"/>
    </g>
    <!-- right half: green square with the eye cut out -->
    <rect x="104" y="40" width="92" height="94" fill="#76B900" stroke="none"/>
    <path d="M104,124 H196 V134 H104 Z" fill="#5E9600" stroke="none"/>
    <path d="M109,45 H191" fill="none" stroke="#A8DE3E" stroke-width="3"/>
    <g clip-path="url(#pNvidiaSquare)" fill="#1D1C21" stroke-width="2.6">
      <path d="M100,50 C144,49 172,68 187,100 C160,102 130,105 100,108.5 L100,103 C126,100 148,97 168,95.5 C156,71 132,59 100,59 Z"/>
      <path d="M100,67 C120,66 135,71 138,79 C137,84 130,88 120,92 C123,88 126,85 128,82 C123,78 113,75 100,75 Z"/>
    </g>
    <rect x="104" y="40" width="92" height="94" fill="none" stroke-width="3"/>
    </g>
    <!-- wordmark -->
    <g fill="url(#pNvidiaChrome)" stroke-width="2.6" fill-rule="evenodd" transform="translate(0,-2)">
      <path d="M34,202 V176 Q34,168 42,168 H56 Q64,168 64,176 V202 H55 V179 Q55,177 53,177 H45 Q43,177 43,179 V202 Z"/>
      <path d="M69,168 H79 L86,191 L93,168 H103 L91.5,202 H80.5 Z"/>
      <rect x="108" y="168" width="9.5" height="34"/>
      <path d="M123,168 H139 Q154,168 154,185 Q154,202 139,202 H123 Z M132.5,177 H138.5 Q144.5,177 144.5,185 Q144.5,193 138.5,193 H132.5 Z"/>
      <rect x="159.5" y="168" width="9.5" height="34"/>
      <path d="M174,202 L186,168 H197 L209,202 H199 L197,196 H186 L184,202 Z M188.5,189 H194.5 L191.5,179 Z"/>
    </g>
  </g>
  <rect x="18" y="20" width="206" height="214" fill="none" stroke="#D8D4CC" stroke-width="1.5"/>
  <rect x="170" y="246" width="54" height="2" fill="#999"/>
  <rect x="-12" y="-8" width="40" height="16" fill="#EFE8D8" opacity=".95" transform="rotate(-18 8 0)"/>
  <rect x="214" y="-8" width="40" height="16" fill="#EFE8D8" opacity=".95" transform="rotate(16 234 0)"/>
  `,
};
