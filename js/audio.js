'use strict';
/* Procedural sound effects (Web Audio) */
class Sfx {
  constructor() { this.ctx = null; this.master = null; this.enabled = store.get('sound', true) !== false; this.noiseBuf = null; }
  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.55;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 0.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* audio is optional */ }
  }
  setEnabled(on) { this.enabled = on; store.set('sound', on); if (on) this.unlock(); }
  get ok() { return this.enabled && this.ctx && this.ctx.state === 'running'; }
  tone(f, dur, { type = 'sine', vol = 0.2, delay = 0, slide = null, attack = 0.006 } = {}) {
    if (!this.ok) return;
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  noise(dur, { vol = 0.2, freq = 1200, q = 1, delay = 0, type = 'bandpass' } = {}) {
    if (!this.ok || !this.noiseBuf) return;
    const c = this.ctx, t = c.currentTime + delay;
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.05);
  }
  pop()   { this.tone(rand(700, 1100), 0.08, { vol: 0.07, slide: rand(1400, 1800) }); }
  smooch(){ this.noise(0.09, { vol: 0.22, freq: 2400, q: 4 }); this.tone(1100, 0.09, { vol: 0.08, slide: 420 }); }
  tick()  { this.tone(1900, 0.035, { type: 'square', vol: 0.04 }); }
  warn()  { this.tone(988, 0.12, { type: 'triangle', vol: 0.2 }); this.tone(740, 0.2, { type: 'triangle', vol: 0.2, delay: 0.12 }); }
  hmm()   { this.tone(196, 0.3, { type: 'triangle', vol: 0.12, slide: 175 }); }
  caught() {
    [233, 247, 277].forEach(f => this.tone(f, 0.45, { type: 'sawtooth', vol: 0.06, slide: f * 0.7 }));
    this.noise(0.2, { vol: 0.18, freq: 500, q: 0.8 });
    [392, 370, 349].forEach((f, i) => this.tone(f, 0.22, { type: 'square', vol: 0.05, delay: 0.35 + i * 0.22 }));
    this.tone(330, 0.6, { type: 'square', vol: 0.05, delay: 1.01, slide: 220 });
  }
  win()  { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.24, { type: 'triangle', vol: 0.16, delay: i * 0.11 })); this.tone(1319, 0.6, { vol: 0.12, delay: 0.48 }); this.tone(1568, 0.7, { vol: 0.08, delay: 0.6 }); }
  lose() { [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.34, { type: 'triangle', vol: 0.14, delay: i * 0.24 })); }
  count(go) { this.tone(go ? 880 : 523, go ? 0.4 : 0.14, { type: 'square', vol: 0.07 }); }
  ding() { this.tone(1568, 0.25, { vol: 0.05 }); this.tone(2093, 0.3, { vol: 0.04, delay: 0.09 }); }
  click() { this.tone(660, 0.05, { type: 'triangle', vol: 0.08 }); }
}
const sfx = new Sfx();
