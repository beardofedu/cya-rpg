const I18n = (() => {
  const spanish = {
    'The Lantern of Kaldra': 'La linterna de Kaldra',
    'A choose-your-own-adventure gamebook': 'Una aventura en la que tú eliges el camino',
    'Language': 'Idioma',
    'Choose your trilogy': 'Elige tu trilogía',
    'Choose who you will be, and turn the page.': 'Elige quién serás y pasa la página.',
    'Your name:': 'Tu nombre:',
    'Adventure Sheet': 'Hoja de aventura',
    'Drink Potion': 'Beber poción',
    'Roll a d20': 'Lanzar un d20',
    'Roll a d20 just for fun': 'Lanza un d20 por diversión',
    'New Adventure': 'Nueva aventura',
    'An original adventure inspired by classic 1980s fantasy gamebooks.': 'Una aventura original inspirada en los libros de fantasía interactiva de los años ochenta.',
    'Warrior': 'Guerrero', 'Rogue': 'Pícaro', 'Mage': 'Mago', 'Cleric': 'Clérigo',
    'A veteran of the border wars, clad in mail and trusting in steel.': 'Un veterano de las guerras fronterizas, protegido con cota de malla y armado de confianza en el acero.',
    'Quick of hand and quicker of wit, you go where locks say you should not.': 'De manos ágiles e ingenio aún más rápido, entras donde las cerraduras dicen que no debes.',
    'A scholar of the arcane whose words can kindle fire from empty air.': 'Un erudito de lo arcano cuyas palabras pueden encender fuego en el aire.',
    'A servant of the Dawnmother, armored in faith and a heavy mace.': 'Un servidor de la Madre del Alba, protegido por la fe y una pesada maza.',
    'Second Wind': 'Segundo aliento', 'Shadowstrike': 'Golpe sombrío',
    'Fireball': 'Bola de fuego', 'Divine Mending': 'Sanación divina',
    'Once per adventure, recover 12 Endurance.': 'Una vez por aventura, recupera 12 puntos de Resistencia.',
    'Once per adventure in combat, strike unseen for double damage — no roll needed.': 'Una vez por aventura, ataca por sorpresa en combate e inflige el doble de daño, sin tirada.',
    'Once per adventure in combat, deal 14 fire damage — no roll needed.': 'Una vez por aventura, inflige 14 puntos de daño de fuego en combate, sin tirada.',
    'Once per adventure, recover 15 Endurance.': 'Una vez por aventura, recupera 15 puntos de Resistencia.',
    'Strength': 'Fuerza', 'Dexterity': 'Destreza', 'Intellect': 'Intelecto', 'Wisdom': 'Sabiduría',
    'STR': 'FUE', 'DEX': 'DES', 'INT': 'INT', 'WIS': 'SAB',
    'Endurance': 'Resistencia', 'Attacks with': 'Ataca con', 'Level': 'Nivel', 'Gold': 'Oro',
    'Equipment': 'Equipo', 'Weapon': 'Arma', 'Armor': 'Armadura',
    'Weapon damage': 'Daño del arma', 'Armor defense': 'Defensa de la armadura',
    'Backpack': 'Mochila', 'Empty': 'Vacía', ' (used)': ' (usada)',
    'Longsword': 'Espada larga', 'Twin Daggers': 'Dagas gemelas', 'Oak Staff': 'Bastón de roble',
    'Mace of Dawn': 'Maza del Alba', 'Chain Mail': 'Cota de malla', 'Leather Armor': 'Armadura de cuero',
    'Mage Robes': 'Túnica de mago', 'Scale Mail': 'Cota de escamas', 'Lockpicks': 'Ganzúas',
    'Spellbook': 'Libro de hechizos', 'Holy Symbol': 'Símbolo sagrado', 'Healing Potion': 'Poción curativa',
    'Rope': 'Cuerda', 'Iron Key': 'Llave de hierro', 'Ward of Ash': 'Amuleto de fresno',
    "Huntsman's Bow": 'Arco de cazador', "Warden's Mail": 'Cota del guardián',
    'Dawnforged Blade': 'Hoja forjada al alba', 'Whispersteel Daggers': 'Dagas de acero susurrante',
    'Starfall Staff': 'Bastón de estrella caída', 'Sunfire Mace': 'Maza de fuego solar',
    'Tideglass Armor': 'Armadura de cristal marino',
    'Equipped {item}.': 'Equipaste {item}.',
    'Story complete! You reached level {level}: +2 maximum Endurance and +1 {stat}.': '¡Historia completada! Alcanzaste el nivel {level}: +2 a la Resistencia máxima y +1 a {stat}.',
    '{stat} Check — DC {dc}': 'Prueba de {stat} — CD {dc}',
    'Roll a d20 and add your modifier ({bonus}). Meet or beat <strong>{dc}</strong> to succeed. A natural 20 always succeeds; a natural 1 always fails.': 'Lanza un d20 y suma tu modificador ({bonus}). Iguala o supera <strong>{dc}</strong> para tener éxito. Un 20 natural siempre tiene éxito; un 1 natural siempre falla.',
    'Roll d20 ({bonus})': 'Lanzar d20 ({bonus})',
    '✅ Success!': '✅ ¡Éxito!', '❌ Failure': '❌ Fallo',
    'You rolled {roll} {modifier} = {total} — {result}{natural}': 'Sacaste {roll} {modifier} = {total} — {result}{natural}',
    'Success!': '¡Éxito!', 'Failure.': 'Fallo.', ' (Natural 20!)': ' (¡20 natural!)', ' (Natural 1!)': ' (¡1 natural!)',
    'Continue →': 'Continuar →',
    'Combat: {foe}': 'Combate: {foe}', 'Enemy Endurance': 'Resistencia del enemigo',
    "Each round, roll d20 {modifier} ({stat}) against the enemy's Defense {dc}. Hit: deal {low}–{high} {modifier} damage (double on a natural 20). Your armor blocks {armor} damage from each hit.": 'Cada asalto, lanza d20 {modifier} ({stat}) contra la Defensa {dc} del enemigo. Si aciertas: infliges {low}–{high} {modifier} de daño (el doble con un 20 natural). Tu armadura bloquea {armor} puntos de daño por golpe.',
    'Attack — Roll d20 ({modifier} {stat})': 'Atacar — Lanzar d20 ({modifier} {stat})',
    '💥 Critical hit!': '💥 ¡Golpe crítico!', '⚔️ Hit!': '⚔️ ¡Acierto!', '🛡️ Miss': '🛡️ Fallo',
    'Defense': 'Defensa', 'Critical! ': '¡Crítico! ', 'Fumble! ': '¡Pifia! ', 'Miss. ': 'Fallo. ',
    'Rolled {roll}{modifier}={total}: {critical}You hit for <strong>{damage}</strong>.': 'Tirada {roll}{modifier}={total}: {critical}Infliges <strong>{damage}</strong> de daño.',
    'Rolled {roll}{modifier}={total}: {miss}{foe} hits you for <strong>{damage}</strong>.': 'Tirada {roll}{modifier}={total}: {miss}{foe} te inflige <strong>{damage}</strong> de daño.',
    '<strong>{foe} is defeated!</strong>': '<strong>¡{foe} ha sido derrotado!</strong>',
    'Second Wind: recovered 12 Endurance.': 'Segundo aliento: recuperaste 12 puntos de Resistencia.',
    'Divine Mending: recovered 15 Endurance.': 'Sanación divina: recuperaste 15 puntos de Resistencia.',
    'You catch your Second Wind (+12 Endurance).': 'Recobras el aliento (+12 de Resistencia).',
    'The Dawnmother mends your wounds (+15 Endurance).': 'La Madre del Alba sana tus heridas (+15 de Resistencia).',
    '{ability}! You deal <strong>{damage}</strong> damage.': '¡{ability}! Infliges <strong>{damage}</strong> de daño.',
    'You drink a Healing Potion (+10 Endurance).': 'Bebes una poción curativa (+10 de Resistencia).',
    'Recovered 10 Endurance.': 'Recuperaste 10 puntos de Resistencia.',
    '🏆 The End': '🏆 Fin', '💀 You Have Perished': '💀 Has muerto',
    'Continue to the next story →': 'Continuar a la siguiente historia →',
    'Begin a New Adventure': 'Comenzar una nueva aventura',
    'Abandon this adventure and start over?': '¿Abandonar esta aventura y empezar de nuevo?',
    'A natural 20!': '¡Un 20 natural!', 'Ouch, a natural 1.': 'Ay, un 1 natural.',
    'Just for luck.': 'Solo por suerte.', 'Click anywhere to continue': 'Haz clic en cualquier lugar para continuar',
    'Gained 15 Gold and 2 Healing Potions.': 'Obtuviste 15 de Oro y 2 pociones curativas.',
    'Learned how to speak to the star.': 'Aprendiste a hablar con la estrella.',
    "Learned Iona's river song.": 'Aprendiste la canción del río de Iona.',
    'Gained a weapon and Tideglass Armor. Equip them from your Adventure Sheet.': 'Obtuviste un arma y una armadura de cristal marino. Equípalas en tu hoja de aventura.',
    'The sluice will help release the river.': 'La compuerta te ayudará a liberar el río.',
    "Found the telescope's release lever.": 'Encontraste la palanca de liberación del telescopio.',
    'Freed the sentinel (+1 to the final Wisdom check).': 'Liberaste al centinela (+1 a la prueba final de Sabiduría).',
  };
  for (const [id, section] of Object.entries(STORY)) {
    if (section.combat) spanish[section.combat.name] = STORY_ES[id].combat.name;
  }
  let language = localStorage.getItem('cya-rpg-language') === 'es' ? 'es' : 'en';
  function t(key, vars = {}) {
    const text = language === 'es' ? (spanish[key] ?? STORY_MESSAGES_ES[key] ?? key) : key;
    return text.replace(/\{(\w+)\}/g, (match, name) => vars[name] ?? match);
  }
  function section(id) {
    const original = STORY[id];
    if (language !== 'es') return original;
    const translated = STORY_ES[id];
    if (!translated) throw new Error(`Missing Spanish section: ${id}`);
    return {
      ...original, ...translated,
      check: original.check && { ...original.check, ...translated.check },
      combat: original.combat && { ...original.combat, ...translated.combat },
      illustration: original.illustration && { ...original.illustration, ...translated.illustration },
      choices: original.choices?.map((choice, index) => ({ ...choice, ...translated.choices[index] })),
    };
  }
  return {
    t, section,
    get language() { return language; },
    setLanguage(value) {
      if (!['en', 'es'].includes(value)) throw new Error(`Unsupported language: ${value}`);
      language = value;
      localStorage.setItem('cya-rpg-language', value);
    },
  };
})();
