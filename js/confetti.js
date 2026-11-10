'use strict';
/* Confetti (canvas) */
const confetti = {
  cv: $('confetti'), ctx: null, parts: [], rainT: 0, w: 0, h: 0, dpr: 1,
  init() { this.ctx = this.cv.getContext('2d'); this.resize(); },
  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.cv.width = this.w * this.dpr; this.cv.height = this.h * this.dpr;
  },
  start(sec) { this.rainT = sec; if (REDUCED) this.rainT = 0.3; },
  clear() { this.parts.length = 0; this.rainT = 0; if (this.ctx) this.ctx.clearRect(0, 0, this.cv.width, this.cv.height); },
  spawn(n) {
    const colors = ['#FF4F86', '#FFE08A', '#8ED8C4', '#8B9BD6', '#FFB3C9', '#FFFFFF'];
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: rand(0, this.w), y: rand(-60, -10), vx: rand(-50, 50), vy: rand(90, 220),
        r: rand(0, 6.28), vr: rand(-5, 5), s: rand(6, 13), c: pick(colors), heart: Math.random() < 0.35, ph: rand(0, 6.28),
      });
    }
  },
  update(dt) {
    if (!this.ctx) return;
    if (this.rainT > 0) { this.rainT -= dt; this.spawn(REDUCED ? 2 : Math.ceil(110 * dt)); }
    if (!this.parts.length) return;
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    this.parts = this.parts.filter(p => p.y < this.h + 30);
    for (const p of this.parts) {
      p.ph += dt * 4; p.x += (p.vx + Math.sin(p.ph) * 30) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.strokeStyle = INK; c.lineWidth = 1.5;
      if (p.heart) {
        const s = p.s / 16;
        c.scale(s, s); c.beginPath();
        c.moveTo(0, 8); c.bezierCurveTo(-4, 4, -16, -2, -16, -10); c.bezierCurveTo(-16, -17, -10, -21, -5, -21);
        c.bezierCurveTo(-2, -21, 0, -19, 0, -16); c.bezierCurveTo(0, -19, 2, -21, 5, -21); c.bezierCurveTo(10, -21, 16, -17, 16, -10);
        c.bezierCurveTo(16, -2, 4, 4, 0, 8); c.fill(); c.stroke();
      } else {
        c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * Math.abs(Math.cos(p.ph)) + 1);
      }
      c.restore();
    }
    if (!this.parts.length) c.clearRect(0, 0, this.w, this.h);
  },
};
