const ADVENTURE_SETS = {
  kaldra: {
    title: 'The Lantern of Kaldra', start: 1,
    stories: ['The Lantern of Kaldra', 'The Ashen Tide', 'The Crown of Hollow Night'],
    intro: 'Thornwick\'s stolen Lantern is all that stands between the villages and the Hollow King. Carry its light from a ruined monastery to a drowned coast and a buried city.',
  },
  starfall: {
    title: 'The Starfall Covenant', start: 'orchard-1',
    stories: ['The Clockwork Orchard', 'The Glass River', 'The Last Star'],
    intro: 'An orchard has stopped the seasons. Follow its stolen starlight through a river of glass to an observatory above the clouds, where a promise can change the sky.',
  },
};

const ADVENTURE_SETS_ES = {
  kaldra: {
    title: 'La linterna de Kaldra',
    stories: ['La linterna de Kaldra', 'La marea de ceniza', 'La corona de la noche hueca'],
    intro: 'La linterna robada de Thornwick es lo único que protege a las aldeas del Rey Hueco. Lleva su luz desde un monasterio en ruinas hasta una costa inundada y una ciudad sepultada.',
  },
  starfall: {
    title: 'El pacto de las estrellas',
    stories: ['El huerto mecánico', 'El río de cristal', 'La última estrella'],
    intro: 'Un huerto ha detenido las estaciones. Sigue su luz estelar robada a través de un río de cristal hasta un observatorio sobre las nubes, donde una promesa puede cambiar el cielo.',
  },
};

function addSection(id, section, spanish) {
  STORY[id] = section;
  STORY_ES[id] = spanish;
}

function provision(s, flag) {
  s.hp = s.maxHp;
  s.abilityUsed = false;
  if (s.flags[flag]) return 'You have rested. Your class ability is ready.';
  s.flags[flag] = true;
  s.items.push('Healing Potion', 'Healing Potion');
  return 'Restored all Endurance and your class ability. Gained 2 Healing Potions.';
}

addSection('orchard-1', {
  title: 'The Clockwork Orchard',
  text: (s) => `<p>At Bellweather, spring has lasted thirteen months. Brass apples tick on leafless branches, and the miller begs you for help, ${s.name}. Each midnight, another field turns to copper.</p>
    <p>The orchard keeper wound a fallen star into the roots to save one harvest. Now the machine refuses to let the year end. The miller gives you supplies and points toward the garden wall.</p>`,
  onEnter: (s) => {
    if (s.flags.orchardSupplies) return '';
    s.flags.orchardSupplies = true;
    s.gold += 15;
    s.items.push('Healing Potion', 'Healing Potion');
    return 'Gained 15 Gold and 2 Healing Potions.';
  },
  choices: [
    { text: 'Follow the irrigation channel.', to: 'orchard-channel' },
    { text: 'Approach the locked garden gate.', to: 'orchard-gate' },
  ],
}, {
  title: 'El huerto mecánico',
  text: (s) => `<p>En Bellweather, la primavera lleva trece meses sin terminar. Las manzanas de latón hacen tictac en ramas sin hojas, y el molinero te pide ayuda, ${s.name}. Cada medianoche, otro campo se convierte en cobre.</p>
    <p>Para salvar una cosecha, el guardián del huerto encerró una estrella caída entre las raíces. Ahora la máquina se niega a dejar que termine el año. El molinero te entrega provisiones y señala el muro del jardín.</p>`,
  choices: [{ text: 'Sigue el canal de riego.' }, { text: 'Acércate a la puerta cerrada del jardín.' }],
});
addSection('orchard-channel', {
  title: 'Water Between the Gears',
  text: '<p>The channel passes beneath turning brass wheels. A narrow gap opens whenever the largest wheel catches. Beyond it, you glimpse a quiet tool shed.</p>',
  check: { stat: 'DEX', dc: 12, text: 'Time your passage between the wheels.', success: 'orchard-shed', failure: 'orchard-scrape' },
}, {
  title: 'Agua entre los engranajes',
  text: '<p>El canal pasa bajo ruedas de latón que no dejan de girar. Se abre un hueco estrecho cuando la mayor se atasca. Al otro lado distingues un cobertizo silencioso.</p>',
  check: { text: 'Cruza entre las ruedas en el momento justo.' },
});
addSection('orchard-scrape', {
  title: 'The Price of Haste',
  text: '<p>A wheel catches your cloak. You tear free and drop into the shed, bruised but beyond the machinery.</p>',
  onEnter: (s) => { s.hp -= 3; return 'Lost 3 Endurance.'; },
  choices: [{ text: 'Search the shed.', to: 'orchard-shed' }],
}, {
  title: 'El precio de la prisa',
  text: '<p>Una rueda atrapa tu capa. Logras soltarte y caes dentro del cobertizo, con algunos golpes pero lejos de la maquinaria.</p>',
  choices: [{ text: 'Registra el cobertizo.' }],
});
addSection('orchard-gate', {
  title: 'The Gardener of Brass',
  text: '<p>A mechanical gardener bars the gate with pruning shears. Its chest bears an empty winding socket. You might stop its spring, or fight your way past.</p>',
  choices: [
    { text: '[Warrior] Brace the shears and stop the spring.', to: 'orchard-strength', show: isClass('warrior') },
    { text: '[Rogue] Release the winding catch.', to: 'orchard-dexterity', show: isClass('rogue') },
    { text: '[Mage] Read the command etched on its chest.', to: 'orchard-intellect', show: isClass('mage') },
    { text: '[Cleric] Listen for the living voice in the gears.', to: 'orchard-wisdom', show: isClass('cleric') },
    { text: 'Fight the brass gardener.', to: 'orchard-fight' },
  ],
}, {
  title: 'El jardinero de latón',
  text: '<p>Un jardinero mecánico bloquea la puerta con unas tijeras de podar. En su pecho hay un orificio para una llave de cuerda. Podrías detener su resorte o abrirte paso luchando.</p>',
  choices: [
    { text: '[Guerrero] Sujeta las tijeras y detén el resorte.' },
    { text: '[Pícaro] Suelta el seguro de la cuerda.' },
    { text: '[Mago] Lee la orden grabada en su pecho.' },
    { text: '[Clérigo] Escucha la voz viva entre los engranajes.' },
    { text: 'Lucha contra el jardinero de latón.' },
  ],
});
for (const [id, stat, title, spanish] of [
  ['strength', 'STR', 'Hold Fast', 'Mantente firme'],
  ['dexterity', 'DEX', 'A Delicate Catch', 'Un seguro delicado'],
  ['intellect', 'INT', 'The First Command', 'La primera orden'],
  ['wisdom', 'WIS', 'A Voice in the Spring', 'Una voz en el resorte'],
]) {
  addSection(`orchard-${id}`, {
    title, text: '<p>You wait for the gardener to pause, then reach for the secret of its restless heart.</p>',
    check: { stat, dc: 12, text: 'Stop the gardener without breaking it.', success: 'orchard-shed', failure: 'orchard-fight' },
  }, {
    title: spanish, text: '<p>Esperas a que el jardinero se detenga un instante y buscas el secreto de su corazón inquieto.</p>',
    check: { text: 'Detén al jardinero sin destruirlo.' },
  });
}
addSection('orchard-fight', {
  title: 'The Rusted Shears',
  text: '<p>The gardener advances with a grinding of gears. Behind it, the gate swings open.</p>',
  combat: { name: 'Brass Gardener', hp: 16, dc: 11, damage: [3, 5], win: 'orchard-shed' },
}, {
  title: 'Las tijeras oxidadas', text: '<p>El jardinero avanza entre chirridos de engranajes. Detrás de él se abre la puerta.</p>',
  combat: { name: 'Jardinero de latón' },
});
addSection('orchard-shed', {
  title: 'The Keeper\'s Notebook',
  text: '<p>In the shed, a notebook lies open beside a copper seed. "The star is not fuel," the keeper wrote. "It is a guest. Ask what it needs before you wind the clock."</p><p>The seed holds a little of the orchard\'s warmth. You tuck it safely away.</p>',
  onEnter: (s) => { s.flags.starSeed = true; return 'Learned how to speak to the star.'; },
  choices: [{ text: 'Descend beneath the oldest tree.', to: 'orchard-heart' }],
}, {
  title: 'El cuaderno del guardián',
  text: '<p>En el cobertizo hay un cuaderno abierto junto a una semilla de cobre. «La estrella no es combustible», escribió el guardián. «Es una invitada. Pregúntale qué necesita antes de dar cuerda al reloj».</p><p>La semilla guarda algo del calor del huerto. La pones a buen recaudo.</p>',
  choices: [{ text: 'Desciende bajo el árbol más antiguo.' }],
});
addSection('orchard-heart', {
  title: 'A Season Held Captive',
  text: '<p>Between the roots, a small star trembles inside a cage of clock hands. "I wanted to see things grow," it says. "But no one told me how to stop."</p><p>You can teach the machine to release the season. If it will not listen, you must break its spring.</p>',
  check: { stat: 'WIS', dc: 13, text: 'Convince the star to trust the turning year.', bonus: (s) => s.flags.starSeed ? 2 : 0, bonusLabel: 'Keeper\'s notebook', success: 'orchard-bloom', failure: 'orchard-break' },
}, {
  title: 'Una estación cautiva',
  text: '<p>Entre las raíces, una pequeña estrella tiembla en una jaula de manecillas. «Quería ver crecer las cosas», dice. «Pero nadie me explicó cómo parar».</p><p>Puedes enseñar a la máquina a liberar la estación. Si no escucha, tendrás que romper su resorte.</p>',
  check: { text: 'Convence a la estrella de que confíe en el ciclo del año.', bonusLabel: 'Cuaderno del guardián' },
});
addSection('orchard-bloom', {
  title: 'The First Autumn',
  ending: 'victory', storyId: 'clockwork-orchard', outcome: 'bloom', nextStory: 'glass-1',
  text: (s) => `<p>The star folds its clock hands together. All across Bellweather, copper leaves turn gold, then fall as ordinary leaves. A harvest can finally end.</p><p>${s.name}, you carry the grateful star to the river. Its sisters, it tells you, are still missing.</p>`,
}, {
  title: 'El primer otoño',
  text: (s) => `<p>La estrella junta sus manecillas. En todo Bellweather, las hojas de cobre se vuelven doradas y luego caen como hojas corrientes. Por fin puede terminar una cosecha.</p><p>${s.name}, llevas a la agradecida estrella hasta el río. Sus hermanas, te cuenta, siguen desaparecidas.</p>`,
});
addSection('orchard-break', {
  title: 'An Unwound Promise',
  ending: 'victory', storyId: 'clockwork-orchard', outcome: 'broken', nextStory: 'glass-1',
  text: '<p>You break the great spring. The trees become wood again, but their fruit falls as ash. Bellweather will need a difficult winter to recover.</p><p>The freed star hides in your pack. From the river comes the faint sound of its sisters calling.</p>',
}, {
  title: 'Una promesa sin cuerda',
  text: '<p>Rompes el gran resorte. Los árboles vuelven a ser de madera, pero sus frutos caen convertidos en ceniza. Bellweather necesitará un invierno difícil para recuperarse.</p><p>La estrella liberada se esconde en tu mochila. Desde el río llega el débil eco de sus hermanas.</p>',
});
addSection('glass-1', {
  title: 'The Glass River',
  text: (s) => `<p>Downstream, the river has hardened into transparent glass. Barges hang frozen above their own shadows. Ferrymaster Iona recognizes you, ${s.name}, and offers supplies.</p>
    <p>A star lies trapped in the sluice tower. The first star whispers that its sister tried to keep every reflection safe, and forgot to let the water move.</p>
    ${s.storyOutcomes['clockwork-orchard'] === 'bloom' ? '<p>Fresh leaves from Bellweather drift inside the glass. The river remembers how to change.</p>' : '<p>Ash from the orchard is suspended beneath your feet. Even a broken promise leaves a trail.</p>'}`,
  onEnter: (s) => provision(s, 'glassSupplies'),
  choices: [
    { text: 'Cross the river\'s glass surface.', to: 'glass-crossing' },
    { text: 'Follow Iona into the reed tunnels.', to: 'glass-reeds' },
  ],
}, {
  title: 'El río de cristal',
  text: (s) => `<p>Río abajo, el agua se ha endurecido hasta volverse cristal transparente. Las barcazas cuelgan inmóviles sobre sus propias sombras. Iona, la barquera, te reconoce, ${s.name}, y te ofrece provisiones.</p>
    <p>Hay una estrella atrapada en la torre de las compuertas. La primera estrella susurra que su hermana quiso proteger todos los reflejos y olvidó dejar correr el agua.</p>
    ${s.storyOutcomes['clockwork-orchard'] === 'bloom' ? '<p>Hojas frescas de Bellweather flotan dentro del cristal. El río recuerda cómo cambiar.</p>' : '<p>La ceniza del huerto está suspendida bajo tus pies. Hasta una promesa rota deja un rastro.</p>'}`,
  choices: [{ text: 'Cruza la superficie de cristal del río.' }, { text: 'Sigue a Iona por los túneles de juncos.' }],
});
addSection('glass-crossing', {
  title: 'Footsteps Over Reflections',
  text: '<p>Cracks spread whenever you look down. You fix your gaze on the tower and test each step.</p>',
  check: { stat: 'DEX', dc: 12, text: 'Cross without waking your reflection.', success: 'glass-store', failure: 'glass-fight' },
}, {
  title: 'Pasos sobre los reflejos', text: '<p>Las grietas se extienden cada vez que miras abajo. Fijas la vista en la torre y tanteas cada paso.</p>',
  check: { text: 'Cruza sin despertar a tu reflejo.' },
});
addSection('glass-reeds', {
  title: 'The Ferrymaster\'s Song',
  text: '<p>Iona sings a tune with a missing final note. "The river must finish it," she says. You memorize the tune as she leads you through a tunnel beneath the tower.</p>',
  onEnter: (s) => { s.flags.riverSong = true; return 'Learned Iona\'s river song.'; },
  choices: [{ text: 'Enter the tower storehouse.', to: 'glass-store' }],
}, {
  title: 'La canción de la barquera',
  text: '<p>Iona canta una melodía a la que le falta la última nota. «El río debe terminarla», dice. Memorizas la canción mientras te guía por un túnel bajo la torre.</p>',
  choices: [{ text: 'Entra en el almacén de la torre.' }],
});
addSection('glass-fight', {
  title: 'The Other Traveler',
  text: '<p>Your reflection climbs out of the river, carrying a sword made of splinters. It bars your way to the tower.</p>',
  combat: { name: 'Glass Reflection', hp: 18, dc: 12, damage: [3, 6], win: 'glass-store' },
}, {
  title: 'El otro viajero',
  text: '<p>Tu reflejo sale del río con una espada hecha de esquirlas. Te cierra el paso hacia la torre.</p>',
  combat: { name: 'Reflejo de cristal' },
});
addSection('glass-store', {
  title: 'Cargo for Tomorrow',
  text: '<p>The tower storehouse holds equipment meant for the river wardens. Iona insists you take a weapon and armor: no cargo matters more than a moving river.</p>',
  onEnter: (s) => {
    if (s.flags.glassGear) return '';
    s.flags.glassGear = true;
    s.items.push({ warrior: 'Dawnforged Blade', rogue: 'Whispersteel Daggers', mage: 'Starfall Staff', cleric: 'Sunfire Mace' }[s.cls], 'Tideglass Armor');
    return 'Gained a weapon and Tideglass Armor. Equip them from your Adventure Sheet.';
  },
  choices: [{ text: 'Climb to the sluice mechanism.', to: 'glass-lock' }],
}, {
  title: 'Un cargamento para mañana',
  text: '<p>El almacén de la torre guarda equipo para los guardianes del río. Iona insiste en que tomes un arma y una armadura: ningún cargamento importa más que un río que fluye.</p>',
  choices: [{ text: 'Sube hasta el mecanismo de la compuerta.' }],
});
addSection('glass-lock', {
  title: 'The Frozen Sluice',
  text: '<p>The wheel will not turn. In its axle, the star has woven a knot of still water. You must loosen it before the tower splits.</p>',
  choices: [
    { text: '[Warrior] Lever the wheel free.', to: 'glass-force', show: isClass('warrior') },
    { text: '[Rogue] Unhook the frozen ratchet.', to: 'glass-catch', show: isClass('rogue') },
    { text: '[Mage] Untie the water-spell.', to: 'glass-spell', show: isClass('mage') },
    { text: '[Cleric] Call the river back to its course.', to: 'glass-prayer', show: isClass('cleric') },
  ],
}, {
  title: 'La compuerta congelada',
  text: '<p>La rueda no gira. La estrella ha tejido un nudo de agua inmóvil en el eje. Debes aflojarlo antes de que la torre se parta.</p>',
  choices: [
    { text: '[Guerrero] Libera la rueda haciendo palanca.' }, { text: '[Pícaro] Desengancha el trinquete congelado.' },
    { text: '[Mago] Desata el hechizo del agua.' }, { text: '[Clérigo] Devuelve el río a su cauce.' },
  ],
});
for (const [id, stat] of [['force', 'STR'], ['catch', 'DEX'], ['spell', 'INT'], ['prayer', 'WIS']]) {
  addSection(`glass-${id}`, {
    title: 'A Little Movement', text: '<p>You work against the frozen mechanism. Deep below, the river begins to hum.</p>',
    check: { stat, dc: 13, text: 'Free the sluice without damaging its supports.', success: 'glass-open', failure: 'glass-shards' },
  }, {
    title: 'Un pequeño movimiento', text: '<p>Forcejeas con el mecanismo congelado. Muy abajo, el río empieza a murmurar.</p>',
    check: { text: 'Libera la compuerta sin dañar sus soportes.' },
  });
}
addSection('glass-shards', {
  title: 'The Tower Shivers',
  text: '<p>The wheel breaks loose with a shower of glass. You shield your face and stumble into the star chamber.</p>',
  onEnter: (s) => { s.hp -= 4; return 'Lost 4 Endurance.'; },
  choices: [{ text: 'Reach for the trapped star.', to: 'glass-heart' }],
}, {
  title: 'La torre tiembla', text: '<p>La rueda se suelta entre una lluvia de cristal. Te proteges el rostro y entras tambaleándote en la cámara de la estrella.</p>',
  choices: [{ text: 'Tiende la mano hacia la estrella atrapada.' }],
});
addSection('glass-open', {
  title: 'The Turning Wheel',
  text: '<p>The wheel turns once. A silver current curls through the chamber, shielding you from falling glass.</p>',
  onEnter: (s) => { s.flags.glassSluice = true; return 'The sluice will help release the river.'; },
  choices: [{ text: 'Reach for the trapped star.', to: 'glass-heart' }],
}, {
  title: 'La rueda gira', text: '<p>La rueda da una vuelta. Una corriente plateada recorre la cámara y te protege de los fragmentos de cristal.</p>',
  choices: [{ text: 'Tiende la mano hacia la estrella atrapada.' }],
});
addSection('glass-heart', {
  title: 'The Unfinished Note',
  text: '<p>"If the water moves, the faces will vanish," the second star says. You show it that a reflection can return even after a ripple passes.</p>',
  check: {
    stat: 'WIS', dc: 14, text: 'Help the star release its reflections.',
    bonus: (s) => (s.flags.riverSong ? 2 : 0) + (s.flags.glassSluice ? 1 : 0),
    bonusLabel: 'Song and sluice', success: 'glass-flow', failure: 'glass-fracture',
  },
}, {
  title: 'La nota inconclusa', text: '<p>«Si el agua se mueve, los rostros desaparecerán», dice la segunda estrella. Le muestras que un reflejo puede volver después de que pase una onda.</p>',
  check: { text: 'Ayuda a la estrella a liberar sus reflejos.', bonusLabel: 'Canción y compuerta' },
});
addSection('glass-flow', {
  title: 'A River Again',
  ending: 'victory', storyId: 'glass-river', outcome: 'flowing', nextStory: 'star-1',
  text: '<p>The river answers Iona with its own final note. Glass melts into clear water. Barges settle gently and the second star joins its sister in your pack.</p><p>The stars point upward. Their eldest sister waits in the observatory where their journey began.</p>',
}, {
  title: 'De nuevo un río',
  text: '<p>El río responde a Iona con su propia nota final. El cristal se funde en agua clara. Las barcazas descienden suavemente y la segunda estrella se une a su hermana en tu mochila.</p><p>Las estrellas señalan hacia arriba. Su hermana mayor espera en el observatorio donde comenzó su viaje.</p>',
});
addSection('glass-fracture', {
  title: 'The Broken Mirror',
  ending: 'victory', storyId: 'glass-river', outcome: 'fractured', nextStory: 'star-1',
  text: '<p>You shatter the star\'s glass shell. Water rushes free, carrying sharp islands of crystal toward the sea. Iona will guide the first boats slowly.</p><p>The second star is free, but silent. Its eldest sister waits above the clouds, and you must ask why they fell.</p>',
}, {
  title: 'El espejo roto',
  text: '<p>Rompes la envoltura de cristal de la estrella. El agua queda libre y arrastra afiladas islas de cristal hacia el mar. Iona guiará despacio a los primeros barcos.</p><p>La segunda estrella está libre, pero no habla. Su hermana mayor espera sobre las nubes, y debes averiguar por qué cayeron.</p>',
});
addSection('star-1', {
  title: 'The Last Star',
  text: (s) => `<p>The mountain observatory rises above a sea of clouds. You rest in its abandoned hostel, ${s.name}, while two stars keep watch beside your bed.</p><p>At dawn you find a letter from astronomer Sera: "I promised them a home on earth. I never asked what a home should be."</p>
    ${s.storyOutcomes['clockwork-orchard'] === 'bloom' ? '<p>The copper seed has sprouted. One sister has already learned that a home can change.</p>' : '<p>The first star watches the broken clock hands. It still hopes a promise can be repaired.</p>'}
    ${s.storyOutcomes['glass-river'] === 'flowing' ? '<p>The second star hums with the river. It has learned that leaving is not the same as losing.</p>' : '<p>The second star holds a shard of its old shell. There is still time to teach it another way.</p>'}`,
  onEnter: (s) => provision(s, 'starSupplies'),
  choices: [
    { text: 'Take the exposed sky stair.', to: 'star-stair' },
    { text: 'Enter Sera\'s abandoned workshop.', to: 'star-workshop' },
  ],
}, {
  title: 'La última estrella',
  text: (s) => `<p>El observatorio se alza sobre un mar de nubes. Descansas en su albergue abandonado, ${s.name}, mientras dos estrellas velan junto a tu cama.</p><p>Al amanecer encuentras una carta de la astrónoma Sera: «Les prometí un hogar en la tierra. Nunca les pregunté cómo debía ser ese hogar».</p>
    ${s.storyOutcomes['clockwork-orchard'] === 'bloom' ? '<p>La semilla de cobre ha brotado. Una hermana ya sabe que un hogar puede cambiar.</p>' : '<p>La primera estrella observa las manecillas rotas. Aún espera que una promesa pueda repararse.</p>'}
    ${s.storyOutcomes['glass-river'] === 'flowing' ? '<p>La segunda estrella tararea con el río. Ha aprendido que marcharse no es lo mismo que perder.</p>' : '<p>La segunda estrella guarda una esquirla de su antigua envoltura. Todavía puedes enseñarle otro camino.</p>'}`,
  choices: [{ text: 'Sube por la escalera expuesta al cielo.' }, { text: 'Entra en el taller abandonado de Sera.' }],
});
addSection('star-stair', {
  title: 'Above the Weather',
  text: '<p>The stairs hang from chains over empty air. You climb as wind pulls at your pack and the stars huddle close.</p>',
  check: { stat: 'STR', dc: 13, text: 'Reach the dome through the mountain wind.', success: 'star-dome', failure: 'star-wind' },
}, {
  title: 'Sobre las tormentas', text: '<p>La escalera cuelga de cadenas sobre el vacío. Subes mientras el viento tira de tu mochila y las estrellas se acurrucan a tu lado.</p>',
  check: { text: 'Llega a la cúpula atravesando el viento de la montaña.' },
});
addSection('star-wind', {
  title: 'A Hard Landing',
  text: '<p>A chain snaps. You swing into the dome wall and pull yourself through a window. The stars are safe, but your shoulder aches.</p>',
  onEnter: (s) => { s.hp -= 4; return 'Lost 4 Endurance.'; },
  choices: [{ text: 'Explore the dome.', to: 'star-dome' }],
}, {
  title: 'Un aterrizaje brusco', text: '<p>Una cadena se rompe. Golpeas el muro de la cúpula y logras entrar por una ventana. Las estrellas están a salvo, pero te duele el hombro.</p>',
  choices: [{ text: 'Explora la cúpula.' }],
});
addSection('star-workshop', {
  title: 'A Map of Belonging',
  text: '<p>Sera\'s maps show the stars as travelers, not possessions. A margin note describes a release lever hidden beneath the great telescope.</p>',
  check: { stat: 'INT', dc: 12, text: 'Decode Sera\'s star map.', success: 'star-map', failure: 'star-dome' },
}, {
  title: 'Un mapa del hogar', text: '<p>Los mapas de Sera muestran a las estrellas como viajeras, no como posesiones. Una nota al margen describe una palanca de liberación oculta bajo el gran telescopio.</p>',
  check: { text: 'Descifra el mapa estelar de Sera.' },
});
addSection('star-map', {
  title: 'The Open Door',
  text: '<p>You mark the hidden lever on your map. Sera designed a way out, even when she could not bear to use it.</p>',
  onEnter: (s) => { s.flags.starMap = true; return 'Found the telescope\'s release lever.'; },
  choices: [{ text: 'Enter the dome.', to: 'star-dome' }],
}, {
  title: 'La puerta abierta', text: '<p>Marcas la palanca oculta en el mapa. Sera diseñó una salida, aunque no se atreviera a utilizarla.</p>',
  choices: [{ text: 'Entra en la cúpula.' }],
});
addSection('star-dome', {
  title: 'The Astronomer\'s Vigil',
  text: '<p>Sera stands beneath a telescope aimed at the earth. The eldest star burns inside its lens. "I could make a perfect world," Sera says. "One that never changes."</p><p>A brass sentinel guards the lens. You can release its chain if you found the lever, or face it directly. A sheltered bench offers one last rest.</p>',
  choices: [
    { text: 'Rest beside the chart table.', to: 'star-rest', show: (s) => !s.flags.starRest },
    { text: 'Pull the hidden release lever.', to: 'star-release', show: (s) => s.flags.starMap },
    { text: 'Confront the sentinel.', to: 'star-sentinel' },
  ],
}, {
  title: 'La vigilia de la astrónoma',
  text: '<p>Sera espera bajo un telescopio que apunta a la tierra. La hermana mayor arde dentro de su lente. «Podría crear un mundo perfecto», dice Sera. «Uno que nunca cambie».</p><p>Un centinela de latón protege la lente. Si encontraste la palanca, puedes soltar su cadena; si no, tendrás que enfrentarlo. Un banco resguardado ofrece un último descanso.</p>',
  choices: [{ text: 'Descansa junto a la mesa de mapas.' }, { text: 'Tira de la palanca oculta.' }, { text: 'Enfréntate al centinela.' }],
});
addSection('star-rest', {
  title: 'Two Small Lights',
  text: '<p>The two stars warm your hands while you bind your wounds. Below, the river winds past an orchard waiting for another spring.</p>',
  onEnter: (s) => { s.flags.starRest = true; s.hp = Math.min(s.maxHp, s.hp + 8); return 'Recovered up to 8 Endurance.'; },
  choices: [{ text: 'Return to Sera.', to: 'star-dome' }],
}, {
  title: 'Dos pequeñas luces', text: '<p>Las dos estrellas te calientan las manos mientras te curas las heridas. Abajo, el río serpentea junto a un huerto que espera otra primavera.</p>',
  choices: [{ text: 'Regresa con Sera.' }],
});
addSection('star-release', {
  title: 'The Unchained Guardian',
  text: '<p>The lever falls. Freed from the telescope, the sentinel kneels and lets you pass. Sera watches it choose its own purpose for the first time.</p>',
  onEnter: (s) => { s.flags.starRelease = true; return 'Freed the sentinel (+1 to the final Wisdom check).'; },
  choices: [{ text: 'Speak to the eldest star.', to: 'star-heart' }],
}, {
  title: 'El guardián sin cadenas',
  text: '<p>La palanca baja. Libre del telescopio, el centinela se arrodilla y te deja pasar. Por primera vez, Sera lo ve elegir su propio destino.</p>',
  choices: [{ text: 'Habla con la hermana mayor.' }],
});
addSection('star-sentinel', {
  title: 'The Keeper of Still Skies',
  text: '<p>The sentinel opens wings of sharpened brass. Behind it, the telescope begins to turn the clouds to glass.</p>',
  combat: { name: 'Sky Sentinel', hp: 28, dc: 13, damage: [4, 7], win: 'star-heart' },
}, {
  title: 'El guardián del cielo inmóvil',
  text: '<p>El centinela despliega alas de latón afilado. Detrás de él, el telescopio empieza a convertir las nubes en cristal.</p>',
  combat: { name: 'Centinela del cielo' },
});
addSection('star-heart', {
  title: 'A Home With Open Windows',
  text: (s) => `<p>The eldest star looks at its sisters. "What if we leave, and no one remembers us?" it asks.</p><p>You tell it of ${s.storyOutcomes['clockwork-orchard'] === 'bloom' ? 'an orchard that learned to welcome autumn' : 'a village planting after a bitter winter'}, and ${s.storyOutcomes['glass-river'] === 'flowing' ? 'a river that carries every face without keeping it' : 'a ferrymaster guiding boats through broken glass'}. A home is not a cage, and remembering need not stop the world.</p>`,
  check: {
    stat: 'WIS', dc: 14, text: 'Help Sera and the stars make a new covenant.',
    bonus: (s) => (s.storyOutcomes['clockwork-orchard'] === 'bloom' ? 1 : 0)
      + (s.storyOutcomes['glass-river'] === 'flowing' ? 1 : 0) + (s.flags.starRelease ? 1 : 0),
    bonusLabel: 'Lessons of the journey', success: 'star-dawn', failure: 'star-watch',
  },
}, {
  title: 'Un hogar con las ventanas abiertas',
  text: (s) => `<p>La hermana mayor mira a las otras estrellas. «¿Y si nos vamos y nadie nos recuerda?», pregunta.</p><p>Le hablas de ${s.storyOutcomes['clockwork-orchard'] === 'bloom' ? 'un huerto que aprendió a recibir el otoño' : 'una aldea que siembra tras un invierno amargo'}, y de ${s.storyOutcomes['glass-river'] === 'flowing' ? 'un río que lleva todos los rostros sin retenerlos' : 'una barquera que guía barcos entre cristales rotos'}. Un hogar no es una jaula, y recordar no exige detener el mundo.</p>`,
  check: { text: 'Ayuda a Sera y a las estrellas a forjar un nuevo pacto.', bonusLabel: 'Lecciones del viaje' },
});
addSection('star-dawn', {
  title: 'The Returning Constellation',
  ending: 'victory', storyId: 'last-star', outcome: 'returned',
  text: (s) => `<p>Sera opens the lens. Three stars rise into the morning, then return that evening as a new constellation above Bellweather.</p><p>Years later, ${s.name}, children still point to the orchard, the river, and the open window written in the sky. Each winter the stars visit, and each spring they are free to leave.</p>`,
}, {
  title: 'La constelación que regresa',
  text: (s) => `<p>Sera abre la lente. Tres estrellas ascienden en la mañana y regresan esa noche como una nueva constelación sobre Bellweather.</p><p>Años después, ${s.name}, los niños aún señalan el huerto, el río y la ventana abierta dibujados en el cielo. Las estrellas visitan la tierra cada invierno y son libres de marcharse cada primavera.</p>`,
});
addSection('star-watch', {
  title: 'The Patient Observatory',
  ending: 'victory', storyId: 'last-star', outcome: 'sheltered',
  text: (s) => `<p>The eldest star is not ready to fly. Instead, you turn the telescope away from the earth and open the dome. The seasons and river are safe.</p><p>Sera agrees to keep the door unlocked. You take the first watch, ${s.name}, while the sisters practice rising above the lens. Not every journey ends today. Some need a safe place to begin again.</p>`,
}, {
  title: 'El observatorio paciente',
  text: (s) => `<p>La hermana mayor aún no está lista para volar. Apartas el telescopio de la tierra y abres la cúpula. Las estaciones y el río están a salvo.</p><p>Sera acepta dejar la puerta sin llave. Tomas la primera guardia, ${s.name}, mientras las hermanas practican cómo elevarse sobre la lente. No todos los viajes terminan hoy. Algunos necesitan un lugar seguro donde volver a empezar.</p>`,
});

const kaldraDeath = STORY.death.text;
STORY.death.text = (s) => s.adventureSet === 'starfall'
  ? '<p>Your strength fails beneath an unfamiliar sky. The stars wait quietly beside you. In Bellweather, the miller lights a candle for the traveler who tried to bring the seasons home.</p>'
  : kaldraDeath(s);
const kaldraDeathEs = STORY_ES.death.text;
STORY_ES.death.text = (s) => s.adventureSet === 'starfall'
  ? '<p>Tus fuerzas te abandonan bajo un cielo desconocido. Las estrellas esperan en silencio a tu lado. En Bellweather, el molinero enciende una vela por quien intentó devolver las estaciones a su hogar.</p>'
  : typeof kaldraDeathEs === 'function' ? kaldraDeathEs(s) : kaldraDeathEs;
