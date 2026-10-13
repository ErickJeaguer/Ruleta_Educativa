/**
 * RULETA ARCOÍRIS - Motor del Juego, Retos Educativos y Dificultad Adaptativa
 * Espacio de nombres: window.RuletaArcoiris.game
 */
(function() {
  'use strict';

  window.RuletaArcoiris = window.RuletaArcoiris || {};

  var currentMode = 'colores'; // 'colores' | 'formas'
  var currentProfileId = 'pequenos';
  var currentSubLevel = 1; // 1 a 3

  var sessionRound = 1; // 1 a 5 rondas por sesión
  var sessionMaxRounds = 5;

  var currentChallenge = null;
  var boardItems = [];
  var foundCount = 0;
  var totalTargetsNeeded = 0;
  var errorsThisRound = 0;
  var isRoundActive = false;

  // Seguimiento adaptativo
  var streakClean = 0;
  var streakStruggling = 0;

  // Callbacks para comunicar con la interfaz (app.js)
  var listeners = {
    onRoundReady: null,
    onTargetFound: null,
    onWrongItem: null,
    onHintTriggered: null,
    onRoundCompleted: null,
    onSessionCompleted: null,
    onChispaChange: null
  };

  /**
   * Obtener perfil activo y sus parámetros
   */
  function getActiveProfile() {
    var profiles = window.RuletaArcoiris.PROFILES || {};
    return profiles[currentProfileId] || profiles.pequenos;
  }

  /**
   * Obtener colores habilitados para el perfil actual
   */
  function getAvailableColors() {
    var profile = getActiveProfile();
    var allColors = window.RuletaArcoiris.COLORS || [];
    return allColors.filter(function(c) {
      return profile.colorIds.indexOf(c.id) !== -1;
    });
  }

  /**
   * Obtener formas habilitadas para el perfil actual
   */
  function getAvailableShapes() {
    var profile = getActiveProfile();
    var allShapes = window.RuletaArcoiris.SHAPES || [];
    return allShapes.filter(function(s) {
      return profile.shapeIds.indexOf(s.id) !== -1;
    });
  }

  /**
   * Barajado aleatorio Fisher-Yates
   */
  function shuffleArray(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /**
   * Notificar cambio de estado a Chispa
   */
  function setChispaState(state, message) {
    if (typeof listeners.onChispaChange === 'function') {
      listeners.onChispaChange(state, message);
    }
  }

  var gameManager = {
    /**
     * Inicializar motor de juego
     */
    init: function(callbacks) {
      listeners = Object.assign(listeners, callbacks || {});

      if (window.RuletaArcoiris.storage) {
        var state = window.RuletaArcoiris.storage.get();
        currentProfileId = state.currentProfile || 'pequenos';
        currentSubLevel = state.subLevel || 1;
        streakClean = state.streakClean || 0;
        streakStruggling = state.streakStruggling || 0;
      }

      sessionRound = 1;
      this.prepareWheelForMode();
    },

    setMode: function(mode) {
      if (mode !== 'colores' && mode !== 'formas') mode = 'colores';
      if (currentMode === mode) return;
      currentMode = mode;
      isRoundActive = false;
      this.prepareWheelForMode();
    },

    getMode: function() {
      return currentMode;
    },

    setProfile: function(profileId) {
      currentProfileId = 'pequenos';
      currentSubLevel = 1;
      streakClean = 0;
      streakStruggling = 0;
      if (window.RuletaArcoiris.storage) {
        window.RuletaArcoiris.storage.update({
          currentProfile: 'pequenos',
          subLevel: currentSubLevel,
          streakClean: 0,
          streakStruggling: 0
        });
      }
      this.prepareWheelForMode();
    },

    getProfile: function() {
      return getActiveProfile();
    },

    getSubLevel: function() {
      return currentSubLevel;
    },

    getSessionRound: function() {
      return sessionRound;
    },

    resetSessionRound: function() {
      sessionRound = 1;
    },

    isRoundInProgress: function() {
      return isRoundActive;
    },

    /**
     * Configurar la ruleta según el modo actual (colores o formas)
     */
    prepareWheelForMode: function() {
      if (!window.RuletaArcoiris.wheel) return;

      var colors = getAvailableColors();
      var shapes = getAvailableShapes();

      if (currentMode === 'formas') {
        window.RuletaArcoiris.wheel.setItems(shapes, 'formas');
      } else {
        window.RuletaArcoiris.wheel.setItems(colors, 'colores');
      }
    },

    /**
     * Ejecutar el giro de la ruleta
     * @param {Function} onFinishSpin
     */
    spinWheel: function(onFinishSpin) {
      if (window.RuletaArcoiris.wheel.isSpinning() || isRoundActive) return;

      var self = this;
      var items = window.RuletaArcoiris.wheel.getItems();
      if (!items || items.length === 0) return;

      // Selección aleatoria equilibrada
      var targetIndex = Math.floor(Math.random() * items.length);

      setChispaState('espera', '¡La ruleta está girando! ¿Qué tocará?');

      window.RuletaArcoiris.wheel.spinTo(targetIndex, function(chosenItem) {
        self.handleSpinResult(chosenItem, targetIndex, onFinishSpin);
      });
    },

    /**
     * Procesar resultado del giro según el modo
     */
    handleSpinResult: function(chosenItem, index, onFinishSpin) {
      var self = this;

      if (currentMode === 'colores') {
        self.createChallenge({
          mode: 'colores',
          targetColor: chosenItem
        });
        if (typeof onFinishSpin === 'function') onFinishSpin(chosenItem);

      } else {
        self.createChallenge({
          mode: 'formas',
          targetShape: chosenItem
        });
        if (typeof onFinishSpin === 'function') onFinishSpin(chosenItem);
      }
    },

    /**
     * Generación del reto y del tablero de juego
     */
    createChallenge: function(params) {
      var profile = getActiveProfile();
      var colors = getAvailableColors();
      var shapes = getAvailableShapes();

      // Cálculo de cantidades según perfil y subnivel adaptativo
      var baseMinObj = profile.minObjects;
      var baseMaxObj = profile.maxObjects;
      var totalObjects = Math.min(
        baseMaxObj,
        baseMinObj + (currentSubLevel - 1) + Math.floor(Math.random() * 2)
      );

      var minT = profile.minTargets;
      var maxT = profile.maxTargets;
      var numTargets = Math.min(
        maxT,
        Math.max(minT, minT + Math.floor(Math.random() * (maxT - minT + 1)))
      );

      // Asegurar que numTargets nunca exceda totalObjects - 1
      numTargets = Math.max(1, Math.min(numTargets, totalObjects - 1));

      var items = [];
      var nextId = 1;

      if (params.mode === 'colores') {
        var targetColor = params.targetColor;

        currentChallenge = {
          mode: 'colores',
          targetColor: targetColor,
          targetShape: null,
          title: 'Color ' + targetColor.name,
          instruction: 'Toca todos los objetos de color ' + targetColor.name + '.',
          accessibleText: 'Busca los objetos de color ' + targetColor.name
        };

        // 1. Generar los objetivos correctos (mismo color, formas variadas)
        for (var t = 0; t < numTargets; t++) {
          var randomShape = shapes[Math.floor(Math.random() * shapes.length)];
          items.push({
            id: 'item_' + (nextId++),
            color: targetColor,
            shape: randomShape,
            isTarget: true,
            isFound: false,
            ariaLabel: randomShape.name + ' ' + (randomShape.gender === 'f' ? targetColor.feminine : targetColor.name)
          });
        }

        // 2. Generar distractores (otros colores disponibles, nunca el color objetivo)
        var otherColors = colors.filter(function(c) { return c.id !== targetColor.id; });
        var distractorsNeeded = totalObjects - numTargets;

        for (var d = 0; d < distractorsNeeded; d++) {
          var dColor = otherColors[Math.floor(Math.random() * otherColors.length)];
          var dShape = shapes[Math.floor(Math.random() * shapes.length)];
          items.push({
            id: 'item_' + (nextId++),
            color: dColor,
            shape: dShape,
            isTarget: false,
            isFound: false,
            ariaLabel: dShape.name + ' ' + (dShape.gender === 'f' ? dColor.feminine : dColor.name)
          });
        }

      } else if (params.mode === 'formas') {
        var targetShape = params.targetShape;

        currentChallenge = {
          mode: 'formas',
          targetColor: null,
          targetShape: targetShape,
          title: targetShape.name,
          instruction: 'Toca todas las figuras: ' + targetShape.plural + '.',
          accessibleText: 'Busca todas las figuras con forma de ' + targetShape.name
        };

        // 1. Generar objetivos correctos (misma forma, colores variados)
        for (var st = 0; st < numTargets; st++) {
          var sColor = colors[Math.floor(Math.random() * colors.length)];
          items.push({
            id: 'item_' + (nextId++),
            color: sColor,
            shape: targetShape,
            isTarget: true,
            isFound: false,
            ariaLabel: targetShape.name + ' ' + (targetShape.gender === 'f' ? sColor.feminine : sColor.name)
          });
        }

        // 2. Generar distractores (otras formas, nunca la forma objetivo)
        var otherShapes = shapes.filter(function(s) { return s.id !== targetShape.id; });
        var sDistractorsNeeded = totalObjects - numTargets;

        for (var sd = 0; sd < sDistractorsNeeded; sd++) {
          var distShape = otherShapes[Math.floor(Math.random() * otherShapes.length)];
          var distColor = colors[Math.floor(Math.random() * colors.length)];
          items.push({
            id: 'item_' + (nextId++),
            color: distColor,
            shape: distShape,
            isTarget: false,
            isFound: false,
            ariaLabel: distShape.name + ' ' + (distShape.gender === 'f' ? distColor.feminine : distColor.name)
          });
        }

      }

      // Mezclar posiciones en el tablero
      boardItems = shuffleArray(items);
      foundCount = 0;
      totalTargetsNeeded = numTargets;
      errorsThisRound = 0;
      isRoundActive = true;

      setChispaState('curiosidad', currentChallenge.instruction);

      if (window.RuletaArcoiris.audio) {
        window.RuletaArcoiris.audio.playChallengeVoice(currentChallenge);
      }

      if (typeof listeners.onRoundReady === 'function') {
        listeners.onRoundReady({
          challenge: currentChallenge,
          boardItems: boardItems,
          totalTargets: totalTargetsNeeded,
          foundCount: foundCount
        });
      }
    },

    /**
     * Manejar la selección de un objeto del tablero
     * @param {string} itemId
     */
    selectItem: function(itemId) {
      if (!isRoundActive) return;

      var item = null;
      for (var i = 0; i < boardItems.length; i++) {
        if (boardItems[i].id === itemId) {
          item = boardItems[i];
          break;
        }
      }

      if (!item || item.isFound) return;

      if (item.isTarget) {
        // RESPUESTA CORRECTA
        item.isFound = true;
        foundCount++;

        // Sonido ascendente según aciertos acumulados en la ronda
        if (window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.playCorrectItem(foundCount);
        }

        setChispaState('celebracion', '¡Excelente! ¡Encontraste uno!');

        if (typeof listeners.onTargetFound === 'function') {
          listeners.onTargetFound(item, foundCount, totalTargetsNeeded);
        }

        // Comprobar si se completó la ronda
        if (foundCount >= totalTargetsNeeded) {
          this.completeRound();
        }

      } else {
        // RESPUESTA INCORRECTA
        errorsThisRound++;

        if (window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.playWrongItem();
        }

        setChispaState('animo', '¡Casi! Sigue buscando, ¡tú puedes!');

        if (typeof listeners.onWrongItem === 'function') {
          listeners.onWrongItem(item, errorsThisRound);
        }

        // Pista visual amigable si supera el umbral de errores
        var profile = getActiveProfile();
        if (errorsThisRound >= profile.errorHintThreshold) {
          this.triggerHint();
        }
      }
    },

    /**
     * Activar pista visual suave en uno de los objetivos no encontrados
     */
    triggerHint: function() {
      var unfoundTargets = boardItems.filter(function(i) {
        return i.isTarget && !i.isFound;
      });

      if (unfoundTargets.length > 0) {
        var hintTarget = unfoundTargets[0];
        setChispaState('curiosidad', '¡Mira con atención! Chispa te da una pista.');
        if (typeof listeners.onHintTriggered === 'function') {
          listeners.onHintTriggered(hintTarget);
        }
      }
    },

    /**
     * Finalizar ronda con éxito
     */
    completeRound: function() {
      isRoundActive = false;

      // Actualizar persistencia y recompensas
      var rewardData = { totalStars: 0, newlyUnlockedStickers: [] };
      if (window.RuletaArcoiris.storage) {
        rewardData = window.RuletaArcoiris.storage.addStar();

        // Actualizar estadísticas
        var state = window.RuletaArcoiris.storage.get();
        if (currentMode === 'colores') state.stats.colorsPlayed++;
        else state.stats.shapesPlayed++;

        state.stats.totalMistakes += errorsThisRound;
        if (errorsThisRound === 0) state.stats.perfectRounds++;

        // Ajuste adaptativo de dificultad
        if (errorsThisRound <= 1) {
          streakClean++;
          streakStruggling = 0;
          if (streakClean >= 3 && currentSubLevel < 3) {
            currentSubLevel++;
            streakClean = 0;
          }
        } else if (errorsThisRound >= 3) {
          streakStruggling++;
          streakClean = 0;
          if (streakStruggling >= 2 && currentSubLevel > 1) {
            currentSubLevel--;
            streakStruggling = 0;
          }
        }

        state.subLevel = currentSubLevel;
        state.streakClean = streakClean;
        state.streakStruggling = streakStruggling;
        window.RuletaArcoiris.storage.save(state);
      }

      var isSessionEnd = (sessionRound >= sessionMaxRounds);

      if (rewardData.newlyUnlockedStickers && rewardData.newlyUnlockedStickers.length > 0) {
        if (window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.playStickerUnlock();
        }
      } else {
        if (window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.playRoundWin();
        }
      }

      setChispaState('celebracion', '¡Genial! ¡Lo lograste! Ganaste una estrella dorada.');

      var self = this;
      if (typeof listeners.onRoundCompleted === 'function') {
        listeners.onRoundCompleted({
          rewardData: rewardData,
          sessionRound: sessionRound,
          isSessionEnd: isSessionEnd,
          errors: errorsThisRound,
          challenge: currentChallenge
        });
      }
    },

    /**
     * Avanzar a la siguiente ronda de la sesión
     */
    nextRound: function() {
      if (sessionRound < sessionMaxRounds) {
        sessionRound++;
      } else {
        sessionRound = 1;
      }
      isRoundActive = false;
      this.prepareWheelForMode();
    },

    /**
     * Obtener el reto actual
     */
    getCurrentChallenge: function() {
      return currentChallenge;
    },

    /**
     * Terminar o cancelar ronda activa (por ejemplo, al volver al inicio)
     */
    cancelRound: function() {
      isRoundActive = false;
      if (window.RuletaArcoiris.wheel) {
        window.RuletaArcoiris.wheel.reset();
      }
    }
  };

  window.RuletaArcoiris.game = gameManager;

})();
