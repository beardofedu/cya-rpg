# cya-rpg — The Lantern of Kaldra

A browser-based choose-your-own-adventure fantasy RPG in the spirit of classic 1980s gamebooks like *Lone Wolf*. Play it at **https://beardofedu.github.io/cya-rpg/**.

## Features

- **Four classes** — Warrior, Rogue, Mage, and Cleric — each with STR / DEX / INT / WIS scores, Endurance, a weapon, starting gear, and a once-per-adventure ability.
- **Leveling and equipment** — earn a level after each completed story, improve your class's primary stat and Endurance, and equip found weapons and armor.
- **Stat checks** — roll a d20 + your stat modifier against a Difficulty Class. Natural 20 always succeeds; natural 1 always fails.
- **Animated 3D d20** — every roll tumbles a twenty-sided die across the window and lands on the rolled face.
- **Custom dice appearance** — choose from six colors and a solid or translucent finish on the Adventure Sheet, with an instant preview. Your preference is remembered separately from adventure saves and applies to every roll.
- **Combat** — round-by-round d20 attacks using your class's attack stat, plus potions and class abilities.
- **Story illustrations** — atmospheric artwork appears at pivotal scenes, with responsive layouts and accessible descriptions.
- **Three linked stories** — *The Lantern of Kaldra*, *The Ashen Tide*, and *The Crown of Hollow Night* — with class-specific paths, equipment rewards, multiple endings, and autosave (localStorage). Earlier discoveries and outcomes affect the final adventure.

## Running locally

It's a static site — no build step. Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Files

- `index.html` — page layout
- `style.css` — parchment gamebook styling
- `dice.js` — canvas-rendered, animated 3D icosahedron (d20)
- `story.js` — classes and story sections
- `game.js` — game engine (state, checks, combat, saving)

## Checking story changes

Run `node --test` for story-link, progression, save compatibility, branching, and dice appearance checks.
