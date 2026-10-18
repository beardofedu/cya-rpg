const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const storySource = readFileSync(path.join(root, 'story.js'), 'utf8');
const gameSource = readFileSync(path.join(root, 'game.js'), 'utf8');
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

function makeGame(saved) {
  const elements = new Map();
  const storage = new Map(saved ? [[saveKey, JSON.stringify(saved)]] : []);
  const context = vm.createContext({
    console,
    document: {
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
    Dice: { rollD20: async () => runtime.roll },
  });
  vm.runInContext(`${storySource}\nthis.data = { STORY, CLASSES };`, context);
  const runtime = {
    ...context.data,
    roll: 20,
    element: (id) => context.document.getElementById(id),
    saved: () => JSON.parse(storage.get(saveKey)),
  };
  vm.runInContext(gameSource, context);
  runtime.game = context.window.Game;
  runtime.state = () => runtime.game.state;
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
  await runtime.click('Roll d20');
  await runtime.click('Continue');
}

async function winCombat(runtime) {
  runtime.roll = 20;
  for (let round = 0; !runtime.state().combat.over; round++) {
    assert.ok(round < 20, 'Combat must finish');
    await runtime.click('Attack');
  }
  await runtime.click('Continue');
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
