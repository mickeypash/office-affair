'use strict';
/* Streak: an unbroken kiss raises the multiplier, which speeds up the meter and scores love points.
   State stays on the game: streak = seconds of the current unbroken kiss; multiplier = 1, 2 or 3 (fever); lovePoints. */
const streak = {
  onRoundStart(g) { g.lovePoints = 0; this.reset(g); },
  // Letting go, a catch, a pause or the round ending all break the streak
  reset(g) { g.streak = 0; g.multiplier = 1; },
  // Called every playing frame. Returns how fast the meter fills this frame (1 = the mode's romanceRate).
  onKissFrame(g, dt, kissing) {
    const st = g.rules.streak, prevMult = g.multiplier;
    g.streak = kissing ? g.streak + dt : 0;
    g.multiplier = !st.enabled ? 1 : g.streak >= st.at3 ? 3 : g.streak >= st.at2 ? 2 : 1;
    if (g.multiplier > prevMult) { renderer.streakUp(g.multiplier); sfx.streakUp(g.multiplier); }
    if (!kissing) return 0;
    g.lovePoints += st.points * g.multiplier * dt;
    return st.enabled ? st.fill[g.multiplier - 1] : 1;
  },
};
