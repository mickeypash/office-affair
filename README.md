# Office Affair 💋

*Love is a full-time job.*

A small single-player browser game. Two coworkers are secretly in love. You steal kisses while the boss is not looking. Fill the romance meter before 5 pm, and do not get caught.

## How to open

Open `index.html` in a modern browser (Chrome, Edge, Firefox or Safari). Double-clicking the file is enough. You do not need a server, an install step or a network connection.

## How to play

| Action | Desktop | Mobile |
|---|---|---|
| Kiss | Hold **Shift**, **Space** or the left mouse button on the office | Press and hold **HOLD TO KISS 💋** |
| Stop | Release | Release |
| Pause | **Esc** / **P** or the pause button | Pause button |

- **Boss facing away** (typing, sipping coffee, reading, on the phone): kissing is safe.
- **Hold one kiss longer** for a multiplier: ×2 after 2 seconds, ×3 FEVER after 4. The meter fills faster. Letting go or getting caught resets it.
- **Yellow ⚠ with a head turn**: the boss is turning around. Kissing is still safe, but let go now.
- **Boss facing you, red striped sight cone**: kissing for more than 150 ms gets you caught. Kissing while the boss turns back also gets you caught.
- **Dashed ? while the boss stretches, or lowers his phone and swaps it to his other ear**: this is a bluff. The boss will not turn. He never bluffs twice in a row.
- You start with 1 life, so at first one catch ends the game with a meeting with HR.
- You earn a life when the meter reaches 35%, and another at 70%. You can hold up to 3. Each catch costs a life.
- If the clock gets to 5 pm first, you are clocked out.

A round lasts 75 seconds. The boss gets less predictable as the meter fills (0–30%, 30–70%, 70–100%).

When you win, your score picks one of three endings. You score love points while you kiss (more at ×2 and ×3), plus 20 for every second left, minus 500 each time you were caught.

- **Under 3,400: Drinks with the boss.** The boss asks her out for drinks, and he goes home alone.
- **3,400 or more: A rose at 7.** They leave together at 7 pm, and he brings a rose.
- **4,250 or more: Concert night.** They go to a concert together. You need long, risky streaks for this one.

Your best score and its ending, your pick and your sound setting are saved in `localStorage`. The thresholds are in `CONFIG.endings` in `js/config.js`.

Tuning lives in `MODES` in `js/config.js`. A mode holds everything a difficulty can change: round length, romance rate, the boss's timing tiers and bluff chances, lives, the streak, and whether the sight cone and warning toasts are on. At the start of each round the game copies the active mode into `game.rules`, and gameplay code reads only that. There is one mode for now, `standard`. The Friday (easy) and Monday (hard) levels from PR #3 are in git history.

## Project structure

| File | What it holds |
|---|---|
| `index.html` | Page markup: HUD, the SVG office scene, overlays |
| `css/style.css` | All styles |
| `js/util.js` | Small helpers and the `localStorage` wrapper |
| `js/config.js` | Game rules and tuning |
| `js/characters.js` | Every character as data: the girls you can play, the "Make your own" defaults and wardrobe, the guy's names and palettes |
| `js/cast.js` | Your pick, your saved custom girl, and the random guy |
| `js/art.js` | SVG builders for the characters, hair styles, outfits, the guy, the boss and the walker |
| `js/audio.js` | Procedural sound effects (Web Audio) |
| `js/player.js` | Input state (which keys and pointers are held) |
| `js/manager.js` | The boss's state machine |
| `js/lives.js` | Lives rules: starting lives, earning one at each threshold, losing one per catch |
| `js/streak.js` | Streak multiplier and love points |
| `js/renderer.js` | Animates the scene every frame |
| `js/confetti.js` | Win confetti (canvas) |
| `js/ui.js` | HUD, menus, result memos, toasts |
| `js/customise.js` | The "Who's clocking in?" picker and the "Make your own" editor |
| `js/game.js` | Game lifecycle and finite-state machine |
| `js/main.js` | Boot, layout, input wiring, main loop |

The scripts are plain `<script>` tags, not ES modules. Browsers block modules on pages opened straight from disk, so this keeps double-clicking `index.html` working.

## Notes

- Plain HTML, CSS and JavaScript. The graphics are inline SVG and the sounds come from the Web Audio API. There are no external assets or dependencies.
- Romance fills at 3.75% per second. The spec's starting value of 2% per second made the round too hard.
- The game respects `prefers-reduced-motion`. It pauses when the tab is hidden or loses focus, and it clears held keys so no input gets stuck.

## Who's clocking in?

Press **Play** and pick who you play:

- **Gabi** or **Vix**, the two leads, with fixed looks.
- **Make your own**: set a name, skin tone, hair style and colour, outfit and colour, and glasses. Every colour row also has a colour picker. Your girl is saved in `localStorage` and stays on her card. Use **Edit your girl** to change her.

The guy is a surprise. Every round brings a new random guy, with his name on the desk plate (Banana, Smoothie, Straw, Tree, Pickle or Mango). **Play again** keeps your pick and brings a new guy.

Characters live in `js/characters.js`. Each girl in `CHARACTERS` has an `id`, a `name`, a `look` (skin, hair style and colour, outfit and colour, glasses, makeup, mouth, mood) and short `notes`. The picker shows one card per girl, in that order, and then **Make your own**. To add a girl, add an entry. The guy's names, skin tones, hair and outfit colours are in `GUYS` in the same file.

Set `hidden: true` to keep a girl off the picker while she is not ready. A saved pick of a hidden girl falls back to the first visible one. To see hidden girls while you work on them, open the game with `?cast=all` at the end of the URL (for example `index.html?cast=all`). The hidden **New Starter** entry is a placeholder that keeps this working; replace her when a real new girl arrives.

To add a hair style or an outfit, add a builder to `HAIR_ART`, `OUTFIT_ART` or `GUY_OUTFITS` in `js/art.js`, and add its label to `HAIR_STYLES` or `OUTFITS` in `js/characters.js` for the editor.

## Play online

**https://mickey.sh/office-affair/**

## Publishing

`.github/workflows/pages.yml` publishes the game to GitHub Pages on every push to `main`. You can also start it by hand from the **Actions** tab. It publishes only `index.html`, `css/` and `js/`.
