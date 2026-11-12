'use strict';
/* The cast: who you play (a girl from CHARACTERS or your own girl) and tonight's random guy.
   Your pick and your custom girl are saved in localStorage. The guy is new every round.
   Only visible characters (PLAYABLE) can be picked; a saved pick of anyone else falls back to the first one. */
const PICKS = [...PLAYABLE.map(c => c.id), 'custom'];
const HEX = /^#[0-9a-f]{6}$/i;

/* Return a clean copy of a custom girl. Unknown or bad values fall back to the defaults. */
function cleanGirl(m) {
  const out = { ...DEFAULT_CUSTOM };
  if (!m || typeof m !== 'object') return out;
  if (typeof m.name === 'string') out.name = m.name.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) || DEFAULT_CUSTOM.name;
  for (const k of ['skin', 'hair', 'outfitColour']) if (HEX.test(m[k])) out[k] = m[k].toUpperCase();
  if (m.hairStyle in HAIR_STYLES) out.hairStyle = m.hairStyle;
  if (m.outfit in OUTFITS) out.outfit = m.outfit;
  if (typeof m.glasses === 'boolean') out.glasses = m.glasses;
  return out;
}

const cast = {
  pick: PICKS[0],    // a PLAYABLE id, or custom
  custom: null,      // the "Make your own" girl, or null until she is made
  guy: null,
  load() {
    const p = store.get('pick', PICKS[0]);
    const saved = store.get('customGirl', null);
    this.custom = saved ? cleanGirl(saved) : null;
    this.pick = PICKS.includes(p) && (p !== 'custom' || this.custom) ? p : PICKS[0];
    this.rollGuy();
  },
  setPick(p) { if (PICKS.includes(p) && (p !== 'custom' || this.custom)) { this.pick = p; store.set('pick', p); } },
  girl() { return this.pick === 'custom' ? this.custom : GIRLS[this.pick]; },
  girlName() { return this.girl().name; },
  guyName() { return this.guy.name; },
  rollGuy() { this.guy = randomGuy(); return this.guy; },
  // Custom girl editing
  ensureCustom() { if (!this.custom) { this.custom = { ...DEFAULT_CUSTOM }; this.saveCustom(); } return this.custom; },
  setCustom(key, value) { this.custom = cleanGirl({ ...this.custom, [key]: value }); this.saveCustom(); },
  resetCustom() { this.custom = { ...DEFAULT_CUSTOM }; this.saveCustom(); },
  shuffleCustom() {
    const keys = o => Object.keys(o);
    this.custom = cleanGirl({
      ...this.custom, skin: pick(SKIN_TONES)[0], hair: pick(HAIR_COLOURS)[0], outfitColour: pick(OUTFIT_COLOURS)[0],
      hairStyle: pick(keys(HAIR_STYLES)), outfit: pick(keys(OUTFITS)), glasses: Math.random() < 0.3,
    });
    this.saveCustom();
  },
  saveCustom() { store.set('customGirl', this.custom); },
};
cast.load();
