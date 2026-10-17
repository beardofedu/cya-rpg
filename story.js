// Classes and story sections for "The Lantern of Kaldra".
// Stats are ability scores; the modifier used in checks is floor((score - 10) / 2).

const CLASSES = {
  warrior: {
    name: 'Warrior', icon: '⚔️',
    blurb: 'A veteran of the border wars, clad in mail and trusting in steel.',
    stats: { STR: 17, DEX: 12, INT: 8, WIS: 12 },
    hp: 32, attackStat: 'STR', damage: [5, 9], weapon: 'Longsword',
    ability: { name: 'Second Wind', desc: 'Once per adventure, recover 12 Endurance.', combatOnly: false },
    items: ['Longsword', 'Chain Mail'],
  },
  rogue: {
    name: 'Rogue', icon: '🗡️',
    blurb: 'Quick of hand and quicker of wit, you go where locks say you should not.',
    stats: { STR: 10, DEX: 17, INT: 13, WIS: 10 },
    hp: 24, attackStat: 'DEX', damage: [4, 8], weapon: 'Twin Daggers',
    ability: { name: 'Shadowstrike', desc: 'Once per adventure in combat, strike unseen for double damage — no roll needed.', combatOnly: true },
    items: ['Twin Daggers', 'Lockpicks'],
  },
  mage: {
    name: 'Mage', icon: '🔮',
    blurb: 'A scholar of the arcane whose words can kindle fire from empty air.',
    stats: { STR: 8, DEX: 12, INT: 17, WIS: 13 },
    hp: 20, attackStat: 'INT', damage: [4, 8], weapon: 'Arcane Bolt',
    ability: { name: 'Fireball', desc: 'Once per adventure in combat, deal 14 fire damage — no roll needed.', combatOnly: true },
    items: ['Oak Staff', 'Spellbook'],
  },
  cleric: {
    name: 'Cleric', icon: '✨',
    blurb: 'A servant of the Dawnmother, armored in faith and a heavy mace.',
    stats: { STR: 13, DEX: 10, INT: 11, WIS: 17 },
    hp: 26, attackStat: 'WIS', damage: [4, 8], weapon: 'Mace of Dawn',
    ability: { name: 'Divine Mending', desc: 'Once per adventure, recover 15 Endurance.', combatOnly: false },
    items: ['Mace of Dawn', 'Holy Symbol'],
  },
};

const STAT_NAMES = { STR: 'Strength', DEX: 'Dexterity', INT: 'Intellect', WIS: 'Wisdom' };

// Helpers available to section scripts.
const has = (s, item) => s.items.includes(item);
const isClass = (...c) => (s) => c.includes(s.cls);

const STORY = {
  1: {
    title: 'The Stolen Light',
    text: (s) => `
      <p>The bells of Thornwick are ringing when you arrive — not in celebration, but in alarm.
      Elder Maren meets you at the well, her lantern-bearer's robes torn and sooty.</p>
      <p>"The <em>Lantern of Dawn</em> is gone," she says. "A robed figure walked through our wards as if
      they were mist. The tracks lead north, toward the ruined Monastery of Kaldra. Without the Lantern,
      the Hollow King's dead will rise at the next new moon — three nights from now."</p>
      <p>She presses a small pouch into your hand. "It is all the village can spare. Please, ${s.name}."</p>`,
    onEnter: (s) => { s.gold += 15; s.items.push('Healing Potion'); return 'Gained 15 Gold and a Healing Potion.'; },
    choices: [
      { text: 'Visit the market before setting out.', to: 2 },
      { text: 'Take the north road at once.', to: 3 },
    ],
  },
  2: {
    title: 'Thornwick Market',
    text: `<p>Most stalls are shuttered, but old Bram the trader is still selling to anyone brave enough to
      leave the village. "Rope's five gold. Potions are eight. Won't find better before Kaldra."</p>`,
    choices: [
      { text: 'Buy a coil of Rope (5 Gold).', to: 2, req: (s) => s.gold >= 5 && !has(s, 'Rope'), reqText: (s) => has(s, 'Rope') ? 'already owned' : 'need 5 Gold',
        effect: (s) => { s.gold -= 5; s.items.push('Rope'); return 'Bought Rope.'; } },
      { text: 'Buy a Healing Potion (8 Gold).', to: 2, req: (s) => s.gold >= 8, reqText: () => 'need 8 Gold',
        effect: (s) => { s.gold -= 8; s.items.push('Healing Potion'); return 'Bought a Healing Potion.'; } },
      { text: 'Leave the market and take the north road.', to: 3 },
    ],
  },
  3: {
    title: 'The Thornwood Road',
    text: `<p>The road north winds into the Thornwood, where the trees grow so close their branches knit
      overhead. Within an hour the daylight is a grey memory. Somewhere off the path, something large
      shifts in the undergrowth — and then goes very still.</p>`,
    check: { stat: 'WIS', dc: 12, text: 'Make a Wisdom check to sense the danger before it strikes.', success: 5, failure: 4 },
  },
  4: {
    title: 'Ambush!',
    text: `<p>Too late you hear the low growl. Two grey wolves, ribs showing through mangy fur, lunge from
      the briars. Their eyes glow faintly green — the Hollow King's hunger is already in them.</p>`,
    combat: { name: 'Hollow-Eyed Wolves', hp: 14, dc: 11, damage: [3, 5], win: 6 },
  },
  5: {
    title: 'The Hunter\'s Cache',
    text: `<p>You step off the road and wait. Two green-eyed wolves slink past, noses to the dirt, and
      lose your scent at the stream. Following their trail back, you find a hunter's camp — abandoned
      in a hurry. Beneath a loose stone is a small cache.</p>`,
    onEnter: (s) => { s.items.push('Healing Potion'); s.gold += 6; return 'Found a Healing Potion and 6 Gold.'; },
    choices: [{ text: 'Continue north.', to: 6 }],
  },
  6: {
    title: 'The Split Stone',
    text: (s) => `
      <p>By dusk you reach a great boulder split cleanly in two. Beyond it the path forks.</p>
      <p>To the east, the roar of the Greywater River, swollen with snowmelt. A ford lies somewhere along
      its banks. To the west, the black mouth of the old Kaldra silver mine burrows into the mountainside —
      a shorter road, if the stories of what lives inside are untrue.</p>
      ${s.cls === 'rogue' ? '<p><em>Your trained eye notices fresh boot-prints heading into the mine. Small boots. Goblins.</em></p>' : ''}`,
    choices: [
      { text: 'Head east to the river ford.', to: 7 },
      { text: 'Enter the abandoned mine.', to: 10 },
    ],
  },
  7: {
    title: 'The Greywater',
    text: `<p>The ford is little more than a line of slick stones beneath churning white water.
      An old iron post stands on each bank where a guide-rope once hung.</p>`,
    choices: [
      { text: 'Tie your Rope between the posts and cross safely.', to: 8, req: (s) => has(s, 'Rope'), reqText: () => 'requires Rope' },
      { text: 'Brave the current without a rope.', to: 'ford-check' },
    ],
  },
  'ford-check': {
    number: 7, title: 'Into the Current',
    text: `<p>You wade in. The cold is a fist around your chest, and the river pulls hard at your legs.</p>`,
    check: { stat: 'STR', dc: 13, text: 'Make a Strength check to fight the current.', success: 8, failure: 9 },
  },
  9: {
    title: 'Swept Away',
    text: `<p>Your foot slips. The Greywater seizes you and slams you against the rocks before spitting you,
      gasping, onto the far bank a quarter-mile downstream.</p>`,
    onEnter: (s) => { s.hp -= 6; return 'Lost 6 Endurance.'; },
    choices: [{ text: 'Drag yourself upright and go on.', to: 8 }],
  },
  8: {
    title: 'The Ferrywoman',
    text: `<p>On the far bank stands a crooked hut with smoke curling from its chimney. A woman older than
      anyone you have ever seen sits on its step, mending a net.</p>
      <p>"Few cross for Kaldra these days," she says. "Answer my riddle, and I'll give you something to
      keep the cold dark off you:</p>
      <p><em>'I have a mouth but never eat, a bed but never sleep, I run but never walk.'</em>"</p>`,
    check: { stat: 'INT', dc: 12, text: 'Make an Intellect check to solve the riddle.', success: 'riddle-win', failure: 'riddle-lose' },
  },
  'riddle-win': {
    number: 8, title: 'A River',
    text: `<p>"A river," you answer. She cackles with delight and drapes a charm of woven ash-wood around
      your neck. "The <strong>Ward of Ash</strong>. When the darkness tries to claim what's bright, hold it close."</p>`,
    onEnter: (s) => { s.items.push('Ward of Ash'); return 'Gained the Ward of Ash (+2 to the final Wisdom check).'; },
    choices: [{ text: 'Thank her and climb toward the monastery.', to: 14 }],
  },
  'riddle-lose': {
    number: 8, title: 'No Answer',
    text: `<p>You puzzle over the words until the old woman shrugs and returns to her net. "A river, dear.
      It's always a river." She says nothing more.</p>`,
    choices: [{ text: 'Climb toward the monastery.', to: 14 }],
  },
  10: {
    title: 'The Kaldra Mine',
    text: (s) => `
      <p>The mine is utterly dark and smells of old smoke. A dozen paces in, the tunnel opens onto a chasm
      spanned by a rope bridge with half its planks missing.</p>
      ${s.cls === 'mage' ? '<p><em>You murmur a word and a globe of pale light blooms above your palm, revealing every rotten plank.</em></p>' : ''}`,
    choices: [
      { text: 'Use your magelight to pick a safe path across.', to: 11, show: isClass('mage') },
      { text: 'Cross the bridge carefully in the dark.', to: 'bridge-check', show: (s) => s.cls !== 'mage' },
    ],
  },
  'bridge-check': {
    number: 10, title: 'The Broken Bridge',
    text: `<p>Each step is a guess. The ropes creak and sway beneath you.</p>`,
    check: { stat: 'DEX', dc: 12, text: 'Make a Dexterity check to keep your footing.', success: 11, failure: 12 },
  },
  12: {
    title: 'A Long Fall',
    text: `<p>A plank snaps. You plunge, catch a rope with one hand, and haul yourself up the far side with
      bleeding palms and a wrenched shoulder.</p>`,
    onEnter: (s) => { s.hp -= 5; return 'Lost 5 Endurance.'; },
    choices: [{ text: 'Press deeper into the mine.', to: 11 }],
  },
  11: {
    title: 'Goblin Lantern-Light',
    text: `<p>Ahead, firelight. A band of goblins squats around a cookfire in an old ore chamber. Their
      chieftain, a scarred brute twice their size, wears a heavy <strong>iron key</strong> on a thong
      around his neck. Beyond them, a tunnel climbs toward fresh air — toward Kaldra.</p>`,
    choices: [
      { text: 'Charge the chieftain.', to: 13 },
      { text: 'Try to sneak along the chamber wall.', to: 'sneak-check' },
      { text: '[Rogue] Slip in and lift the key from his neck.', to: 'rogue-key', show: isClass('rogue') },
    ],
  },
  'sneak-check': {
    number: 11, title: 'In the Shadows',
    text: `<p>You press yourself against the cold stone and edge forward, step by careful step.</p>`,
    check: { stat: 'DEX', dc: 14, text: 'Make a Dexterity check to sneak past unseen.', success: 14, failure: 13 },
  },
  'rogue-key': {
    number: 11, title: 'Light Fingers',
    text: `<p>Goblins sleep with one eye open, but they drink with both closed. You drift through the
      firelight like smoke, snip the thong, and are gone before the chieftain finishes his belch.</p>`,
    onEnter: (s) => { s.items.push('Iron Key'); s.gold += 10; return 'Gained the Iron Key and 10 Gold.'; },
    choices: [{ text: 'Climb toward the monastery.', to: 14 }],
  },
  13: {
    title: 'The Goblin Chieftain',
    text: `<p>With a howl the chieftain hurls aside his supper and hefts a spiked club. His warband scatters
      to watch — goblins love a good fight, so long as it is someone else's.</p>`,
    combat: { name: 'Goblin Chieftain', hp: 16, dc: 12, damage: [3, 6], win: 'goblin-win' },
  },
  'goblin-win': {
    number: 13, title: 'Spoils',
    text: `<p>The chieftain falls and the rest of the band flees shrieking into the deep tunnels.
      You take the iron key from his neck and a few coins from his purse.</p>`,
    onEnter: (s) => { s.items.push('Iron Key'); s.gold += 8; return 'Gained the Iron Key and 8 Gold.'; },
    choices: [{ text: 'Climb toward the monastery.', to: 14 }],
  },
  14: {
    title: 'The Gates of Kaldra',
    text: `<p>The monastery clings to the mountainside like a broken crown. Its iron gate is shut and
      locked, its walls slick with frost. In the highest window, a cold blue light flickers — the stolen
      Lantern, burning wrong.</p>
      <p>Beside the gate, half-buried in snow, a small shrine to the Dawnmother still stands.</p>`,
    choices: [
      { text: 'Unlock the gate with the Iron Key.', to: 16, req: (s) => has(s, 'Iron Key'), reqText: () => 'requires Iron Key' },
      { text: '[Rogue] Pick the lock.', to: 'lockpick-check', show: isClass('rogue') },
      { text: '[Cleric] Pray at the shrine of the Dawnmother.', to: 17, show: isClass('cleric') },
      { text: 'Climb the frozen wall.', to: 'climb-check' },
    ],
  },
  'lockpick-check': {
    number: 14, title: 'Tumblers',
    text: `<p>The lock is old and frost-stiff, but locks are only puzzles with patience.</p>`,
    check: { stat: 'DEX', dc: 11, text: 'Make a Dexterity check to pick the lock.', success: 16, failure: 'climb-check' },
  },
  'climb-check': {
    number: 14, title: 'The Frozen Wall',
    text: `<p>You find handholds in the crumbling mortar and begin to climb.</p>`,
    check: { stat: 'STR', dc: 13, text: 'Make a Strength check to scale the wall.', success: 16, failure: 15 },
  },
  15: {
    title: 'Ice and Stone',
    text: `<p>Near the top your grip fails and you fall hard into the courtyard snow. You are inside —
      but the noise has woken something.</p>`,
    onEnter: (s) => { s.hp -= 4; return 'Lost 4 Endurance.'; },
    choices: [{ text: 'Get up and face it.', to: 16 }],
  },
  16: {
    title: 'The Courtyard of Bones',
    text: (s) => `
      <p>The courtyard is a graveyard of fallen monks. As you cross it, the snow heaves. A skeleton in the
      rusted mail of a temple guard drags itself upright, blue fire in its eye sockets.</p>
      ${s.cls === 'cleric' ? '<p><em>Your holy symbol grows warm. The Dawnmother\'s light could drive this thing back.</em></p>' : ''}`,
    choices: [
      { text: '[Cleric] Raise your holy symbol and turn the undead.', to: 'turn-check', show: isClass('cleric') },
      { text: 'Fight the skeleton guard.', to: 'skeleton-fight' },
    ],
  },
  'turn-check': {
    number: 16, title: 'Turn Undead',
    text: `<p>You lift the sun-disc of the Dawnmother and speak the Words of Morning.</p>`,
    check: { stat: 'WIS', dc: 12, text: 'Make a Wisdom check to turn the undead.', success: 18, failure: 'skeleton-fight' },
  },
  'skeleton-fight': {
    number: 16, title: 'The Skeleton Guard',
    text: `<p>The skeleton raises a notched halberd and advances with terrible patience.</p>`,
    combat: { name: 'Skeleton Guard', hp: 15, dc: 12, damage: [4, 6], win: 18 },
  },
  17: {
    title: 'The Dawnmother\'s Blessing',
    text: `<p>You clear the snow from the shrine and kneel. Warmth spreads through you like sunrise. When you
      open your eyes, a hidden door has swung open in the wall beside the shrine — the pilgrims' way,
      leading straight into the monastery's inner hall.</p>`,
    onEnter: (s) => { s.hp = Math.min(s.maxHp, s.hp + 8); s.abilityUsed = false; return 'Recovered 8 Endurance and regained Divine Mending.'; },
    choices: [{ text: 'Enter by the pilgrims\' way.', to: 18 }],
  },
  18: {
    title: 'The Inner Hall',
    text: `<p>The inner hall is vast and silent. To your left, a library of rotting shelves; to your right,
      a stair spirals up into the bell tower. Above, through the ceiling, you can hear a voice chanting —
      and feel the cold pulse of the stolen Lantern.</p>`,
    choices: [
      { text: 'Search the library for knowledge of the thief.', to: 19 },
      { text: 'Climb the bell tower.', to: 21 },
      { text: 'Go straight up to the sanctum.', to: 20 },
    ],
  },
  19: {
    title: 'The Library',
    text: `<p>Most of the books have rotted to pulp, but a chained ledger on the abbot's desk survives.
      It lists every monk of Kaldra — and one name is scratched out with such force it tore the page.</p>`,
    check: { stat: 'INT', dc: 13, text: 'Make an Intellect check to decipher the scratched-out name.', success: 'name-win', failure: 'name-lose' },
  },
  'name-win': {
    number: 19, title: 'A True Name',
    text: `<p>Pressing the page to the light, you trace the grooves of the pen: <strong>Vesh Calloway</strong>,
      novice, expelled for "communion with the Hollow." The thief was once a monk here — and a true
      name has power over those who have sold themselves to darkness.</p>`,
    onEnter: (s) => { s.flags.trueName = true; return 'You learned the thief\'s true name.'; },
    choices: [{ text: 'Climb to the sanctum.', to: 20 }],
  },
  'name-lose': {
    number: 19, title: 'Lost to Time',
    text: `<p>The scratches defeat you. Whoever this was, the monks wanted them forgotten.</p>`,
    choices: [{ text: 'Climb to the sanctum.', to: 20 }],
  },
  21: {
    title: 'The Bell Tower',
    text: `<p>At the top of the tower hangs the great bronze bell of Kaldra, green with age. An inscription
      reads: <em>"My voice drives back the Hollow."</em> The rope has long since rotted away.</p>`,
    check: { stat: 'STR', dc: 12, text: 'Make a Strength check to swing the bell by hand.', success: 'bell-win', failure: 'bell-lose' },
  },
  'bell-win': {
    number: 21, title: 'The Voice of Kaldra',
    text: `<p>You heave against the bell until it swings — and it <em>sings</em>. The note shudders through
      the stone. Above, the chanting falters, and a scream of rage echoes down the stair.</p>`,
    onEnter: (s) => { s.flags.bell = true; return 'The thief has been weakened by the bell.'; },
    choices: [{ text: 'Race to the sanctum.', to: 20 }],
  },
  'bell-lose': {
    number: 21, title: 'Too Heavy',
    text: `<p>The bell does not budge, and you wrench your back trying. You leave it to its silence.</p>`,
    onEnter: (s) => { s.hp -= 2; return 'Lost 2 Endurance.'; },
    choices: [{ text: 'Climb to the sanctum.', to: 20 }],
  },
  20: {
    title: 'The Sanctum',
    text: (s) => `
      <p>The sanctum roof is open to the stars. In its center, upon the old altar, sits the
      <em>Lantern of Dawn</em> — its golden flame twisted into a sickly blue. Before it stands a gaunt
      figure in a monk's grey robe, hands raised, chanting.</p>
      <p>The thief turns. Its face is a young man's, hollowed by hunger that is not for food.
      "You're too late," it whispers. "The Hollow King hears me now."</p>
      ${s.flags.bell ? '<p><em>Blood trickles from its ears — the bell\'s note still rings in its bones.</em></p>' : ''}`,
    choices: [
      { text: 'Speak his true name: "Vesh Calloway."', to: 23, req: (s) => s.flags.trueName, reqText: () => 'you do not know his name' },
      { text: '[Mage] Unravel his dark ritual with a counterspell.', to: 'counter-check', show: isClass('mage') },
      { text: 'Attack!', to: (s) => (s.flags.bell ? 23 : 22) },
    ],
  },
  'counter-check': {
    number: 20, title: 'Counterspell',
    text: `<p>You seize the threads of his ritual and pull.</p>`,
    check: { stat: 'INT', dc: 14, text: 'Make an Intellect check to unravel the ritual.', success: 23, failure: 22 },
  },
  22: {
    title: 'Vesh, Servant of the Hollow',
    text: `<p>Shadows boil from Vesh's sleeves and coalesce into claws. He comes at you with the full,
      terrible strength of the Hollow King.</p>`,
    combat: { name: 'Vesh, Servant of the Hollow', hp: 24, dc: 14, damage: [4, 7], win: 24 },
  },
  23: {
    title: 'Vesh, Unmade',
    text: (s) => `
      <p>${s.flags.trueName ? 'At the sound of his name, Vesh flinches as if struck. For a heartbeat the young novice looks out of those eyes, terrified.' : 'The darkness around Vesh gutters and thins. His power is broken — but he will not yield.'}
      With a shriek he lunges at you, his shadow-claws flickering and weak.</p>`,
    combat: { name: 'Vesh, Weakened', hp: 12, dc: 11, damage: [3, 5], win: 24 },
  },
  24: {
    title: 'The Lantern of Dawn',
    text: (s) => `
      <p>Vesh collapses into a heap of grey robes and drifting ash. You lift the Lantern from the altar.
      It is ice-cold in your hands, its flame still a corrupted blue, whispering in a voice that is not
      a voice.</p>
      <p>You will have to reach into the light itself and call the dawn back into it.</p>
      ${has(s, 'Ward of Ash') ? '<p><em>The Ward of Ash grows warm against your chest.</em></p>' : ''}`,
    check: {
      stat: 'WIS', dc: 14, text: 'Make a Wisdom check to cleanse the Lantern.',
      bonus: (s) => (has(s, 'Ward of Ash') ? 2 : 0), bonusLabel: 'Ward of Ash',
      success: 25, failure: 26,
    },
  },
  25: {
    title: 'Dawn Returns',
    ending: 'victory',
    text: (s) => `
      <p>The blue fire shudders, fights you — and breaks. Gold floods back into the Lantern so brightly
      that the whole ruined monastery is lit as if by noon. Across the mountainside, the restless dead
      sink back into their graves.</p>
      <p>Three days later you walk back into Thornwick with the Lantern of Dawn burning true in your hands.
      They ring the bells again — this time in celebration. Songs will be sung of ${s.name} the
      ${CLASSES[s.cls].name} for a very long time.</p>`,
  },
  26: {
    title: 'A Dimmer Light',
    ending: 'victory',
    text: (s) => `
      <p>You pour your will into the flame until you can barely stand. The blue fades — but the gold
      that returns is pale and thin, like winter sunlight.</p>
      <p>It is enough. The dead of the mountain grow quiet, and Thornwick is safe for now. But Elder Maren's
      face is grave when she takes the Lantern from you. "It will need tending," she says. "The Hollow King
      has tasted its light. He will be back."</p>
      <p>Perhaps, ${s.name}, so will you.</p>`,
  },
  death: {
    number: '✝', title: 'Your Adventure Ends Here',
    ending: 'death',
    text: `<p>Your strength fails and the world goes dark. Far to the south, in Thornwick, the last oil
      in the village lamps burns low as the new moon rises...</p>`,
  },
};
