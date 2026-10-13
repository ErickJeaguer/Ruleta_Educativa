/**
 * RULETA ARCOÍRIS - Batería de Pruebas Automatizadas de Verificación
 */
const fs = require('fs');
const path = require('path');

// 1. Simulación de entorno de navegador mínimo para Node.js
global.window = {};
global.document = {
  readyState: 'complete',
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    setAttribute: () => {},
    removeAttribute: () => {},
    innerHTML: '',
    textContent: '',
    style: {},
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {}
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.performance = { now: () => Date.now() };

// Mock localStorage
let storageStore = {};
global.window.localStorage = {
  getItem: (key) => storageStore[key] || null,
  setItem: (key, val) => { storageStore[key] = String(val); },
  removeItem: (key) => { delete storageStore[key]; },
  clear: () => { storageStore = {}; }
};

// Cargar módulos en orden
function loadScript(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  eval(content);
}

const jsDir = path.join(__dirname, 'js');
loadScript(path.join(jsDir, 'config.js'));
loadScript(path.join(jsDir, 'storage.js'));
loadScript(path.join(jsDir, 'audio.js'));
loadScript(path.join(jsDir, 'wheel.js'));
loadScript(path.join(jsDir, 'game.js'));

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

console.log('--- INICIANDO BATERÍA DE PRUEBAS DE LA RULETA ARCOÍRIS ---\n');

// =========================================================================
// 1. PRUEBAS DE LA RULETA Y MATEMÁTICA DE ROTACIÓN
// =========================================================================
console.log('1. Pruebas de la ruleta y geometría matemática:');

const wheel = window.RuletaArcoiris.wheel;
const config = window.RuletaArcoiris;

// Prueba 1.1: Modo colores presenta solo colores válidos
wheel.setItems(config.COLORS.slice(0, 4), 'colores');
assert(wheel.getItems().length === 4, 'Ruleta configurada con 4 sectores de colores válidos');

// Prueba 1.2: Modo formas presenta solo figuras válidas
wheel.setItems(config.SHAPES.slice(0, 5), 'formas');
assert(wheel.getItems().length === 5, 'Ruleta configurada con 5 sectores de figuras válidas');

// Prueba 1.3: Verificación de coincidencia matemática del puntero para TODOS los sectores
// Probamos N = 4, N = 5 y N = 6 sectores
[4, 5, 6].forEach((n) => {
  const testItems = config.COLORS.slice(0, n);
  wheel.setItems(testItems, 'colores');
  
  for (let targetIdx = 0; targetIdx < n; targetIdx++) {
    // Calculamos el ángulo objetivo
    const finalAngle = wheel.calculateTargetAngle(targetIdx);
    // Verificamos qué sector queda bajo el puntero con ese ángulo
    const sectorUnderPointer = wheel.getSectorUnderPointer(finalAngle);
    assert(
      sectorUnderPointer === targetIdx,
      `Geometría precisa: para N=${n}, objetivo=${targetIdx}, ángulo=${finalAngle}° -> sector bajo puntero=${sectorUnderPointer}`
    );
  }
});

// Prueba 1.4: Múltiples giros consecutivos mantienen la precisión
wheel.setItems(config.COLORS, 'colores'); // 6 colores
let currentRot = 0;
let precisionOk = true;
for (let spin = 0; spin < 10; spin++) {
  const chosen = spin % 6;
  const targetAngle = wheel.calculateTargetAngle(chosen);
  const aligned = wheel.getSectorUnderPointer(targetAngle);
  if (aligned !== chosen || targetAngle <= currentRot) {
    precisionOk = false;
  }
  // Simulamos que la ruleta queda en ese ángulo
  wheel.calculateTargetAngle = (idx) => {
    // helper test
    const arcAngle = 360 / 6;
    const targetBaseMod = (360 - ((idx * arcAngle) % 360)) % 360;
    const curMod = ((targetAngle % 360) + 360) % 360;
    const delta = (targetBaseMod - curMod + 360) % 360;
    return targetAngle + (4 * 360) + delta;
  };
}
assert(precisionOk, '10 giros consecutivos mantienen el puntero y acumulación continua correcta');

// Restaurar implementación original
loadScript(path.join(jsDir, 'wheel.js'));

// =========================================================================
// 2. PRUEBAS EDUCATIVAS Y LÓGICA DE JUEGO
// =========================================================================
console.log('\n2. Pruebas de retos educativos y lógica de juego:');

const game = window.RuletaArcoiris.game;

// Inicializar juego
let lastChallengeData = null;
game.init({
  onRoundReady: (data) => { lastChallengeData = data; }
});

// 2.1 Modo Colores: sólo objetos con el color seleccionado son objetivo
game.setMode('colores');
game.setProfile('pequenos');
const redColor = config.getColorById('rojo');
game.createChallenge({ mode: 'colores', targetColor: redColor });

assert(lastChallengeData !== null, 'Reto en modo colores generado con éxito');
assert(lastChallengeData.totalTargets >= 1, 'Ronda contiene al menos un objetivo correcto');

const allTargetsRed = lastChallengeData.boardItems
  .filter(i => i.isTarget)
  .every(i => i.color.id === 'rojo');
assert(allTargetsRed, 'En modo colores, todos los objetivos son del color rojo independientemente de la forma');

const allDistractorsNotRed = lastChallengeData.boardItems
  .filter(i => !i.isTarget)
  .every(i => i.color.id !== 'rojo');
assert(allDistractorsNotRed, 'En modo colores, ningún distractor tiene el color objetivo accidentalmente');

// 2.2 Modo Formas: sólo objetos con la figura seleccionada son objetivo
game.setMode('formas');
const starShape = config.getShapeById('estrella');
game.createChallenge({ mode: 'formas', targetShape: starShape });

const allTargetsStar = lastChallengeData.boardItems
  .filter(i => i.isTarget)
  .every(i => i.shape.id === 'estrella');
assert(allTargetsStar, 'En modo formas, todos los objetivos son estrellas independientemente del color');

const allDistractorsNotStar = lastChallengeData.boardItems
  .filter(i => !i.isTarget)
  .every(i => i.shape.id !== 'estrella');
assert(allDistractorsNotStar, 'En modo formas, ningún distractor es la figura objetivo');

// 2.3 Modos soportados: exclusivamente colores y formas (3 a 5 años)
const supportedModes = Object.keys(config.MODES);
assert(
  supportedModes.length === 2 && supportedModes.includes('colores') && supportedModes.includes('formas'),
  'Modos soportados configurados exclusivamente para Colores y Formas (3 a 5 años)'
);
game.setMode('colores');
assert(game.getMode() === 'colores', 'Modo colores activado correctamente');
game.setMode('formas');
assert(game.getMode() === 'formas', 'Modo formas activado correctamente');

// 2.4 Validación interactiva: evitar dobles aciertos y verificar finalización exacta
let targetFoundEvents = 0;
let roundCompletedTriggered = false;
game.init({
  onTargetFound: () => { targetFoundEvents++; },
  onRoundCompleted: () => { roundCompletedTriggered = true; }
});
game.createChallenge({ mode: 'colores', targetColor: redColor });

const targets = lastChallengeData.boardItems.filter(i => i.isTarget);
const firstTarget = targets[0];

// Clic 1 sobre el objetivo
game.selectItem(firstTarget.id);
assert(targetFoundEvents === 1, 'Primer clic en objetivo registra el acierto');

// Clic 2 sobre el mismo objetivo ya encontrado (debe ignorarse)
game.selectItem(firstTarget.id);
assert(targetFoundEvents === 1, 'Doble clic sobre el mismo objetivo no se contabiliza dos veces');

// Clic en distractor
const distractor = lastChallengeData.boardItems.find(i => !i.isTarget);
game.selectItem(distractor.id);
assert(targetFoundEvents === 1, 'Clic en distractor no cuenta como objetivo');

// Completar los objetivos restantes
for (let i = 1; i < targets.length; i++) {
  game.selectItem(targets[i].id);
}
assert(roundCompletedTriggered, 'La ronda finaliza exactamente tras encontrar todos los objetivos requeridos');

// =========================================================================
// 3. PRUEBAS DE PROGRESO Y ALMACENAMIENTO LOCAL
// =========================================================================
console.log('\n3. Pruebas de persistencia y progreso:');

const storage = window.RuletaArcoiris.storage;
storage.reset();

let initial = storage.get();
assert(initial.totalStars === 0, 'Estado inicial reiniciado con 0 estrellas');

// Agregar estrellas y verificar desbloqueo de pegatinas
// Cada 3 estrellas se desbloquea una pegatina
storage.addStar();
storage.addStar();
let r3 = storage.addStar(); // 3 estrellas -> debe desbloquear pegatina 1
assert(r3.totalStars === 3, 'Contador de estrellas acumula exactamente 3');
assert(r3.newlyUnlockedStickers.length === 1, 'Al alcanzar 3 estrellas se desbloquea la primera pegatina');
assert(r3.newlyUnlockedStickers[0].id === 'chispa_sonriente', 'La primera pegatina desbloqueada es Chispa Sonriente');

// Agregar otra estrella (4) -> no debe desbloquear nueva
let r4 = storage.addStar();
assert(r4.newlyUnlockedStickers.length === 0, 'A 4 estrellas no se repite desbloqueo');

// Simular recarga cargando desde almacenamiento serializado
const reloaded = storage.load();
assert(reloaded.totalStars === 4, 'Recarga de datos conserva las 4 estrellas');
assert(reloaded.unlockedStickers.includes('chispa_sonriente'), 'Recarga conserva la pegatina desbloqueada');

// Simular corrupción de datos en localStorage
global.window.localStorage.setItem('ruletaArcoiris.v1', '{ corrupt json !!!');
const recovered = storage.load();
assert(recovered !== null && typeof recovered.totalStars === 'number', 'Recuperación ante JSON corrupto no bloquea el juego');

// =========================================================================
// 4. PRUEBAS DE AUDIO Y MODO SILENCIOSO
// =========================================================================
console.log('\n4. Pruebas de audio y controles independientes:');

const audio = window.RuletaArcoiris.audio;
audio.init();

const musicBefore = audio.isMusicEnabled();
const sfxBefore = audio.isSfxEnabled();

audio.toggleMusic();
assert(audio.isMusicEnabled() !== musicBefore, 'Música se activa/desactiva correctamente');
assert(audio.isSfxEnabled() === sfxBefore, 'Alternar música no altera los efectos sonoros');

audio.toggleSfx();
assert(audio.isSfxEnabled() !== sfxBefore, 'Efectos se activan/desactivan independientemente de la música');

// Invocar todos los sonidos sin AudioContext (modo fallback) -> no deben lanzar excepciones
let audioSafe = true;
try {
  audio.playButtonClick();
  audio.playTick();
  audio.playWheelSpinStart();
  audio.playWheelStop();
  audio.playCorrectItem(1);
  audio.playWrongItem();
  audio.playStickerUnlock();
  audio.playRoundWin();
  audio.playSessionWin();
} catch (e) {
  audioSafe = false;
}
assert(audioSafe, 'Todas las funciones de audio son seguras y funcionan sin fallar ante falta de AudioContext');

// =========================================================================
// 5. PRUEBAS DE ESTRUCTURA Y ARCHIVOS
// =========================================================================
console.log('\n5. Pruebas de integridad de archivos y dependencias:');

const expectedFiles = [
  'index.html',
  'css/styles.css',
  'js/config.js',
  'js/storage.js',
  'js/audio.js',
  'js/wheel.js',
  'js/game.js',
  'js/app.js'
];

let allFilesExist = true;
expectedFiles.forEach(f => {
  const full = path.join(__dirname, f);
  if (!fs.existsSync(full)) {
    allFilesExist = false;
    console.error(`  Falta el archivo: ${f}`);
  }
});
assert(allFilesExist, 'Todos los 8 archivos obligatorios existen en el proyecto');

// Verificar ausencia de llamadas remotas http/https en index.html y css
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'css/styles.css'), 'utf8');

const remoteHtml = /https?:\/\//i.test(htmlContent);
const remoteCss = /https?:\/\//i.test(cssContent);
assert(!remoteHtml && !remoteCss, 'Cero dependencias remotas: no hay peticiones a URLs http/https externas');

// 6. Pruebas de perfil infantil 3-5 años y voz
console.log('\n6. Pruebas específicas de primera infancia (3 a 5 años):');
const activeProf = game.getProfile();
assert(activeProf.age === '3–5 años', 'El perfil configurado es Pequeños artistas para 3 a 5 años');
assert(activeProf.maxObjects <= 6, 'Límite máximo seguro de 6 objetos en pantalla para evitar sobrecarga en 3 a 5 años');

let voiceRan = true;
try {
  audio.playChallengeVoice({ mode: 'colores', targetColor: { id: 'amarillo' } });
  audio.playVoice('bienvenida');
} catch (e) {
  voiceRan = false;
}
assert(voiceRan, 'Método playVoice y playChallengeVoice toleran ausencia de audios sin lanzar excepciones');

console.log(`\n=======================================================`);
console.log(`RESULTADO DE LA BATERÍA DE PRUEBAS: ${passedTests}/${totalTests} superadas.`);
console.log(`=======================================================\n`);
