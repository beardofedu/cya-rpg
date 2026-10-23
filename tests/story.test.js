const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const storySource = readFileSync(path.join(root, 'story.js'), 'utf8');
const gameSource = readFileSync(path.join(root, 'game.js'), 'utf8');
const contentSource = ['story-es.js', 'adventures.js', 'i18n.js']
  .map((file) => readFileSync(path.join(root, file), 'utf8')).join('\n');
const saveKey = 'cya-rpg-save-v1';

class Element {
  constructor() {
    this.children = [];
    this.listeners = {};
    this.selectors = new Map();
    this.textContent = '';
    this.value = '';
    this.disabled = false;
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle: (name, force) => force ? classes.add(name) : classes.delete(name),
    };
  }

  set innerHTML(value) {
    this.html = value;
    this.textContent = value.replace(/<[^>]*>/g, '');
    this.children = [];
    this.selectors.clear();
  }

  get innerHTML() { return this.html || ''; }
  appendChild(child) { this.children.push(child); }
  addEventListener(event, callback) { this.listeners[event] = callback; }
  setAttribute(name, value) { this[name] = value; }
  querySelectorAll() { return []; }
  querySelector(selector) {
    if (!this.selectors.has(selector)) this.selectors.set(selector, new Element());
    return this.selectors.get(selector);
  }

  async click() {
    assert.equal(this.disabled, false, `Disabled button: ${this.textContent}`);
    assert.ok(this.listeners.click, `Missing click handler: ${this.textContent}`);
    await this.listeners.click();
  }
}

function makeGame(saved, language = 'en') {
  const elements = new Map();
  const storage = new Map(saved ? [[saveKey, JSON.stringify(saved)]] : []);
  storage.set('cya-rpg-language', language);
  const context = vm.createContext({
    console,
    document: {
      documentElement: {},
      querySelectorAll: () => [],
      querySelector: (selector) => context.document.getElementById(selector),
      getElementById: (id) => {
        if (!elements.has(id)) elements.set(id, new Element());
        return elements.get(id);
      },
      createElement: () => new Element(),
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    window: { scrollTo() {} },
    setTimeout: () => 1,
    clearTimeout() {},
    confirm: () => true,
    Dice: { rollD20: async (formatResult) => {
      runtime.diceResult = formatResult(runtime.roll);
      return runtime.pendingRoll ?? runtime.roll;
    } },
  });
  vm.runInContext(`${storySource}\n${contentSource}\nthis.data = { STORY, STORY_ES, CLASSES, EQUIPMENT, ADVENTURE_SETS, I18n };`, context);
  const runtime = {
    ...context.data,
    roll: 20,
    element: (id) => context.document.getElementById(id),
    saved: () => JSON.parse(storage.get(saveKey)),
    language: () => storage.get('cya-rpg-language'),
  };
  vm.runInContext(gameSource, context);
  runtime.game = context.window.Game;
  runtime.state = () => runtime.game.state;
  runtime.setLanguage = (value) => {
    runtime.element('language-select').value = value;
    runtime.element('language-select').listeners.change();
  };
  runtime.chooseSet = (value) => {
    runtime.element('adventure-set').value = value;
    runtime.element('adventure-set').listeners.change();
  };
  runtime.click = async (label) => {
    const descendants = (el) => [el, ...el.children.flatMap(descendants)];
    const buttons = ['section-choices', 'section-interactive']
      .flatMap((id) => descendants(runtime.element(id)));
    const button = buttons.find((el) => el.textContent.startsWith(label));
    assert.ok(button, `Missing button "${label}" in ${runtime.state().section}`);
    await button.click();
  };
  return runtime;
}

async function start(runtime, cls) {
  await runtime.element('class-list').children[Object.keys(runtime.CLASSES).indexOf(cls)].click();
}

async function resolveCheck(runtime, roll) {
  runtime.roll = roll;
  await runtime.click(runtime.I18n.language === 'es' ? 'Lanzar d20' : 'Roll d20');
  await runtime.click(runtime.I18n.language === 'es' ? 'Continuar' : 'Continue');
}

async function winCombat(runtime) {
  runtime.roll = 20;
  for (let round = 0; !runtime.state().combat.over; round++) {
    assert.ok(round < 20, 'Combat must finish');
    await runtime.click(runtime.I18n.language === 'es' ? 'Atacar' : 'Attack');
  }
  await runtime.click(runtime.I18n.language === 'es' ? 'Continuar' : 'Continue');
}

async function choose(runtime, target) {
  const section = runtime.I18n.section(runtime.state().section);
  const choice = section.choices.find((entry) =>
    (typeof entry.to === 'function' ? entry.to(runtime.state()) : entry.to) === target
    && (!entry.show || entry.show(runtime.state())) && (!entry.req || entry.req(runtime.state())));
  assert.ok(choice, `Missing choice to ${target}`);
  await runtime.click(choice.text);
}

test('all story links and illustration assets exist across class and flag variants', () => {
  const { STORY, CLASSES } = makeGame();
  const targets = new Map(Object.keys(STORY).map((id) => [id, new Set()]));
  for (const cls of Object.keys(CLASSES)) {
    for (const enabled of [false, true]) {
      for (const outcome of ['dawn', 'dim', undefined]) {
        const state = {
          cls, name: 'Reader', hp: 20, maxHp: 30, gold: 50,
          items: enabled ? ['Rope', 'Ward of Ash', 'Iron Key'] : [],
          flags: Object.fromEntries(['bell', 'trueName', 'kingBell', 'kingName', 'crownSeal',
            'crownArchive', 'crownBellTried', 'crownRest', 'tideCache', 'tideBlessing', 'watchtower']
            .map((key) => [key, enabled])),
          storyOutcomes: { lantern: outcome, 'ashen-tide': enabled ? 'cleansed' : 'scarred' },
          completedStories: ['lantern', 'ashen-tide'],
        };
        for (const [id, section] of Object.entries(STORY)) {
          const text = typeof section.text === 'function' ? section.text(state) : section.text;
          assert.equal(typeof text, 'string', `${id} has story text`);
          assert.ok(!text.includes('undefined'), `${id} has no missing interpolations`);
          const links = [
            ...(section.choices || []).map((choice) => typeof choice.to === 'function' ? choice.to(state) : choice.to),
            section.check?.success, section.check?.failure, section.combat?.win, section.nextStory,
          ].filter((target) => target !== undefined);
          for (const target of links) {
            assert.ok(STORY[target], `${id} links to existing section ${target}`);
            targets.get(id).add(String(target));
          }
          if (section.illustration) {
            assert.ok(existsSync(path.join(root, section.illustration.src)));
            assert.ok(section.illustration.alt);
            assert.ok(section.illustration.caption);
          }
        }
      }
    }
  }
  const reached = new Set();
  const visit = (id) => {
    if (reached.has(id)) return;
    reached.add(id);
    for (const target of targets.get(id)) visit(target);
  };
  visit('1');
  for (const id of Object.keys(STORY).filter((key) => key.startsWith('s3-'))) {
    assert.ok(reached.has(id), `${id} is connected to the series`);
  }
  assert.equal(STORY['s2-dawn'].nextStory, 's3-1');
  assert.equal(STORY['s2-dim'].nextStory, 's3-1');
  assert.equal(STORY['s3-dawn'].nextStory, undefined);
  assert.equal(STORY['s3-watch'].nextStory, undefined);
});

for (const cls of ['warrior', 'rogue', 'mage', 'cleric']) {
  for (const success of [true, false]) {
    test(`${cls} can complete the third story through ${success ? 'successful' : 'failed'} checks`, async () => {
      const runtime = makeGame();
      await start(runtime, cls);
      runtime.game.goTo(success ? 25 : 26);
      runtime.game.goTo(success ? 's2-dawn' : 's2-dim');
      runtime.state().hp = 1;
      runtime.state().abilityUsed = true;
      const potions = runtime.state().items.filter((item) => item === 'Healing Potion').length;
      await runtime.click('Continue to the next story');
      assert.equal(runtime.state().section, 's3-1');
      assert.equal(runtime.state().hp, runtime.state().maxHp);
      assert.equal(runtime.state().abilityUsed, false);
      assert.equal(runtime.state().items.filter((item) => item === 'Healing Potion').length, potions + 2);
      assert.equal(runtime.state().level, 3);

      if (success) {
        await runtime.click('Follow the funeral road');
        await resolveCheck(runtime, 20);
      } else {
        await runtime.click('Climb into the broken aqueduct');
        await runtime.click(cls === 'rogue' ? '[Rogue]' : 'Balance');
        if (cls !== 'rogue') {
          await resolveCheck(runtime, 1);
          await runtime.click('Approach the palace');
        }
      }
      assert.equal(runtime.state().section, 's3-gate');
      await runtime.click(`[${runtime.CLASSES[cls].name}]`);
      await resolveCheck(runtime, success ? 20 : 1);
      if (success) await runtime.click('Enter the palace');
      else await winCombat(runtime);
      assert.equal(runtime.state().section, 's3-hall');

      await runtime.click('Search the royal archive');
      await resolveCheck(runtime, success ? 20 : 1);
      await runtime.click('Return to the hall');
      await runtime.click('Examine the mourning bell');
      await runtime.click('Pull the clapper');
      await resolveCheck(runtime, success ? 20 : 1);
      await runtime.click('Return to the hall');
      await runtime.click('Rest in the alcove');
      await runtime.click('Return to the hall');
      assert.equal(runtime.STORY['s3-hall'].choices.filter((choice) => !choice.show || choice.show(runtime.state())).length, 1);

      await runtime.click('Open the throne-room doors');
      await runtime.click(success ? 'Call him Ardan' : 'Refuse him');
      if (success) await runtime.click('Face the crown');
      assert.equal(runtime.state().section, success ? 's3-king-weakened' : 's3-king-empowered');
      await winCombat(runtime);
      assert.equal(runtime.state().section, 's3-crown');
      await resolveCheck(runtime, success ? 20 : 1);
      assert.equal(runtime.state().section, success ? 's3-dawn' : 's3-watch');
      assert.equal(runtime.state().level, 4);
      assert.equal(runtime.state().storyOutcomes['hollow-crown'], success ? 'freed' : 'bound');
      assert.equal(runtime.saved().section, runtime.state().section);
      const reloaded = makeGame(runtime.saved());
      assert.equal(reloaded.state().level, 4, 'Reloading must not award a second level');
      assert.equal(reloaded.state().storyOutcomes['hollow-crown'], success ? 'freed' : 'bound');
    });
  }
}

test('legacy saves at either second-story ending gain continuation without duplicate rewards', async () => {
  for (const ending of ['s2-dawn', 's2-dim']) {
    const initial = makeGame();
    await start(initial, 'mage');
    initial.game.goTo(25);
    initial.game.goTo(ending);
    const saved = initial.saved();
    delete saved.storyOutcomes;
    const runtime = makeGame(saved);
    assert.equal(runtime.state().level, saved.level);
    assert.equal(runtime.state().storyOutcomes['ashen-tide'], ending === 's2-dawn' ? 'cleansed' : 'scarred');
    assert.equal(runtime.saved().storyOutcomes['ashen-tide'], runtime.state().storyOutcomes['ashen-tide']);
    await runtime.click('Continue to the next story');
    assert.equal(runtime.state().section, 's3-1');
    assert.ok(!runtime.element('section-text').innerHTML.includes('undefined'));
    assert.equal(runtime.state().storyOutcomes.lantern, undefined, 'Unknown historical outcomes are not invented');
  }
});

test('old discoveries change third-story bonuses and unlock the bell shortcut', async () => {
  const runtime = makeGame();
  await start(runtime, 'rogue');
  const state = runtime.state();
  assert.equal(runtime.STORY['s3-road'].check.bonus(state), 0);
  assert.equal(runtime.STORY['s3-archive'].check.bonus(state), 0);
  state.flags.trueName = true;
  state.flags.bell = true;
  assert.equal(runtime.STORY['s3-road'].check.bonus(state), 2);
  assert.equal(runtime.STORY['s3-archive'].check.bonus(state), 2);
  runtime.game.goTo('s3-bell');
  await runtime.click('Use the lesson of Kaldra');
  assert.equal(state.flags.kingBell, true);
  runtime.game.goTo('s3-throne');
  await runtime.click('Refuse him');
  assert.equal(state.section, 's3-king-weakened');
});

test('all four sources of final-check aid stack exactly once', async () => {
  const runtime = makeGame();
  await start(runtime, 'warrior');
  const state = runtime.state();
  for (let mask = 0; mask < 16; mask++) {
    state.flags.crownSeal = !!(mask & 1);
    state.items = mask & 2 ? ['Ward of Ash'] : [];
    state.storyOutcomes = {
      lantern: mask & 4 ? 'dawn' : 'dim',
      'ashen-tide': mask & 8 ? 'cleansed' : 'scarred',
    };
    assert.equal(runtime.STORY['s3-crown'].check.bonus(state),
      [1, 2, 4, 8].filter((bit) => mask & bit).length);
  }
});

test('mid-story reload preserves choices and supplies without re-running entry effects', async () => {
  const runtime = makeGame();
  await start(runtime, 'cleric');
  runtime.game.goTo('s2-dawn');
  await runtime.click('Continue to the next story');
  const saved = runtime.saved();
  saved.hp = 5;
  saved.abilityUsed = true;
  const reloaded = makeGame(saved);
  assert.equal(reloaded.state().hp, 5);
  assert.equal(reloaded.state().abilityUsed, true);
  assert.deepEqual(Array.from(reloaded.state().items), saved.items);
  assert.equal(reloaded.state().flags.crownSupplies, true);
  assert.equal(reloaded.state().storyOutcomes['ashen-tide'], 'cleansed');
});

test('unweakened King and funeral-road failure remain playable', async () => {
  const runtime = makeGame();
  await start(runtime, 'warrior');
  runtime.game.goTo('s3-road');
  await resolveCheck(runtime, 1);
  assert.equal(runtime.state().section, 's3-procession-fight');
  await winCombat(runtime);
  assert.equal(runtime.state().section, 's3-gate');
  runtime.game.goTo('s3-throne');
  await runtime.click('Refuse him');
  assert.equal(runtime.state().section, 's3-king');
  await winCombat(runtime);
  assert.equal(runtime.state().section, 's3-crown');
});

test('illustration is displayed at the beacon and hidden on unillustrated scenes', async () => {
  const runtime = makeGame();
  await start(runtime, 'mage');
  runtime.game.goTo('s2-watch');
  const figure = runtime.element('section-illustration');
  assert.equal(figure.classList.contains('hidden'), false);
  assert.equal(figure.querySelector('img').src, 'assets/dunmere-beacon.jpg');
  assert.ok(figure.querySelector('img').alt);
  runtime.game.goTo('s3-1');
  assert.equal(figure.classList.contains('hidden'), true);
});

test('each trilogy starts independently and the set selection survives a language change', async () => {
  for (const [set, section] of [['kaldra', 1], ['starfall', 'orchard-1']]) {
    const runtime = makeGame();
    runtime.chooseSet(set);
    runtime.element('hero-name').value = 'Sol';
    runtime.setLanguage('es');
    assert.equal(runtime.element('adventure-set').value, set);
    assert.match(runtime.element('set-stories').innerHTML, /<li>.+<\/li>/);
    await start(runtime, 'mage');
    assert.equal(runtime.state().section, section);
    assert.equal(runtime.state().adventureSet, set);
    assert.equal(runtime.state().name, 'Sol');
    assert.equal(runtime.state().level, 1);
    assert.equal(runtime.state().completedStories.length, 0);
    assert.equal(runtime.state().gold, 15);
    assert.ok(runtime.state().items.includes('Oak Staff'));
    assert.match(runtime.element('sheet-body').innerHTML, /Bastón de roble/);
  }
});

test('every section has complete Spanish presentation without overriding mechanics', () => {
  const runtime = makeGame(undefined, 'es');
  const flags = ['bell', 'trueName', 'kingBell', 'kingName', 'crownSeal', 'tideBlessing',
    'starSeed', 'riverSong', 'glassSluice', 'starMap', 'starRelease'];
  for (const [id, original] of Object.entries(runtime.STORY)) {
    const patch = runtime.STORY_ES[id];
    assert.ok(patch, `${id} has Spanish`);
    assert.notEqual(patch.title, original.title, `${id} title is translated`);
    assert.deepEqual(Object.keys(patch).filter((key) =>
      !['title', 'text', 'choices', 'check', 'combat', 'illustration'].includes(key)), []);
    assert.equal(patch.choices?.length, original.choices?.length, `${id} choice count matches`);
    for (const [index, choice] of (original.choices || []).entries()) {
      assert.ok(patch.choices[index].text);
      assert.notEqual(patch.choices[index].text, choice.text);
      if (choice.reqText) assert.ok(patch.choices[index].reqText);
    }
    if (original.check) {
      assert.ok(patch.check.text);
      assert.notEqual(patch.check.text, original.check.text);
      if (original.check.bonusLabel) assert.ok(patch.check.bonusLabel);
    }
    if (original.combat) assert.ok(patch.combat.name);
    if (original.illustration) {
      assert.ok(patch.illustration.alt);
      assert.ok(patch.illustration.caption);
    }
    for (const cls of Object.keys(runtime.CLASSES)) {
      for (const enabled of [false, true]) {
        for (const outcome of ['dawn', 'dim', undefined]) {
          const state = {
            cls, name: 'Sol', hp: 20, maxHp: 30, gold: 50,
            adventureSet: id.startsWith('orchard') ? 'starfall' : 'kaldra',
            flags: Object.fromEntries(flags.map((key) => [key, enabled])),
            items: enabled ? ['Ward of Ash', 'Rope', 'Iron Key'] : [],
            completedStories: enabled ? ['ashen-tide'] : [],
            storyOutcomes: {
              lantern: outcome, 'ashen-tide': enabled ? 'cleansed' : 'scarred',
              'clockwork-orchard': enabled ? 'bloom' : 'broken',
              'glass-river': enabled ? 'flowing' : 'fractured',
            },
          };
          const localized = runtime.I18n.section(id);
          const text = typeof localized.text === 'function' ? localized.text(state) : localized.text;
          assert.equal(typeof text, 'string');
          assert.ok(!text.includes('undefined'), `${id} Spanish has no missing values`);
          assert.notEqual(text, typeof original.text === 'function' ? original.text(state) : original.text);
          for (const [index, choice] of (original.choices || []).entries()) {
            assert.equal(localized.choices[index].to, choice.to);
            assert.equal(localized.choices[index].effect, choice.effect);
            assert.equal(localized.choices[index].req, choice.req);
            if (choice.reqText) {
              const hint = localized.choices[index].reqText;
              assert.ok(typeof hint === 'function' ? hint(state) : hint);
            }
          }
          if (original.check) {
            assert.equal(localized.check.dc, original.check.dc);
            assert.equal(localized.check.bonus, original.check.bonus);
          }
          for (const hook of [original.onEnter, ...(original.choices || []).map((choice) => choice.effect)]) {
            if (!hook) continue;
            const message = hook(structuredClone(state));
            if (message) assert.notEqual(runtime.I18n.t(message), message, `${id}: translated notification ${message}`);
          }
        }
      }
    }
  }
});

for (const language of ['en', 'es']) {
  for (const cls of ['warrior', 'rogue', 'mage', 'cleric']) {
    for (const success of [true, false]) {
      test(`${language}: ${cls} completes the new trilogy with ${success ? 'successful' : 'failed'} checks`, async () => {
        const runtime = makeGame(undefined, language);
        runtime.chooseSet('starfall');
        await start(runtime, cls);
        await choose(runtime, 'orchard-gate');
        await choose(runtime, `orchard-${{ warrior: 'strength', rogue: 'dexterity', mage: 'intellect', cleric: 'wisdom' }[cls]}`);
        await resolveCheck(runtime, success ? 20 : 1);
        if (!success) await winCombat(runtime);
        await choose(runtime, 'orchard-heart');
        await resolveCheck(runtime, success ? 20 : 1);
        assert.equal(runtime.state().section, success ? 'orchard-bloom' : 'orchard-break');
        assert.equal(runtime.state().level, 2);
        runtime.state().hp = 1;
        runtime.state().abilityUsed = true;
        await runtime.click(runtime.I18n.t('Continue to the next story →'));
        assert.equal(runtime.state().section, 'glass-1');
        assert.equal(runtime.state().hp, runtime.state().maxHp);
        assert.equal(runtime.state().abilityUsed, false);
        if (success) {
          await choose(runtime, 'glass-reeds');
          await choose(runtime, 'glass-store');
        } else {
          await choose(runtime, 'glass-crossing');
          await resolveCheck(runtime, 1);
          await winCombat(runtime);
        }
        assert.equal(runtime.state().items.filter((item) => item === 'Tideglass Armor').length, 1);
        await choose(runtime, 'glass-lock');
        await choose(runtime, `glass-${{ warrior: 'force', rogue: 'catch', mage: 'spell', cleric: 'prayer' }[cls]}`);
        await resolveCheck(runtime, success ? 20 : 1);
        await choose(runtime, 'glass-heart');
        await resolveCheck(runtime, success ? 20 : 1);
        assert.equal(runtime.state().section, success ? 'glass-flow' : 'glass-fracture');
        assert.equal(runtime.state().level, 3);
        await runtime.click(runtime.I18n.t('Continue to the next story →'));
        if (success) {
          await choose(runtime, 'star-workshop');
          await resolveCheck(runtime, 20);
          await choose(runtime, 'star-dome');
        } else {
          await choose(runtime, 'star-stair');
          await resolveCheck(runtime, 1);
          await choose(runtime, 'star-dome');
        }
        await choose(runtime, 'star-rest');
        await choose(runtime, 'star-dome');
        assert.ok(!runtime.I18n.section('star-dome').choices[0].show(runtime.state()), 'Rest cannot be farmed');
        await choose(runtime, success ? 'star-release' : 'star-sentinel');
        if (success) await choose(runtime, 'star-heart');
        else await winCombat(runtime);
        assert.equal(runtime.STORY['star-heart'].check.bonus(runtime.state()), success ? 3 : 0);
        await resolveCheck(runtime, success ? 20 : 1);
        assert.equal(runtime.state().section, success ? 'star-dawn' : 'star-watch');
        assert.equal(runtime.state().level, 4);
        assert.deepEqual(Array.from(runtime.state().completedStories), ['clockwork-orchard', 'glass-river', 'last-star']);
        assert.equal(runtime.state().storyOutcomes['last-star'], success ? 'returned' : 'sheltered');
        const reloaded = makeGame(runtime.saved(), runtime.language());
        assert.equal(reloaded.state().level, 4);
        assert.equal(reloaded.state().adventureSet, 'starfall');
        assert.equal(reloaded.STORY[reloaded.state().section].nextStory, undefined);
      });
    }
  }
}

test('all new sections are reachable from the new start and never link into the original trilogy', () => {
  const { STORY } = makeGame();
  const reached = new Set();
  function visit(id) {
    if (reached.has(id)) return;
    reached.add(id);
    const section = STORY[id];
    assert.ok(section, `Section ${id} exists`);
    assert.match(id, /^(orchard|glass|star)-/);
    const links = [...(section.choices || []).map((choice) => choice.to), section.check?.success,
      section.check?.failure, section.combat?.win, section.nextStory].filter((link) => link !== undefined);
    links.forEach(visit);
  }
  visit('orchard-1');
  for (const id of Object.keys(STORY).filter((id) => /^(orchard|glass|star)-/.test(id))) {
    assert.ok(reached.has(id), `${id} reachable from the new trilogy`);
  }
});

test('language switches preserve pending/resolved checks, combat, equipment, and rewards', async () => {
  const runtime = makeGame();
  await start(runtime, 'rogue');
  runtime.game.goTo(3);
  const before = JSON.stringify(runtime.state());
  runtime.setLanguage('es');
  assert.equal(JSON.stringify(runtime.state()), before);
  assert.match(runtime.element('section-interactive').children[0].innerHTML, /Prueba de Sabiduría/);
  runtime.roll = 20;
  await runtime.click('Lanzar d20');
  const checked = JSON.stringify(runtime.state());
  runtime.setLanguage('en');
  assert.equal(JSON.stringify(runtime.state()), checked);
  await runtime.click('Continue');
  assert.equal(runtime.state().section, 5);
  const gained = JSON.stringify(runtime.state());
  runtime.setLanguage('es');
  assert.equal(JSON.stringify(runtime.state()), gained, 'Entry effects are not repeated');
  runtime.game.goTo(4);
  runtime.roll = 1;
  await runtime.click('Atacar');
  const combat = JSON.stringify(runtime.state());
  runtime.setLanguage('en');
  assert.equal(JSON.stringify(runtime.state()), combat);
  assert.match(runtime.element('section-interactive').children[0].innerHTML, /hits you for/);
  runtime.setLanguage('es');
  assert.match(runtime.element('section-interactive').children[0].innerHTML, /te inflige/);
  const reloaded = makeGame(runtime.saved(), runtime.language());
  assert.equal(reloaded.language(), 'es');
  assert.equal(JSON.stringify(reloaded.state()), combat);
  assert.match(reloaded.element('sheet-body').innerHTML, /Dagas gemelas/);
  assert.ok(reloaded.state().items.includes('Twin Daggers'), 'Item IDs stay canonical');
  assert.equal(reloaded.state().adventureSet, 'kaldra');
});

test('legacy English combat logs can be rendered in Spanish without changing their save format', async () => {
  const initial = makeGame();
  await start(initial, 'mage');
  initial.game.goTo(4);
  const saved = initial.saved();
  delete saved.adventureSet;
  saved.combat.log = [
    'Rolled 1+3=4: Fumble! The Hollow-Eyed Wolves hits you for <strong>4</strong>.',
    'Rolled 20+3=23: Critical! You hit for <strong>12</strong>.',
    'Fireball! You deal <strong>14</strong> damage.',
    '<strong>The Hollow-Eyed Wolves is defeated!</strong>',
    'You drink a Healing Potion (+10 Endurance).',
  ];
  const runtime = makeGame(saved, 'es');
  const html = runtime.element('section-interactive').children[0].innerHTML;
  assert.ok(!html.includes('Rolled') && !html.includes('hits you') && !html.includes('is defeated'));
  assert.match(html, /Bola de fuego/);
  assert.match(html, /poción curativa/);
  assert.deepEqual(Array.from(runtime.state().combat.log), saved.combat.log);
  assert.equal(runtime.state().adventureSet, 'kaldra');
});

test('new trilogy death uses its own setting in both languages', async () => {
  const runtime = makeGame();
  runtime.chooseSet('starfall');
  await start(runtime, 'warrior');
  runtime.state().hp = 1;
  runtime.game.goTo('orchard-scrape');
  assert.equal(runtime.state().section, 'death');
  assert.match(runtime.element('section-text').innerHTML, /Bellweather/);
  assert.ok(!runtime.element('section-text').innerHTML.includes('Thornwick'));
  runtime.setLanguage('es');
  assert.match(runtime.element('section-text').innerHTML, /molinero/);
});

test('changing language and restarting are disabled during an unresolved dice animation', async () => {
  const runtime = makeGame();
  await start(runtime, 'warrior');
  runtime.game.goTo(3);
  let release;
  runtime.pendingRoll = new Promise((resolve) => { release = resolve; });
  const rolling = runtime.click('Roll d20');
  assert.equal(runtime.element('language-select').disabled, true);
  assert.equal(runtime.element('btn-restart').disabled, true);
  runtime.setLanguage('es');
  assert.equal(runtime.language(), 'en');
  assert.equal(runtime.state().check.done, false);
  release(20);
  await rolling;
  assert.equal(runtime.element('language-select').disabled, false);
  assert.equal(runtime.element('btn-restart').disabled, false);
  assert.equal(runtime.state().check.roll, 20);
  runtime.setLanguage('es');
  assert.equal(runtime.state().check.roll, 20);
});

test('the original trilogy plays through entirely in Spanish with canonical progression', async () => {
  const runtime = makeGame(undefined, 'es');
  await start(runtime, 'cleric');
  await choose(runtime, 3);
  await resolveCheck(runtime, 20);
  await choose(runtime, 6);
  await choose(runtime, 10);
  await choose(runtime, 'bridge-check');
  await resolveCheck(runtime, 20);
  await choose(runtime, 13);
  await winCombat(runtime);
  await choose(runtime, 14);
  await choose(runtime, 17);
  await choose(runtime, 18);
  await choose(runtime, 21);
  await resolveCheck(runtime, 20);
  await choose(runtime, 20);
  await choose(runtime, 23);
  await winCombat(runtime);
  await resolveCheck(runtime, 20);
  assert.equal(runtime.state().section, 25);
  await runtime.click(runtime.I18n.t('Continue to the next story →'));
  await choose(runtime, 's2-shrine');
  await resolveCheck(runtime, 20);
  await choose(runtime, 's2-cross');
  await resolveCheck(runtime, 20);
  await choose(runtime, 's2-cache');
  await choose(runtime, 's2-keeper');
  await winCombat(runtime);
  await resolveCheck(runtime, 20);
  assert.equal(runtime.state().section, 's2-dawn');
  await runtime.click(runtime.I18n.t('Continue to the next story →'));
  await choose(runtime, 's3-road');
  await resolveCheck(runtime, 20);
  await choose(runtime, 's3-prayer');
  await resolveCheck(runtime, 20);
  await choose(runtime, 's3-hall');
  await choose(runtime, 's3-throne');
  await choose(runtime, 's3-king');
  await winCombat(runtime);
  await resolveCheck(runtime, 20);
  assert.equal(runtime.state().section, 's3-dawn');
  assert.equal(runtime.state().level, 4);
  assert.deepEqual(Array.from(runtime.state().completedStories), ['lantern', 'ashen-tide', 'hollow-crown']);
  assert.match(runtime.element('section-interactive').children[0].innerHTML, /Fin/);
});
