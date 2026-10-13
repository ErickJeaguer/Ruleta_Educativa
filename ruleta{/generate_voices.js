/**
 * GENERADOR AUTOMÁTICO DE VOCES CON ELEVENLABS
 * Descarga y guarda las locuciones en /audio y /ruleta-arcoiris/audio
 */
const fs = require('fs');
const path = require('path');

// Leer API Key de variable de entorno o archivo .env
let apiKey = process.env.ELEVENLABS_API_KEY;

// Si existe un archivo .env en el directorio actual o en HOME, intentar leerlo
const localEnvPath = path.join(__dirname, '.env');
const homeEnvPath = path.join(process.env.USERPROFILE || process.env.HOME || '', '.env');

function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('ELEVENLABS_API_KEY=')) {
        return trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return null;
}

if (!apiKey) {
  apiKey = loadEnvFile(localEnvPath) || loadEnvFile(homeEnvPath);
}

// Voz por defecto en ElevenLabs (Jessica: alegre, cálida y juguetona, compatible con API gratuita)
// Se puede cambiar pasando un argumento: node generate_voices.js TU_VOICE_ID
const voiceId = process.argv[2] || process.env.ELEVENLABS_VOICE_ID || 'cgSgspJ2msm6clMCkdW9'; // Jessica (Playful, Bright, Warm)

// Catálogo de frases a generar para niños de 3 a 5 años
const PHRASES = [
  // --- MODO COLORES (Prioridad) ---
  { filename: 'color_amarillo.mp3', text: '¡Encuentra todos los objetos de color amarillo!' },
  { filename: 'color_rojo.mp3',     text: '¡Encuentra todos los objetos de color rojo!' },
  { filename: 'color_azul.mp3',     text: '¡Encuentra todos los objetos de color azul!' },
  { filename: 'color_verde.mp3',    text: '¡Encuentra todos los objetos de color verde!' },
  { filename: 'color_naranja.mp3',  text: '¡Encuentra todos los objetos de color naranja!' },
  { filename: 'color_morado.mp3',   text: '¡Encuentra todos los objetos de color morado!' },

  // --- MODO FIGURAS (3 a 5 años) ---
  { filename: 'forma_circulo.mp3',   text: '¡Encuentra todos los círculos!' },
  { filename: 'forma_cuadrado.mp3',  text: '¡Encuentra todos los cuadrados!' },
  { filename: 'forma_triangulo.mp3', text: '¡Encuentra todos los triángulos!' },
  { filename: 'forma_estrella.mp3',  text: '¡Encuentra todas las estrellas!' },
  { filename: 'forma_corazon.mp3',   text: '¡Encuentra todos los corazones!' },

  // --- INTERACCIÓN Y NAVEGACIÓN ---
  { filename: 'gira_ruleta.mp3',     text: '¡Toca el botón girar para descubrir tu reto!' },
  { filename: 'gira_forma.mp3',      text: '¡Muy bien! Ahora gira para elegir la figura.' },
  { filename: 'bienvenida.mp3',      text: '¡Hola! Soy Chispa. ¿Listo para jugar en el jardín mágico?' }
];

async function generateVoice(phrase) {
  console.log(`🎙️  Generando: ${phrase.filename} -> "${phrase.text}"`);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const payload = {
    text: phrase.text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.80,
      style: 0.2,
      use_speaker_boost: true
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en ElevenLabs (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Guardar en ambas carpetas de audio (raíz y ruleta-arcoiris)
  const paths = [
    path.join(__dirname, 'audio', phrase.filename),
    path.join(__dirname, 'ruleta-arcoiris', 'audio', phrase.filename)
  ];

  for (const p of paths) {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, buffer);
  }

  console.log(`   ✅ Guardado exitoso: ${phrase.filename} (${buffer.length} bytes)`);
}

async function main() {
  if (!apiKey) {
    console.error('\n❌ ERROR: No se encontró la API Key de ElevenLabs.');
    console.error('Puedes configurarla en PowerShell con:');
    console.error('  $env:ELEVENLABS_API_KEY = "tu_api_key_aqui"');
    console.error('O crear un archivo .env con:');
    console.error('  ELEVENLABS_API_KEY=tu_api_key_aqui\n');
    process.exit(1);
  }

  console.log('\n=======================================================');
  console.log('   GENERADOR DE VOCES CON ELEVENLABS - RULETA ARCOÍRIS');
  console.log('=======================================================');
  console.log(`Voz utilizada (Voice ID): ${voiceId}`);
  console.log(`Total de frases a generar: ${PHRASES.length}\n`);

  for (let i = 0; i < PHRASES.length; i++) {
    try {
      await generateVoice(PHRASES[i]);
      // Pequeña pausa entre llamadas para respetar límites de tasa
      await new Promise(resolve => setTimeout(resolve, 350));
    } catch (err) {
      console.error(`   ❌ Error al generar ${PHRASES[i].filename}:`, err.message);
    }
  }

  console.log('\n✨ ¡Proceso completado! Las voces ya están listas en la carpeta audio/.');
}

main();
