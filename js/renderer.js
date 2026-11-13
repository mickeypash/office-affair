'use strict';
/* Renderer: animates the SVG office scene */
class Renderer {
  constructor() {
    this.scene = $('scene');
    $('mgrBody').innerHTML = managerSVG();
    $('walker').innerHTML = walkerSVG();
    this.chars = {};
    this.buildChar('L');
    this.buildChar('R');
    const ids = ['mgrBody', 'mgrBack', 'mgrSide', 'mgrFront', 'actType', 'actCoffee', 'actRead', 'actPhone', 'actPhoneL', 'actStretchArms',
      'elbowL', 'elbowR', 'mug', 'paper', 'mgrLids', 'mgrBrowStern', 'mgrBrowUp', 'mgrMouthFlat', 'mgrMouthO', 'mgrEyes',
      'warnIcon', 'fakeIcon', 'bigBang', 'thought', 'thoughtText', 'thoughtBox', 'cone', 'coneFill', 'coneLine',
      'hourHand', 'minHand', 'sky0', 'sky1', 'sun', 'cityLights', 'warm', 'warm2', 'dim', 'cupL', 'spill', 'sheetPop', 'emailPop',
      'walker', 'wLegA', 'wLegB', 'wCups', 'printerBody', 'jamText', 'jamPapers', 'jp0', 'jp1', 'jp2', 'printerLight',
      'plantL', 'plantR', 'hearts', 'notes'];
    this.el = {};
    ids.forEach(id => { this.el[id] = $(id); });
    const phoneArm = g => ({ paths: [...g.children].filter(n => n.tagName === 'path'), hand: g.querySelector('.phone-hand'), k: 0 });
    this.phoneArms = { R: phoneArm(this.el.actPhone), L: phoneArm(this.el.actPhoneL) };
    ['streakBadge', 'streakText', 'streakShadow', 'streakFever'].forEach(id => { this.el[id] = $(id); });
    this.heartPool = [];
    for (let i = 0; i < 28; i++) {
      const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      u.setAttribute('href', '#heartShape');
      u.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#heartShape');
      u.setAttribute('stroke', INK); u.setAttribute('stroke-width', '2.5'); u.style.display = 'none';
      this.el.hearts.appendChild(u);
      this.heartPool.push({ node: u, alive: false });
    }
    this.notePool = [];
    for (let i = 0; i < 4; i++) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.textContent = i % 2 ? '♫' : '♪'; t.style.display = 'none';
      this.el.notes.appendChild(t);
      this.notePool.push({ node: t, alive: false });
    }
    this.reset();
  }
  /* (Re)draw one character from the cast. L = the girl you play, R = the random guy. */
  buildChar(k) {
    const dir = k === 'L' ? 1 : -1;
    const o = k === 'L' ? girlOpts(cast.girl(), dir) : guyOpts(cast.guy, dir);
    $('char' + k).innerHTML = coworkerBody(o);
    $('hands' + k).innerHTML = coworkerHands(o);
    const prev = this.chars[k];
    this.chars[k] = this.makeChar('char' + k, 'hands' + k, k === 'L' ? 560 : 1040, dir);
    if (prev && prev.pose) this.chars[k].pose = prev.pose;
    this.updatePlate(k);
  }
  updatePlate(k) {
    const el = $('plate' + k);
    el.textContent = k === 'L' ? cast.girlName() : cast.guyName();
    el.removeAttribute('textLength'); el.removeAttribute('lengthAdjust');
    try {
      if (el.getComputedTextLength() > 132) { el.setAttribute('textLength', '132'); el.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    } catch (e) { /* not rendered yet */ }
  }
  /* Make one coworker look at the other for a moment (used as live feedback when customising). */
  glanceAt(k) { const c = this.chars[k === 'L' ? 'R' : 'L']; if (c) { c.glancing = 1.4; } }
  makeChar(bodyId, handsId, x, dir) {
    const body = $(bodyId), hands = $(handsId);
    const q = s => body.querySelector(s), qh = s => hands.querySelector(s);
    return {
      x, dir, body, hands, head: q('.cw-head'), male: !!q('.cw[data-male]'),
      // the curtain of hair on the face side hides in profile, so it doesn't cover the kiss
      nearCurtain: q(dir > 0 ? '.curtain-r' : '.curtain-l'),
      front: q('.f-front'), profile: q('.f-profile'), earsFront: q('.ears-front'), earProfile: q('.ear-profile'),
      eyesOpen: q('.eyes-open'), pupils: q('.pupils'), eyesBlink: q('.eyes-blink'), eyesHappy: q('.eyes-happy'), eyesWide: q('.eyes-wide'),
      brows: q('.brows'), browsSad: q('.brows-sad'),
      mSmile: q('.m-smile'), mGrin: q('.m-grin'), mO: q('.m-o'), mNerv: q('.m-nerv'), mSad: q('.m-sad'), sweat: q('.sweat'), blush: q('.blush-f'),
      hType: qh('.h-type'),
      armL: { fo: qh('.h-left .fo'), fc: qh('.h-left .fc'), hc: qh('.h-left .hc') },
      armR: { fo: qh('.h-right .fo'), fc: qh('.h-right .fc'), hc: qh('.h-right .hc') }, hDoc: qh('.h-doc'), hHug: qh('.h-hug'),
      blinkT: rand(1, 4), blinking: 0, glanceT: rand(2, 6), glancing: 0, face: '', handsMode: '',
    };
  }
  reset() {
    this.t = 0; this.lean = 0; this.jump = 0; this.caughtT = 0; this.naturalT = 0; this.heartT = 0; this.noteT = 0;
    this.mode = 'play'; // play | win | loseHR | loseTime
    this.endT = 0; this.mgrPose = ''; this.squash = 0; this.lastActivity = '';
    this.thoughtT = rand(3, 6); this.thoughtShow = 0;
    this.decorT = rand(4, 7); this.walkerX = null; this.jamT = 0; this.plantT = 0; this.emailT = 0; this.emailShown = false;
    this.streakPop = 0; this.feverGlow = 0; this.shownMult = 1; vis(this.el.streakBadge, false);
    this.heartPool.forEach(h => { h.alive = false; h.node.style.display = 'none'; });
    this.notePool.forEach(n => { n.alive = false; n.node.style.display = 'none'; });
    const e = this.el;
    vis(e.bigBang, false); vis(e.warnIcon, false); vis(e.fakeIcon, false); vis(e.thought, false); vis(e.cone, false);
    vis(e.sheetPop, false); vis(e.emailPop, false); vis(e.jamText, false); vis(e.jamPapers, false);
    e.cupL.setAttribute('transform', ''); e.spill.setAttribute('opacity', '0');
    e.warm.setAttribute('opacity', '0'); e.warm2.setAttribute('opacity', '0'); e.dim.setAttribute('opacity', '0');
    e.walker.setAttribute('transform', 'translate(-300,522) scale(.55)');
    e.printerBody.setAttribute('transform', ''); e.plantL.setAttribute('transform', ''); e.plantR.setAttribute('transform', '');
    this.scene.classList.remove('shake');
  }
  /* --- events from game --- */
  caught() {
    this.caughtT = CONFIG.freeze; this.jump = 1;
    if (!REDUCED) { this.scene.classList.remove('shake'); void this.scene.getBBox; requestAnimationFrame(() => this.scene.classList.add('shake')); }
    vis(this.el.sheetPop, true);
  }
  actNatural() { this.naturalT = 1.7; }
  streakUp(n) {
    this.streakPop = REDUCED ? 0 : 0.32;
    if (n >= 3) this.heartBurst();
  }
  win() { this.mode = 'win'; this.endT = 0; }
  lose(kind) { this.mode = kind === 'hr' ? 'loseHR' : 'loseTime'; this.endT = 0; }

  /* --- per-frame --- */
  update(dt, g) {
    this.t += dt;
    const t = this.t, e = this.el, playing = g.state === S.PLAYING;
    const kissing = g.kissingNow && playing;
    if (this.caughtT > 0) { this.caughtT -= dt; if (this.caughtT <= 0) this.afterCaught(); }
    if (this.naturalT > 0) this.naturalT -= dt;
    if (this.mode !== 'play') this.endT += dt;

    /* lean */
    let target = kissing ? 1 : 0;
    if (this.caughtT > 0) target = -0.22;
    if (this.mode === 'win') target = 1;
    if (this.mode === 'loseHR' || this.mode === 'loseTime') target = -0.05;
    const speed = target > this.lean ? 7 : 12;
    this.lean += (target - this.lean) * (1 - Math.exp(-speed * dt));
    if (this.jump > 0) this.jump = Math.max(0, this.jump - dt * 2.2);
    const L = this.lean;
    const jumpY = -Math.sin(this.jump * Math.PI) * 46 * (this.jump > 0 ? 1 : 0);
    const sway = (REDUCED ? 0 : 1) * (L > 0.6 ? Math.sin(t * 7) * 2.2 * L : 0);
    const breathe = REDUCED ? 0 : Math.sin(t * 2.1) * 1.6;

    for (const k of ['L', 'R']) {
      const c = this.chars[k], d = c.dir;
      const dx = L * 89 * d;
      const rot = L * 18 * d + sway * d * 0.6;
      const jy = jumpY * (k === 'L' ? 1 : 0.85);
      const y = 680 + breathe + jy + L * 6;
      const bx = c.x + dx;
      c.body.setAttribute('transform', `translate(${bx.toFixed(2)},${y.toFixed(2)}) rotate(${rot.toFixed(2)})`);
      c.pose = { bx, by: y, hx: c.x + dx * 0.75, hy: 680 + jy, rot };
      const headTilt = L * 7 * d + (L < 0.3 && c.glancing > 0 ? 6 * d : 0);
      c.head.setAttribute('transform', `translate(0,-266) rotate(${headTilt.toFixed(2)})`);
      this.updateFace(c, k, dt, g, kissing);
      this.poseArms(c);
    }

    /* hearts while kissing */
    if ((kissing && L > 0.82) || (this.mode === 'win' && this.endT < 4)) {
      this.heartT -= dt;
      if (this.heartT <= 0) { this.heartT = this.mode === 'win' ? 0.09 : g.multiplier >= 3 ? rand(0.08, 0.12) : rand(0.16, 0.24); this.spawnHeart(g.state === S.PLAYING); }
    }
    this.updateHearts(dt);
    this.updateStreak(dt, g, kissing);

    /* act-natural whistle notes */
    if (this.naturalT > 0 && playing) {
      this.noteT -= dt;
      if (this.noteT <= 0) { this.noteT = 0.45; this.spawnNote(); }
    }
    this.updateNotes(dt);

    /* manager */
    this.updateManager(dt, g);

    /* clock + sky */
    const p = g.state === S.MENU ? 0 : clamp(1 - g.timeLeft / g.rules.duration, 0, 1);
    const hours = 9 + 8 * p - (g.state === S.MENU ? 0.02 : 0);
    e.hourHand.setAttribute('transform', `rotate(${((hours % 12) * 30).toFixed(2)})`);
    e.minHand.setAttribute('transform', `rotate(${(((hours * 60) % 60) * 6).toFixed(2)})`);
    if (((t * 10) | 0) % 3 === 0) this.updateSky(p);

    /* lighting */
    const warmOn = this.mode === 'win' ? clamp(this.endT / 1.2, 0, 1) : 0;
    e.warm.setAttribute('opacity', Math.max(warmOn * 0.9, this.feverGlow * 0.45).toFixed(3));
    e.warm2.setAttribute('opacity', Math.max(warmOn * 0.16, this.feverGlow * 0.07).toFixed(3));
    const dimOn = this.mode === 'loseTime' ? clamp(this.endT / 1.0, 0, 1) * 0.45 : this.mode === 'loseHR' ? clamp(this.endT / 1.0, 0, 1) * 0.2 : 0;
    e.dim.setAttribute('opacity', dimOn.toFixed(3));

    /* decor */
    this.updateDecor(dt, g);
  }

  poseArms(c) {
    const { bx, by, hx, hy, rot } = c.pose;
    c.hands.setAttribute('transform', `translate(${hx.toFixed(2)},${hy.toFixed(2)})`);
    const ox = bx - hx, oy = by - hy;
    const rad = rot * Math.PI / 180, cs = Math.cos(rad), sn = Math.sin(rad);
    const rel = `translate(${ox.toFixed(2)},${oy.toFixed(2)}) rotate(${rot.toFixed(2)})`;
    if (c.handsMode === 'doc') c.hDoc.setAttribute('transform', rel);
    if (c.handsMode === 'hug') c.hHug.setAttribute('transform', rel);
    if (c.handsMode !== 'type') return;
    [[c.armL, -1, c.tyL || 0], [c.armR, 1, c.tyR || 0]].forEach(([a, side, ty]) => {
      const elx = 108 * side, ely = -62;
      const ex = elx * cs - ely * sn + ox, ey = elx * sn + ely * cs + oy;
      const tx = 50 * side, tyy = -28 + ty;
      const d = `M${ex.toFixed(1)},${ey.toFixed(1)} Q${((ex + tx) / 2 + 8 * side).toFixed(1)},${(Math.max(ey, tyy) + 10).toFixed(1)} ${tx},${tyy.toFixed(1)}`;
      a.fo.setAttribute('d', d); a.fc.setAttribute('d', d);
      a.hc.setAttribute('cx', tx); a.hc.setAttribute('cy', tyy.toFixed(1));
    });
  }

  afterCaught() {
    this.el.cupL.setAttribute('transform', '');
    vis(this.el.sheetPop, false);
  }

  updateFace(c, k, dt, g, kissing) {
    // timers
    c.blinkT -= dt;
    if (c.blinkT <= 0) { c.blinking = 0.13; c.blinkT = rand(2, 5); }
    if (c.blinking > 0) c.blinking -= dt;
    c.glanceT -= dt;
    if (c.glanceT <= 0) { c.glancing = rand(0.9, 1.5); c.glanceT = rand(k === 'R' ? 3 : 5, k === 'R' ? 7 : 10); }
    if (c.glancing > 0) c.glancing -= dt;

    let face = 'idle', hands = 'type';
    if (this.mode === 'win') face = this.endT < 2.4 || Math.sin(this.endT * 1.3) > 0 ? 'kiss' : 'happy';
    else if (this.mode === 'loseHR') face = 'sad';
    else if (this.mode === 'loseTime') face = 'sad';
    else if (this.caughtT > 0) face = 'caught';
    else if (this.lean > 0.55) face = 'kiss';
    else if (this.naturalT > 0 && g.state === S.PLAYING) { face = 'natural'; if (k === 'R') hands = 'doc'; }
    else if (g.state === S.MENU) face = c.glancing > 0 ? 'look' : 'idle';
    else if (g.manager.state === M.SUSPICIOUS && !g.manager.fake && g.state === S.PLAYING) face = 'nervous';
    else if (c.glancing > 0) face = 'look';
    if (face === 'idle' && c.blinking > 0) face = 'blink';
    if (this.mode === 'win') hands = this.lean > 0.8 ? 'hug' : 'type';
    if (this.mode === 'loseHR' || this.mode === 'loseTime') hands = 'type';

    if (face !== c.face) { this.setFace(c, face); c.face = face; }
    if (hands !== c.handsMode) {
      vis(c.hType, hands === 'type'); vis(c.hDoc, hands === 'doc'); vis(c.hHug, hands === 'hug');
      c.handsMode = hands;
    }
    // look direction for pupils
    if (c.eyesOpen.style.display !== 'none') {
      let lx = 0;
      if (face === 'look') lx = 7 * c.dir;
      if (face === 'natural') lx = -6 * c.dir;
      if (face === 'nervous') lx = Math.sin(this.t * 9) * 4;
      if (g.state === S.MENU && face === 'idle') lx = 0;
      c.pupils.setAttribute('transform', `translate(${lx.toFixed(1)},0)`);
    }
    // blush
    const blush = clamp(0.18 + g.romance / 100 * 0.45 + (face === 'look' ? 0.3 : 0), 0, 0.85);
    if (!c.male) c.blush.setAttribute('opacity', blush.toFixed(2));
    // typing
    if (hands === 'type') {
      const typing = (this.mode === 'play') && this.caughtT <= 0;
      const fast = this.naturalT > 0 && k === 'L';
      const sp = fast ? 30 : (k === 'L' ? 17 : 12), amp = typing ? (fast ? 5 : 2.6) : 0;
      const off = k === 'L' ? 0 : 1.3;
      c.tyL = Math.min(0, Math.sin(this.t * sp + off) * amp * 2);
      c.tyR = Math.min(0, Math.sin(this.t * sp + off + Math.PI) * amp * 2);
    }
  }

  setFace(c, f) {
    const profile = f === 'kiss';
    vis(c.front, !profile); vis(c.profile, profile); vis(c.earsFront, !profile); vis(c.earProfile, profile);
    if (c.nearCurtain) vis(c.nearCurtain, !profile);
    if (profile) return;
    vis(c.eyesOpen, ['idle', 'look', 'natural', 'nervous', 'sad'].includes(f));
    vis(c.eyesBlink, f === 'blink');
    vis(c.eyesHappy, f === 'happy');
    vis(c.eyesWide, f === 'caught');
    vis(c.brows, f !== 'sad' && f !== 'nervous');
    vis(c.browsSad, f === 'sad' || f === 'nervous');
    vis(c.mSmile, ['idle', 'look', 'blink'].includes(f));
    vis(c.mGrin, f === 'happy');
    vis(c.mO, f === 'caught');
    vis(c.mNerv, f === 'natural' || f === 'nervous');
    vis(c.mSad, f === 'sad');
    vis(c.sweat, f === 'caught' || f === 'natural' || f === 'nervous');
  }

  spawnHeart(withSound) {
    const h = this.heartPool.find(x => !x.alive);
    if (!h) return;
    const win = this.mode === 'win';
    h.alive = true; h.life = 0; h.side = 0; h.max = win ? rand(1.8, 2.6) : rand(1.3, 1.8);
    h.x = 800 + rand(-14, 14) + (win ? rand(-120, 120) : 0); h.y = 434 + rand(-8, 8);
    h.vx = rand(-40, 40); h.vy = -rand(110, 170); h.ph = rand(0, 6.28);
    h.s = rand(0.9, 1.5); h.rot = rand(-18, 18);
    h.node.setAttribute('fill', pick(['#FF4F86', '#FF6F91', '#FF8FAB', '#E0336C']));
    h.node.style.display = 'inline';
    if (withSound) sfx.pop();
    return h;
  }
  heartBurst() {
    for (let i = 0; i < 9; i++) {
      const h = this.spawnHeart(false);
      if (!h) return;
      const a = -Math.PI / 2 + (i - 4) * 0.3, sp = rand(190, 270);
      h.vx = Math.cos(a) * sp; h.vy = Math.sin(a) * sp; h.s = rand(1.1, 1.6);
    }
  }
  /* x2 / x3 badge beside the kiss (clear of the boss), plus the fever glow */
  updateStreak(dt, g, kissing) {
    const e = this.el, mult = kissing ? g.multiplier : 1;
    if (mult !== this.shownMult) {
      vis(e.streakBadge, mult > 1); vis(e.streakFever, mult >= 3);
      if (mult > 1) {
        e.streakText.textContent = e.streakShadow.textContent = '×' + mult;
        e.streakText.setAttribute('fill', mult >= 3 ? '#FFC23A' : '#FF4F86');
      }
      this.shownMult = mult;
    }
    const fever = mult >= 3 ? 1 : 0;
    this.feverGlow += (fever - this.feverGlow) * (1 - Math.exp(-(fever ? 3 : 8) * dt));
    if (this.feverGlow < 0.002) this.feverGlow = 0;
    if (mult < 2) return;
    let sc = 1;
    if (this.streakPop > 0) {
      this.streakPop -= dt;
      const k = 1 - clamp(this.streakPop / 0.32, 0, 1);
      sc = 0.55 + 0.45 * k + 0.4 * Math.sin(k * Math.PI);
    }
    if (mult >= 3 && !REDUCED) sc *= 1 + Math.sin(this.t * 9) * 0.05;
    e.streakBadge.setAttribute('transform', `translate(1030,318) scale(${sc.toFixed(3)})`);
  }
  updateHearts(dt) {
    for (const h of this.heartPool) {
      if (!h.alive) continue;
      h.life += dt;
      if (h.life >= h.max) { h.alive = false; h.node.style.display = 'none'; continue; }
      const k = h.life / h.max;
      h.x += (h.vx + (REDUCED ? 0 : Math.sin(h.life * 5 + h.ph) * 40)) * dt;
      h.y += h.vy * dt;
      // Keep the boss visible: hearts rising into his head and warning-icon area drift out sideways and fade.
      const dx = h.x - 800;
      if (h.y < 380 && Math.abs(dx) < 95) {
        if (!h.side) h.side = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
        h.x += h.side * 260 * dt;
      }
      const nearBoss = h.y < 330 && Math.abs(h.x - 800) < 95;
      const sc = h.s * (k < 0.15 ? k / 0.15 : 1) * (0.7 + k * 0.4);
      h.node.setAttribute('transform', `translate(${h.x.toFixed(1)},${h.y.toFixed(1)}) rotate(${h.rot.toFixed(1)}) scale(${sc.toFixed(3)})`);
      h.node.setAttribute('opacity', (nearBoss ? 0.25 : k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1).toFixed(2));
    }
  }
  spawnNote() {
    const n = this.notePool.find(x => !x.alive);
    if (!n) return;
    n.alive = true; n.life = 0; n.x = 470 + rand(-10, 10); n.y = 400; n.node.style.display = 'inline';
  }
  updateNotes(dt) {
    for (const n of this.notePool) {
      if (!n.alive) continue;
      n.life += dt;
      if (n.life > 1.2) { n.alive = false; n.node.style.display = 'none'; continue; }
      n.y -= 60 * dt; n.x -= 18 * dt;
      n.node.setAttribute('transform', `translate(${(n.x + Math.sin(n.life * 8) * 6).toFixed(1)},${n.y.toFixed(1)})`);
      n.node.setAttribute('opacity', (1 - n.life / 1.2).toFixed(2));
    }
  }

  updateManager(dt, g) {
    const e = this.el, m = g.manager, t = this.t;
    let pose = 'back', icon = '', bang = false, rise = 0, stern = true, mouthO = false, lids = true, activity = m.activity, stretch = false, phoneFake = false;
    const playingish = g.state === S.PLAYING || g.state === S.PAUSED || g.state === S.COUNTDOWN;

    if (g.state === S.MENU) { pose = 'front'; activity = ''; }
    else if (this.mode === 'win') { pose = 'back'; activity = 'phone'; }
    else if (this.mode === 'loseHR') { pose = 'front'; rise = -36; }
    else if (this.mode === 'loseTime') { pose = 'back'; activity = 'coffee'; }
    else if (this.caughtT > 0) { pose = 'front'; bang = true; rise = -40; stern = false; mouthO = true; lids = false; }
    else if (playingish) {
      switch (m.state) {
        case M.DISTRACTED: pose = 'back'; break;
        case M.SUSPICIOUS:
          if (m.fake && m.fakeKind === 'phone') { pose = 'back'; phoneFake = true; icon = 'fake'; activity = 'phone'; }
          else if (m.fake) { pose = 'back'; stretch = true; icon = 'fake'; activity = ''; }
          else { pose = 'side'; icon = 'warn'; rise = -8; }
          break;
        case M.WATCHING: pose = 'front'; break;
        case M.RETURNING: pose = 'side'; break;
      }
    }
    if (pose !== this.mgrPose) {
      vis(e.mgrBack, pose === 'back'); vis(e.mgrSide, pose === 'side'); vis(e.mgrFront, pose === 'front');
      if (this.mgrPose) this.squash = 0.16;
      this.mgrPose = pose;
    }
    if (pose === 'back') {
      const act = stretch ? '' : activity;
      // Phone bluff: lower the right-hand phone (first 45%), pause, then hold it to the left ear (last 40%).
      let side = m.phoneHand === 'left' ? 'L' : 'R', k = 0;
      if (phoneFake) {
        const p = m.progress;
        side = p < 0.6 ? 'R' : 'L';
        if (side === 'R') k = REDUCED ? (p < 0.2 ? 0 : 1) : Math.sin(clamp(p / 0.45, 0, 1) * Math.PI / 2);
        else k = REDUCED ? 0 : 1 - Math.sin(clamp((p - 0.6) / 0.12, 0, 1) * Math.PI / 2);
      }
      if (act !== this.lastActivity || stretch !== this.lastStretch || side !== this.lastPhoneSide) {
        vis(e.actType, act === 'type'); vis(e.actCoffee, act === 'coffee'); vis(e.actRead, act === 'read');
        vis(e.actPhone, act === 'phone' && side === 'R'); vis(e.actPhoneL, act === 'phone' && side === 'L');
        vis(e.actStretchArms, stretch);
        this.lastActivity = act; this.lastStretch = stretch; this.lastPhoneSide = side;
      }
      if (act === 'phone') this.posePhone(side, k);
      if (act === 'type' && !REDUCED) {
        e.elbowL.setAttribute('transform', `translate(0,${(Math.sin(t * 16) * 3).toFixed(2)})`);
        e.elbowR.setAttribute('transform', `translate(0,${(Math.sin(t * 16 + 2) * 3).toFixed(2)})`);
      }
      if (act === 'coffee') { const sip = Math.max(0, Math.sin(t * 1.6)); e.mug.setAttribute('transform', `rotate(${(-sip * 22).toFixed(1)} 120 -260)`); }
      if (act === 'read' && !REDUCED) e.paper.setAttribute('transform', `rotate(${(-8 + Math.sin(t * 1.2) * 3).toFixed(1)} -150 -280)`);
    }
    if (pose === 'front') {
      vis(e.mgrLids, lids && g.state !== S.MENU ? true : g.state === S.MENU);
      vis(e.mgrBrowStern, stern); vis(e.mgrBrowUp, !stern);
      vis(e.mgrMouthFlat, !mouthO); vis(e.mgrMouthO, mouthO);
      // eyes dart in watching
      const dart = (g.state === S.PLAYING && m.state === M.WATCHING && !REDUCED) ? Math.sin(t * 3) * 5 : 0;
      e.mgrEyes.setAttribute('transform', `translate(${dart.toFixed(1)},0)`);
    }
    // squash on turn
    let sx = 1;
    if (this.squash > 0) { this.squash -= dt; sx = 1 - 0.28 * Math.sin(clamp(this.squash / 0.16, 0, 1) * Math.PI); }
    const fidget = (pose === 'side' && icon === 'warn' && !REDUCED) ? Math.sin(t * 30) * 1.5 : 0;
    const stretchRise = stretch ? -10 - Math.sin(t * 4) * 4 : 0;
    e.mgrBody.setAttribute('transform', `translate(${fidget.toFixed(2)},${(rise + stretchRise).toFixed(2)}) scale(${sx.toFixed(3)},1)`);
    // Keep the boss's feet on the floor when the body rises (standing up, stretching): stretch shins, drop shoes.
    const lift = rise + stretchRise;
    if (lift !== this.lastLift || pose !== this.lastLegPose) {
      this.lastLift = lift; this.lastLegPose = pose;
      const poseEl = pose === 'back' ? e.mgrBack : pose === 'side' ? e.mgrSide : e.mgrFront;
      const sh = poseEl.querySelector('.shins'), so = poseEl.querySelector('.shoes');
      if (sh && so) {
        const top = +sh.dataset.top, len = +sh.dataset.len, k = (len - lift) / len;
        sh.setAttribute('transform', `translate(0,${top}) scale(1,${k.toFixed(4)}) translate(0,${-top})`);
        so.setAttribute('transform', `translate(0,${(-lift).toFixed(2)})`);
      }
    }

    // icons
    vis(e.warnIcon, icon === 'warn'); vis(e.fakeIcon, icon === 'fake');
    if (icon) {
      const pulse = REDUCED ? 1 : 1 + Math.sin(t * 14) * 0.08;
      const pop = clamp(m.t / 0.12, 0, 1);
      const el = icon === 'warn' ? e.warnIcon : e.fakeIcon;
      el.setAttribute('transform', `translate(800,196) scale(${(pulse * (0.4 + 0.6 * pop)).toFixed(3)})`);
    }
    vis(e.bigBang, bang);
    if (bang) {
      const k = clamp((CONFIG.freeze - this.caughtT) / 0.18, 0, 1);
      const sc = REDUCED ? 1 : (k < 1 ? 0.3 + k * 1.0 : 1.3 - Math.min(0.3, (CONFIG.freeze - this.caughtT - 0.18) * 1.2));
      e.bigBang.setAttribute('transform', `translate(800,170) scale(${sc.toFixed(3)})`);
    }

    // sight cone (directional awareness)
    let coneScale = 0, fillOp = 0, dashed = true, coneOn = false;
    if (g.state === S.PLAYING || g.state === S.PAUSED) {
      if (m.state === M.SUSPICIOUS && !m.fake) { coneOn = true; coneScale = 0.25 + 0.55 * m.progress; }
      else if (m.state === M.WATCHING) { coneOn = true; coneScale = 1; fillOp = 0.26; dashed = false; }
      else if (m.state === M.RETURNING) { coneOn = true; coneScale = 1 - m.progress; fillOp = 0.26 * (1 - m.progress); dashed = false; }
    }
    if (this.caughtT > 0 && this.mode === 'play') { coneOn = true; coneScale = 1; fillOp = 0.4; dashed = false; }
    if (!g.rules.cone) coneOn = false;
    vis(e.cone, coneOn);
    if (coneOn) {
      e.cone.setAttribute('transform', `translate(800,292) scale(${coneScale.toFixed(3)}) translate(-800,-292)`);
      e.coneFill.setAttribute('opacity', fillOp.toFixed(3));
      e.coneLine.setAttribute('stroke-dasharray', dashed ? '18 12' : 'none');
      e.coneLine.setAttribute('opacity', dashed ? '0.85' : '0.6');
    }

    // thought bubbles
    const canThink = (playingish && m.state === M.DISTRACTED && this.caughtT <= 0 && this.mode === 'play') || this.mode === 'win';
    if (this.thoughtShow > 0) {
      this.thoughtShow -= dt;
      if (this.thoughtShow <= 0 || !canThink) { this.thoughtShow = 0; vis(e.thought, false); }
    } else if (canThink && g.state !== S.PAUSED) {
      this.thoughtT -= dt;
      if (this.thoughtT <= 0) {
        this.thoughtT = rand(5, 9);
        const lines = m.activity === 'phone' || this.mode === 'win' ? COPY.thoughts.phone : COPY.thoughts.idle;
        if (this.mode === 'win') this.thoughtT = 2.6;
        this.showThought(pick(lines));
      }
    }
  }
  /* Phone arm on side R or L. k = 0: phone at the ear. k = 1: lowered to the desk. */
  posePhone(side, k) {
    const a = this.phoneArms[side];
    if (a.k === k) return;
    a.k = k;
    const s = side === 'R' ? 1 : -1, f = v => (v * s).toFixed(1);
    const hx = lerp(92, 158, k), hy = lerp(-250, -150, k), cx = lerp(132, 150, k), cy = lerp(-196, -186, k);
    const d = `M${f(88)},-150 Q${f(cx)},${cy.toFixed(1)} ${f(hx)},${(hy + 6).toFixed(1)}`;
    a.paths.forEach(n => n.setAttribute('d', d));
    a.hand.setAttribute('transform', `translate(${f(hx - 92)},${(hy + 250).toFixed(1)}) rotate(${f(k * 70)} ${f(92)} -250)`);
  }
  showThought(text) {
    const e = this.el;
    e.thoughtText.textContent = text;
    const w = Math.max(170, text.length * 10.2 + 40);
    e.thoughtBox.setAttribute('width', w.toFixed(0));
    e.thoughtText.setAttribute('x', (868 + w / 2).toFixed(0));
    vis(e.thought, true);
    this.thoughtShow = 2.4;
  }

  updateSky(p) {
    const e = this.el;
    const mix = (a, b, k) => {
      const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
      return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join('');
    };
    const k1 = clamp(p / 0.7, 0, 1), k2 = clamp((p - 0.7) / 0.3, 0, 1);
    const top = k2 > 0 ? mix('F49AB5', '8A7BC8', k2) : mix('9ED0F0', 'F49AB5', k1);
    const bot = k2 > 0 ? mix('FFC27A', 'FF9F7A', k2) : mix('FCE3C4', 'FFC27A', k1);
    e.sky0.setAttribute('stop-color', top); e.sky1.setAttribute('stop-color', bot);
    e.sun.setAttribute('cy', (150 + p * 170).toFixed(1));
    e.sun.setAttribute('fill', mix('FFE08A', 'FF8C69', p));
    e.cityLights.setAttribute('opacity', (0.2 + p * 0.8).toFixed(2));
  }

  updateDecor(dt, g) {
    const e = this.el, t = this.t;
    const active = g.state === S.PLAYING || g.state === S.MENU || g.state === S.COUNTDOWN;
    if (active && this.mode === 'play' && this.caughtT <= 0) {
      this.decorT -= dt;
      if (this.decorT <= 0) {
        this.decorT = rand(6, 11);
        const options = ['walker', 'printer', 'plant', 'email'].filter(o => !(o === 'walker' && this.walkerX !== null));
        const ev = pick(options);
        if (ev === 'walker') { this.walkerX = -160; this.walkerDir = 1; }
        if (ev === 'printer') this.jamT = 1.6;
        if (ev === 'plant') this.plantT = 1.3;
        if (ev === 'email') { this.emailT = 2.6; if (g.state === S.PLAYING) sfx.ding(); }
      }
    }
    // walker with coffee tower
    if (this.walkerX !== null) {
      this.walkerX += 210 * dt;
      const step = Math.sin(this.walkerX / 22);
      e.wLegA.setAttribute('transform', `rotate(${(step * 22).toFixed(1)} 0 -96)`);
      e.wLegB.setAttribute('transform', `rotate(${(-step * 22).toFixed(1)} 0 -96)`);
      e.wCups.setAttribute('transform', `translate(0,-262) rotate(${(Math.sin(t * 5) * 4).toFixed(2)} 0 0)`);
      const bob = Math.abs(step) * -6;
      e.walker.setAttribute('transform', `translate(${this.walkerX.toFixed(1)},${(522 + bob).toFixed(1)}) scale(.55)`);
      if (this.walkerX > 1780) { this.walkerX = null; e.walker.setAttribute('transform', 'translate(-300,522) scale(.55)'); }
    }
    // printer jam
    if (this.jamT > 0) {
      this.jamT -= dt;
      const on = this.jamT > 0;
      vis(e.jamText, on); vis(e.jamPapers, on);
      e.printerLight.setAttribute('fill', on && Math.sin(t * 20) > 0 ? '#E5392B' : '#5DB58C');
      e.printerBody.setAttribute('transform', on && !REDUCED ? `translate(${(Math.sin(t * 70) * 2.5).toFixed(2)},0)` : '');
      const k = 1 - clamp(this.jamT / 1.6, 0, 1);
      [e.jp0, e.jp1, e.jp2].forEach((p, i) => {
        const kk = clamp(k * 1.4 - i * 0.18, 0, 1);
        const x = 1470 + (i - 1) * 70 * kk, y = 400 - Math.sin(kk * Math.PI) * 120 + kk * 60;
        p.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(kk * 240 * (i - 1 || 1)).toFixed(1)})`);
      });
    }
    // plant wobble
    if (this.plantT > 0) {
      this.plantT -= dt;
      const a = REDUCED ? 0 : Math.sin(t * 18) * 7 * clamp(this.plantT / 1.3, 0, 1);
      e.plantL.setAttribute('transform', `rotate(${a.toFixed(2)} 530 520)`);
      e.plantR.setAttribute('transform', `rotate(${(-a * 0.7).toFixed(2)} 1323 520)`);
    }
    // email
    if (this.emailT > 0) {
      this.emailT -= dt;
      vis(e.emailPop, this.emailT > 0);
    }
    // caught: tipped cup
    if (this.caughtT > 0) {
      const k = clamp((CONFIG.freeze - this.caughtT) / 0.25, 0, 1);
      e.cupL.setAttribute('transform', `rotate(${(k * 96).toFixed(1)} 718 656)`);
      e.spill.setAttribute('opacity', (k * 0.9).toFixed(2));
    } else {
      const op = parseFloat(e.spill.getAttribute('opacity')) || 0;
      if (op > 0) e.spill.setAttribute('opacity', Math.max(0, op - dt * 0.12).toFixed(3));
    }
  }
}
