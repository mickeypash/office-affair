'use strict';
/* The cast: names and looks for the two coworkers, saved in localStorage. */
const ROLES = ['player', 'partner'];
const HEX = /^#[0-9a-f]{6}$/i;

/* Return a clean copy of a cast member. Unknown or bad values fall back to the defaults. */
function cleanMember(m, def) {
  const out = { ...def };
  if (!m || typeof m !== 'object') return out;
  const text = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
  out.name = text(m.name, NAME_MAX) || def.name;
  out.team = text(m.team, TEAM_MAX) || def.team;
  for (const k of ['skin', 'hair', 'outfitColour']) if (HEX.test(m[k])) out[k] = m[k].toUpperCase();
  if (m.hairStyle in HAIR_STYLES) out.hairStyle = m.hairStyle;
  if (m.outfit in OUTFITS) out.outfit = m.outfit;
  if (typeof m.glasses === 'boolean') out.glasses = m.glasses;
  return out;
}

const cast = {
  data: null,
  load() {
    const saved = store.get('cast', {}) || {};
    this.data = {};
    for (const r of ROLES) this.data[r] = cleanMember(saved[r], DEFAULT_CAST[r]);
  },
  save() { store.set('cast', this.data); },
  get(role) { return this.data[role]; },
  set(role, key, value) {
    this.data[role] = cleanMember({ ...this.data[role], [key]: value }, DEFAULT_CAST[role]);
    this.save();
  },
  reset(role) { this.data[role] = { ...DEFAULT_CAST[role] }; this.save(); },
  shuffle(role) {
    const keys = o => Object.keys(o);
    this.data[role] = cleanMember({
      ...this.data[role],
      skin: pick(SKIN_TONES)[0], hair: pick(HAIR_COLOURS)[0], outfitColour: pick(OUTFIT_COLOURS)[0],
      hairStyle: pick(keys(HAIR_STYLES)), outfit: pick(keys(OUTFITS)), glasses: Math.random() < 0.4,
    }, DEFAULT_CAST[role]);
    this.save();
  },
  fullName(role) { return this.data[role].name; },
  firstName(role) { return this.data[role].name.split(' ')[0]; },
};
cast.load();
