/**
 * RULETA ARCOÍRIS - Catálogo de Colores, Figuras, Niveles y Recompensas
 * Espacio de nombres: window.RuletaArcoiris
 */
(function() {
  'use strict';

  window.RuletaArcoiris = window.RuletaArcoiris || {};

  // Paleta didáctica de colores con alto contraste y legibilidad
  var COLORS = [
    {
      id: 'rojo',
      name: 'Rojo',
      article: 'el',
      plural: 'rojos',
      feminine: 'roja',
      femininePlural: 'rojas',
      hex: '#E53935',
      textColor: '#FFFFFF',
      border: '#B71C1C'
    },
    {
      id: 'azul',
      name: 'Azul',
      article: 'el',
      plural: 'azules',
      feminine: 'azul',
      femininePlural: 'azules',
      hex: '#1E88E5',
      textColor: '#FFFFFF',
      border: '#0D47A1'
    },
    {
      id: 'amarillo',
      name: 'Amarillo',
      article: 'el',
      plural: 'amarillos',
      feminine: 'amarilla',
      femininePlural: 'amarillas',
      hex: '#FDD835',
      textColor: '#37474F',
      border: '#F57F17'
    },
    {
      id: 'verde',
      name: 'Verde',
      article: 'el',
      plural: 'verdes',
      feminine: 'verde',
      femininePlural: 'verdes',
      hex: '#43A047',
      textColor: '#FFFFFF',
      border: '#1B5E20'
    },
    {
      id: 'naranja',
      name: 'Naranja',
      article: 'el',
      plural: 'naranjas',
      feminine: 'naranja',
      femininePlural: 'naranjas',
      hex: '#FB8C00',
      textColor: '#FFFFFF',
      border: '#E65100'
    },
    {
      id: 'morado',
      name: 'Morado',
      article: 'el',
      plural: 'morados',
      feminine: 'morada',
      femininePlural: 'moradas',
      hex: '#8E24AA',
      textColor: '#FFFFFF',
      border: '#4A148C'
    }
  ];

  // Catálogo de figuras geométricas con paths SVG vectoriales precisos
  var SHAPES = [
    {
      id: 'circulo',
      name: 'Círculo',
      gender: 'm',
      plural: 'círculos',
      viewBox: '0 0 100 100',
      svgPath: '<circle cx="50" cy="50" r="38" />'
    },
    {
      id: 'cuadrado',
      name: 'Cuadrado',
      gender: 'm',
      plural: 'cuadrados',
      viewBox: '0 0 100 100',
      svgPath: '<rect x="16" y="16" width="68" height="68" rx="10" />'
    },
    {
      id: 'triangulo',
      name: 'Triángulo',
      gender: 'm',
      plural: 'triángulos',
      viewBox: '0 0 100 100',
      svgPath: '<polygon points="50,14 86,82 14,82" stroke-linejoin="round" />'
    },
    {
      id: 'rectangulo',
      name: 'Rectángulo',
      gender: 'm',
      plural: 'rectángulos',
      viewBox: '0 0 100 100',
      svgPath: '<rect x="12" y="24" width="76" height="52" rx="10" />'
    },
    {
      id: 'estrella',
      name: 'Estrella',
      gender: 'f',
      plural: 'estrellas',
      viewBox: '0 0 100 100',
      svgPath: '<polygon points="50,12 61,37 88,38 66,55 74,82 50,66 26,82 34,55 12,38 39,37" stroke-linejoin="round" />'
    },
    {
      id: 'corazon',
      name: 'Corazón',
      gender: 'm',
      plural: 'corazones',
      viewBox: '0 0 100 100',
      svgPath: '<path d="M50 82 C50 82 18 62 18 38 C18 24 28 16 39 16 C45 16 48 19 50 23 C52 19 55 16 61 16 C72 16 82 24 82 38 C82 62 50 82 50 82 Z" stroke-linejoin="round" />'
    }
  ];

  // Perfil único adaptado para primera infancia (3 a 5 años)
  var PROFILES = {
    pequenos: {
      id: 'pequenos',
      name: 'Pequeños artistas',
      age: '3–5 años',
      colorIds: ['rojo', 'azul', 'amarillo', 'verde', 'naranja', 'morado'], // 6 colores didácticos
      shapeIds: ['circulo', 'cuadrado', 'triangulo', 'estrella', 'corazon'], // Figuras adaptadas para 3-5 años
      minObjects: 4,
      maxObjects: 6,
      minTargets: 1,
      maxTargets: 2,
      errorHintThreshold: 2
    }
  };

  // Catálogo de 12 pegatinas coleccionables originales del jardín mágico
  var STICKERS = [
    {
      id: 'chispa_sonriente',
      name: 'Chispa Sonriente',
      description: 'Tu amigo camaleón feliz de jugar contigo.',
      starsRequired: 3,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<circle cx="50" cy="50" r="42" fill="#81C784" stroke="#388E3C" stroke-width="3"/>' +
             '<circle cx="38" cy="42" r="12" fill="#FFFFFF"/>' +
             '<circle cx="41" cy="42" r="6" fill="#1B5E20"/>' +
             '<circle cx="43" cy="40" r="2" fill="#FFFFFF"/>' +
             '<path d="M35 62 Q50 76 65 62" stroke="#1B5E20" stroke-width="4" stroke-linecap="round" fill="none"/>' +
             '<circle cx="28" cy="56" r="5" fill="#FF8A80"/>' +
             '<circle cx="72" cy="56" r="5" fill="#FF8A80"/>' +
             '<path d="M48 18 Q55 8 62 18" stroke="#388E3C" stroke-width="4" stroke-linecap="round" fill="none"/>' +
           '</svg>'
    },
    {
      id: 'flor_arcoiris',
      name: 'Flor Arcoíris',
      description: 'Una flor mágica con pétalos de mil colores.',
      starsRequired: 6,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<circle cx="50" cy="28" r="14" fill="#E53935"/>' +
             '<circle cx="72" cy="42" r="14" fill="#FB8C00"/>' +
             '<circle cx="68" cy="68" r="14" fill="#43A047"/>' +
             '<circle cx="32" cy="68" r="14" fill="#1E88E5"/>' +
             '<circle cx="28" cy="42" r="14" fill="#8E24AA"/>' +
             '<circle cx="50" cy="50" r="16" fill="#FDD835" stroke="#F57F17" stroke-width="2"/>' +
             '<circle cx="45" cy="47" r="2.5" fill="#37474F"/>' +
             '<circle cx="55" cy="47" r="2.5" fill="#37474F"/>' +
             '<path d="M46 54 Q50 58 54 54" stroke="#37474F" stroke-width="2" stroke-linecap="round" fill="none"/>' +
           '</svg>'
    },
    {
      id: 'sol_radiante',
      name: 'Sol Radiante',
      description: 'Calienta el jardín y llena de energía el día.',
      starsRequired: 9,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<g stroke="#FFA000" stroke-width="4" stroke-linecap="round">' +
               '<line x1="50" y1="12" x2="50" y2="20"/>' +
               '<line x1="50" y1="80" x2="50" y2="88"/>' +
               '<line x1="12" y1="50" x2="20" y2="50"/>' +
               '<line x1="80" y1="50" x2="88" y2="50"/>' +
               '<line x1="23" y1="23" x2="29" y2="29"/>' +
               '<line x1="71" y1="71" x2="77" y2="77"/>' +
               '<line x1="23" y1="77" x2="29" y2="71"/>' +
               '<line x1="71" y1="29" x2="77" y2="23"/>' +
             '</g>' +
             '<circle cx="50" cy="50" r="28" fill="#FFD54F" stroke="#FFA000" stroke-width="3"/>' +
             '<circle cx="42" cy="45" r="3" fill="#E65100"/>' +
             '<circle cx="58" cy="45" r="3" fill="#E65100"/>' +
             '<path d="M42 55 Q50 64 58 55" stroke="#E65100" stroke-width="3" stroke-linecap="round" fill="none"/>' +
             '<circle cx="36" cy="53" r="3.5" fill="#FF8A80"/>' +
             '<circle cx="64" cy="53" r="3.5" fill="#FF8A80"/>' +
           '</svg>'
    },
    {
      id: 'mariposa_magica',
      name: 'Mariposa Mágica',
      description: 'Vuela entre los colores dejando estelas de luz.',
      starsRequired: 12,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<path d="M50 48 Q70 20 85 36 Q88 60 52 54" fill="#CE93D8" stroke="#8E24AA" stroke-width="2"/>' +
             '<path d="M50 48 Q30 20 15 36 Q12 60 48 54" fill="#CE93D8" stroke="#8E24AA" stroke-width="2"/>' +
             '<path d="M50 54 Q75 66 70 82 Q55 86 50 60" fill="#80DEEA" stroke="#00ACC1" stroke-width="2"/>' +
             '<path d="M50 54 Q25 66 30 82 Q45 86 50 60" fill="#80DEEA" stroke="#00ACC1" stroke-width="2"/>' +
             '<ellipse cx="50" cy="52" rx="4" ry="20" fill="#5D4037"/>' +
             '<circle cx="50" cy="30" r="5" fill="#5D4037"/>' +
             '<path d="M48 27 Q42 16 36 20" stroke="#5D4037" stroke-width="2" stroke-linecap="round" fill="none"/>' +
             '<path d="M52 27 Q58 16 64 20" stroke="#5D4037" stroke-width="2" stroke-linecap="round" fill="none"/>' +
           '</svg>'
    },
    {
      id: 'estrella_dorada',
      name: 'Estrella Brillante',
      description: 'Ilumina los aciertos de grandes exploradores.',
      starsRequired: 15,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<polygon points="50,14 61,38 88,39 67,56 75,82 50,67 25,82 33,56 12,39 39,38" fill="#FFCA28" stroke="#FF8F00" stroke-width="3" stroke-linejoin="round"/>' +
             '<circle cx="43" cy="46" r="3" fill="#3E2723"/>' +
             '<circle cx="57" cy="46" r="3" fill="#3E2723"/>' +
             '<path d="M45 54 Q50 60 55 54" stroke="#3E2723" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
             '<circle cx="38" cy="52" r="3" fill="#FF8A80"/>' +
             '<circle cx="62" cy="52" r="3" fill="#FF8A80"/>' +
           '</svg>'
    },
    {
      id: 'trebol_verde',
      name: 'Trébol de la Suerte',
      description: 'Un hallazgo muy especial en el césped del jardín.',
      starsRequired: 18,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<g fill="#4CAF50" stroke="#2E7D32" stroke-width="2">' +
               '<circle cx="36" cy="38" r="14"/>' +
               '<circle cx="64" cy="38" r="14"/>' +
               '<circle cx="36" cy="62" r="14"/>' +
               '<circle cx="64" cy="62" r="14"/>' +
             '</g>' +
             '<circle cx="50" cy="50" r="12" fill="#66BB6A"/>' +
             '<path d="M50 56 Q52 78 62 86" stroke="#2E7D32" stroke-width="4" stroke-linecap="round" fill="none"/>' +
           '</svg>'
    },
    {
      id: 'chispa_detective',
      name: 'Chispa Detective',
      description: 'Chispa buscando pistas con su lupa mágica.',
      starsRequired: 21,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<circle cx="45" cy="50" r="35" fill="#66BB6A" stroke="#2E7D32" stroke-width="3"/>' +
             '<circle cx="38" cy="44" r="10" fill="#FFFFFF"/>' +
             '<circle cx="40" cy="44" r="5" fill="#1B5E20"/>' +
             '<circle cx="68" cy="52" r="16" fill="#E0F7FA" stroke="#00838F" stroke-width="3" fill-opacity="0.7"/>' +
             '<line x1="79" y1="64" x2="90" y2="78" stroke="#5D4037" stroke-width="5" stroke-linecap="round"/>' +
             '<path d="M32 60 Q44 68 52 60" stroke="#1B5E20" stroke-width="3" stroke-linecap="round" fill="none"/>' +
           '</svg>'
    },
    {
      id: 'corazon_brillante',
      name: 'Corazón Dulce',
      description: 'Representa el cariño y la alegría de aprender.',
      starsRequired: 24,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<path d="M50 82 C50 82 18 62 18 38 C18 24 28 16 39 16 C45 16 48 19 50 23 C52 19 55 16 61 16 C72 16 82 24 82 38 C82 62 50 82 50 82 Z" fill="#F06292" stroke="#C2185B" stroke-width="3"/>' +
             '<circle cx="38" cy="36" r="3.5" fill="#4A148C"/>' +
             '<circle cx="62" cy="36" r="3.5" fill="#4A148C"/>' +
             '<path d="M44 46 Q50 52 56 46" stroke="#4A148C" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
             '<circle cx="32" cy="44" r="3" fill="#FF80AB"/>' +
             '<circle cx="68" cy="44" r="3" fill="#FF80AB"/>' +
           '</svg>'
    },
    {
      id: 'nube_feliz',
      name: 'Nube Soñadora',
      description: 'Flota suavemente sobre el arcoíris del jardín.',
      starsRequired: 27,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<path d="M26 62 A16 16 0 0 1 36 36 A20 20 0 0 1 70 38 A16 16 0 0 1 76 62 Z" fill="#E1F5FE" stroke="#0288D1" stroke-width="3"/>' +
             '<circle cx="44" cy="50" r="3" fill="#01579B"/>' +
             '<circle cx="58" cy="50" r="3" fill="#01579B"/>' +
             '<path d="M46 58 Q51 63 56 58" stroke="#01579B" stroke-width="2" stroke-linecap="round" fill="none"/>' +
             '<circle cx="38" cy="56" r="3" fill="#FF8A80"/>' +
             '<circle cx="64" cy="56" r="3" fill="#FF8A80"/>' +
           '</svg>'
    },
    {
      id: 'brote_magico',
      name: 'Brote Curioso',
      description: 'Una pequeña plantita que crece con cada juego.',
      starsRequired: 30,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<path d="M25 78 Q50 82 75 78 Q70 65 30 65 Z" fill="#795548" stroke="#4E342E" stroke-width="2"/>' +
             '<path d="M50 70 Q48 45 42 35" stroke="#4CAF50" stroke-width="4" stroke-linecap="round" fill="none"/>' +
             '<path d="M42 35 Q25 32 30 20 Q45 22 42 35 Z" fill="#81C784" stroke="#2E7D32" stroke-width="2"/>' +
             '<path d="M46 45 Q65 40 62 26 Q46 32 46 45 Z" fill="#A5D6A7" stroke="#2E7D32" stroke-width="2"/>' +
           '</svg>'
    },
    {
      id: 'hongo_fantasia',
      name: 'Hongo de Cuento',
      description: 'Sombrerito rojo con lunares del bosque secreto.',
      starsRequired: 33,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<path d="M38 55 Q38 82 42 84 Q58 84 62 84 Q62 55 62 55 Z" fill="#FFF9C4" stroke="#FBC02D" stroke-width="2"/>' +
             '<path d="M18 55 Q50 18 82 55 Q50 62 18 55 Z" fill="#EF5350" stroke="#C62828" stroke-width="3"/>' +
             '<circle cx="35" cy="40" r="5" fill="#FFFFFF"/>' +
             '<circle cx="50" cy="32" r="6" fill="#FFFFFF"/>' +
             '<circle cx="65" cy="42" r="5" fill="#FFFFFF"/>' +
             '<circle cx="45" cy="68" r="2.5" fill="#4E342E"/>' +
             '<circle cx="55" cy="68" r="2.5" fill="#4E342E"/>' +
             '<path d="M47 74 Q50 77 53 74" stroke="#4E342E" stroke-width="2" stroke-linecap="round" fill="none"/>' +
           '</svg>'
    },
    {
      id: 'chispa_corona',
      name: 'Chispa Gran Campeón',
      description: '¡Corona de oro para el explorador del arcoíris!',
      starsRequired: 36,
      svg: '<svg viewBox="0 0 100 100" class="sticker-art">' +
             '<circle cx="50" cy="55" r="34" fill="#4CAF50" stroke="#2E7D32" stroke-width="3"/>' +
             '<polygon points="30,30 36,18 45,28 50,14 55,28 64,18 70,30" fill="#FFD54F" stroke="#FFA000" stroke-width="2"/>' +
             '<circle cx="40" cy="52" r="8" fill="#FFFFFF"/>' +
             '<circle cx="42" cy="52" r="4" fill="#1B5E20"/>' +
             '<path d="M40 68 Q50 76 60 68" stroke="#1B5E20" stroke-width="3" stroke-linecap="round" fill="none"/>' +
             '<circle cx="32" cy="62" r="4" fill="#FF8A80"/>' +
             '<circle cx="68" cy="62" r="4" fill="#FF8A80"/>' +
           '</svg>'
    }
  ];

  // Modos de juego
  var MODES = {
    colores: {
      id: 'colores',
      name: 'Colores',
      label: 'Modo Colores',
      instructionTemplate: 'Encuentra los objetos de color {color}'
    },
    formas: {
      id: 'formas',
      name: 'Formas',
      label: 'Modo Formas',
      instructionTemplate: 'Encuentra todas las figuras: {forma}'
    }
  };

  // Constantes de juego
  var CONSTANTS = {
    STORAGE_KEY: 'ruletaArcoiris.v1',
    SESSION_ROUNDS: 5,
    STARS_PER_ROUND: 1,
    DEFAULT_PROFILE: 'pequenos',
    MIN_SPIN_ROTATIONS: 4, // Al menos 4 vueltas completas
    MAX_SPIN_ROTATIONS: 6,
    SPIN_DURATION_MS: 3400
  };

  // Exportar en el espacio de nombres
  window.RuletaArcoiris.COLORS = COLORS;
  window.RuletaArcoiris.SHAPES = SHAPES;
  window.RuletaArcoiris.PROFILES = PROFILES;
  window.RuletaArcoiris.STICKERS = STICKERS;
  window.RuletaArcoiris.MODES = MODES;
  window.RuletaArcoiris.CONSTANTS = CONSTANTS;

  // Funciones de utilidad para catálogo
  window.RuletaArcoiris.getColorById = function(id) {
    for (var i = 0; i < COLORS.length; i++) {
      if (COLORS[i].id === id) return COLORS[i];
    }
    return COLORS[0];
  };

  window.RuletaArcoiris.getShapeById = function(id) {
    for (var i = 0; i < SHAPES.length; i++) {
      if (SHAPES[i].id === id) return SHAPES[i];
    }
    return SHAPES[0];
  };

  window.RuletaArcoiris.getStickerById = function(id) {
    for (var i = 0; i < STICKERS.length; i++) {
      if (STICKERS[i].id === id) return STICKERS[i];
    }
    return null;
  };

})();
