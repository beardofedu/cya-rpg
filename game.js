(function () {
  const SAVE_KEY = 'cya-rpg-save-v1';
  const $ = (id) => document.getElementById(id);
  const mod = (score) => Math.floor((score - 10) / 2);
  const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const resolve = (v, s) => (typeof v === 'function' ? v(s) : v);
  const t = I18n.t;

  let state = null;
  let selectedSet = 'kaldra';
  let rolling = false;

  function newState(cls, name, adventureSet) {
    const c = CLASSES[cls];
    return {
      cls, name: name || 'Aldric', adventureSet,
      stats: { ...c.stats },
      hp: c.hp, maxHp: c.hp, gold: 0,
      items: [...c.items],
      equipment: { weapon: c.weapon, armor: c.armor },
      level: 1, completedStories: [], storyOutcomes: {},
      flags: {}, abilityUsed: false,
      section: null, check: null, combat: null,
    };
  }

  const save = () => localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  function load() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
  }

  function normalizeState(s) {
    const c = CLASSES[s.cls];
    s.stats ||= { ...c.stats };
    s.items ||= [...c.items];
    s.level = Number.isInteger(s.level) && s.level > 0 ? s.level : 1;
    s.completedStories = Array.isArray(s.completedStories) ? s.completedStories : [];
    s.storyOutcomes ||= {};
    s.adventureSet ||= /^(orchard|glass|star)-/.test(s.section) ? 'starfall' : 'kaldra';
    s.equipment ||= {};
    for (const slot of ['weapon', 'armor']) {
      const equipped = s.equipment[slot];
      if (!EQUIPMENT[equipped] || EQUIPMENT[equipped].slot !== slot || !s.items.includes(equipped)) {
        const starter = slot === 'weapon' ? c.weapon : c.armor;
        if (!s.items.includes(starter)) s.items.push(starter);
        s.equipment[slot] = starter;
      }
    }
    return s;
  }

  const weaponFor = (s) => EQUIPMENT[s.equipment.weapon] || { damage: CLASSES[s.cls].damage };
  const armorFor = (s) => EQUIPMENT[s.equipment.armor] || { defense: 0 };

  function completeStory(sec) {
    if (sec.storyId && sec.outcome) state.storyOutcomes[sec.storyId] = sec.outcome;
    if (!sec.storyId || state.completedStories.includes(sec.storyId)) return '';
    state.completedStories.push(sec.storyId);
    state.level += 1;
    state.maxHp += 2;
    state.hp = Math.min(state.maxHp, state.hp + 2);
    state.stats[CLASSES[state.cls].attackStat] += 1;
    return t('Story complete! You reached level {level}: +2 maximum Endurance and +1 {stat}.',
      { level: state.level, stat: t(CLASSES[state.cls].attackStat) });
  }

  function toast(msg) {
    if (!msg) return;
    const t = $('toast');
    t.textContent = I18n.t(msg);
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function show(screen) {
    $('screen-select').classList.toggle('hidden', screen !== 'select');
    $('screen-game').classList.toggle('hidden', screen !== 'game');
  }

  // ---------- Class selection ----------
  function renderLanguage() {
    document.documentElement.lang = I18n.language;
    document.title = t('The Lantern of Kaldra');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    $('language-select').value = I18n.language;
    $('btn-free-roll').title = t('Roll a d20 just for fun');
    document.querySelector('.sheet').setAttribute('aria-label', t('Adventure Sheet'));
    document.querySelector('.site-header h1').textContent = t('The Lantern of Kaldra');
    document.querySelector('.tagline').textContent = t('A choose-your-own-adventure gamebook');
  }

  function renderSet() {
    const set = I18n.language === 'es' ? ADVENTURE_SETS_ES[selectedSet] : ADVENTURE_SETS[selectedSet];
    $('set-intro').textContent = set.intro;
    $('set-stories').innerHTML = set.stories.map((title) => `<li>${title}</li>`).join('');
  }

  function renderSelect() {
    show('select');
    const sets = I18n.language === 'es' ? ADVENTURE_SETS_ES : ADVENTURE_SETS;
    $('adventure-set').innerHTML = Object.entries(sets).map(([id, set]) =>
      `<option value="${id}"${id === selectedSet ? ' selected' : ''}>${set.title}</option>`).join('');
    $('adventure-set').value = selectedSet;
    renderSet();
    const list = $('class-list');
    list.innerHTML = '';
    for (const [key, c] of Object.entries(CLASSES)) {
      const card = document.createElement('button');
      card.className = 'class-card parchment';
      card.innerHTML = `
        <div class="icon">${c.icon}</div>
        <h3>${t(c.name)}</h3>
        <p>${t(c.blurb)}</p>
        ${statGrid(c.stats)}
        <p><strong>${t('Endurance')}:</strong> ${c.hp} &nbsp; <strong>${t('Attacks with')}:</strong> ${t(STAT_NAMES[c.attackStat])}</p>
        <p class="ability"><strong>${t(c.ability.name)}:</strong> ${t(c.ability.desc)}</p>`;
      card.addEventListener('click', () => {
        const name = ($('hero-name').value || '').replace(/[<>&"'`]/g, '').trim().slice(0, 24);
        state = newState(key, name, selectedSet);
        goTo(ADVENTURE_SETS[selectedSet].start);
      });
      list.appendChild(card);
    }
  }

  function statGrid(stats) {
    return `<div class="stat-grid">${Object.entries(stats).map(([k, v]) =>
      `<div class="stat" title="${t(STAT_NAMES[k])}"><span class="label">${t(k)}</span><span class="value">${v}</span> <span class="mod">${fmt(mod(v))}</span></div>`
    ).join('')}</div>`;
  }

  // ---------- Adventure sheet ----------
  function renderSheet() {
    const c = CLASSES[state.cls];
    const pct = Math.max(0, (state.hp / state.maxHp) * 100);
    const counts = {};
    state.items.forEach((i) => { counts[i] = (counts[i] || 0) + 1; });
    const gearOptions = (slot) => state.items
      .filter((item) => EQUIPMENT[item] && EQUIPMENT[item].slot === slot)
      .map((item) => `<option value="${escapeHtml(item)}"${state.equipment[slot] === item ? ' selected' : ''}>${escapeHtml(t(item))}</option>`)
      .join('');
    $('sheet-body').innerHTML = `
      <div class="who">${c.icon} ${escapeHtml(state.name)} — ${t(c.name)}</div>
      ${statGrid(state.stats)}
      <div class="sheet-row"><span>${t('Level')}</span><span>${state.level}</span></div>
      <div class="sheet-row"><span>${t('Endurance')}</span><span>${Math.max(0, state.hp)} / ${state.maxHp}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="sheet-row"><span>${t('Gold')}</span><span>${state.gold}</span></div>
      <strong>${t('Equipment')}</strong>
      <label class="equipment-row">${t('Weapon')}
        <select class="equip-select" data-slot="weapon">${gearOptions('weapon')}</select>
      </label>
      <label class="equipment-row">${t('Armor')}
        <select class="equip-select" data-slot="armor">${gearOptions('armor')}</select>
      </label>
      <div class="sheet-row"><span>${t('Weapon damage')}</span><span>${weaponFor(state).damage[0]}–${weaponFor(state).damage[1]}</span></div>
      <div class="sheet-row"><span>${t('Armor defense')}</span><span>${armorFor(state).defense}</span></div>
      <strong>${t('Backpack')}</strong>
      <ul class="items">${Object.entries(counts).map(([i, n]) => `<li>${escapeHtml(t(i))}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || `<li>${t('Empty')}</li>`}</ul>`;
    $('sheet-body').querySelectorAll('.equip-select').forEach((select) => {
      select.addEventListener('change', () => {
        state.equipment[select.dataset.slot] = select.value;
        save();
        render();
        $('sheet-body').querySelector(`.equip-select[data-slot="${select.dataset.slot}"]`).focus();
        toast(t('Equipped {item}.', { item: t(select.value) }));
      });
    });

    const sec = STORY[state.section];
    const ended = !!(sec && sec.ending);
    const inCombat = !!state.combat && !state.combat.over;
    const busyCheck = !!state.check && !state.check.done;

    const ab = $('btn-ability');
    ab.textContent = `${t(c.ability.name)}${state.abilityUsed ? t(' (used)') : ''}`;
    ab.title = t(c.ability.desc);
    ab.disabled = ended || state.abilityUsed || (c.ability.combatOnly && !inCombat) || (!c.ability.combatOnly && state.hp >= state.maxHp) || busyCheck;

    const potions = counts['Healing Potion'] || 0;
    const pb = $('btn-potion');
    pb.textContent = `${t('Drink Potion')} (${potions})`;
    pb.disabled = ended || potions === 0 || state.hp >= state.maxHp;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // ---------- Navigation ----------
  function goTo(id) {
    const sec = STORY[id];
    if (!sec) { console.error('Missing section', id); return; }
    state.section = id;
    state.check = sec.check ? { done: false } : null;
    state.combat = sec.combat ? { enemyHp: sec.combat.hp, log: [], over: false } : null;
    let msg = '';
    if (sec.onEnter) msg = t(sec.onEnter(state) || '');
    if (state.hp <= 0 && id !== 'death') { state.hp = 0; return goTo('death'); }
    const reward = sec.ending === 'victory' ? completeStory(sec) : '';
    if (reward) msg = [msg, reward].filter(Boolean).join(' ');
    save();
    render();
    toast(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    show('game');
    const sec = I18n.section(state.section);
    $('section-number').textContent = sec.number ?? state.section;
    $('section-number').classList.toggle('named', sec.number === undefined && typeof state.section === 'string');
    $('section-title').textContent = sec.title;
    $('section-text').innerHTML = resolve(sec.text, state);
    const illustration = $('section-illustration');
    if (sec.illustration) {
      illustration.querySelector('img').src = sec.illustration.src;
      illustration.querySelector('img').alt = sec.illustration.alt;
      illustration.querySelector('figcaption').textContent = sec.illustration.caption;
      illustration.classList.remove('hidden');
    } else {
      illustration.classList.add('hidden');
    }
    const inter = $('section-interactive');
    const choices = $('section-choices');
    inter.innerHTML = '';
    choices.innerHTML = '';

    if (sec.check) renderCheck(sec, inter, choices);
    else if (sec.combat) renderCombat(sec, inter, choices);
    else if (sec.ending) renderEnding(sec, inter);
    else renderChoices(sec, choices);

    renderSheet();
  }

  function renderChoices(sec, el) {
    for (const ch of sec.choices || []) {
      if (ch.show && !ch.show(state)) continue;
      const ok = !ch.req || ch.req(state);
      const b = document.createElement('button');
      b.className = 'btn';
      b.innerHTML = `${ch.text}${!ok && ch.reqText ? ` <span class="choice-note">(${resolve(ch.reqText, state)})</span>` : ''}`;
      b.disabled = !ok;
      b.addEventListener('click', () => {
        const msg = ch.effect ? ch.effect(state) : '';
        const to = resolve(ch.to, state);
        if (to === state.section) { save(); render(); toast(msg); }
        else { goTo(to); toast(msg); }
      });
      el.appendChild(b);
    }
  }

  // ---------- Skill checks ----------
  function checkBonus(chk) {
    const m = mod(state.stats[chk.stat]);
    const extra = chk.bonus ? chk.bonus(state) : 0;
    return { m, extra, total: m + extra };
  }

  function renderCheck(sec, inter, choices) {
    const chk = sec.check;
    const { m, extra } = checkBonus(chk);
    const box = document.createElement('div');
    box.className = 'check-box';
    const bonusTxt = `${fmt(m)} ${t(chk.stat)}${extra ? ` ${fmt(extra)} ${chk.bonusLabel}` : ''}`;
    box.innerHTML = `<h3>🎲 ${t('{stat} Check — DC {dc}', { stat: t(STAT_NAMES[chk.stat]), dc: chk.dc })}</h3>
      <p>${chk.text} ${t('Roll a d20 and add your modifier ({bonus}). Meet or beat <strong>{dc}</strong> to succeed. A natural 20 always succeeds; a natural 1 always fails.', { bonus: bonusTxt, dc: chk.dc })}</p>`;
    inter.appendChild(box);

    if (!state.check.done) {
      const b = document.createElement('button');
      b.className = 'btn roll';
      b.textContent = t('Roll d20 ({bonus})', { bonus: bonusTxt });
      b.addEventListener('click', async () => {
        b.disabled = true;
        const res = await rollD20((r) => {
          const tot = r + m + extra;
          const ok = r === 20 || (r !== 1 && tot >= chk.dc);
          return `<span class="big">${r} ${fmt(m + extra)} = ${tot}</span>${t(ok ? '✅ Success!' : '❌ Failure')} (${I18n.language === 'es' ? 'CD' : 'DC'} ${chk.dc})<br>`;
        });
        if (res == null) { b.disabled = false; return; }
        const total = res + m + extra;
        const success = res === 20 || (res !== 1 && total >= chk.dc);
        state.check = { done: true, roll: res, total, success };
        save();
        render();
      });
      choices.appendChild(b);
    } else {
      const r = state.check;
      const p = document.createElement('p');
      p.className = `result ${r.success ? 'success' : 'failure'}`;
      p.textContent = t('You rolled {roll} {modifier} = {total} — {result}{natural}', {
        roll: r.roll, modifier: fmt(r.total - r.roll), total: r.total,
        result: t(r.success ? 'Success!' : 'Failure.'),
        natural: r.roll === 20 ? t(' (Natural 20!)') : r.roll === 1 ? t(' (Natural 1!)') : '',
      });
      box.appendChild(p);
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = t('Continue →');
      b.addEventListener('click', () => goTo(r.success ? chk.success : chk.failure));
      choices.appendChild(b);
    }
  }

  // ---------- Combat ----------
  function logText(entry) {
    if (typeof entry === 'string') {
      let match = entry.match(/^Rolled (\d+)([+-]\d+)=(\d+): (Critical! )?You hit for <strong>(\d+)<\/strong>\.$/);
      if (match) entry = {
        key: 'Rolled {roll}{modifier}={total}: {critical}You hit for <strong>{damage}</strong>.',
        values: { roll: match[1], modifier: match[2], total: match[3], critical: match[4] || '', damage: match[5] },
      };
      else if ((match = entry.match(/^Rolled (\d+)([+-]\d+)=(\d+): (Fumble! |Miss\. )The (.+) hits you for <strong>(\d+)<\/strong>\.$/))) {
        entry = {
          key: 'Rolled {roll}{modifier}={total}: {miss}{foe} hits you for <strong>{damage}</strong>.',
          values: { roll: match[1], modifier: match[2], total: match[3], miss: match[4], foe: match[5], damage: match[6] },
        };
      } else if ((match = entry.match(/^<strong>The (.+) is defeated!<\/strong>$/))) {
        entry = { key: '<strong>{foe} is defeated!</strong>', values: { foe: match[1] } };
      } else if ((match = entry.match(/^(.+)! You deal <strong>(\d+)<\/strong> damage\.$/))) {
        entry = { key: '{ability}! You deal <strong>{damage}</strong> damage.', values: { ability: match[1], damage: match[2] } };
      } else return t(entry);
    }
    const values = { ...entry.values };
    for (const key of ['foe', 'ability', 'critical', 'miss']) {
      if (values[key]) values[key] = t(values[key]);
    }
    return t(entry.key, values);
  }

  function renderCombat(sec, inter, choices) {
    const foe = sec.combat;
    const cb = state.combat;
    const c = CLASSES[state.cls];
    const am = mod(state.stats[c.attackStat]);
    const weapon = weaponFor(state);
    const box = document.createElement('div');
    box.className = 'combat-box';
    const pct = Math.max(0, (cb.enemyHp / foe.hp) * 100);
    box.innerHTML = `<h3>⚔️ ${t('Combat: {foe}', { foe: foe.name })}</h3>
      <div class="sheet-row"><span>${t('Enemy Endurance')}</span><span>${Math.max(0, cb.enemyHp)} / ${foe.hp}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <p class="choice-note">${t("Each round, roll d20 {modifier} ({stat}) against the enemy's Defense {dc}. Hit: deal {low}–{high} {modifier} damage (double on a natural 20). Your armor blocks {armor} damage from each hit.",
        { modifier: fmt(am), stat: t(c.attackStat), dc: foe.dc, low: weapon.damage[0], high: weapon.damage[1], armor: armorFor(state).defense })}</p>
      <ol class="combat-log">${cb.log.map((l) => `<li>${logText(l)}</li>`).join('')}</ol>`;
    inter.appendChild(box);
    const logEl = box.querySelector('.combat-log');
    logEl.scrollTop = logEl.scrollHeight;

    if (cb.over) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = t('Continue →');
      b.addEventListener('click', () => goTo(foe.win));
      choices.appendChild(b);
      return;
    }

    const actions = document.createElement('div');
    actions.className = 'combat-actions';
    const atk = document.createElement('button');
    atk.className = 'btn roll';
    atk.textContent = t('Attack — Roll d20 ({modifier} {stat})', { modifier: fmt(am), stat: t(c.attackStat) });
    atk.addEventListener('click', async () => {
      atk.disabled = true;
      const r = await rollD20((roll) => {
        const tot = roll + am;
        const hit = roll === 20 || (roll !== 1 && tot >= foe.dc);
        return `<span class="big">${roll} ${fmt(am)} = ${tot}</span>${t(roll === 20 ? '💥 Critical hit!' : hit ? '⚔️ Hit!' : '🛡️ Miss')} (${t('Defense')} ${foe.dc})<br>`;
      });
      if (r == null) { atk.disabled = false; return; }
      combatRound(r, am);
    });
    actions.appendChild(atk);
    choices.appendChild(actions);
  }

  function combatRound(roll, am) {
    const foe = STORY[state.section].combat;
    const cb = state.combat;
    const total = roll + am;
    const hit = roll === 20 || (roll !== 1 && total >= foe.dc);
    if (hit) {
      const weapon = weaponFor(state);
      let dmg = Math.max(1, randInt(weapon.damage[0], weapon.damage[1]) + am);
      if (roll === 20) dmg *= 2;
      cb.enemyHp -= dmg;
      cb.log.push({
        key: 'Rolled {roll}{modifier}={total}: {critical}You hit for <strong>{damage}</strong>.',
        values: { roll, modifier: fmt(am), total, critical: roll === 20 ? 'Critical! ' : '', damage: dmg },
      });
    } else {
      let dmg = randInt(foe.damage[0], foe.damage[1]) + (roll === 1 ? 2 : 0);
      dmg = Math.max(1, dmg - armorFor(state).defense);
      state.hp -= dmg;
      cb.log.push({
        key: 'Rolled {roll}{modifier}={total}: {miss}{foe} hits you for <strong>{damage}</strong>.',
        values: { roll, modifier: fmt(am), total, miss: roll === 1 ? 'Fumble! ' : 'Miss. ', foe: foe.name, damage: dmg },
      });
    }
    finishRound(foe);
  }

  function finishRound(foe) {
    const cb = state.combat;
    if (state.hp <= 0) { state.hp = 0; return goTo('death'); }
    if (cb.enemyHp <= 0) {
      cb.over = true;
      cb.log.push({ key: '<strong>{foe} is defeated!</strong>', values: { foe: foe.name } });
    }
    save();
    render();
  }

  function useAbility() {
    const c = CLASSES[state.cls];
    if (state.abilityUsed) return;
    state.abilityUsed = true;
    if (state.cls === 'warrior') {
      state.hp = Math.min(state.maxHp, state.hp + 12);
      toast('Second Wind: recovered 12 Endurance.');
      if (state.combat && !state.combat.over) state.combat.log.push('You catch your Second Wind (+12 Endurance).');
    } else if (state.cls === 'cleric') {
      state.hp = Math.min(state.maxHp, state.hp + 15);
      toast('Divine Mending: recovered 15 Endurance.');
      if (state.combat && !state.combat.over) state.combat.log.push('The Dawnmother mends your wounds (+15 Endurance).');
    } else {
      const foe = STORY[state.section].combat;
      const am = mod(state.stats[c.attackStat]);
      const weapon = weaponFor(state);
      const dmg = state.cls === 'mage' ? 14 : (randInt(weapon.damage[0], weapon.damage[1]) + am) * 2;
      state.combat.enemyHp -= dmg;
      state.combat.log.push({
        key: '{ability}! You deal <strong>{damage}</strong> damage.',
        values: { ability: c.ability.name, damage: dmg },
      });
      return finishRound(foe);
    }
    save();
    render();
  }

  function drinkPotion() {
    const i = state.items.indexOf('Healing Potion');
    if (i < 0) return;
    state.items.splice(i, 1);
    state.hp = Math.min(state.maxHp, state.hp + 10);
    if (state.combat && !state.combat.over) state.combat.log.push('You drink a Healing Potion (+10 Endurance).');
    save();
    render();
    toast('Recovered 10 Endurance.');
  }

  function renderEnding(sec, inter) {
    const div = document.createElement('div');
    div.innerHTML = `<div class="ending-banner ${sec.ending}">${t(sec.ending === 'victory' ? '🏆 The End' : '💀 You Have Perished')}</div>`;
    if (sec.nextStory) {
      const next = document.createElement('button');
      next.className = 'btn roll';
      next.textContent = t('Continue to the next story →');
      next.addEventListener('click', () => goTo(sec.nextStory));
      div.appendChild(next);
    }
    const b = document.createElement('button');
    b.className = 'btn roll';
    b.textContent = t('Begin a New Adventure');
    b.addEventListener('click', restart);
    div.appendChild(b);
    inter.appendChild(div);
  }

  function restart() {
    localStorage.removeItem(SAVE_KEY);
    state = null;
    renderSelect();
    window.scrollTo({ top: 0 });
  }

  async function rollD20(formatResult) {
    if (rolling) return null;
    rolling = true;
    $('language-select').disabled = true;
    $('btn-restart').disabled = true;
    try {
      return await Dice.rollD20(formatResult);
    } finally {
      rolling = false;
      $('language-select').disabled = false;
      $('btn-restart').disabled = false;
    }
  }

  // ---------- Wire up ----------
  $('language-select').addEventListener('change', () => {
    if (rolling) return;
    I18n.setLanguage($('language-select').value);
    renderLanguage();
    $('toast').classList.remove('show');
    if (state) render();
    else renderSelect();
  });
  $('adventure-set').addEventListener('change', () => {
    selectedSet = $('adventure-set').value;
    renderSet();
  });
  $('btn-ability').addEventListener('click', useAbility);
  $('btn-potion').addEventListener('click', drinkPotion);
  $('btn-restart').addEventListener('click', () => {
    if (confirm(t('Abandon this adventure and start over?'))) restart();
  });
  $('btn-free-roll').addEventListener('click', () => rollD20((r) => `<span class="big">${r}</span>${t(r === 20 ? 'A natural 20!' : r === 1 ? 'Ouch, a natural 1.' : 'Just for luck.')}<br>`));

  renderLanguage();
  const saved = load();
  if (saved && saved.cls && CLASSES[saved.cls] && STORY[saved.section]) {
    state = normalizeState(saved);
    selectedSet = state.adventureSet;
    if (STORY[state.section].ending === 'victory') {
      completeStory(STORY[state.section]);
      save();
    }
    render();
  }
  else renderSelect();

  // Exposed for debugging/tests.
  window.Game = { get state() { return state; }, goTo };
})();
