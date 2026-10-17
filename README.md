# cya-rpg — The Lantern of Kaldra

A browser-based choose-your-own-adventure fantasy RPG in the spirit of classic 1980s gamebooks like *Lone Wolf*. Play it at **https://beardofedu.github.io/cya-rpg/**.

## Features

- **Four classes** — Warrior, Rogue, Mage, and Cleric — each with STR / DEX / INT / WIS scores, Endurance, a weapon, starting gear, and a once-per-adventure ability.
- **Stat checks** — roll a d20 + your stat modifier against a Difficulty Class. Natural 20 always succeeds; natural 1 always fails.
- **Animated 3D d20** — every roll tumbles a twenty-sided die across the window and lands on the rolled face.
- **Combat** — round-by-round d20 attacks using your class's attack stat, plus potions and class abilities.
- **Branching story** with class-specific paths, items that open new options, multiple endings, and autosave (localStorage).

## Running locally

It's a static site — no build step. Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Files

- `index.html` — page layout
- `style.css` — parchment gamebook styling
- `dice.js` — canvas-rendered, animated 3D icosahedron (d20)
- `story.js` — classes and story sections
- `game.js` — game engine (state, checks, combat, saving)
