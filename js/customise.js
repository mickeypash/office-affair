'use strict';
/* "Who's clocking in?" (pick a girl from CHARACTERS or your own girl) and the "Make your own" editor.
   Both draw live in the office behind them. */

/* Small head-and-shoulders portrait for a pick card. */
function portraitSVG(m) {
  const body = coworkerBody(girlOpts(m, 1));
  return `<svg viewBox="-150 -370 300 300" aria-hidden="true"><rect x="-150" y="-370" width="300" height="300" fill="#F6DDA6"/>${body}</svg>`;
}

const select = {
  el: {},
  init() {
    ['select', 'btnStart', 'btnSelectBack', 'btnRestyle', 'pickCustom', 'pickCustomName'].forEach(id => { this.el[id] = $(id); });
    // One card per visible girl, in CHARACTERS order, before the "Make your own" card.
    document.querySelector('#select .pick-slot').insertAdjacentHTML('beforebegin', PLAYABLE.map(c =>
      `<button class="pick-card" role="radio" data-pick="${esc(c.id)}" aria-checked="false"><span class="pick-face" data-face="${esc(c.id)}">${portraitSVG(GIRLS[c.id])}</span><span class="pick-name">${esc(c.name)}</span></button>`).join(''));
    this.cards = [...document.querySelectorAll('.pick-card')];
    this.cards.forEach(c => c.addEventListener('click', () => this.choose(c.dataset.pick)));
    this.el.btnStart.addEventListener('click', () => game.start());
    this.el.btnSelectBack.addEventListener('click', () => this.close());
    this.el.btnRestyle.addEventListener('click', () => customise.open());
  },
  get isOpen() { return this.el.select.classList.contains('show'); },
  open() { this.render(); ui.showOverlay('select'); },
  close() { ui.showOverlay('menu'); },
  choose(p) {
    // Tapping your girl's card again (or the hanger badge) opens her wardrobe.
    if (p === 'custom' && cast.custom && cast.pick === 'custom') { customise.open(); return; }
    if (p === 'custom' && !cast.custom) { cast.ensureCustom(); cast.setPick('custom'); renderer.buildChar('L'); customise.open(); return; }
    cast.setPick(p);
    renderer.buildChar('L');
    renderer.glanceAt('L');
    this.render();
  },
  render() {
    for (const c of this.cards) c.setAttribute('aria-checked', String(c.dataset.pick === cast.pick));
    const face = document.querySelector('[data-face="custom"]');
    if (cast.custom) {
      face.innerHTML = portraitSVG(cast.custom);
      this.el.pickCustomName.textContent = cast.custom.name;
      this.el.pickCustom.classList.remove('empty');
    } else {
      face.innerHTML = '<span class="pick-plus" aria-hidden="true">+</span>';
      this.el.pickCustomName.textContent = 'Make your own';
      this.el.pickCustom.classList.add('empty');
    }
    this.el.btnRestyle.hidden = !cast.custom;
  },
};

const customise = {
  el: {},
  init() {
    ['customise', 'custName', 'custGlasses', 'custDone', 'custShuffle', 'custReset'].forEach(id => { this.el[id] = $(id); });
    this.groups = [...document.querySelectorAll('#custBody [data-key]')];
    const palettes = { skin: SKIN_TONES, hair: HAIR_COLOURS, outfitColour: OUTFIT_COLOURS };
    const lists = { hairStyle: HAIR_STYLES, outfit: OUTFITS };
    for (const g of this.groups) {
      const key = g.dataset.key;
      if (palettes[key]) {
        g.innerHTML = palettes[key].map(([hex, label]) =>
          `<button class="sw" role="radio" aria-checked="false" aria-label="${label}" title="${label}" data-value="${hex}" style="--c:${hex}"></button>`).join('') +
          `<label class="sw sw-custom" title="Pick any colour"><input type="color" aria-label="Pick any colour"></label>`;
        g.querySelector('input').addEventListener('input', e => this.apply(key, e.target.value));
      } else {
        g.innerHTML = Object.entries(lists[key]).map(([id, label]) =>
          `<button class="chip" role="radio" aria-checked="false" data-value="${id}">${label}</button>`).join('');
      }
      g.addEventListener('click', e => {
        const b = e.target.closest('button[data-value]');
        if (b) this.apply(key, b.dataset.value);
      });
    }
    this.el.custName.addEventListener('input', () => { cast.setCustom('name', this.el.custName.value); renderer.updatePlate('L'); });
    this.el.custGlasses.addEventListener('click', () => this.apply('glasses', !cast.custom.glasses));
    this.el.custShuffle.addEventListener('click', () => { cast.shuffleCustom(); this.redraw(); this.render(); });
    this.el.custReset.addEventListener('click', () => { cast.resetCustom(); this.redraw(); this.render(); });
    this.el.custDone.addEventListener('click', () => this.close());
  },
  get isOpen() { return this.el.customise.classList.contains('show'); },
  open() {
    cast.ensureCustom();
    cast.setPick('custom');
    this.redraw();
    this.render();
    ui.showOverlay('customise');
  },
  close() { select.open(); },
  redraw() { renderer.buildChar('L'); renderer.glanceAt('L'); },
  apply(key, value) { cast.setCustom(key, value); this.redraw(); this.render(); },
  render() {
    const m = cast.custom;
    this.el.custName.value = m.name;
    this.el.custGlasses.setAttribute('aria-pressed', String(m.glasses));
    this.el.custGlasses.textContent = m.glasses ? 'Glasses: on' : 'Glasses: off';
    for (const g of this.groups) {
      const v = m[g.dataset.key];
      let found = false;
      g.querySelectorAll('button[data-value]').forEach(b => {
        const on = b.dataset.value.toUpperCase() === String(v).toUpperCase();
        b.setAttribute('aria-checked', String(on));
        found = found || on;
      });
      const custom = g.querySelector('.sw-custom');
      if (custom) {
        custom.setAttribute('aria-checked', String(!found));
        custom.style.background = found ? '' : v;
        custom.querySelector('input').value = v.toLowerCase();
      }
    }
  },
};
