'use strict';
/* Boot, layout, input wiring and the main loop */
if (STORY.poster && POSTERS[STORY.poster]) $('poster').innerHTML = POSTERS[STORY.poster];
const renderer = new Renderer();
const game = new Game();
ui.init();
select.init();
customise.init();
confetti.init();

function layout() {
  const app = $('app');
  const cs = getComputedStyle(app);
  const padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const padH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const gap = parseFloat(cs.rowGap || cs.gap) || 12;
  const hudH = ui.el.hud.offsetHeight, ctrlH = ui.el.controls.offsetHeight;
  const availW = Math.max(200, window.innerWidth - padH);
  const availH = Math.max(160, window.innerHeight - padV - hudH - ctrlH - gap * 2 - 14);
  const aspect = clamp(availW / availH, 0.75, 16 / 9);
  let w = Math.min(availW, availH * aspect);
  let h = w / aspect;
  document.documentElement.style.setProperty('--stage-w', Math.floor(w) + 'px');
  document.documentElement.style.setProperty('--stage-h', Math.floor(h) + 'px');
  const vbW = clamp(900 * aspect, 900, 1600), vbH = vbW / aspect;
  // Portrait + Customise sheet open: scroll the scene so the faces sit above the sheet.
  const liftForSheet = document.body.classList.contains('customising') && vbH > 900;
  const vbY = liftForSheet ? 40 : 900 - vbH;
  $('scene').setAttribute('viewBox', `${(800 - vbW / 2).toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  confetti.resize();
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 200));
layout();

const gameplayInput = () => game.state === S.PLAYING || game.state === S.COUNTDOWN;

// Keyboard
window.addEventListener('keydown', e => {
  const isSpace = e.code === 'Space' || e.key === ' ';
  const isShift = e.key === 'Shift';
  if ((isSpace || isShift) && gameplayInput()) {
    e.preventDefault();
    if (!e.repeat) player.press(isSpace ? 'key:space' : 'key:shift');
    return;
  }
  if (e.key === 'Escape' && customise.isOpen) { e.preventDefault(); customise.close(); return; }
  if (e.key === 'Escape' && select.isOpen) { e.preventDefault(); select.close(); return; }
  if (e.key === 'Escape' || ((e.key === 'p' || e.key === 'P') && !(e.target instanceof HTMLInputElement))) {
    if (gameplayInput()) { e.preventDefault(); game.pause(); }
    else if (game.state === S.PAUSED) { e.preventDefault(); game.resume(); }
  }
  if (e.key === 'Enter' && game.state === S.MENU && document.activeElement === document.body) {
    if (select.isOpen) { e.preventDefault(); game.start(); }
    else if (!customise.isOpen) { e.preventDefault(); select.open(); }
  }
});
window.addEventListener('keyup', e => {
  const isSpace = e.code === 'Space' || e.key === ' ';
  if (isSpace) { player.release('key:space'); if (gameplayInput()) e.preventDefault(); }
  if (e.key === 'Shift') player.release('key:shift');
});

// Any tap or key (re)starts the sound: mobile browsers only allow it from a user gesture.
['touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, () => sfx.unlock(), { passive: true }));

// A soft click for buttons on the menu, "Who's clocking in?", the wardrobe, pause and result screens.
// Not for buttons that start a round (the countdown beeps start) or the sound button (it clicks already).
const NO_CLICK = ['btnStart', 'btnRestart', 'btnAgain', 'btnSoundMenu'];
['menu', 'select', 'customise', 'pause', 'result'].forEach(id => $(id).addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b && !NO_CLICK.includes(b.id)) { sfx.unlock(); sfx.click(); }
}));

// Pointer on the stage and on the kiss button
function bindHold(el, prefix) {
  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!gameplayInput()) return;
    e.preventDefault();
    sfx.unlock();
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    player.press(prefix + e.pointerId);
  });
  const up = e => player.release(prefix + e.pointerId);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('lostpointercapture', up);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
bindHold(ui.el.stage, 'stage:');
bindHold(ui.el.kissBtn, 'btn:');
// Safety net: a release anywhere clears that pointer
window.addEventListener('pointerup', e => { player.release('stage:' + e.pointerId); player.release('btn:' + e.pointerId); });
window.addEventListener('pointercancel', e => { player.release('stage:' + e.pointerId); player.release('btn:' + e.pointerId); });
ui.el.kissBtn.addEventListener('click', e => e.preventDefault());
ui.el.kissBtn.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });

// Focus loss: never leave a key stuck, pause the round
window.addEventListener('blur', () => { player.clear(); game.pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { player.clear(); game.pause(); } });
document.addEventListener('touchmove', e => { if (gameplayInput()) e.preventDefault(); }, { passive: false });

// Buttons
const toggleSound = () => { sfx.setEnabled(!sfx.enabled); ui.syncSound(); sfx.click(); };
ui.el.btnPlay.addEventListener('click', () => select.open());
ui.el.btnSoundMenu.addEventListener('click', toggleSound);
ui.el.btnSoundHud.addEventListener('click', e => { toggleSound(); e.currentTarget.blur(); });
ui.el.btnPause.addEventListener('click', e => { game.pause(); });
ui.el.btnResume.addEventListener('click', () => game.resume());
ui.el.btnRestart.addEventListener('click', () => game.start());
ui.el.btnQuit.addEventListener('click', () => game.toMenu());
ui.el.btnAgain.addEventListener('click', () => game.start());
ui.el.btnMenu.addEventListener('click', () => game.toMenu());
// Space on HUD buttons during play must not "click" them
[ui.el.btnPause, ui.el.btnSoundHud].forEach(b => b.addEventListener('keyup', e => { if ((e.code === 'Space') && gameplayInput()) e.preventDefault(); }));

// Main loop
let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (!(dt > 0)) dt = 0;
  dt = Math.min(dt, 0.1); // clamp after tab switches / hitches
  if (game.state !== S.PAUSED) {
    game.update(dt);
    renderer.update(dt, game);
    confetti.update(dt);
  }
  ui.update(dt, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Small test hook (no effect on play)
window.__officeAffair = { game, player, renderer, CONFIG, S, M };
