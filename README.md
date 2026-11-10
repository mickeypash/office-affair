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

## Notes

- The game is one file with HTML, CSS and JavaScript only. The graphics are inline SVG and the sounds come from the Web Audio API. There are no external assets.
- Romance fills at 3.75% per second. The spec's starting value of 2% per second made the round too hard.
- The game respects `prefers-reduced-motion`. It pauses when the tab is hidden or loses focus, and it clears held keys so no input gets stuck.

## Play online

**https://mickeypash.github.io/office-affair/**

## Publishing

`.github/workflows/pages.yml` publishes the game to GitHub Pages on every push to `main`. You can also start it by hand from the **Actions** tab. It publishes only `index.html`.
