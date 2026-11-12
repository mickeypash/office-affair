'use strict';
/* Lives: start with rules.lives.start, earn +1 at each rules.lives.earnAt % (once per round), lose one per catch.
   State stays on the game (game.lives, game.nextLife) so the HUD and tests can read it. */
const lives = {
  onRoundStart(g) { g.lives = g.rules.lives.start; g.nextLife = 0; },
  // Called every playing frame after the meter moves
  onRomance(g) {
    const at = g.rules.lives.earnAt;
    if (g.nextLife < at.length && g.romance >= at[g.nextLife]) { g.nextLife++; this.gain(g); }
  },
  gain(g) {
    if (g.lives >= g.rules.lives.max) return;
    g.lives++;
    ui.gainLife(g.lives);
    sfx.life();
    ui.toast('+1 life. Keep going.', 'love', 2);
  },
  // Returns true when that was the last life (the round ends after the freeze)
  onCaught(g) {
    g.lives = Math.max(0, g.lives - 1);
    ui.loseLife(g.lives);
    return g.lives <= 0;
  },
};
