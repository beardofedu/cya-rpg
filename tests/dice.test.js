const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '..', 'dice.js'), 'utf8');
const html = readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const key = 'cya-rpg-dice-appearance-v1';
const palette = ['ruby', 'sapphire', 'emerald', 'amethyst', 'amber', 'obsidian'];

function makeDice(saved = null, blockedStorage = false) {
  const elements = new Map();
  const storage = new Map(saved === null ? [] : [[key, saved]]);
  const warnings = [];
  const fills = [];
  const frames = [];
  const timers = [];
  const ctx = {
    setTransform() {}, clearRect() {}, save() {}, restore() {}, beginPath() {},
    ellipse() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {},
    translate() {}, rotate() {}, scale() {}, fillText() {}, fillRect() {},
    fill() { fills.push(this.fillStyle); },
  };
  const element = (id) => {
    if (!elements.has(id)) {
      const classes = new Set(['hidden']);
      elements.set(id, {
        value: '',
        style: { setProperty(name, value) { this[name] = value; } },
        listeners: {},
        classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
        addEventListener(name, fn) { this.listeners[name] = fn; },
        removeEventListener(name) { delete this.listeners[name]; },
        getContext: () => ctx,
      });
    }
    return elements.get(id);
  };
  const document = { getElementById: element, addEventListener() {}, removeEventListener() {} };
  const context = vm.createContext({
    document,
    I18n: { t: (text) => text },
    window: {
      innerWidth: 1000, innerHeight: 800, devicePixelRatio: 1, addEventListener() {},
      crypto: { getRandomValues: (buffer) => { buffer[0] = 19; } },
    },
    localStorage: {
      getItem(name) {
        if (blockedStorage) throw new Error('Storage blocked');
        return storage.get(name) ?? null;
      },
      setItem(name, value) {
        if (blockedStorage) throw new Error('Storage blocked');
        storage.set(name, value);
      },
    },
    console: { warn: (...args) => warnings.push(args) },
    performance: { now: () => 0 },
    requestAnimationFrame: (fn) => frames.push(fn),
    setTimeout: (fn) => timers.push(fn),
  });
  vm.runInContext(source, context);
  return {
    element, storage, warnings, fills,
    change(id, value) {
      element(id).value = value;
      element(id).listeners.change();
    },
    async roll() {
      fills.length = 0;
      const result = context.window.Dice.rollD20();
      frames.shift()(1900);
      timers.shift()();
      assert.match(element('dice-result').innerHTML, /You rolled 20/);
      element('dice-overlay').listeners.click();
      assert.equal(await result, 20);
      assert.ok(element('dice-overlay').classList.contains('hidden'));
      return fills.filter((fill) => fill !== 'rgba(0,0,0,0.35)');
    },
  };
}

test('dice controls expose every supported color and finish', () => {
  for (const value of [...palette, 'solid', 'translucent']) {
    assert.ok(html.includes(`value="${value}"`), `Missing option ${value}`);
  }
});

test('dice default to ruby and solid, preserving the original shaded colors', async () => {
  const dice = makeDice();
  assert.equal(dice.element('dice-color').value, 'ruby');
  assert.equal(dice.element('dice-finish').value, 'solid');
  assert.equal(dice.element('dice-preview').style['--dice-rgb'], '170,36,42');
  assert.ok((await dice.roll()).every((fill) => /^rgba\(\d+,\d+,\d+,1\)$/.test(fill)));
});

test('all six colors render distinctly in both finishes without changing roll results', async () => {
  const dice = makeDice();
  const renderedColors = new Set();
  for (const color of palette) {
    dice.change('dice-color', color);
    dice.change('dice-finish', 'solid');
    const solid = await dice.roll();
    assert.ok(solid.length > 0);
    renderedColors.add(solid.join(';'));
    dice.change('dice-finish', 'translucent');
    const translucent = await dice.roll();
    assert.deepEqual(translucent, solid.map((fill) => fill.replace(',1)', ',0.62)')));
    assert.equal(dice.element('dice-preview').style['--dice-alpha'], '0.62');
    assert.deepEqual(JSON.parse(dice.storage.get(key)), { color, finish: 'translucent' });
  }
  assert.equal(renderedColors.size, palette.length);
});

test('appearance persists independently and restores the controls and preview', () => {
  const first = makeDice();
  first.change('dice-color', 'emerald');
  first.change('dice-finish', 'translucent');
  assert.deepEqual([...first.storage.keys()], [key]);
  const restored = makeDice(first.storage.get(key));
  assert.equal(restored.element('dice-color').value, 'emerald');
  assert.equal(restored.element('dice-finish').value, 'translucent');
  assert.equal(restored.element('dice-preview').style['--dice-rgb'], '45,133,75');
  assert.equal(restored.element('dice-preview').style['--dice-alpha'], '0.62');
});

test('invalid saved values cannot become palette lookups or unsupported finishes', async () => {
  for (const saved of ['null', '{}', '{"color":"__proto__","finish":"glass"}', '{"color":"missing"}']) {
    const dice = makeDice(saved);
    assert.equal(dice.element('dice-color').value, 'ruby');
    assert.equal(dice.element('dice-finish').value, 'solid');
    await dice.roll();
  }
  const malformed = makeDice('{');
  assert.equal(malformed.warnings.length, 1);
  await malformed.roll();
});

test('storage failures are reported without preventing customization or rolling', async () => {
  const dice = makeDice(null, true);
  assert.equal(dice.warnings.length, 1);
  dice.change('dice-color', 'sapphire');
  dice.change('dice-finish', 'translucent');
  assert.equal(dice.warnings.length, 3);
  assert.ok((await dice.roll()).every((fill) => fill.endsWith(',0.62)')));
});
