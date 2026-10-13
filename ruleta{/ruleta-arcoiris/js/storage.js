/**
 * RULETA ARCOÍRIS - Sistema de Almacenamiento Local Seguro
 * Espacio de nombres: window.RuletaArcoiris.storage
 */
(function() {
  'use strict';

  window.RuletaArcoiris = window.RuletaArcoiris || {};

  var STORAGE_KEY = (window.RuletaArcoiris.CONSTANTS && window.RuletaArcoiris.CONSTANTS.STORAGE_KEY) || 'ruletaArcoiris.v1';

  var DEFAULT_STATE = {
    version: 1,
    totalStars: 0,
    roundsCompleted: 0,
    unlockedStickers: [],
    currentProfile: 'pequenos',
    subLevel: 1,
    musicEnabled: true,
    sfxEnabled: true,
    stats: {
      colorsPlayed: 0,
      shapesPlayed: 0,
      comboPlayed: 0,
      totalMistakes: 0,
      perfectRounds: 0
    },
    streakClean: 0,
    streakStruggling: 0
  };

  // Estado en memoria como respaldo ante bloqueos de localStorage
  var memoryState = null;
  var isLocalStorageAvailable = true;

  // Comprobar disponibilidad real de localStorage
  function checkLocalStorageAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      var testKey = '__arcoiris_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  isLocalStorageAvailable = checkLocalStorageAvailability();

  // Clonar objetos de forma segura
  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return Object.assign({}, obj);
    }
  }

  // Sanitizar y validar los datos cargados contra la estructura por defecto
  function sanitizeState(raw) {
    if (!raw || typeof raw !== 'object') {
      return deepClone(DEFAULT_STATE);
    }

    var clean = deepClone(DEFAULT_STATE);

    if (typeof raw.totalStars === 'number' && raw.totalStars >= 0) {
      clean.totalStars = Math.floor(raw.totalStars);
    }
    if (typeof raw.roundsCompleted === 'number' && raw.roundsCompleted >= 0) {
      clean.roundsCompleted = Math.floor(raw.roundsCompleted);
    }
    if (Array.isArray(raw.unlockedStickers)) {
      clean.unlockedStickers = raw.unlockedStickers.filter(function(id) {
        return typeof id === 'string';
      });
    }
    clean.currentProfile = 'pequenos';
    if (typeof raw.subLevel === 'number' && raw.subLevel >= 1 && raw.subLevel <= 3) {
      clean.subLevel = Math.floor(raw.subLevel);
    }
    if (typeof raw.musicEnabled === 'boolean') {
      clean.musicEnabled = raw.musicEnabled;
    }
    if (typeof raw.sfxEnabled === 'boolean') {
      clean.sfxEnabled = raw.sfxEnabled;
    }

    if (raw.stats && typeof raw.stats === 'object') {
      clean.stats.colorsPlayed = Math.max(0, Number(raw.stats.colorsPlayed) || 0);
      clean.stats.shapesPlayed = Math.max(0, Number(raw.stats.shapesPlayed) || 0);
      clean.stats.comboPlayed = Math.max(0, Number(raw.stats.comboPlayed) || 0);
      clean.stats.totalMistakes = Math.max(0, Number(raw.stats.totalMistakes) || 0);
      clean.stats.perfectRounds = Math.max(0, Number(raw.stats.perfectRounds) || 0);
    }

    if (typeof raw.streakClean === 'number') {
      clean.streakClean = Math.max(0, Math.floor(raw.streakClean));
    }
    if (typeof raw.streakStruggling === 'number') {
      clean.streakStruggling = Math.max(0, Math.floor(raw.streakStruggling));
    }

    return clean;
  }

  var storageManager = {
    /**
     * Cargar estado actual con tolerancia total a fallos
     */
    load: function() {
      if (memoryState) {
        return deepClone(memoryState);
      }

      if (!isLocalStorageAvailable) {
        memoryState = deepClone(DEFAULT_STATE);
        return deepClone(memoryState);
      }

      try {
        var rawString = window.localStorage.getItem(STORAGE_KEY);
        if (!rawString) {
          memoryState = deepClone(DEFAULT_STATE);
          this.save(memoryState);
          return deepClone(memoryState);
        }

        var parsed = JSON.parse(rawString);
        memoryState = sanitizeState(parsed);
        return deepClone(memoryState);
      } catch (err) {
        console.warn('RuletaArcoiris: Error al leer datos locales, inicializando valores seguros.', err);
        memoryState = deepClone(DEFAULT_STATE);
        return deepClone(memoryState);
      }
    },

    /**
     * Guardar estado actual
     */
    save: function(state) {
      var sanitized = sanitizeState(state);
      memoryState = deepClone(sanitized);

      if (!isLocalStorageAvailable) {
        return true;
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
        return true;
      } catch (err) {
        console.warn('RuletaArcoiris: Error al persistir en localStorage. Continuando en memoria.', err);
        return false;
      }
    },

    /**
     * Obtener el estado actual sin mutar
     */
    get: function() {
      if (!memoryState) {
        return this.load();
      }
      return deepClone(memoryState);
    },

    /**
     * Actualizar campos específicos del estado
     */
    update: function(partial) {
      var current = this.get();
      for (var key in partial) {
        if (Object.prototype.hasOwnProperty.call(partial, key)) {
          if (key === 'stats' && typeof partial.stats === 'object') {
            current.stats = Object.assign({}, current.stats, partial.stats);
          } else {
            current[key] = partial[key];
          }
        }
      }
      this.save(current);
      return deepClone(current);
    },

    /**
     * Restablecer todo el progreso a valores iniciales limpios
     */
    reset: function() {
      memoryState = deepClone(DEFAULT_STATE);
      if (isLocalStorageAvailable) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          // Ignorar fallo de borrado
        }
      }
      this.save(memoryState);
      return deepClone(memoryState);
    },

    /**
     * Agregar una estrella y verificar desbloqueo de pegatinas
     * @returns {Object} { totalStars, newlyUnlockedStickers }
     */
    addStar: function() {
      var state = this.get();
      state.totalStars = (state.totalStars || 0) + 1;
      state.roundsCompleted = (state.roundsCompleted || 0) + 1;

      var newlyUnlocked = [];
      var allStickers = (window.RuletaArcoiris.STICKERS || []);

      for (var i = 0; i < allStickers.length; i++) {
        var sticker = allStickers[i];
        if (state.totalStars >= sticker.starsRequired) {
          if (state.unlockedStickers.indexOf(sticker.id) === -1) {
            state.unlockedStickers.push(sticker.id);
            newlyUnlocked.push(sticker);
          }
        }
      }

      this.save(state);
      return {
        totalStars: state.totalStars,
        roundsCompleted: state.roundsCompleted,
        newlyUnlockedStickers: newlyUnlocked
      };
    }
  };

  // Inicializar lectura previa
  storageManager.load();

  window.RuletaArcoiris.storage = storageManager;

})();
