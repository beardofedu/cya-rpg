const CLASS_NAMES_ES = {
  warrior: 'Guerrero',
  rogue: 'Pícaro',
  mage: 'Mago',
  cleric: 'Clérigo',
};

const STORY_ES = {
  1: {
    title: 'La luz robada',
    text: (s) => `
      <p>Las campanas de Thornwick repican cuando llegas, no por celebración, sino por alarma.
      La anciana Maren te recibe junto al pozo, con sus ropas de guardiana de la linterna rotas y cubiertas de hollín.</p>
      <p>«La <em>linterna del Alba</em> ha desaparecido», dice. «Una figura encapuchada atravesó nuestras protecciones
      como si fueran niebla. Sus huellas llevan al norte, hacia las ruinas del monasterio de Kaldra. Sin la linterna,
      los muertos del Rey Hueco se alzarán con la próxima luna nueva, dentro de tres noches».</p>
      <p>Te pone una pequeña bolsa en la mano. «Es todo lo que puede ofrecer la aldea. Por favor, ${s.name}».</p>`,
    choices: [
      { text: 'Visitar el mercado antes de partir.' },
      { text: 'Tomar de inmediato el camino del norte.' },
    ],
  },
  2: {
    title: 'El mercado de Thornwick',
    text: `<p>La mayoría de los puestos están cerrados, pero el viejo comerciante Bram sigue vendiendo a quienes tienen
      el valor de abandonar la aldea. «La cuerda cuesta cinco monedas de oro. Las pociones, ocho. No encontrarás nada mejor antes de Kaldra».</p>`,
    choices: [
      { text: 'Comprar un rollo de cuerda (5 de oro).', reqText: (s) => has(s, 'Rope') ? 'ya la tienes' : 'necesitas 5 de oro' },
      { text: 'Comprar una poción curativa (8 de oro).', reqText: () => 'necesitas 8 de oro' },
      { text: 'Salir del mercado y tomar el camino del norte.' },
    ],
  },
  3: {
    title: 'El camino de Thornwood',
    text: `<p>El camino del norte serpentea por Thornwood, donde los árboles crecen tan juntos que sus ramas se entrelazan
      sobre tu cabeza. Al cabo de una hora, la luz del día no es más que un recuerdo gris. En algún lugar fuera del sendero,
      algo grande se mueve entre la maleza... y luego queda completamente inmóvil.</p>`,
    check: { text: 'Haz una prueba de Sabiduría para percibir el peligro antes de que ataque.' },
  },
  4: {
    title: '¡Emboscada!',
    text: `<p>Oyes el gruñido cuando ya es demasiado tarde. Dos lobos grises, con las costillas marcadas bajo el pelaje
      sarnoso, saltan de las zarzas. Sus ojos brillan con una tenue luz verde: el hambre del Rey Hueco ya habita en ellos.</p>`,
    combat: { name: 'Lobos de ojos huecos' },
  },
  5: {
    title: 'El escondite del cazador',
    text: `<p>Te apartas del camino y esperas. Dos lobos de ojos verdes pasan sigilosamente, con el hocico pegado al suelo,
      y pierden tu rastro junto al arroyo. Siguiendo sus huellas en sentido contrario, encuentras un campamento de cazador
      abandonado a toda prisa. Bajo una piedra suelta hay un pequeño alijo.</p>`,
    choices: [{ text: 'Continuar hacia el norte.' }],
  },
  6: {
    title: 'La piedra partida',
    text: (s) => `
      <p>Al anochecer llegas a una enorme roca partida limpiamente en dos. Más allá, el sendero se bifurca.</p>
      <p>Al este ruge el río Greywater, crecido por el deshielo. En algún lugar de sus orillas hay un vado.
      Al oeste, la boca negra de la antigua mina de plata de Kaldra se adentra en la ladera:
      un camino más corto, si las historias sobre lo que vive dentro son falsas.</p>
      ${s.cls === 'rogue' ? '<p><em>Tu mirada experta distingue huellas recientes de botas que se dirigen a la mina. Botas pequeñas. Trasgos.</em></p>' : ''}`,
    choices: [
      { text: 'Registrar la torre de vigilancia en ruinas.' },
      { text: 'Ir al este, hacia el vado del río.' },
      { text: 'Entrar en la mina abandonada.' },
    ],
  },
  'watchtower-check': {
    title: 'La vieja torre de vigilancia',
    text: `<p>La torre se inclina sobre el camino; sus pisos superiores se han derrumbado. Entras por una brecha
      en la piedra y registras los escombros en busca de algo que los antiguos guardias hayan dejado atrás.</p>`,
    check: { text: 'Haz una prueba de Destreza para registrar la torre inestable.' },
  },
  'watchtower-cache': {
    title: 'El escondite del capitán de la guardia',
    text: `<p>Detrás de una viga caída encuentras un arco en buen estado y una cota de malla envuelta en tela encerada.
      El viejo equipo del capitán de la guardia puede resultarte útil.</p>`,
    choices: [{ text: 'Volver a la bifurcación del camino.' }],
  },
  'watchtower-fall': {
    title: 'Una torre que se desmorona',
    text: `<p>El suelo cede bajo tus pies. Atraviesas una viga podrida al caer y aterrizas con fuerza entre
      los hierbajos de abajo. La torre no tiene nada más que ofrecer.</p>`,
    choices: [{ text: 'Volver a la bifurcación del camino.' }],
  },
  7: {
    title: 'El Greywater',
    text: `<p>El vado apenas es una hilera de piedras resbaladizas bajo aguas blancas y revueltas.
      En cada orilla queda un viejo poste de hierro del que antaño colgaba una cuerda guía.</p>`,
    choices: [
      { text: 'Atar tu cuerda entre los postes y cruzar sin peligro.', reqText: () => 'requiere cuerda' },
      { text: 'Desafiar la corriente sin cuerda.' },
    ],
  },
  'ford-check': {
    title: 'Dentro de la corriente',
    text: `<p>Te adentras en el agua. El frío te oprime el pecho como un puño, y el río tira con fuerza de tus piernas.</p>`,
    check: { text: 'Haz una prueba de Fuerza para luchar contra la corriente.' },
  },
  9: {
    title: 'A merced del río',
    text: `<p>El pie te resbala. El Greywater te atrapa y te golpea contra las rocas antes de arrojarte,
      sin aliento, a la otra orilla, cuatrocientos metros río abajo.</p>`,
    choices: [{ text: 'Ponerte en pie como puedas y seguir adelante.' }],
  },
  8: {
    title: 'La barquera',
    text: `<p>En la otra orilla hay una cabaña torcida de cuya chimenea sale una espiral de humo. En el escalón de entrada,
      una mujer más anciana que ninguna que hayas visto remienda una red.</p>
      <p>«Pocos cruzan hacia Kaldra en estos tiempos», dice. «Responde a mi acertijo y te daré algo
      que mantenga lejos de ti la fría oscuridad:</p>
      <p><em>“Tengo boca, pero nunca como; lecho, pero nunca duermo; corro, pero nunca camino”</em>».</p>`,
    check: { text: 'Haz una prueba de Intelecto para resolver el acertijo.' },
  },
  'riddle-win': {
    title: 'Un río',
    text: `<p>«Un río», respondes. Ella suelta una carcajada de alegría y te cuelga del cuello un amuleto de madera
      de fresno entretejida. «El <strong>Amuleto de fresno</strong>. Cuando la oscuridad intente apoderarse de lo que brilla, mantenlo cerca».</p>`,
    choices: [{ text: 'Darle las gracias y subir hacia el monasterio.' }],
  },
  'riddle-lose': {
    title: 'Sin respuesta',
    text: `<p>Le das vueltas a las palabras hasta que la anciana se encoge de hombros y vuelve a su red. «Un río, cariño.
      Siempre es un río». No dice nada más.</p>`,
    choices: [{ text: 'Subir hacia el monasterio.' }],
  },
  10: {
    title: 'La mina de Kaldra',
    text: (s) => `
      <p>La mina está completamente a oscuras y huele a humo antiguo. A una docena de pasos, el túnel desemboca
      en un abismo cruzado por un puente de cuerda al que le faltan la mitad de los tablones.</p>
      ${s.cls === 'mage' ? '<p><em>Murmuras una palabra y una esfera de luz pálida florece sobre tu palma, revelando cada tablón podrido.</em></p>' : ''}`,
    choices: [
      { text: 'Usar tu luz mágica para encontrar un paso seguro.' },
      { text: 'Cruzar el puente con cuidado en la oscuridad.' },
    ],
  },
  'bridge-check': {
    title: 'El puente roto',
    text: `<p>Cada paso es una apuesta. Las cuerdas crujen y oscilan bajo tus pies.</p>`,
    check: { text: 'Haz una prueba de Destreza para mantener el equilibrio.' },
  },
  12: {
    title: 'Una larga caída',
    text: `<p>Un tablón se rompe. Te precipitas al vacío, atrapas una cuerda con una mano y consigues trepar
      hasta el otro lado, con las palmas ensangrentadas y el hombro torcido.</p>`,
    choices: [{ text: 'Adentrarte más en la mina.' }],
  },
  11: {
    title: 'Luz de linternas trasgas',
    text: `<p>Más adelante brilla una hoguera. Un grupo de trasgos se acuclilla alrededor del fuego en una antigua
      cámara de mineral. Su jefe, un bruto lleno de cicatrices que les dobla en tamaño, lleva una pesada <strong>llave
      de hierro</strong> colgada al cuello con una tira de cuero. Más allá, un túnel asciende hacia el aire fresco, hacia Kaldra.</p>`,
    choices: [
      { text: 'Cargar contra el jefe.' },
      { text: 'Intentar pasar a escondidas junto a la pared de la cámara.' },
      { text: '[Pícaro] Colarte y robarle la llave del cuello.' },
    ],
  },
  'sneak-check': {
    title: 'Entre las sombras',
    text: `<p>Te pegas a la piedra fría y avanzas poco a poco, con sumo cuidado.</p>`,
    check: { text: 'Haz una prueba de Destreza para pasar sin que te vean.' },
  },
  'rogue-key': {
    title: 'Dedos ágiles',
    text: `<p>Los trasgos duermen con un ojo abierto, pero beben con los dos cerrados. Te deslizas por la luz de la hoguera
      como el humo, cortas la tira de cuero y desapareces antes de que el jefe termine de eructar.</p>`,
    choices: [{ text: 'Subir hacia el monasterio.' }],
  },
  13: {
    title: 'El jefe trasgo',
    text: `<p>Con un aullido, el jefe arroja su cena a un lado y empuña un garrote con púas. Su banda se aparta
      para mirar: a los trasgos les encanta una buena pelea, siempre que sea de otros.</p>`,
    combat: { name: 'Jefe trasgo' },
  },
  'goblin-win': {
    title: 'El botín',
    text: `<p>El jefe cae y el resto de la banda huye dando alaridos hacia los túneles profundos.
      Tomas la llave de hierro de su cuello y unas monedas de su bolsa.</p>`,
    choices: [{ text: 'Subir hacia el monasterio.' }],
  },
  14: {
    title: 'Las puertas de Kaldra',
    text: `<p>El monasterio se aferra a la ladera como una corona rota. Su puerta de hierro está cerrada con llave,
      y sus muros resbalan de escarcha. En la ventana más alta parpadea una luz azul y fría:
      la linterna robada, que arde de forma antinatural.</p>
      <p>Junto a la puerta, medio enterrado en la nieve, aún se alza un pequeño santuario de la Madre del Alba.</p>`,
    choices: [
      { text: 'Abrir la puerta con la llave de hierro.', reqText: () => 'requiere llave de hierro' },
      { text: '[Pícaro] Forzar la cerradura.' },
      { text: '[Clérigo] Rezar en el santuario de la Madre del Alba.' },
      { text: 'Escalar el muro helado.' },
    ],
  },
  'lockpick-check': {
    title: 'Los mecanismos de la cerradura',
    text: `<p>La cerradura es vieja y está rígida por la escarcha, pero toda cerradura es un acertijo que exige paciencia.</p>`,
    check: { text: 'Haz una prueba de Destreza para forzar la cerradura.' },
  },
  'climb-check': {
    title: 'El muro helado',
    text: `<p>Encuentras asideros en la argamasa que se desmorona y empiezas a trepar.</p>`,
    check: { text: 'Haz una prueba de Fuerza para escalar el muro.' },
  },
  15: {
    title: 'Hielo y piedra',
    text: `<p>Cerca de la cima pierdes el agarre y caes con fuerza sobre la nieve del patio. Has logrado entrar,
      pero el ruido ha despertado algo.</p>`,
    choices: [{ text: 'Levantarte y hacerle frente.' }],
  },
  16: {
    title: 'El patio de los huesos',
    text: (s) => `
      <p>El patio es un cementerio de monjes caídos. Mientras lo cruzas, la nieve se agita. Un esqueleto con la cota
      oxidada de un guardia del templo se incorpora trabajosamente, con fuego azul en las cuencas de los ojos.</p>
      ${s.cls === 'cleric' ? '<p><em>Tu símbolo sagrado se calienta. La luz de la Madre del Alba podría hacer retroceder a esa criatura.</em></p>' : ''}`,
    choices: [
      { text: '[Clérigo] Alzar tu símbolo sagrado y ahuyentar al no muerto.' },
      { text: 'Luchar contra el guardia esqueleto.' },
    ],
  },
  'turn-check': {
    title: 'Ahuyentar a los no muertos',
    text: `<p>Alzas el disco solar de la Madre del Alba y pronuncias las Palabras de la Mañana.</p>`,
    check: { text: 'Haz una prueba de Sabiduría para ahuyentar al no muerto.' },
  },
  'skeleton-fight': {
    title: 'El guardia esqueleto',
    text: `<p>El esqueleto alza una alabarda mellada y avanza con una paciencia aterradora.</p>`,
    combat: { name: 'Guardia esqueleto' },
  },
  17: {
    title: 'La bendición de la Madre del Alba',
    text: `<p>Retiras la nieve del santuario y te arrodillas. Un calor se extiende por tu cuerpo como el amanecer. Cuando
      abres los ojos, una puerta oculta se ha abierto en el muro junto al santuario: el paso de los peregrinos,
      que conduce directamente a la sala interior del monasterio.</p>`,
    choices: [{ text: 'Entrar por el paso de los peregrinos.' }],
  },
  18: {
    title: 'La sala interior',
    text: `<p>La sala interior es inmensa y silenciosa. A tu izquierda hay una biblioteca de estantes podridos; a tu derecha,
      una escalera de caracol sube al campanario. Arriba, a través del techo, oyes una voz que entona un cántico
      y sientes el pulso frío de la linterna robada.</p>`,
    choices: [
      { text: 'Buscar en la biblioteca información sobre el ladrón.' },
      { text: 'Subir al campanario.' },
      { text: 'Subir directamente al santuario.' },
    ],
  },
  19: {
    title: 'La biblioteca',
    text: `<p>La mayoría de los libros se ha podrido hasta volverse pulpa, pero sobre el escritorio del abad sobrevive
      un registro encadenado. Enumera a todos los monjes de Kaldra, y hay un nombre tachado con tanta fuerza que rasgó la página.</p>`,
    check: { text: 'Haz una prueba de Intelecto para descifrar el nombre tachado.' },
  },
  'name-win': {
    title: 'Un nombre verdadero',
    text: `<p>Al poner la página a contraluz, sigues los surcos de la pluma: <strong>Vesh Calloway</strong>,
      novicio, expulsado por «comunión con el Hueco». El ladrón fue monje aquí, y un nombre verdadero
      tiene poder sobre quienes se han vendido a la oscuridad.</p>`,
    choices: [{ text: 'Subir al santuario.' }],
  },
  'name-lose': {
    title: 'Perdido en el tiempo',
    text: `<p>No consigues descifrar los tachones. Fuera quien fuera, los monjes querían que cayera en el olvido.</p>`,
    choices: [{ text: 'Subir al santuario.' }],
  },
  21: {
    title: 'El campanario',
    text: `<p>En lo alto de la torre cuelga la gran campana de bronce de Kaldra, verde por el paso del tiempo. Una inscripción
      reza: <em>«Mi voz hace retroceder al Hueco».</em> La cuerda se pudrió hace mucho.</p>`,
    check: { text: 'Haz una prueba de Fuerza para balancear la campana a mano.' },
  },
  'bell-win': {
    title: 'La voz de Kaldra',
    text: `<p>Empujas la campana hasta que se balancea, y entonces <em>canta</em>. La nota hace vibrar
      la piedra. Arriba, el cántico titubea y un grito de furia resuena por la escalera.</p>`,
    choices: [{ text: 'Correr hacia el santuario.' }],
  },
  'bell-lose': {
    title: 'Demasiado pesada',
    text: `<p>La campana no se mueve y te lastimas la espalda al intentarlo. La dejas sumida en su silencio.</p>`,
    choices: [{ text: 'Subir al santuario.' }],
  },
  20: {
    title: 'El santuario',
    text: (s) => `
      <p>El techo del santuario está abierto a las estrellas. En el centro, sobre el viejo altar, descansa
      la <em>linterna del Alba</em>, con su llama dorada retorcida en un azul enfermizo. Ante ella se alza una figura
      demacrada con una túnica gris de monje, las manos elevadas, entonando un cántico.</p>
      <p>El ladrón se vuelve. Tiene el rostro de un joven, consumido por un hambre que no es de comida.
      «Llegas demasiado tarde», susurra. «El Rey Hueco ya me escucha».</p>
      ${s.flags.bell ? '<p><em>Le brota sangre de los oídos: la nota de la campana aún le resuena en los huesos.</em></p>' : ''}`,
    choices: [
      { text: 'Pronunciar su nombre verdadero: «Vesh Calloway».', reqText: () => 'no conoces su nombre' },
      { text: '[Mago] Deshacer su oscuro ritual con un contrahechizo.' },
      { text: '¡Atacar!' },
    ],
  },
  'counter-check': {
    title: 'Contrahechizo',
    text: `<p>Atrapas los hilos de su ritual y tiras de ellos.</p>`,
    check: { text: 'Haz una prueba de Intelecto para deshacer el ritual.' },
  },
  22: {
    title: 'Vesh, siervo del Hueco',
    text: `<p>De las mangas de Vesh brotan sombras que se condensan en garras. Se lanza contra ti con toda
      la terrible fuerza del Rey Hueco.</p>`,
    combat: { name: 'Vesh, siervo del Hueco' },
  },
  23: {
    title: 'Vesh, despojado de su poder',
    text: (s) => `
      <p>${s.flags.trueName ? 'Al oír su nombre, Vesh se estremece como si lo hubieran golpeado. Por un instante, el joven novicio asoma aterrorizado tras aquellos ojos.' : 'La oscuridad que rodea a Vesh vacila y se disipa. Su poder se ha roto, pero no piensa rendirse.'}
      Con un alarido se abalanza sobre ti, con sus garras de sombra débiles y parpadeantes.</p>`,
    combat: { name: 'Vesh, debilitado' },
  },
  24: {
    title: 'La linterna del Alba',
    text: (s) => `
      <p>Vesh se desploma en un montón de túnicas grises y ceniza flotante. Levantas la linterna del altar.
      Está helada entre tus manos; su llama sigue siendo de un azul corrupto y susurra con una voz que no es
      una voz.</p>
      <p>Tendrás que adentrarte en la propia luz y llamar al alba para que regrese a ella.</p>
      ${has(s, 'Ward of Ash') ? '<p><em>El Amuleto de fresno se calienta contra tu pecho.</em></p>' : ''}`,
    check: { text: 'Haz una prueba de Sabiduría para purificar la linterna.', bonusLabel: 'Amuleto de fresno' },
  },
  25: {
    title: 'El regreso del alba',
    text: (s) => `
      <p>El fuego azul se estremece, lucha contra ti y se quiebra. El oro inunda de nuevo la linterna con tanta intensidad
      que todo el monasterio en ruinas se ilumina como a mediodía. Por la ladera, los muertos inquietos
      vuelven a hundirse en sus tumbas.</p>
      <p>Tres días después regresas a Thornwick con la linterna del Alba ardiendo con su luz verdadera entre tus manos.
      Vuelven a repicar las campanas, esta vez por celebración. Durante mucho tiempo se cantarán canciones de ${s.name},
      el ${CLASS_NAMES_ES[s.cls]}.</p>`,
  },
  26: {
    title: 'Una luz más tenue',
    text: (s) => `
      <p>Viertes tu voluntad en la llama hasta que apenas puedes mantenerte en pie. El azul se desvanece, pero el oro
      que regresa es pálido y débil, como el sol de invierno.</p>
      <p>Es suficiente. Los muertos de la montaña se aquietan y Thornwick está a salvo por ahora. Pero el rostro de la anciana
      Maren es grave cuando recibe la linterna de tus manos. «Habrá que cuidarla», dice. «El Rey Hueco
      ha probado su luz. Volverá».</p>
      <p>Quizá tú también vuelvas, ${s.name}.</p>`,
  },
  's2-1': {
    title: 'La marea de ceniza',
    text: (s) => `
      <p>Tres semanas después del regreso de la linterna, llega un jinete de la costa sur. Unas aguas grises
      están inundando la aldea pesquera de Dunmere y los muertos salen caminando de la marea.</p>
      <p>El jinete te reconoce, ${s.name}, y te ruega que encuentres el origen antes de la próxima pleamar.</p>`,
    choices: [
      { text: 'Buscar la bendición de la Madre del Alba antes de partir.' },
      { text: 'Cabalgar de inmediato hacia el sur.' },
    ],
  },
  's2-shrine': {
    title: 'Una plegaria por Dunmere',
    text: `<p>En el santuario de la aldea, pides a la Madre del Alba que te guíe a través de la marisma inundada.</p>`,
    check: { text: 'Haz una prueba de Sabiduría para recibir la bendición del santuario.' },
  },
  's2-blessing': {
    title: 'Luz en la niebla',
    text: `<p>Un cálido resplandor se posa sobre ti. La marisma puede estar a oscuras, pero no tendrás que afrontarla en soledad.</p>`,
    choices: [{ text: 'Cabalgar hacia el sur, a Dunmere.' }],
  },
  's2-cross': {
    title: 'El camino anegado',
    text: `<p>La calzada ha desaparecido bajo la inundación. Avanzas con cuidado entre piedras semisumergidas
      mientras manos frías emergen de las aguas negras.</p>`,
    check: { text: 'Haz una prueba de Destreza para cruzar la calzada inundada.' },
  },
  's2-drowned-fight': {
    title: 'Manos bajo el agua',
    text: `<p>Los muertos salen arrastrándose del agua y bloquean la calzada. No tienes más remedio que luchar.</p>`,
    combat: { name: 'Muertos ahogados' },
  },
  's2-watch': {
    title: 'El faro sumergido',
    illustration: {
      alt: 'Un faro azotado por la tormenta sobre una aldea inundada, con una perla negra que brilla bajo las olas.',
      caption: 'El faro sumergido, donde la marea de ceniza se reúne bajo Dunmere.',
    },
    text: `<p>El faro de Dunmere se alza sobre una roca por encima de la marea. Su lámpara está apagada y un rastro
      de agua de mar negra lleva desde el sótano hasta la sala del farero.</p>`,
    choices: [
      { text: 'Registrar el almacén del farero.' },
      { text: 'Entrar en la sala del farero.' },
    ],
  },
  's2-cache': {
    title: 'Las provisiones del farero',
    text: `<p>Encuentras un cofre cerrado con viejo equipo del faro. Dentro hay una armadura resistente a las mareas
      y un arma adecuada para tu formación.</p>`,
    choices: [{ text: 'Entrar en la sala del farero.' }],
  },
  's2-keeper': {
    title: 'El farero ahogado',
    text: `<p>La sala del farero está inundada hasta la cintura. Una figura con un abrigo cubierto de percebes emerge
      del agua, aferrando una cadena de ancla oxidada. Su linterna arde con una llama negra.</p>`,
    combat: { name: 'Farero ahogado' },
  },
  's2-heart': {
    title: 'Bajo el faro',
    text: (s) => `
      <p>Detrás del escritorio del farero, una escalera desciende bajo las olas hasta una cámara donde el propio mar
      parece respirar. Una perla negra palpita en el centro, atrayendo a los muertos hacia Dunmere.</p>
      ${s.flags.tideBlessing || has(s, 'Ward of Ash') ? '<p><em>Tu amuleto protector brilla contra el frío.</em></p>' : ''}`,
    check: { text: 'Haz una prueba de Sabiduría para purificar la perla negra.', bonusLabel: 'Amuleto protector' },
  },
  's2-dawn': {
    title: 'La marea cambia',
    text: (s) => `
      <p>La luz inunda la perla negra, que se resquebraja con un sonido parecido a un trueno lejano. Los muertos
      se deshacen en espuma inofensiva. Al amanecer, el mar se ha retirado de las calles de Dunmere.</p>
      <p>Los aldeanos aclaman a ${s.name} por haber hecho retroceder la marea de ceniza.</p>`,
  },
  's2-dim': {
    title: 'Un mar en calma',
    text: `<p>Rompes la perla, aunque su oscuridad deja una marca en la cámara. Los muertos se hunden
      bajo las olas y Dunmere se salva, por ahora. Los aldeanos recordarán el precio de esa victoria.</p>`,
  },
  's3-1': {
    title: 'La corona de la noche hueca',
    text: (s) => `
      <p>En la primera mañana despejada tras el rescate de Dunmere, todas las campanas de Thornwick repican sin que
      nadie tire de sus cuerdas. La anciana Maren te encuentra junto al pozo. Esta vez trae la propia linterna.</p>
      <p>«La montaña y el mar no eran más que sus dedos», dice. «Debemos llegar a la mano». Más allá
      del paso del norte, la ciudad enterrada de Caer Hollow ha surgido de la nieve. En su corazón,
      el Rey Hueco reúne a sus muertos dispersos para una última marcha.</p>
      ${s.storyOutcomes.lantern === 'dim'
        ? '<p>La linterna aún arde con una luz débil y azulada en los bordes. Algo bajo la ciudad lejana responde a su parpadeo.</p>'
        : s.storyOutcomes.lantern === 'dawn'
          ? '<p>La linterna arde con el oro puro que restauraste en Kaldra. Maren sonríe. «Mantén viva esa alba».</p>'
          : '<p>Maren protege la linterna del viento. «Pase lo que haya pasado en Kaldra, su luz debe llegar a la ciudad».</p>'}
      ${s.storyOutcomes['ashen-tide'] === 'cleansed'
        ? '<p>Del asa cuelga una esquirla de la perla purificada que aún guarda una chispa de la luz que salvó Dunmere.</p>'
        : s.storyOutcomes['ashen-tide'] === 'scarred'
          ? '<p>Grietas ennegrecidas por la sal marcan el asa de la linterna. La herida bajo Dunmere no ha terminado de cerrarse.</p>'
          : ''}
      <p>Con provisiones de ambas aldeas, cruzas el paso. Un camino funerario conduce a las puertas de la ciudad;
      un acueducto roto ofrece otra forma de entrar.</p>`,
    choices: [
      { text: 'Seguir el camino funerario.' },
      { text: 'Trepar al acueducto roto.' },
    ],
  },
  's3-road': {
    title: 'La procesión sin pisadas',
    text: (s) => `
      <p>Cientos de ciudadanos muertos recorren el camino funerario, cada uno con una vela apagada. Ninguno proyecta
      sombra. Bajas la linterna y buscas un ritmo en su marcha silenciosa.</p>
      ${s.flags.bell ? '<p>Recuerdas la nota de Kaldra: los muertos titubean con el mismo intervalo.</p>' : ''}
      ${has(s, 'Ward of Ash') ? '<p>El Amuleto de fresno de la barquera se calienta cuando el espectro más cercano se vuelve hacia ti.</p>' : ''}`,
    check: { text: 'Encuentra un paso entre la procesión sin despertar a sus guardianes.', bonusLabel: 'Lecciones de Kaldra' },
  },
  's3-procession-fight': {
    title: 'El guardián de la vela',
    text: `<p>Una figura alta se vuelve y su vela estalla en una llamarada azul. La procesión se aparta, dejándote
      a solas con el guardián acorazado del camino. Detrás de él, la puerta de la ciudad permanece abierta.</p>`,
    combat: { name: 'Guardián de la vela' },
  },
  's3-aqueduct': {
    title: 'Agua sobre las tumbas',
    text: `<p>El acueducto pasa sobre los tejados de un barrio enterrado. Su estrecha cornisa está cubierta
      de hielo; abajo, un canal de agua negra fluye cuesta arriba hacia el palacio.</p>`,
    choices: [
      { text: '[Pícaro] Seguir los apoyos de mantenimiento sin que te vean.' },
      { text: 'Avanzar en equilibrio por la cornisa helada.' },
    ],
  },
  's3-ledge': {
    title: 'Un paso sobre la oscuridad',
    text: `<p>La piedra se mueve bajo tus botas. Extiendes los brazos, manteniendo la linterna bien lejos
      del agua que intenta alcanzar su llama.</p>`,
    check: { text: 'Cruza el acueducto dañado.' },
  },
  's3-fall': {
    title: 'El canal hambriento',
    text: `<p>Resbalas y caes al canal, pero consigues salir por una rejilla de desagüe. Unos dedos fríos tiran
      de tu capa, aunque la linterna se mantiene sobre el agua. Sales junto a la puerta del palacio.</p>`,
    choices: [{ text: 'Acercarte al palacio.' }],
  },
  's3-gate': {
    title: 'El sello cuádruple',
    text: `<p>Cuatro eslabones de sombra mantienen cerradas las puertas del palacio. Un guardián de piedra duerme junto a ellas,
      con la espada sobre las rodillas. Cada eslabón lleva una marca distinta: un puño, un ojo abierto, una runa
      y un sol naciente.</p>
      <p>Si rompes un eslabón limpiamente, su poder podría volverse contra el Rey. Si fallas, el guardián despertará.</p>`,
    choices: [
      { text: '[Guerrero] Romper la cubierta de hierro que rodea el puño.' },
      { text: '[Pícaro] Encontrar el cierre oculto bajo el ojo.' },
      { text: '[Mago] Deshacer la runa de atadura.' },
      { text: '[Clérigo] Restaurar la marca del sol con una plegaria.' },
      { text: 'Despertar al guardián y luchar para entrar.' },
    ],
  },
  's3-force': {
    title: 'Hierro contra hierro',
    text: `<p>Encajas tu arma bajo la cubierta y te apoyas con fuerza contra la puerta.</p>`,
    check: { text: 'Rompe la atadura sin destruir su poder.' },
  },
  's3-lock': {
    title: 'El ojo que nunca se cierra',
    text: `<p>El ojo tallado sigue tus manos. Trabajas al tacto, manteniendo el rostro fuera de su mirada.</p>`,
    check: { text: 'Libera el sello sin despertar a su vigilante.' },
  },
  's3-rune': {
    title: 'Un hechizo escrito al revés',
    text: `<p>La runa es una protección vuelta del revés. Sigues su comienzo y rechazas el final que promete.</p>`,
    check: { text: 'Vuelve la atadura contra su creador.' },
  },
  's3-prayer': {
    title: 'La mañana bajo la tierra',
    text: `<p>Presionas tu símbolo sagrado contra la marca del sol. Bajo la piedra, algo recuerda el calor.</p>`,
    check: { text: 'Restaura el propósito olvidado de la protección.' },
  },
  's3-seal': {
    title: 'Un eslabón liberado',
    text: `<p>El eslabón de sombra se vuelve de plata y cae en tu mano. Las puertas se abren sin hacer ruido.
      Cuelgas el eslabón liberado de la linterna; brilla como una estrella pequeña y paciente.</p>`,
    choices: [{ text: 'Entrar en el palacio.' }],
  },
  's3-guardian': {
    title: 'El último guardia del palacio',
    text: `<p>El guardián de piedra se alza. El polvo se derrama de sus articulaciones cuando levanta una espada tan ancha
      que podría bloquear toda la entrada. Debes pasar por su alcance para entrar en el palacio.</p>`,
    combat: { name: 'Guardián del palacio' },
  },
  's3-hall': {
    title: 'La sala de las vidas inconclusas',
    text: `<p>El palacio está lleno de cosas corrientes: el caballo de madera de un niño, una carta a medio escribir,
      pan convertido en piedra. El Rey no solo robó vidas. Las detuvo a la mitad.</p>
      <p>Más allá de la sala se encuentran un archivo, una pequeña campana de duelo y las puertas de la sala del trono.
      Un nicho resguardado ofrece un momento para curarte las heridas.</p>`,
    choices: [
      { text: 'Registrar el archivo real.' },
      { text: 'Examinar la campana de duelo.' },
      { text: 'Descansar en el nicho.' },
      { text: 'Abrir las puertas de la sala del trono.' },
    ],
  },
  's3-archive': {
    title: 'La promesa anterior a la corona',
    text: (s) => `
      <p>Los decretos reales se deshacen bajo tus dedos. Una página más antigua recoge la promesa de un rey de no dejar
      morir jamás a su pueblo. Debajo, otra mano ha escrito: «Cumplió las palabras y quebró su sentido».</p>
      ${s.flags.trueName ? '<p>Recuerdas a Vesh Calloway. Un alma robada todavía puede oír el nombre al que respondía antes.</p>' : ''}`,
    check: { text: 'Recupera el nombre del Rey y las palabras de su juramento.', bonusLabel: 'El nombre verdadero de Vesh' },
  },
  's3-name': {
    title: 'Ardan, quien temía al alba',
    text: `<p><strong>Ardan</strong>. El nombre sobrevive bajo el sello. Su juramento no era gobernar para siempre,
      sino proteger a su pueblo hasta la mañana. La corona le ha enseñado a confundir ambas cosas.</p>
      <p>Si consigues que recuerde la diferencia, quizá puedas debilitarlo sin entregar la linterna.</p>`,
    choices: [{ text: 'Volver a la sala.' }],
  },
  's3-archive-lost': {
    title: 'Tinta bajo el polvo',
    text: `<p>El nombre se desprende en escamas antes de que puedas leerlo. Solo queda la impresión de una corona.
      Fuera cual fuera la promesa que inició esta tragedia, su final debe estar en la sala del trono.</p>`,
    choices: [{ text: 'Volver a la sala.' }],
  },
  's3-bell': {
    title: 'Una nota para los vivos',
    text: (s) => `
      <p>Una pequeña campana de bronce cuelga sobre una lista de los muertos de la ciudad. Su badajo está atado con sombras.</p>
      ${s.flags.bell ? '<p>Reconoces la forma de la inscripción de Kaldra. Esta campana necesita una nota clara, no fuerza bruta.</p>' : ''}`,
    choices: [
      { text: 'Usar la lección de Kaldra para liberar el badajo.' },
      { text: 'Tirar del badajo hasta liberarlo.' },
    ],
  },
  's3-bell-check': {
    title: 'El peso del silencio',
    text: `<p>Agarras el badajo. La sombra resiste como el hierro frío.</p>`,
    check: { text: 'Libera la campana de duelo.' },
  },
  's3-bell-song': {
    title: 'Una ciudad recuerda',
    text: `<p>La campana suena una vez. Se abren puertas a lo largo de las calles vacías. Rostros pálidos se vuelven hacia
      el palacio y de la sala del trono llega un grito de miedo: el Rey ya no puede ocultar a su pueblo del alba.</p>`,
    choices: [{ text: 'Volver a la sala.' }],
  },
  's3-bell-hurt': {
    title: 'Un silencio que muerde',
    text: `<p>La sombra azota tus manos. Retrocedes, con los dedos entumecidos. La campana no sonará
      para ti, pero la linterna sigue ardiendo.</p>`,
    choices: [{ text: 'Volver a la sala.' }],
  },
  's3-rest': {
    title: 'Un pequeño círculo de calor',
    text: `<p>Dejas la linterna en el nicho y vendas tus heridas a su luz. Por un momento puedes oír
      el pozo de Thornwick y las gaviotas de Dunmere en lugar del silencio de la ciudad enterrada.</p>
      <p>El aceite es valioso. No puedes permitirte otro descanso aquí.</p>`,
    choices: [{ text: 'Volver a la sala.' }],
  },
  's3-throne': {
    title: 'El Rey Hueco',
    text: (s) => `
      <p>Una corona de vidrio negro flota sobre un trono de raíces. Debajo se sienta un hombre tan delgado
      que la luz de las estrellas atraviesa sus manos. Su mirada pasa sobre ti y se fija en la linterna.</p>
      <p>«Solo pedí una noche más», dice. «Dame la luz y ninguno de ellos tendrá que marcharse jamás».</p>
      ${s.flags.kingBell ? '<p>La campana de duelo aún le tiembla en los huesos. Su sombra no consigue mantener la forma.</p>' : ''}
      ${s.storyOutcomes.lantern === 'dim' ? '<p>Un hilo azul se extiende desde la linterna debilitada hasta su corona. Él sonríe mientras se alimenta de él.</p>' : ''}`,
    choices: [
      { text: 'Llamarlo Ardan y recordarle su juramento.' },
      { text: 'Negarte y alzar tu arma.' },
    ],
  },
  's3-oath': {
    title: 'Hasta la mañana',
    text: `<p>«Prometiste protegerlos hasta la mañana, Ardan. No robarles la mañana».</p>
      <p>El Rey mira hacia las puertas, donde espera su pueblo. Su corona se ciñe como una trampa.
      «Entonces rómpela», susurra. La sombra se alza para luchar sin él.</p>`,
    choices: [{ text: 'Enfrentarte a la sombra de la corona.' }],
  },
  's3-king': {
    title: 'La última noche',
    text: `<p>El Rey se pone en pie y reúne a su alrededor todas las sombras de la sala. Tu linterna es un único
      punto dorado frente a una oscuridad que ha esperado siglos este momento.</p>`,
    combat: { name: 'Rey Hueco' },
  },
  's3-king-empowered': {
    title: 'La luz que probó',
    text: `<p>El borde azul de la llama de la linterna azota la corona. El Rey bebe su fuerza robada
      y crece hasta superar la altura de su trono. Lo que empezó en Kaldra debe terminar aquí.</p>`,
    combat: { name: 'Rey Hueco, desatado' },
  },
  's3-king-weakened': {
    title: 'La corona sin rey',
    text: `<p>La corona negra se eleva sobre un cuerpo de sombras que se deshacen. Ataca con mil manos
      que intentan atraparte, pero entre los huecos puedes ver la primera línea pálida de la mañana.</p>`,
    combat: { name: 'Sombra de la corona' },
  },
  's3-crown': {
    title: 'La última llama',
    text: (s) => `
      <p>La corona cae a tus pies, intacta. Dentro del vidrio, una pequeña forma oscura late como un corazón.
      Tras las ventanas, los muertos que esperan vuelven sus rostros hacia ti.</p>
      <p>Abres la linterna y dejas que su luz caiga sobre la corona. Para liberar la ciudad, debes mantener
      esa luz firme mientras todo el peso de su noche robada se opone a ti.</p>
      ${s.flags.crownSeal ? '<p>El eslabón de plata que liberaste mantiene las sombras en su sitio.</p>' : ''}
      ${s.storyOutcomes['ashen-tide'] === 'cleansed' ? '<p>La esquirla de perla responde con la luz de Dunmere.</p>' : ''}`,
    check: { text: 'Destruye la corona y libera la ciudad.', bonusLabel: 'Luz reunida a lo largo de tu viaje' },
  },
  's3-dawn': {
    title: 'Una mañana para todos',
    text: (s) => `
      <p>La corona se resquebraja del borde al corazón. La luz del sol inunda el palacio y los muertos que esperaban se disuelven
      en un centenar de pequeños sonidos cotidianos: risas, pasos, una puerta que se cierra suavemente.</p>
      ${s.flags.kingName ? '<p>Por un momento Ardan está entre ellos, sin ser más alto que nadie. Inclina la cabeza descubierta y desaparece.</p>' : ''}
      <p>Devuelves la linterna a Thornwick. En Dunmere, las barcas salen a un mar despejado. Esa primavera
      ninguna campana repica por alarma.</p>
      <p>Se cuentan muchas historias sobre ${s.name}, el ${CLASS_NAMES_ES[s.cls]}. Tu favorita termina de forma sencilla:
      por fin se permitió a la gente de Caer Hollow volver a casa.</p>`,
  },
  's3-watch': {
    title: 'El guardián de la última luz',
    text: (s) => `
      <p>No puedes romper la corona, pero sí negarle un rey. La sumerges en la llama dorada
      de la linterna y cierras la portezuela. El vidrio se vuelve transparente. Más allá del palacio, los muertos encuentran descanso.</p>
      <p>Thornwick y Dunmere están a salvo. Sin embargo, la linterna no debe apagarse jamás y alguien debe quedarse
      para cuidarla. Tomas la primera guardia mientras la luz del día cruza el trono vacío.</p>
      <p>Cuando los viajeros hablan de ${s.name}, no solo hablan de batallas ganadas, sino de una promesa cumplida.
      El Rey Hueco nunca volverá a gobernar mientras tu luz perdure.</p>`,
  },
  death: {
    title: 'Tu aventura termina aquí',
    text: (s) => s.completedStories.includes('ashen-tide')
      ? `<p>Tus fuerzas fallan y la luz de la linterna mengua. En Caer Hollow, la corona se vuelve
        hacia su trono vacío. A lo lejos, las campanas de Thornwick empiezan a repicar...</p>`
      : `<p>Tus fuerzas fallan y el mundo se oscurece. Muy al sur, en Thornwick, el último aceite
        de las lámparas de la aldea se consume mientras se alza la luna nueva...</p>`,
  },
};

const STORY_MESSAGES_ES = {
  'Gained 15 Gold and a Healing Potion.': 'Has obtenido 15 de oro y una poción curativa.',
  'Bought Rope.': 'Has comprado cuerda.',
  'Bought a Healing Potion.': 'Has comprado una poción curativa.',
  'Found a Healing Potion and 6 Gold.': 'Has encontrado una poción curativa y 6 de oro.',
  'Found a Huntsman\'s Bow and Warden\'s Mail. Equip them from your Adventure Sheet.': 'Has encontrado un arco de cazador y una cota del guardián. Equípalos desde tu hoja de aventura.',
  'Lost 3 Endurance.': 'Has perdido 3 de Resistencia.',
  'Lost 6 Endurance.': 'Has perdido 6 de Resistencia.',
  'Gained the Ward of Ash (+2 to the final Wisdom check).': 'Has obtenido el Amuleto de fresno (+2 a la prueba final de Sabiduría).',
  'Lost 5 Endurance.': 'Has perdido 5 de Resistencia.',
  'Gained the Iron Key and 10 Gold.': 'Has obtenido la llave de hierro y 10 de oro.',
  'Gained the Iron Key and 8 Gold.': 'Has obtenido la llave de hierro y 8 de oro.',
  'Lost 4 Endurance.': 'Has perdido 4 de Resistencia.',
  'Recovered 8 Endurance and regained Divine Mending.': 'Has recuperado 8 de Resistencia y puedes volver a usar Sanación divina.',
  'You learned the thief\'s true name.': 'Has descubierto el nombre verdadero del ladrón.',
  'The thief has been weakened by the bell.': 'La campana ha debilitado al ladrón.',
  'Lost 2 Endurance.': 'Has perdido 2 de Resistencia.',
  'You have rested and recovered. Your class ability is ready.': 'Has descansado y te has recuperado. Tu habilidad de clase está lista.',
  'The shrine will aid you against the tide.': 'El santuario te ayudará contra la marea.',
  'Found Dawnforged Blade and Tideglass Armor. Equip them from your Adventure Sheet.': 'Has encontrado una hoja forjada al alba y una Armadura de cristal marino. Equípalas desde tu hoja de aventura.',
  'Found Whispersteel Daggers and Tideglass Armor. Equip them from your Adventure Sheet.': 'Has encontrado unas dagas de acero susurrante y una Armadura de cristal marino. Equípalas desde tu hoja de aventura.',
  'Found Starfall Staff and Tideglass Armor. Equip them from your Adventure Sheet.': 'Has encontrado un bastón de estrella caída y una Armadura de cristal marino. Equípalos desde tu hoja de aventura.',
  'Found Sunfire Mace and Tideglass Armor. Equip them from your Adventure Sheet.': 'Has encontrado una maza de fuego solar y una Armadura de cristal marino. Equípalas desde tu hoja de aventura.',
  'You have rested. Your class ability is ready.': 'Has descansado. Tu habilidad de clase está lista.',
  'Restored all Endurance and your class ability. Gained 2 Healing Potions.': 'Has recuperado toda la Resistencia y tu habilidad de clase. Has obtenido 2 pociones curativas.',
  'Freed the palace seal (+1 to the final Wisdom check).': 'Has liberado el sello del palacio (+1 a la prueba final de Sabiduría).',
  'Learned the King\'s name and oath.': 'Has descubierto el nombre del Rey y su juramento.',
  'The mourning bell has weakened the Hollow King.': 'La campana de duelo ha debilitado al Rey Hueco.',
  'Recovered up to 8 Endurance.': 'Has recuperado hasta 8 de Resistencia.',
};
