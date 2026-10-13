/**
 * RULETA ARCOÍRIS - Sistema de Audio y Música con Web Audio API
 * Espacio de nombres: window.RuletaArcoiris.audio
 */
(function() {
  'use strict';

  window.RuletaArcoiris = window.RuletaArcoiris || {};

  var audioCtx = null;
  var masterGain = null;
  var musicGain = null;
  var sfxGain = null;

  var isMusicPlaying = false;
  var musicTimer = null;
  var currentMusicNoteIndex = 0;
  var isUnlocked = false;

  // Estado local sincronizado con storage
  var musicEnabled = true;
  var sfxEnabled = true;

  // Melodía suave, mágica y alegre para el jardín (frecuencias en Hz)
  // Pentatónica dulce: C4, D4, E4, G4, A4, C5, D5, E5
  var MELODY = [
    { freq: 329.63, dur: 0.35, pause: 0.1 }, // E4
    { freq: 392.00, dur: 0.35, pause: 0.1 }, // G4
    { freq: 440.00, dur: 0.50, pause: 0.15 }, // A4
    { freq: 392.00, dur: 0.35, pause: 0.1 }, // G4
    { freq: 329.63, dur: 0.35, pause: 0.1 }, // E4
    { freq: 293.66, dur: 0.35, pause: 0.1 }, // D4
    { freq: 261.63, dur: 0.60, pause: 0.2 }, // C4
    { freq: 293.66, dur: 0.35, pause: 0.1 }, // D4
    { freq: 329.63, dur: 0.35, pause: 0.1 }, // E4
    { freq: 392.00, dur: 0.35, pause: 0.1 }, // G4
    { freq: 523.25, dur: 0.60, pause: 0.15 }, // C5
    { freq: 440.00, dur: 0.35, pause: 0.1 }, // A4
    { freq: 392.00, dur: 0.40, pause: 0.1 }, // G4
    { freq: 329.63, dur: 0.35, pause: 0.1 }, // E4
    { freq: 293.66, dur: 0.35, pause: 0.1 }, // D4
    { freq: 261.63, dur: 0.70, pause: 0.3 }  // C4
  ];

  // Acompañamiento armónico suave (bajo/campanilla suave)
  var BASS_NOTES = [130.81, 164.81, 174.61, 196.00]; // C3, E3, F3, G3

  /**
   * Inicializar o reanudar el AudioContext tras la primera interacción del usuario
   */
  function initAudioContext() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('RuletaArcoiris: Web Audio API no está disponible en este navegador.');
      return null;
    }

    try {
      audioCtx = new AudioContextClass();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.9, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Canal de efectos
      sfxGain = audioCtx.createGain();
      sfxGain.gain.setValueAtTime(sfxEnabled ? 0.8 : 0.0, audioCtx.currentTime);
      sfxGain.connect(masterGain);

      // Canal de música (volumen moderado y agradable de fondo)
      musicGain = audioCtx.createGain();
      musicGain.gain.setValueAtTime(musicEnabled ? 0.22 : 0.0, audioCtx.currentTime);
      musicGain.connect(masterGain);

      isUnlocked = true;
      return audioCtx;
    } catch (e) {
      console.warn('RuletaArcoiris: Error al inicializar AudioContext:', e);
      return null;
    }
  }

  /**
   * Tocar una nota suave tipo celesta/marimba mágica
   */
  function playNote(freq, startTime, duration, targetGainNode, type, maxVol) {
    if (!audioCtx || !targetGainNode) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    // Filtro pasa-bajos cálido para sonido infantil dulce
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    var peakVol = maxVol || 0.3;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakVol, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(peakVol * 0.4, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(targetGainNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * Planificador de la melodía de fondo
   */
  function scheduleNextMusicNote() {
    if (!isMusicPlaying || !musicEnabled || !audioCtx) return;

    var note = MELODY[currentMusicNoteIndex];
    var now = audioCtx.currentTime;

    // Nota de melodía
    playNote(note.freq, now, note.dur, musicGain, 'triangle', 0.25);

    // Nota de bajo suave cada 4 notas
    if (currentMusicNoteIndex % 4 === 0) {
      var bassFreq = BASS_NOTES[Math.floor(currentMusicNoteIndex / 4) % BASS_NOTES.length];
      playNote(bassFreq, now, note.dur * 1.5, musicGain, 'sine', 0.18);
    }

    currentMusicNoteIndex = (currentMusicNoteIndex + 1) % MELODY.length;
    var nextTimeMs = (note.dur + note.pause) * 1000;

    musicTimer = setTimeout(scheduleNextMusicNote, nextTimeMs);
  }

  var audioManager = {
    /**
     * Inicializar audio y cargar preferencias
     */
    init: function() {
      if (window.RuletaArcoiris.storage) {
        var state = window.RuletaArcoiris.storage.get();
        musicEnabled = state.musicEnabled !== false;
        sfxEnabled = state.sfxEnabled !== false;
      }

      // Desbloqueo ante cualquier primer toque o clic
      function handleFirstGesture() {
        initAudioContext();
        if (musicEnabled && !isMusicPlaying) {
          audioManager.startMusic();
        }
        document.removeEventListener('pointerdown', handleFirstGesture);
        document.removeEventListener('keydown', handleFirstGesture);
      }

      document.addEventListener('pointerdown', handleFirstGesture, { once: true });
      document.addEventListener('keydown', handleFirstGesture, { once: true });
    },

    /**
     * Iniciar música de fondo
     */
    startMusic: function() {
      if (!musicEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      if (musicGain) {
        musicGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
      }

      if (!isMusicPlaying) {
        isMusicPlaying = true;
        currentMusicNoteIndex = 0;
        scheduleNextMusicNote();
      }
    },

    /**
     * Detener música de fondo
     */
    stopMusic: function() {
      isMusicPlaying = false;
      if (musicTimer) {
        clearTimeout(musicTimer);
        musicTimer = null;
      }
      if (musicGain && audioCtx) {
        musicGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      }
    },

    /**
     * Alternar estado de la música
     */
    toggleMusic: function() {
      musicEnabled = !musicEnabled;
      if (window.RuletaArcoiris.storage) {
        window.RuletaArcoiris.storage.update({ musicEnabled: musicEnabled });
      }

      if (musicEnabled) {
        this.startMusic();
      } else {
        this.stopMusic();
      }
      return musicEnabled;
    },

    isMusicEnabled: function() {
      return musicEnabled;
    },

    /**
     * Alternar efectos de sonido
     */
    toggleSfx: function() {
      sfxEnabled = !sfxEnabled;
      if (window.RuletaArcoiris.storage) {
        window.RuletaArcoiris.storage.update({ sfxEnabled: sfxEnabled });
      }
      if (sfxGain && audioCtx) {
        sfxGain.gain.setValueAtTime(sfxEnabled ? 0.8 : 0.0, audioCtx.currentTime);
      }
      return sfxEnabled;
    },

    isSfxEnabled: function() {
      return sfxEnabled;
    },

    /* =========================================================================
     * EFECTOS DE SONIDO SINTETIZADOS
     * ========================================================================= */

    /**
     * Clic de botón: sonido pop burbujeante y amable
     */
    playButtonClick: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    },

    /**
     * Avance de sector en la ruleta: suave 'tic' de reloj de madera
     */
    playTick: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.025);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.035);
    },

    /**
     * Inicio del giro de la ruleta: swoosh ascendente
     */
    playWheelSpinStart: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.42);
    },

    /**
     * Detención de la ruleta: campana brillante que marca la opción elegida
     */
    playWheelStop: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var now = audioCtx.currentTime;
      // Campana fundamental y armónico brillante
      [880, 1760].forEach(function(freq, i) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        var vol = i === 0 ? 0.35 : 0.18;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    },

    /**
     * Acierto de objeto: campana cristalina que asciende según los encontrados
     * @param {number} step - índice del objetivo encontrado (1, 2, 3...)
     */
    playCorrectItem: function(step) {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
      var baseFreq = notes[Math.min((step || 1) - 1, notes.length - 1)];
      var now = audioCtx.currentTime;

      // Doble tono resonante
      [baseFreq, baseFreq * 1.5].forEach(function(f, idx) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(idx === 0 ? 0.4 : 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    },

    /**
     * Error amable: rebote suave sin tono de castigo o alarma
     */
    playWrongItem: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    },

    /**
     * Desbloqueo de pegatina: arpegio de arpa mágica
     */
    playStickerUnlock: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var arpeggio = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
      var now = audioCtx.currentTime;

      arpeggio.forEach(function(freq, index) {
        var noteTime = now + (index * 0.08);
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.28, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    },

    /**
     * Ronda completada: fanfarria de 5 notas alegres
     */
    playRoundWin: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var fanfare = [
        { freq: 392.00, time: 0.00, dur: 0.14 }, // Sol4
        { freq: 523.25, time: 0.15, dur: 0.14 }, // Do5
        { freq: 659.25, time: 0.30, dur: 0.14 }, // Mi5
        { freq: 783.99, time: 0.45, dur: 0.22 }, // Sol5
        { freq: 1046.50, time: 0.70, dur: 0.55 }  // Do6
      ];

      var now = audioCtx.currentTime;

      fanfare.forEach(function(item) {
        var t = now + item.time;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.38, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + item.dur);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(t);
        osc.stop(t + item.dur + 0.05);
      });
    },

    /**
     * Fin de sesión (5 rondas): melodía de fiesta y celebración
     */
    playSessionWin: function() {
      if (!sfxEnabled) return;
      initAudioContext();
      if (!audioCtx) return;

      var celebration = [
        { freq: 523.25, t: 0.00, d: 0.18 },
        { freq: 659.25, t: 0.20, d: 0.18 },
        { freq: 783.99, t: 0.40, d: 0.22 },
        { freq: 1046.50, t: 0.65, d: 0.30 },
        { freq: 880.00, t: 1.00, d: 0.20 },
        { freq: 1046.50, t: 1.25, d: 0.60 }
      ];

      var now = audioCtx.currentTime;

      celebration.forEach(function(item) {
        var t = now + item.t;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(t);
        osc.stop(t + item.d + 0.05);
      });
    },

    /**
     * Reproducir archivo de voz grabado (si existe en la carpeta audio/)
     * @param {string} filename - Nombre del archivo (ej: 'color_amarillo')
     */
    playVoice: function(filename) {
      if (!sfxEnabled) return;
      try {
        var baseName = filename.replace(/\.(mp3|wav|ogg)$/i, '');
        var src = 'audio/' + baseName + '.mp3';
        var audioEl = new Audio(src);
        audioEl.volume = 0.95;
        var playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            // Fallback silencioso si el archivo aún no ha sido copiado
          });
        }
      } catch (e) {
        // Ignorar fallo sin bloquear el juego
      }
    },

    /**
     * Reproducir la locución del reto actual
     */
    playChallengeVoice: function(challenge) {
      if (!challenge) return;
      if (challenge.mode === 'colores' && challenge.targetColor) {
        this.playVoice('color_' + challenge.targetColor.id);
      } else if (challenge.mode === 'formas' && challenge.targetShape) {
        this.playVoice('forma_' + challenge.targetShape.id);
      }
    }
  };

  window.RuletaArcoiris.audio = audioManager;

})();
