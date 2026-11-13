'use strict';
/* Every character, as data.

   To add a girl you can play, add an entry to CHARACTERS:
     { id, name, hidden, look: { skin, hairStyle, hair, outfit, outfitColour, glasses, makeup, mouth, mood, earrings }, notes }
   - id: short and unique. It is saved as the pick and used as the card's data-pick.
   - look: the same keys as the "Make your own" girl. hairStyle and outfit are ids from HAIR_ART / OUTFIT_ART in art.js.
     mouth is 'pout', 'smirk' or null. mood 'mean' gives heavy lids and sloped brows. earrings: true adds drop earrings.
     shoulderWaves and longStraight shade the hair colour, so give them a hex colour, not a gradient.
   - Cards on "Who's clocking in?" follow the order of CHARACTERS, with "Make your own" last.
   - hidden: true keeps her off the picker, and a saved pick of her falls back to the first visible girl.
     Add ?cast=all to the page URL to show hidden characters while you work on them. */
const CHARACTERS = [
  {
    id: 'gabi', name: 'Gabi', hidden: false,
    look: { skin: '#F2CBAE', hairStyle: 'wavy', hair: 'url(#hairGabi)', outfit: 'laceTop', outfitColour: '#211C27', glasses: false, makeup: true, mouth: 'pout' },
    notes: 'Lead, drawn from the reference photo. Long waves, black lace top, pout.',
  },
  {
    id: 'vix', name: 'Vix', hidden: false,
    look: { skin: '#F5D3BC', hairStyle: 'wavy', hair: 'url(#hairVix)', outfit: 'blazer', outfitColour: '#18151C', glasses: false, makeup: true, mouth: 'smirk', mood: 'mean' },
    notes: 'Lead, drawn from the reference photo. Black blazer, resting mean face and a smirk. Never tongue out.',
  },
  {
    id: 'kimberly', name: 'Kimberly', hidden: true,
    look: { skin: '#F3C8A5', hairStyle: 'shoulderWaves', hair: '#A9733F', outfit: 'buttonTop', outfitColour: '#3F5D9E', glasses: false, makeup: false, mouth: null },
    notes: 'From the old single-file game (Marketing). Shoulder-length light-brown waves, blue button-front top.',
  },
  {
    id: 'alice', name: 'Alice', hidden: true,
    look: { skin: '#F5D3BA', hairStyle: 'longStraight', hair: '#2A2434', outfit: 'floralDress', outfitColour: '#BC2238', glasses: false, makeup: false, mouth: null, earrings: true },
    notes: 'From the old single-file game (HR). Long straight black hair, drop earrings, fitted red floral dress (mock neck, cap sleeves, oxblood branches, gold leaves, pale flowers).',
  },
];

/* The "Make your own" girl before you change anything. */
const CUSTOM_GIRL = {
  name: 'Jo',
  look: { skin: '#E0A877', hairStyle: 'bob', hair: '#1F1A24', outfit: 'turtleneck', outfitColour: '#FF4F86', glasses: false, makeup: true, mouth: null },
};

/* The guy: a new random one every round, built from these pools by randomGuy() in art.js. */
const GUYS = {
  namedChance: 0.25, // chance that tonight's guy is a visible named guy from GUY_CHARACTERS (when there is one)
  names: ['Banana', 'Smoothie', 'Straw', 'Tree', 'Pickle', 'Mango'],
  skin: ['#F7DCC8', '#F2CCB0', '#EDC1A1', '#E8B896', '#F5D5BE'],
  hair: ['#2A1E1A', '#4A3226', '#6B4A33', '#8C6A45', '#C9A06A', '#9A4E2C', '#1C1A1F'],
  hairStyles: ['quiff', 'curtains', 'slick', 'tousled', 'crop', 'shaved', 'curls'],
  colours: ['#7C8A6A', '#3E5068', '#C8B79A', '#8C3B3B', '#2F4A3E', '#E9E1D3', '#6B5B8C', '#B5651D'],
  glasses: ['#2B2340', '#7A4A2E', '#1C1A1F'],
};

/* Named guys. Same idea as CHARACTERS: each one has a hidden flag.
   A visible named guy can be tonight's guy (see GUYS.namedChance); with ?cast=all hidden ones can be too.
   look keys: skin, hairStyle (HAIR_ART id), hair, outfitKey (GUY_OUTFITS id), colour, facial ('none', 'stubble', 'beard'),
   glasses (frame colour or null), glassesShape ('round' or 'rect'). */
const GUY_CHARACTERS = [
  {
    id: 'jensen', name: 'Jensen', hidden: true,
    look: { skin: '#E3B48F', hairStyle: 'swept', hair: '#D9D8E2', outfitKey: 'biker', colour: '#3A3443', facial: 'none', glasses: '#2B2340', glassesShape: 'rect' },
    notes: 'From the old single-file game (Engineering). Silver swept-back hair, rectangular glasses, leather jacket over a black tee.',
  },
];

/* ---- The "Make your own" wardrobe ----
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
const HAIR_STYLES = { wavy: 'Long waves', sleek: 'Sleek', bob: 'Bob', bun: 'Bun', curls: 'Curls', crop: 'Crop' };
const OUTFITS = { laceTop: 'Lace top', blazer: 'Blazer', cardigan: 'Cardigan', turtleneck: 'Turtleneck', floralDress: 'Floral dress' };
const NAME_MAX = 14;

/* Who shows on the picker: the story's girls (see js/stories.js), else every character that is not hidden,
   or all of them with ?cast=all. */
const SHOW_HIDDEN = new URLSearchParams(location.search).get('cast') === 'all';
const PLAYABLE = STORY.girls
  ? STORY.girls.map(id => CHARACTERS.find(c => c.id === id)).filter(Boolean)
  : CHARACTERS.filter(c => SHOW_HIDDEN || !c.hidden);
const NAMED_GUYS = GUY_CHARACTERS.filter(c => SHOW_HIDDEN || !c.hidden);

/* Old names, derived from the data above. GIRLS has every character (hidden too); PLAYABLE decides who can be picked. */
const GIRLS = Object.fromEntries(CHARACTERS.map(c => [c.id, { name: c.name, ...c.look }]));
const DEFAULT_CUSTOM = { name: CUSTOM_GIRL.name, ...CUSTOM_GIRL.look };
const GUY_NAMES = GUYS.names;
const GUY_SKIN = GUYS.skin;
const GUY_HAIR = GUYS.hair;
const GUY_HAIR_STYLES = GUYS.hairStyles;
const GUY_COLOURS = GUYS.colours;
const GUY_GLASSES = GUYS.glasses;
