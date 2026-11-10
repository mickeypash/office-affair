'use strict';
/* Customise screen: edit names and looks. Every change is saved and drawn live in the scene. */
const customise = {
  role: 'player',
  el: {},
  init() {
    ['customise', 'tabPlayer', 'tabPartner', 'custName', 'custTeam', 'custGlasses', 'custDone', 'custShuffle', 'custReset', 'btnCustomise']
      .forEach(id => { this.el[id] = $(id); });
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
    [this.el.tabPlayer, this.el.tabPartner].forEach(t => t.addEventListener('click', () => { this.role = t.dataset.role; this.render(); }));
    this.el.custName.addEventListener('input', () => this.applyText('name', this.el.custName.value));
    this.el.custTeam.addEventListener('input', () => this.applyText('team', this.el.custTeam.value));
    this.el.custGlasses.addEventListener('click', () => this.apply('glasses', !cast.get(this.role).glasses));
    this.el.custShuffle.addEventListener('click', () => { cast.shuffle(this.role); this.redraw(); this.render(); });
    this.el.custReset.addEventListener('click', () => { cast.reset(this.role); this.redraw(); this.render(); });
    this.el.custDone.addEventListener('click', () => this.close());
    this.el.btnCustomise.addEventListener('click', () => this.open());
  },
  get isOpen() { return this.el.customise.classList.contains('show'); },
  get key() { return this.role === 'player' ? 'L' : 'R'; },
  open() {
    this.role = 'player';
    this.render();
    ui.showOverlay('customise');
  },
  close() { ui.showOverlay('menu'); },
  redraw() { renderer.buildChar(this.key); renderer.glanceAt(this.key); },
  apply(key, value) {
    cast.set(this.role, key, value);
    this.redraw();
    this.render();
  },
  // Names: save on every keystroke, but do not overwrite what the person is typing.
  applyText(key, value) {
    cast.set(this.role, key, value);
    renderer.updatePlate(this.key);
    this.renderTabs();
  },
  renderTabs() {
    this.el.tabPlayer.textContent = `${cast.firstName('player')} (you)`;
    this.el.tabPartner.textContent = cast.firstName('partner');
    this.el.tabPlayer.setAttribute('aria-selected', String(this.role === 'player'));
    this.el.tabPartner.setAttribute('aria-selected', String(this.role === 'partner'));
  },
  render() {
    const m = cast.get(this.role);
    this.renderTabs();
    this.el.custName.value = m.name;
    this.el.custTeam.value = m.team;
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
