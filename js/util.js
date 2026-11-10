'use strict';
/* Small helpers and localStorage wrapper */
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = id => document.getElementById(id);
const vis = (el, on) => { if (el) el.style.display = on ? 'inline' : 'none'; };
const fmtTime = s => { s = Math.max(0, Math.ceil(s)); return String((s / 60) | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

const store = {
  get(k, d) { try { const v = localStorage.getItem('officeAffair.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('officeAffair.' + k, JSON.stringify(v)); } catch (e) {} },
};
