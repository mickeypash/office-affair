# Office Affair 💋

*Love is a full-time job.*

A small single-player browser game. Two coworkers are secretly in love. You steal kisses while the boss is not looking. Fill the romance meter before 5 pm, and do not get caught three times.

## How to open

Open `index.html` in a modern browser (Chrome, Edge, Firefox or Safari). Double-clicking the file is enough. You do not need a server, an install step or a network connection.

## How to play

| Action | Desktop | Mobile |
|---|---|---|
| Kiss | Hold **Shift**, **Space** or the left mouse button on the office | Press and hold **HOLD TO KISS 💋** |
| Stop | Release | Release |
| Pause | **Esc** / **P** or the pause button | Pause button |

- **Boss facing away** (typing, sipping coffee, reading, on the phone): kissing is safe.
- **Yellow ⚠ with a head turn**: the boss is turning around. Kissing is still safe, but let go now.
- **Boss facing you, red striped sight cone**: kissing for more than 150 ms gives you a strike. You also get a strike while the boss turns back.
- **Dashed ? while the boss stretches** (only after 70%): this is a bluff. The boss will not turn.
- Three strikes ends the game with a meeting with HR. If the clock gets to 5 pm first, you are clocked out.

A round lasts 75 seconds. The boss gets less predictable as the meter fills: 0–30% is easy, 30–70% is medium, and 70–100% is hard. You get a rank (S, A, B or C) when you win. Your best result and your sound setting are saved in `localStorage`.

## Project structure

| File | What it holds |
|---|---|
| `index.html` | Page markup: HUD, the SVG office scene, overlays |
| `css/style.css` | All styles |
| `js/util.js` | Small helpers and the `localStorage` wrapper |
| `js/config.js` | Game rules, difficulty tuning, character palettes and default cast |
| `js/cast.js` | Loads, checks and saves the cast (names and looks) |
| `js/art.js` | SVG builders for the coworkers, hair styles, outfits, boss and walker |
| `js/audio.js` | Procedural sound effects (Web Audio) |
| `js/player.js` | Input state (which keys and pointers are held) |
| `js/manager.js` | The boss's state machine |
| `js/renderer.js` | Animates the scene every frame |
| `js/confetti.js` | Win confetti (canvas) |
| `js/ui.js` | HUD, menus, result memos, toasts |
| `js/customise.js` | The Customise screen |
| `js/game.js` | Game lifecycle and finite-state machine |
| `js/main.js` | Boot, layout, input wiring, main loop |

The scripts are plain `<script>` tags, not ES modules. Browsers block modules on pages opened straight from disk, so this keeps double-clicking `index.html` working.

## Notes

- Plain HTML, CSS and JavaScript. The graphics are inline SVG and the sounds come from the Web Audio API. There are no external assets or dependencies.
- Romance fills at 3.75% per second. The spec's starting value of 2% per second made the round too hard.
- The game respects `prefers-reduced-motion`. It pauses when the tab is hidden or loses focus, and it clears held keys so no input gets stuck.

## Customise

Click **Customise** on the title screen. You can change both coworkers:

- name and team (shown on the desk name plates and in the memos)
- skin tone, hair style (curls, bun, bob, crop, long, shaved) and hair colour
- outfit (cardigan, vest and tie, turtleneck) and outfit colour
- glasses

Every colour row also has a colour picker for any colour. Changes appear live in the office behind the panel and are saved in `localStorage`. **Surprise me** picks a random look, and **Reset** restores the default.

To change the defaults or add colours, edit `DEFAULT_CAST` and the palettes in `js/config.js`. To add a hair style or an outfit, add a builder to `HAIR_ART` or `OUTFIT_ART` in `js/art.js` and its label to `HAIR_STYLES` or `OUTFITS` in `js/config.js`.

## Play online

**https://mickey.sh/office-affair/**

## Publishing

`.github/workflows/pages.yml` publishes the game to GitHub Pages on every push to `main`. You can also start it by hand from the **Actions** tab. It publishes only `index.html`, `css/` and `js/`.
