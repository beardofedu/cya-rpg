// Classes and story sections for "The Lantern of Kaldra".
// Stats are ability scores; the modifier used in checks is floor((score - 10) / 2).

const CLASSES = {
  warrior: {
    name: 'Warrior', icon: '⚔️',
    blurb: 'A veteran of the border wars, clad in mail and trusting in steel.',
    stats: { STR: 17, DEX: 12, INT: 8, WIS: 12 },
    hp: 32, attackStat: 'STR', damage: [5, 9], weapon: 'Longsword',
    ability: { name: 'Second Wind', desc: 'Once per adventure, recover 12 Endurance.', combatOnly: false },
    armor: 'Chain Mail', items: ['Longsword', 'Chain Mail'],
  },
  rogue: {
    name: 'Rogue', icon: '🗡️',
    blurb: 'Quick of hand and quicker of wit, you go where locks say you should not.',
    stats: { STR: 10, DEX: 17, INT: 13, WIS: 10 },
    hp: 24, attackStat: 'DEX', damage: [4, 8], weapon: 'Twin Daggers',
    ability: { name: 'Shadowstrike', desc: 'Once per adventure in combat, strike unseen for double damage — no roll needed.', combatOnly: true },
    armor: 'Leather Armor', items: ['Twin Daggers', 'Leather Armor', 'Lockpicks'],
  },
  mage: {
    name: 'Mage', icon: '🔮',
    blurb: 'A scholar of the arcane whose words can kindle fire from empty air.',
    stats: { STR: 8, DEX: 12, INT: 17, WIS: 13 },
    hp: 20, attackStat: 'INT', damage: [4, 8], weapon: 'Oak Staff',
    ability: { name: 'Fireball', desc: 'Once per adventure in combat, deal 14 fire damage — no roll needed.', combatOnly: true },
    armor: 'Mage Robes', items: ['Oak Staff', 'Mage Robes', 'Spellbook'],
  },
  cleric: {
    name: 'Cleric', icon: '✨',
    blurb: 'A servant of the Dawnmother, armored in faith and a heavy mace.',
    stats: { STR: 13, DEX: 10, INT: 11, WIS: 17 },
    hp: 26, attackStat: 'WIS', damage: [4, 8], weapon: 'Mace of Dawn',
    ability: { name: 'Divine Mending', desc: 'Once per adventure, recover 15 Endurance.', combatOnly: false },
    armor: 'Scale Mail', items: ['Mace of Dawn', 'Scale Mail', 'Holy Symbol'],
  },
};

const EQUIPMENT = {
  'Longsword': { slot: 'weapon', damage: [5, 9] },
  'Twin Daggers': { slot: 'weapon', damage: [4, 8] },
  'Oak Staff': { slot: 'weapon', damage: [4, 8] },
  'Mace of Dawn': { slot: 'weapon', damage: [4, 8] },
  'Huntsman\'s Bow': { slot: 'weapon', damage: [5, 9] },
  'Dawnforged Blade': { slot: 'weapon', damage: [6, 10] },
  'Whispersteel Daggers': { slot: 'weapon', damage: [5, 9] },
  'Starfall Staff': { slot: 'weapon', damage: [5, 9] },
  'Sunfire Mace': { slot: 'weapon', damage: [5, 9] },
  'Chain Mail': { slot: 'armor', defense: 2 },
  'Leather Armor': { slot: 'armor', defense: 1 },
  'Mage Robes': { slot: 'armor', defense: 0 },
  'Scale Mail': { slot: 'armor', defense: 1 },
  'Warden\'s Mail': { slot: 'armor', defense: 2 },
  'Tideglass Armor': { slot: 'armor', defense: 3 },
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
      { text: 'Search the ruined watchtower.', to: 'watchtower-check', show: (s) => !s.flags.watchtower },
      { text: 'Head east to the river ford.', to: 7 },
      { text: 'Enter the abandoned mine.', to: 10 },
    ],
  },
  'watchtower-check': {
    number: 6, title: 'The Old Watchtower',
    text: `<p>The tower leans over the road, its upper floors collapsed. You climb through a breach in the
      stone and search the debris for anything the old guards left behind.</p>`,
    check: { stat: 'DEX', dc: 12, text: 'Make a Dexterity check to search the unstable tower.', success: 'watchtower-cache', failure: 'watchtower-fall' },
  },
  'watchtower-cache': {
    number: 6, title: 'The Watch Captain\'s Cache',
    text: `<p>Behind a fallen beam, you find a serviceable bow and a suit of mail sealed in an oilskin.
      The watch captain's old equipment may serve you well.</p>`,
    onEnter: (s) => {
      s.flags.watchtower = true;
      s.items.push('Huntsman\'s Bow', 'Warden\'s Mail');
      return 'Found a Huntsman\'s Bow and Warden\'s Mail. Equip them from your Adventure Sheet.';
    },
    choices: [{ text: 'Return to the fork in the road.', to: 6 }],
  },
  'watchtower-fall': {
    number: 6, title: 'A Crumbling Tower',
    text: `<p>The floor gives way beneath you. You tumble through a rotten beam and land hard in the
      weeds below. The tower has nothing left to offer.</p>`,
    onEnter: (s) => { s.flags.watchtower = true; s.hp -= 3; return 'Lost 3 Endurance.'; },
    choices: [{ text: 'Return to the fork in the road.', to: 6 }],
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
    storyId: 'lantern', outcome: 'dawn', nextStory: 's2-1',
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
    storyId: 'lantern', outcome: 'dim', nextStory: 's2-1',
    text: (s) => `
      <p>You pour your will into the flame until you can barely stand. The blue fades — but the gold
      that returns is pale and thin, like winter sunlight.</p>
      <p>It is enough. The dead of the mountain grow quiet, and Thornwick is safe for now. But Elder Maren's
      face is grave when she takes the Lantern from you. "It will need tending," she says. "The Hollow King
      has tasted its light. He will be back."</p>
      <p>Perhaps, ${s.name}, so will you.</p>`,
  },
  's2-1': {
    title: 'The Ashen Tide',
    text: (s) => `
      <p>Three weeks after the Lantern's return, a rider arrives from the southern coast. Grey water is
      flooding the fishing village of Dunmere, and the dead are walking out of the tide.</p>
      <p>The rider recognizes you, ${s.name}, and begs you to find the source before the next high tide.</p>`,
    onEnter: (s) => {
      s.hp = s.maxHp;
      s.abilityUsed = false;
      return 'You have rested and recovered. Your class ability is ready.';
    },
    choices: [
      { text: 'Seek the Dawnmother\'s blessing before leaving.', to: 's2-shrine' },
      { text: 'Ride south at once.', to: 's2-cross' },
    ],
  },
  's2-shrine': {
    title: 'A Prayer for Dunmere',
    text: `<p>At the village shrine, you ask the Dawnmother to guide you through the drowned marsh.</p>`,
    check: { stat: 'WIS', dc: 12, text: 'Make a Wisdom check to receive the shrine\'s blessing.', success: 's2-blessing', failure: 's2-cross' },
  },
  's2-blessing': {
    title: 'Light in the Mist',
    text: `<p>A warm glow settles over you. The marsh may be dark, but you will not face it alone.</p>`,
    onEnter: (s) => { s.flags.tideBlessing = true; return 'The shrine will aid you against the tide.'; },
    choices: [{ text: 'Ride south to Dunmere.', to: 's2-cross' }],
  },
  's2-cross': {
    title: 'The Drowned Road',
    text: `<p>The causeway has vanished beneath the flood. You pick your way between half-submerged stones
      as cold hands reach up from the black water.</p>`,
    check: { stat: 'DEX', dc: 12, text: 'Make a Dexterity check to cross the flooded causeway.', success: 's2-watch', failure: 's2-drowned-fight' },
  },
  's2-drowned-fight': {
    title: 'Hands Below',
    text: `<p>The dead drag themselves from the water and block the causeway. You have no choice but to fight.</p>`,
    combat: { name: 'Drowned Dead', hp: 17, dc: 12, damage: [3, 6], win: 's2-watch' },
  },
  's2-watch': {
    title: 'The Sunken Beacon',
    illustration: {
      src: 'assets/dunmere-beacon.jpg',
      alt: 'A storm-battered lighthouse above a flooded village, with a black pearl glowing beneath the waves.',
      caption: 'The Sunken Beacon, where the ashen tide gathers beneath Dunmere.',
    },
    text: `<p>Dunmere's lighthouse stands on a rock above the tide. Its lamp is dark, and a trail of black
      seawater leads from its cellar toward the keeper's hall.</p>`,
    choices: [
      { text: 'Search the keeper\'s storehouse.', to: 's2-cache', show: (s) => !s.flags.tideCache },
      { text: 'Enter the keeper\'s hall.', to: 's2-keeper' },
    ],
  },
  's2-cache': {
    title: 'The Keeper\'s Stores',
    text: `<p>You find a locked chest of old lighthouse gear. Inside is a suit of tide-resistant armor and
      a weapon suited to your training.</p>`,
    onEnter: (s) => {
      const weapon = {
        warrior: 'Dawnforged Blade',
        rogue: 'Whispersteel Daggers',
        mage: 'Starfall Staff',
        cleric: 'Sunfire Mace',
      }[s.cls];
      s.flags.tideCache = true;
      s.items.push(weapon, 'Tideglass Armor');
      return `Found ${weapon} and Tideglass Armor. Equip them from your Adventure Sheet.`;
    },
    choices: [{ text: 'Enter the keeper\'s hall.', to: 's2-keeper' }],
  },
  's2-keeper': {
    title: 'The Drowned Keeper',
    text: `<p>The keeper's hall is flooded to the waist. A figure in a barnacle-crusted coat rises from the
      water, clutching a rusted anchor chain. Its lantern burns with a black flame.</p>`,
    combat: { name: 'Drowned Keeper', hp: 23, dc: 13, damage: [4, 7], win: 's2-heart' },
  },
  's2-heart': {
    title: 'Beneath the Beacon',
    text: (s) => `
      <p>Behind the keeper's desk, a stair descends below the waves to a chamber where the sea itself
      seems to breathe. A black pearl pulses at its center, drawing the dead toward Dunmere.</p>
      ${s.flags.tideBlessing || has(s, 'Ward of Ash') ? '<p><em>Your protective charm glows against the cold.</em></p>' : ''}`,
    check: {
      stat: 'WIS', dc: 14, text: 'Make a Wisdom check to cleanse the black pearl.',
      bonus: (s) => (s.flags.tideBlessing || has(s, 'Ward of Ash') ? 2 : 0),
      bonusLabel: 'Protective charm', success: 's2-dawn', failure: 's2-dim',
    },
  },
  's2-dawn': {
    title: 'The Tide Turns',
    ending: 'victory', storyId: 'ashen-tide', outcome: 'cleansed', nextStory: 's3-1',
    text: (s) => `
      <p>Light pours through the black pearl, and it cracks with a sound like distant thunder. The dead
      collapse into harmless foam. By morning the sea has withdrawn from Dunmere's streets.</p>
      <p>The villagers hail ${s.name} as the one who turned back the ashen tide.</p>`,
  },
  's2-dim': {
    title: 'A Quiet Sea',
    ending: 'victory', storyId: 'ashen-tide', outcome: 'scarred', nextStory: 's3-1',
    text: `<p>You break the pearl, though its darkness leaves a mark upon the chamber. The dead sink beneath
      the waves and Dunmere is saved — for now. The villagers will remember the cost of that victory.</p>`,
  },
  's3-1': {
    title: 'The Crown of Hollow Night',
    text: (s) => `
      <p>On the first clear morning after Dunmere's rescue, every bell in Thornwick rings without a hand
      upon its rope. Elder Maren finds you at the well. This time she brings the Lantern itself.</p>
      <p>"The mountain and the sea were only his fingers," she says. "We must reach the hand." Beyond
      the northern pass, the buried city of Caer Hollow has risen through the snow. At its heart,
      the Hollow King is gathering his scattered dead for one last march.</p>
      ${s.storyOutcomes.lantern === 'dim'
        ? '<p>The Lantern still burns thin and blue at its edges. Something beneath the distant city answers its flicker.</p>'
        : s.storyOutcomes.lantern === 'dawn'
          ? '<p>The Lantern burns with the clear gold you restored at Kaldra. Maren smiles. "Keep that dawn alive."</p>'
          : '<p>Maren shields the Lantern from the wind. "Whatever happened at Kaldra, its light must reach the city."</p>'}
      ${s.storyOutcomes['ashen-tide'] === 'cleansed'
        ? '<p>A sliver of the cleansed pearl hangs from its handle, still holding a spark of the light that saved Dunmere.</p>'
        : s.storyOutcomes['ashen-tide'] === 'scarred'
          ? '<p>Salt-black cracks mark the Lantern handle. The wound beneath Dunmere has not entirely closed.</p>'
          : ''}
      <p>With provisions from both villages, you cross the pass. A funeral road leads to the city's
      gates; a broken aqueduct offers another way inside.</p>`,
    onEnter: (s) => {
      s.hp = s.maxHp;
      s.abilityUsed = false;
      if (s.flags.crownSupplies) return 'You have rested. Your class ability is ready.';
      s.flags.crownSupplies = true;
      s.items.push('Healing Potion', 'Healing Potion');
      return 'Restored all Endurance and your class ability. Gained 2 Healing Potions.';
    },
    choices: [
      { text: 'Follow the funeral road.', to: 's3-road' },
      { text: 'Climb into the broken aqueduct.', to: 's3-aqueduct' },
    ],
  },
  's3-road': {
    title: 'The Procession Without Footsteps',
    text: (s) => `
      <p>Hundreds of dead citizens walk the funeral road, each carrying an unlit candle. None casts a
      shadow. You lower the Lantern and search for a rhythm in their silent march.</p>
      ${s.flags.bell ? '<p>You remember the note of Kaldra: the dead hesitate at the same interval.</p>' : ''}
      ${has(s, 'Ward of Ash') ? '<p>The Ferrywoman\'s ash-wood charm warms when the nearest shade turns toward you.</p>' : ''}`,
    check: {
      stat: 'WIS', dc: 13, text: 'Find a path through the procession without waking its wardens.',
      bonus: (s) => (s.flags.bell || has(s, 'Ward of Ash') ? 2 : 0),
      bonusLabel: 'Lessons of Kaldra', success: 's3-gate', failure: 's3-procession-fight',
    },
  },
  's3-procession-fight': {
    title: 'The Candle Warden',
    text: `<p>A tall figure turns, its candle flaring blue. The procession parts, leaving you alone with
      the armored keeper of the road. Behind it, the city gate stands open.</p>`,
    combat: { name: 'Candle Warden', hp: 18, dc: 12, damage: [3, 6], win: 's3-gate' },
  },
  's3-aqueduct': {
    title: 'Water Above the Graves',
    text: `<p>The aqueduct runs over the rooftops of a buried district. Its narrow ledge is glazed with
      ice; below, a channel of black water flows uphill toward the palace.</p>`,
    choices: [
      { text: '[Rogue] Follow the maintenance footholds unseen.', to: 's3-gate', show: isClass('rogue') },
      { text: 'Balance along the icy ledge.', to: 's3-ledge', show: (s) => s.cls !== 'rogue' },
    ],
  },
  's3-ledge': {
    title: 'A Step Above Darkness',
    text: `<p>The stone shifts under your boots. You spread your arms, keeping the Lantern well clear
      of the water reaching toward its flame.</p>`,
    check: { stat: 'DEX', dc: 12, text: 'Cross the damaged aqueduct.', success: 's3-gate', failure: 's3-fall' },
  },
  's3-fall': {
    title: 'The Hungry Channel',
    text: `<p>You slip into the channel and scramble out through a drainage grate. Cold fingers tear at
      your cloak, but the Lantern stays above the water. You emerge beside the palace gate.</p>`,
    onEnter: (s) => { s.hp -= 4; return 'Lost 4 Endurance.'; },
    choices: [{ text: 'Approach the palace.', to: 's3-gate' }],
  },
  's3-gate': {
    title: 'The Fourfold Seal',
    text: `<p>The palace doors are bound by four links of shadow. A stone guardian sleeps beside them,
      its sword across its knees. Each link bears a different mark: a fist, an open eye, a rune,
      and a rising sun.</p>
      <p>Break a link cleanly and its power may turn against the King. Fail, and the guardian will wake.</p>`,
    choices: [
      { text: '[Warrior] Break the iron housing around the fist.', to: 's3-force', show: isClass('warrior') },
      { text: '[Rogue] Find the hidden catch beneath the eye.', to: 's3-lock', show: isClass('rogue') },
      { text: '[Mage] Unweave the binding rune.', to: 's3-rune', show: isClass('mage') },
      { text: '[Cleric] Restore the sun-mark with a prayer.', to: 's3-prayer', show: isClass('cleric') },
      { text: 'Wake the guardian and fight for entry.', to: 's3-guardian' },
    ],
  },
  's3-force': {
    title: 'Iron Against Iron',
    text: `<p>You wedge your weapon beneath the housing and brace against the door.</p>`,
    check: { stat: 'STR', dc: 13, text: 'Break the binding without shattering its power.', success: 's3-seal', failure: 's3-guardian' },
  },
  's3-lock': {
    title: 'The Eye That Never Closes',
    text: `<p>The carved eye follows your hands. You work by touch, keeping your face outside its gaze.</p>`,
    check: { stat: 'DEX', dc: 13, text: 'Release the seal without waking its watcher.', success: 's3-seal', failure: 's3-guardian' },
  },
  's3-rune': {
    title: 'A Spell Written Backward',
    text: `<p>The rune is a ward turned inside out. You trace its beginning and refuse its promised end.</p>`,
    check: { stat: 'INT', dc: 13, text: 'Turn the binding back upon its maker.', success: 's3-seal', failure: 's3-guardian' },
  },
  's3-prayer': {
    title: 'Morning Beneath the Earth',
    text: `<p>You press your holy symbol against the sun-mark. Beneath the stone, something remembers warmth.</p>`,
    check: { stat: 'WIS', dc: 13, text: 'Restore the ward\'s forgotten purpose.', success: 's3-seal', failure: 's3-guardian' },
  },
  's3-seal': {
    title: 'A Link Unbound',
    text: `<p>The shadow link turns to silver and falls into your hand. The doors open without a sound.
      You hang the freed link from the Lantern; it shines like a small, patient star.</p>`,
    onEnter: (s) => { s.flags.crownSeal = true; return 'Freed the palace seal (+1 to the final Wisdom check).'; },
    choices: [{ text: 'Enter the palace.', to: 's3-hall' }],
  },
  's3-guardian': {
    title: 'The Last Palace Guard',
    text: `<p>The stone guardian rises. Dust spills from its joints as it lifts a sword wide enough to
      bar the entire doorway. You must pass through its reach to enter the palace.</p>`,
    combat: { name: 'Palace Guardian', hp: 21, dc: 13, damage: [4, 7], win: 's3-hall' },
  },
  's3-hall': {
    title: 'The Hall of Unfinished Lives',
    text: `<p>The palace is filled with ordinary things: a child's wooden horse, a half-written letter,
      bread turned to stone. The King did not only steal lives. He stopped them in the middle.</p>
      <p>Beyond the hall stand an archive, a little mourning bell, and the doors of the throne room.
      A sheltered alcove offers a moment to tend your wounds.</p>`,
    choices: [
      { text: 'Search the royal archive.', to: 's3-archive', show: (s) => !s.flags.crownArchive },
      { text: 'Examine the mourning bell.', to: 's3-bell', show: (s) => !s.flags.crownBellTried },
      { text: 'Rest in the alcove.', to: 's3-rest', show: (s) => !s.flags.crownRest },
      { text: 'Open the throne-room doors.', to: 's3-throne' },
    ],
  },
  's3-archive': {
    title: 'The Promise Before the Crown',
    text: (s) => `
      <p>Royal decrees crumble beneath your fingers. One older page records a king's promise never to
      let his people die. Beneath it, another hand has written: "He kept the words, and broke the meaning."</p>
      ${s.flags.trueName ? '<p>You remember Vesh Calloway. A stolen soul can still hear the name it once answered to.</p>' : ''}`,
    onEnter: (s) => { s.flags.crownArchive = true; },
    check: {
      stat: 'INT', dc: 13, text: 'Recover the King\'s name and the wording of his oath.',
      bonus: (s) => (s.flags.trueName ? 2 : 0), bonusLabel: 'Vesh\'s true name',
      success: 's3-name', failure: 's3-archive-lost',
    },
  },
  's3-name': {
    title: 'Ardan, Who Feared the Dawn',
    text: `<p><strong>Ardan</strong>. The name survives beneath the seal. His oath was not to rule forever,
      but to shelter his people until morning. The crown has taught him to confuse the two.</p>
      <p>If you can make him remember the difference, you may weaken him without surrendering the Lantern.</p>`,
    onEnter: (s) => { s.flags.kingName = true; return 'Learned the King\'s name and oath.'; },
    choices: [{ text: 'Return to the hall.', to: 's3-hall' }],
  },
  's3-archive-lost': {
    title: 'Ink Beneath the Dust',
    text: `<p>The name flakes away before you can read it. Only the impression of a crown remains.
      Whatever promise began this tragedy, the throne room must hold its end.</p>`,
    choices: [{ text: 'Return to the hall.', to: 's3-hall' }],
  },
  's3-bell': {
    title: 'One Note for the Living',
    text: (s) => `
      <p>A small bronze bell hangs above a list of the city's dead. Its clapper is bound in shadow.</p>
      ${s.flags.bell ? '<p>You recognize the shape of its inscription from Kaldra. This bell needs a clear note, not brute force.</p>' : ''}`,
    onEnter: (s) => { s.flags.crownBellTried = true; },
    choices: [
      { text: 'Use the lesson of Kaldra to free the clapper.', to: 's3-bell-song', show: (s) => s.flags.bell },
      { text: 'Pull the clapper free.', to: 's3-bell-check', show: (s) => !s.flags.bell },
    ],
  },
  's3-bell-check': {
    title: 'The Weight of Silence',
    text: `<p>You take hold of the clapper. The shadow resists like cold iron.</p>`,
    check: { stat: 'STR', dc: 12, text: 'Free the mourning bell.', success: 's3-bell-song', failure: 's3-bell-hurt' },
  },
  's3-bell-song': {
    title: 'A City Remembers',
    text: `<p>The bell rings once. Doors open along the empty streets. Pale faces turn toward the palace,
      and from the throne room comes a cry of fear: the King can no longer hide his people from the dawn.</p>`,
    onEnter: (s) => { s.flags.kingBell = true; return 'The mourning bell has weakened the Hollow King.'; },
    choices: [{ text: 'Return to the hall.', to: 's3-hall' }],
  },
  's3-bell-hurt': {
    title: 'A Silence That Bites',
    text: `<p>The shadow snaps across your hands. You step back, fingers numb. The bell will not ring
      for you, but the Lantern still burns.</p>`,
    onEnter: (s) => { s.hp -= 3; return 'Lost 3 Endurance.'; },
    choices: [{ text: 'Return to the hall.', to: 's3-hall' }],
  },
  's3-rest': {
    title: 'A Small Circle of Warmth',
    text: `<p>You set the Lantern in the alcove and bind your wounds in its light. For a moment, you can
      hear Thornwick's well and Dunmere's gulls instead of the silence of the buried city.</p>
      <p>The oil is precious. You cannot afford another rest here.</p>`,
    onEnter: (s) => {
      s.flags.crownRest = true;
      s.hp = Math.min(s.maxHp, s.hp + 8);
      return 'Recovered up to 8 Endurance.';
    },
    choices: [{ text: 'Return to the hall.', to: 's3-hall' }],
  },
  's3-throne': {
    title: 'The Hollow King',
    text: (s) => `
      <p>A crown of black glass floats above a throne of roots. Beneath it sits a man so thin that
      starlight shows through his hands. He looks past you to the Lantern.</p>
      <p>"I asked only for one more night," he says. "Give me the light, and none of them need ever leave."</p>
      ${s.flags.kingBell ? '<p>The mourning bell still trembles in his bones. His shadow cannot keep its shape.</p>' : ''}
      ${s.storyOutcomes.lantern === 'dim' ? '<p>A blue thread reaches from the weakened Lantern toward his crown. He smiles as it feeds him.</p>' : ''}`,
    choices: [
      { text: 'Call him Ardan and remind him of his oath.', to: 's3-oath', show: (s) => s.flags.kingName },
      { text: 'Refuse him and raise your weapon.', to: (s) => s.flags.kingBell ? 's3-king-weakened' : s.storyOutcomes.lantern === 'dim' ? 's3-king-empowered' : 's3-king' },
    ],
  },
  's3-oath': {
    title: 'Until Morning',
    text: `<p>"You promised to shelter them until morning, Ardan. Not to steal the morning."</p>
      <p>The King looks toward the doors, where his people wait. His crown tightens like a trap.
      "Then break it," he whispers. The shadow rises to fight without him.</p>`,
    choices: [{ text: 'Face the crown\'s shadow.', to: 's3-king-weakened' }],
  },
  's3-king': {
    title: 'The Last Night',
    text: `<p>The King stands, drawing every shadow in the hall around him. Your Lantern is a single
      golden point against a darkness that has waited centuries for this moment.</p>`,
    combat: { name: 'Hollow King', hp: 32, dc: 14, damage: [5, 8], win: 's3-crown' },
  },
  's3-king-empowered': {
    title: 'The Light He Tasted',
    text: `<p>The blue edge of the Lantern's flame lashes toward the crown. The King drinks its stolen
      strength, growing taller than his throne. What began at Kaldra must be ended here.</p>`,
    combat: { name: 'Hollow King, Unbound', hp: 36, dc: 15, damage: [5, 8], win: 's3-crown' },
  },
  's3-king-weakened': {
    title: 'The Crown Without a King',
    text: `<p>The black crown rises on a body of unraveling shadow. It strikes with a thousand grasping
      hands, but through the gaps you can see the first pale line of morning.</p>`,
    combat: { name: 'Shadow of the Crown', hp: 24, dc: 12, damage: [4, 7], win: 's3-crown' },
  },
  's3-crown': {
    title: 'The Last Flame',
    text: (s) => `
      <p>The crown falls at your feet, unbroken. Within its glass, a small dark shape beats like a heart.
      Beyond the windows, the waiting dead turn their faces toward you.</p>
      <p>You open the Lantern and let its light fall upon the crown. To free the city, you must hold
      that light steady while the whole weight of its stolen night pushes back.</p>
      ${s.flags.crownSeal ? '<p>The silver link you freed holds the shadows in place.</p>' : ''}
      ${s.storyOutcomes['ashen-tide'] === 'cleansed' ? '<p>The pearl sliver answers with the light of Dunmere.</p>' : ''}`,
    check: {
      stat: 'WIS', dc: 14, text: 'Unmake the crown and release the city.',
      bonus: (s) => (s.flags.crownSeal ? 1 : 0) + (has(s, 'Ward of Ash') ? 1 : 0)
        + (s.storyOutcomes.lantern === 'dawn' ? 1 : 0) + (s.storyOutcomes['ashen-tide'] === 'cleansed' ? 1 : 0),
      bonusLabel: 'Light gathered across your journey', success: 's3-dawn', failure: 's3-watch',
    },
  },
  's3-dawn': {
    title: 'A Morning for Everyone',
    ending: 'victory', storyId: 'hollow-crown', outcome: 'freed',
    text: (s) => `
      <p>The crown cracks from rim to heart. Sunlight fills the palace, and the waiting dead dissolve
      into a hundred small, ordinary sounds: laughter, footsteps, a door closing gently.</p>
      ${s.flags.kingName ? '<p>For a moment Ardan stands among them, no taller than anyone else. He bows his uncovered head, and is gone.</p>' : ''}
      <p>You return the Lantern to Thornwick. In Dunmere, the boats put out on a clear sea. No bells
      ring in alarm that spring.</p>
      <p>They tell many tales of ${s.name} the ${CLASSES[s.cls].name}. Your favorite ends simply:
      at last, the people of Caer Hollow were allowed to go home.</p>`,
  },
  's3-watch': {
    title: 'The Keeper of the Last Light',
    ending: 'victory', storyId: 'hollow-crown', outcome: 'bound',
    text: (s) => `
      <p>You cannot break the crown, but you can deny it a king. You lower it into the Lantern's
      golden flame and close the door. The glass turns clear. Beyond the palace, the dead find rest.</p>
      <p>Thornwick and Dunmere are safe. Yet the Lantern must never go out, and someone must remain
      to tend it. You take the first watch as daylight crosses the empty throne.</p>
      <p>When travelers speak of ${s.name}, they speak not only of battles won, but of a promise kept.
      The Hollow King will never rule again while your light endures.</p>`,
  },
  death: {
    number: '✝', title: 'Your Adventure Ends Here',
    ending: 'death',
    text: (s) => s.completedStories.includes('ashen-tide')
      ? `<p>Your strength fails and the Lantern's light dwindles. In Caer Hollow, the crown turns
        toward its empty throne. Far away, the bells of Thornwick begin to ring...</p>`
      : `<p>Your strength fails and the world goes dark. Far to the south, in Thornwick, the last oil
        in the village lamps burns low as the new moon rises...</p>`,
  },
};
