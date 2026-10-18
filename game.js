(function () {
  const SAVE_KEY = 'cya-rpg-save-v1';
  const $ = (id) => document.getElementById(id);
  const mod = (score) => Math.floor((score - 10) / 2);
  const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const resolve = (v, s) => (typeof v === 'function' ? v(s) : v);

  let state = null;

  function newState(cls, name) {
    const c = CLASSES[cls];
    return {
      cls, name: name || 'Aldric',
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
    return `Story complete! You reached level ${state.level}: +2 maximum Endurance and +1 ${CLASSES[state.cls].attackStat}.`;
  }

  function toast(msg) {
    if (!msg) return;
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function show(screen) {
    $('screen-select').classList.toggle('hidden', screen !== 'select');
    $('screen-game').classList.toggle('hidden', screen !== 'game');
  }

  // ---------- Class selection ----------
  function renderSelect() {
    show('select');
    const list = $('class-list');
    list.innerHTML = '';
    for (const [key, c] of Object.entries(CLASSES)) {
      const card = document.createElement('button');
      card.className = 'class-card parchment';
      card.innerHTML = `
        <div class="icon">${c.icon}</div>
        <h3>${c.name}</h3>
        <p>${c.blurb}</p>
        ${statGrid(c.stats)}
        <p><strong>Endurance:</strong> ${c.hp} &nbsp; <strong>Attacks with:</strong> ${STAT_NAMES[c.attackStat]}</p>
        <p class="ability"><strong>${c.ability.name}:</strong> ${c.ability.desc}</p>`;
      card.addEventListener('click', () => {
        const name = ($('hero-name').value || '').replace(/[<>&"'`]/g, '').trim().slice(0, 24);
        state = newState(key, name);
        goTo(1);
      });
      list.appendChild(card);
    }
  }

  function statGrid(stats) {
    return `<div class="stat-grid">${Object.entries(stats).map(([k, v]) =>
      `<div class="stat" title="${STAT_NAMES[k]}"><span class="label">${k}</span><span class="value">${v}</span> <span class="mod">${fmt(mod(v))}</span></div>`
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
      .map((item) => `<option value="${escapeHtml(item)}"${state.equipment[slot] === item ? ' selected' : ''}>${escapeHtml(item)}</option>`)
      .join('');
    $('sheet-body').innerHTML = `
      <div class="who">${c.icon} ${escapeHtml(state.name)} — ${c.name}</div>
      ${statGrid(state.stats)}
      <div class="sheet-row"><span>Level</span><span>${state.level}</span></div>
      <div class="sheet-row"><span>Endurance</span><span>${Math.max(0, state.hp)} / ${state.maxHp}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="sheet-row"><span>Gold</span><span>${state.gold}</span></div>
      <strong>Equipment</strong>
      <label class="equipment-row">Weapon
        <select class="equip-select" data-slot="weapon">${gearOptions('weapon')}</select>
      </label>
      <label class="equipment-row">Armor
        <select class="equip-select" data-slot="armor">${gearOptions('armor')}</select>
      </label>
      <div class="sheet-row"><span>Weapon damage</span><span>${weaponFor(state).damage[0]}–${weaponFor(state).damage[1]}</span></div>
      <div class="sheet-row"><span>Armor defense</span><span>${armorFor(state).defense}</span></div>
      <strong>Backpack</strong>
      <ul class="items">${Object.entries(counts).map(([i, n]) => `<li>${escapeHtml(i)}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || '<li>Empty</li>'}</ul>`;
    $('sheet-body').querySelectorAll('.equip-select').forEach((select) => {
      select.addEventListener('change', () => {
        state.equipment[select.dataset.slot] = select.value;
        save();
        render();
        $('sheet-body').querySelector(`.equip-select[data-slot="${select.dataset.slot}"]`).focus();
        toast(`Equipped ${select.value}.`);
      });
    });

    const sec = STORY[state.section];
    const ended = !!(sec && sec.ending);
    const inCombat = !!state.combat && !state.combat.over;
    const busyCheck = !!state.check && !state.check.done;

    const ab = $('btn-ability');
    ab.textContent = `${c.ability.name}${state.abilityUsed ? ' (used)' : ''}`;
    ab.title = c.ability.desc;
    ab.disabled = ended || state.abilityUsed || (c.ability.combatOnly && !inCombat) || (!c.ability.combatOnly && state.hp >= state.maxHp) || busyCheck;

    const potions = counts['Healing Potion'] || 0;
    const pb = $('btn-potion');
    pb.textContent = `Drink Potion (${potions})`;
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
    if (sec.onEnter) msg = sec.onEnter(state) || '';
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
    const sec = STORY[state.section];
    $('section-number').textContent = sec.number ?? state.section;
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
      b.innerHTML = `${ch.text}${!ok && ch.reqText ? ` <span class="choice-note">(${ch.reqText(state)})</span>` : ''}`;
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
    const bonusTxt = `${fmt(m)} ${chk.stat}${extra ? ` ${fmt(extra)} ${chk.bonusLabel}` : ''}`;
    box.innerHTML = `<h3>🎲 ${STAT_NAMES[chk.stat]} Check — DC ${chk.dc}</h3>
      <p>${chk.text} Roll a d20 and add your modifier (${bonusTxt}). Meet or beat <strong>${chk.dc}</strong> to succeed.
      A natural 20 always succeeds; a natural 1 always fails.</p>`;
    inter.appendChild(box);

    if (!state.check.done) {
      const b = document.createElement('button');
      b.className = 'btn roll';
      b.textContent = `Roll d20 (${bonusTxt})`;
      b.addEventListener('click', async () => {
        b.disabled = true;
        const res = await Dice.rollD20((r) => {
          const tot = r + m + extra;
          const ok = r === 20 || (r !== 1 && tot >= chk.dc);
          return `<span class="big">${r} ${fmt(m + extra)} = ${tot}</span>${ok ? '✅ Success!' : '❌ Failure'} (DC ${chk.dc})<br>`;
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
      p.textContent = `You rolled ${r.roll} ${fmt(r.total - r.roll)} = ${r.total} — ${r.success ? 'Success!' : 'Failure.'}${r.roll === 20 ? ' (Natural 20!)' : r.roll === 1 ? ' (Natural 1!)' : ''}`;
      box.appendChild(p);
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'Continue →';
      b.addEventListener('click', () => goTo(r.success ? chk.success : chk.failure));
      choices.appendChild(b);
    }
  }

  // ---------- Combat ----------
  function renderCombat(sec, inter, choices) {
    const foe = sec.combat;
    const cb = state.combat;
    const c = CLASSES[state.cls];
    const am = mod(state.stats[c.attackStat]);
    const weapon = weaponFor(state);
    const box = document.createElement('div');
    box.className = 'combat-box';
    const pct = Math.max(0, (cb.enemyHp / foe.hp) * 100);
    box.innerHTML = `<h3>⚔️ Combat: ${foe.name}</h3>
      <div class="sheet-row"><span>Enemy Endurance</span><span>${Math.max(0, cb.enemyHp)} / ${foe.hp}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <p class="choice-note">Each round, roll d20 ${fmt(am)} (${c.attackStat}) against the enemy's Defense ${foe.dc}.
      Hit: deal ${weapon.damage[0]}–${weapon.damage[1]} ${fmt(am)} damage (double on a natural 20). Your armor blocks ${armorFor(state).defense} damage from each hit.</p>
      <ol class="combat-log">${cb.log.map((l) => `<li>${l}</li>`).join('')}</ol>`;
    inter.appendChild(box);
    const logEl = box.querySelector('.combat-log');
    logEl.scrollTop = logEl.scrollHeight;

    if (cb.over) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'Continue →';
      b.addEventListener('click', () => goTo(foe.win));
      choices.appendChild(b);
      return;
    }

    const actions = document.createElement('div');
    actions.className = 'combat-actions';
    const atk = document.createElement('button');
    atk.className = 'btn roll';
    atk.textContent = `Attack — Roll d20 (${fmt(am)} ${c.attackStat})`;
    atk.addEventListener('click', async () => {
      atk.disabled = true;
      const r = await Dice.rollD20((roll) => {
        const tot = roll + am;
        const hit = roll === 20 || (roll !== 1 && tot >= foe.dc);
        return `<span class="big">${roll} ${fmt(am)} = ${tot}</span>${roll === 20 ? '💥 Critical hit!' : hit ? '⚔️ Hit!' : '🛡️ Miss'} (Defense ${foe.dc})<br>`;
      });
      if (r == null) { atk.disabled = false; return; }
      combatRound(foe, r, am);
    });
    actions.appendChild(atk);
    choices.appendChild(actions);
  }

  function combatRound(foe, roll, am) {
    const cb = state.combat;
    const c = CLASSES[state.cls];
    const total = roll + am;
    const hit = roll === 20 || (roll !== 1 && total >= foe.dc);
    if (hit) {
      const weapon = weaponFor(state);
      let dmg = Math.max(1, randInt(weapon.damage[0], weapon.damage[1]) + am);
      if (roll === 20) dmg *= 2;
      cb.enemyHp -= dmg;
      cb.log.push(`Rolled ${roll}${fmt(am)}=${total}: ${roll === 20 ? 'Critical! ' : ''}You hit for <strong>${dmg}</strong>.`);
    } else {
      let dmg = randInt(foe.damage[0], foe.damage[1]) + (roll === 1 ? 2 : 0);
      dmg = Math.max(1, dmg - armorFor(state).defense);
      state.hp -= dmg;
      cb.log.push(`Rolled ${roll}${fmt(am)}=${total}: ${roll === 1 ? 'Fumble! ' : 'Miss. '}The ${foe.name} hits you for <strong>${dmg}</strong>.`);
    }
    finishRound(foe);
  }

  function finishRound(foe) {
    const cb = state.combat;
    if (state.hp <= 0) { state.hp = 0; return goTo('death'); }
    if (cb.enemyHp <= 0) { cb.over = true; cb.log.push(`<strong>The ${foe.name} is defeated!</strong>`); }
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
      state.combat.log.push(`${c.ability.name}! You deal <strong>${dmg}</strong> damage.`);
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
    div.innerHTML = `<div class="ending-banner ${sec.ending}">${sec.ending === 'victory' ? '🏆 The End' : '💀 You Have Perished'}</div>`;
    if (sec.nextStory) {
      const next = document.createElement('button');
      next.className = 'btn roll';
      next.textContent = 'Continue to the next story →';
      next.addEventListener('click', () => goTo(sec.nextStory));
      div.appendChild(next);
    }
    const b = document.createElement('button');
    b.className = 'btn roll';
    b.textContent = 'Begin a New Adventure';
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

  // ---------- Wire up ----------
  $('btn-ability').addEventListener('click', useAbility);
  $('btn-potion').addEventListener('click', drinkPotion);
  $('btn-restart').addEventListener('click', () => {
    if (confirm('Abandon this adventure and start over?')) restart();
  });
  $('btn-free-roll').addEventListener('click', () => Dice.rollD20((r) => `<span class="big">${r}</span>${r === 20 ? 'A natural 20!' : r === 1 ? 'Ouch, a natural 1.' : 'Just for luck.'}<br>`));

  const saved = load();
  if (saved && saved.cls && CLASSES[saved.cls] && STORY[saved.section]) {
    state = normalizeState(saved);
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
