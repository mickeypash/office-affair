'use strict';
/* Runs the end-to-end suites in tests/e2e, one after another, and prints a summary.
   node tests/run.js              every suite
   node tests/run.js story chars  only test-story.js and test-chars.js
   Set GAME_URL to test another copy of the game (for example the live site). */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'e2e');
const all = fs.readdirSync(dir).filter(f => /^test.*\.js$/.test(f)).sort();
const want = process.argv.slice(2);
const suites = want.length ? all.filter(f => want.some(w => f === w || f === `test-${w}.js` || f === `${w}.js`)) : all;
if (!suites.length) { console.error('No suite matches: ' + want.join(' ')); process.exit(2); }

let failed = 0;
for (const f of suites) {
  const r = spawnSync(process.execPath, [path.join(dir, f)], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const pass = (out.match(/^PASS /gm) || []).length, fail = (out.match(/^FAIL /gm) || []).length;
  const bad = r.status !== 0 || fail > 0 || pass === 0;
  if (bad) failed++;
  console.log(`${bad ? '✗' : '✓'} ${f}: ${pass} pass, ${fail} fail`);
  if (bad) console.log(out.split('\n').filter(l => !l.startsWith('PASS ')).join('\n'));
}
process.exit(failed ? 1 : 0);
