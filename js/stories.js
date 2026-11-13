'use strict';
/* Stories: which cast and poster a game uses. Pick one with ?story=<id>; without it (or with an unknown id) you get the office.
   - girls: CHARACTERS ids for "Who's clocking in?" (hidden girls are allowed here), or null for every visible girl.
   - guy: { mode: 'random' } for a new random guy every round, or { mode: 'named', id } for one guy from GUY_CHARACTERS.
   - poster: a POSTERS id from js/posters.js, or null to keep the office poster in index.html.
   Each story saves under its own keys: pick.<id> and best.<id>. */
const STORIES = {
  office: { id: 'office', girls: null, guy: { mode: 'random' }, poster: null },
  nvidia: { id: 'nvidia', girls: ['alice', 'kimberly'], guy: { mode: 'named', id: 'jensen' }, poster: 'nvidia' },
};
const STORY = (id => Object.prototype.hasOwnProperty.call(STORIES, id) ? STORIES[id] : STORIES.office)(
  new URLSearchParams(location.search).get('story'));
/* A save key for this story: key.<id>. */
const storyKey = k => `${k}.${STORY.id}`;
