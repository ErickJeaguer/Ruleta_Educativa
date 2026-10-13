/**
 * RULETA ARCOÍRIS - Controlador Principal de la Aplicación y UI
 * Espacio de nombres: window.RuletaArcoiris.app
 */
(function() {
  'use strict';

  window.RuletaArcoiris = window.RuletaArcoiris || {};

  var activeScreen = 'screen-welcome';
  var previousScreen = 'screen-welcome';

  /**
   * Helper para actualizar elementos por ID con seguridad
   */
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /**
   * Generar HTML de la ilustración SVG de Chispa el camaleón
   * @param {string} state - bienvenida | espera | curiosidad | celebracion | animo | sesion
   */
  function renderChispaSvg(state) {
    var eyeL_cy = 40;
    var eyeR_cy = 40;
    var pupilL_cx = 38;
    var pupilR_cx = 58;
    var pupilL_cy = 40;
    var pupilR_cy = 40;
    var mouthPath = 'M36 58 Q48 70 60 58'; // Sonrisa feliz estándar
    var blushFill = '#FF8A80';
    var bodyColor = '#81C784';
    var crestColor = '#4CAF50';
    var crownSvg = '';

    if (state === 'celebracion') {
      mouthPath = 'M34 56 Q48 76 62 56 Z'; // Sonrisa muy abierta de felicidad
      pupilL_cy = 38;
      pupilR_cy = 38;
      blushFill = '#FF5252';
    } else if (state === 'animo') {
      mouthPath = 'M38 60 Q48 68 58 60'; // Sonrisa tierna y de ánimo
      pupilL_cx = 40;
      pupilR_cx = 60;
    } else if (state === 'curiosidad') {
      mouthPath = 'M40 60 Q48 65 56 60';
      pupilL_cx = 35; // Ojos mirando a los lados con curiosidad
      pupilR_cx = 62;
      pupilL_cy = 38;
      pupilR_cy = 38;
    } else if (state === 'espera') {
      mouthPath = 'M38 59 Q48 68 58 59';
      pupilL_cy = 37; // Mirando hacia arriba (hacia la ruleta)
      pupilR_cy = 37;
    } else if (state === 'sesion') {
      mouthPath = 'M34 56 Q48 78 62 56 Z';
      crownSvg = '<polygon points="32,16 38,4 48,14 58,4 64,16" fill="#FFD54F" stroke="#FFA000" stroke-width="2"/>';
    }

    return '<svg viewBox="0 0 100 100" class="chispa-svg chispa-state-' + state + '" aria-hidden="true">' +
      '<defs>' +
        '<filter id="chispa-shadow" x="-10%" y="-10%" width="120%" height="120%">' +
          '<feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#1B5E20" flood-opacity="0.25"/>' +
        '</filter>' +
      '</defs>' +
      // Cola espiral simpática
      '<path d="M22 68 Q10 70 12 82 Q14 92 26 88 Q32 84 28 78 Q26 74 20 76" fill="none" stroke="' + crestColor + '" stroke-width="6.5" stroke-linecap="round"/>' +
      // Cuerpo regordete y amigable
      '<ellipse cx="46" cy="62" rx="28" ry="22" fill="' + bodyColor + '" filter="url(#chispa-shadow)"/>' +
      // Cresta en el lomo
      '<circle cx="34" cy="42" r="5" fill="' + crestColor + '"/>' +
      '<circle cx="44" cy="40" r="6" fill="' + crestColor + '"/>' +
      '<circle cx="54" cy="42" r="5" fill="' + crestColor + '"/>' +
      // Corona opcional
      crownSvg +
      // Patitas redondeadas
      '<circle cx="32" cy="80" r="7" fill="' + crestColor + '"/>' +
      '<circle cx="58" cy="80" r="7" fill="' + crestColor + '"/>' +
      // Cabeza grande y tierna
      '<circle cx="48" cy="48" r="26" fill="' + bodyColor + '"/>' +
      // Ojo izquierdo (grande y expresivo)
      '<circle cx="36" cy="' + eyeL_cy + '" r="11" fill="#FFFFFF" stroke="#388E3C" stroke-width="2"/>' +
      '<circle cx="' + pupilL_cx + '" cy="' + pupilL_cy + '" r="5.5" fill="#1B5E20"/>' +
      '<circle cx="' + (pupilL_cx + 2) + '" cy="' + (pupilL_cy - 2) + '" r="2" fill="#FFFFFF"/>' +
      // Ojo derecho
      '<circle cx="60" cy="' + eyeR_cy + '" r="11" fill="#FFFFFF" stroke="#388E3C" stroke-width="2"/>' +
      '<circle cx="' + pupilR_cx + '" cy="' + pupilR_cy + '" r="5.5" fill="#1B5E20"/>' +
      '<circle cx="' + (pupilR_cx + 2) + '" cy="' + (pupilR_cy - 2) + '" r="2" fill="#FFFFFF"/>' +
      // Mejillas sonrosadas
      '<circle cx="26" cy="56" r="4.5" fill="' + blushFill + '" opacity="0.8"/>' +
      '<circle cx="70" cy="56" r="4.5" fill="' + blushFill + '" opacity="0.8"/>' +
      // Boca expresiva
      '<path d="' + mouthPath + '" fill="' + (state === 'celebracion' || state === 'sesion' ? '#D32F2F' : 'none') + '" stroke="#1B5E20" stroke-width="3" stroke-linecap="round"/>' +
    '</svg>';
  }

  var app = {
    init: function() {
      var self = this;

      // Inicializar submódulos
      if (window.RuletaArcoiris.storage) {
        window.RuletaArcoiris.storage.load();
      }
      if (window.RuletaArcoiris.audio) {
        window.RuletaArcoiris.audio.init();
      }

      // Configurar motor de juego con callbacks
      if (window.RuletaArcoiris.game) {
        window.RuletaArcoiris.game.init({
          onRoundReady: function(data) {
            self.renderChallenge(data);
          },
          onTargetFound: function(item, found, total) {
            self.handleTargetFound(item, found, total);
          },
          onWrongItem: function(item, errors) {
            self.handleWrongItem(item, errors);
          },
          onHintTriggered: function(targetItem) {
            self.highlightHintItem(targetItem);
          },
          onRoundCompleted: function(result) {
            self.showRoundCelebration(result);
          },
          onChispaChange: function(state, message) {
            self.updateChispa(state, message);
          }
        });
      }

      // Inicializar la ruleta en el DOM
      if (window.RuletaArcoiris.wheel) {
        window.RuletaArcoiris.wheel.init('wheel-container');
        window.RuletaArcoiris.game.prepareWheelForMode();
      }

      // Conectar eventos de la interfaz
      this.bindEvents();

      // Actualizar datos iniciales de la UI
      this.updateHud();
      this.updateAudioButtons();
      this.updateProfileSelectionUI();
      this.updateChispa('bienvenida', '¡Hola! Soy Chispa. ¿Listo para jugar en el jardín mágico?');

      // Mostrar pantalla de bienvenida
      this.showScreen('screen-welcome');
    },

    /**
     * Gestión de pantallas
     */
    showScreen: function(screenId) {
      previousScreen = activeScreen;
      activeScreen = screenId;

      var screens = document.querySelectorAll('.app-screen');
      screens.forEach(function(s) {
        if (s.id === screenId) {
          s.classList.remove('hidden');
          s.setAttribute('aria-hidden', 'false');
        } else {
          s.classList.add('hidden');
          s.setAttribute('aria-hidden', 'true');
        }
      });

      this.updateHud();

      if (screenId === 'screen-game') {
        if (window.RuletaArcoiris.game) {
          window.RuletaArcoiris.game.prepareWheelForMode();
        }
        this.updateChispa('espera', '¡Toca el botón GIRAR para descubrir tu nuevo reto!');
      } else if (screenId === 'screen-stickers') {
        this.renderStickerGallery();
        this.updateChispa('bienvenida', '¡Mira todas las pegatinas que puedes conseguir jugando!');
      } else if (screenId === 'screen-welcome') {
        this.updateChispa('bienvenida', '¡Bienvenido a la Ruleta Arcoíris! Elige tu nivel y a jugar.');
      }
    },

    /**
     * Abrir modal
     */
    openModal: function(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        var firstBtn = modal.querySelector('button');
        if (firstBtn) firstBtn.focus();
      }
    },

    /**
     * Cerrar modal
     */
    closeModal: function(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      }
    },

    /**
     * Actualizar barra superior (HUD)
     */
    updateHud: function() {
      if (!window.RuletaArcoiris.storage) return;
      var state = window.RuletaArcoiris.storage.get();

      // Estrellas
      setText('hud-stars-count', String(state.totalStars || 0));
      setText('welcome-stars-count', String(state.totalStars || 0));

      // Ronda actual de sesión
      var curRound = 1;
      if (window.RuletaArcoiris.game) {
        curRound = window.RuletaArcoiris.game.getSessionRound();
      }
      setText('hud-round-indicator', 'Ronda ' + curRound + ' de 5');

      // Nombre del perfil
      setText('hud-profile-badge', '3–5 años');

      // Modo activo en pestañas
      var activeMode = 'colores';
      if (window.RuletaArcoiris.game) {
        activeMode = window.RuletaArcoiris.game.getMode();
      }
      var modeButtons = document.querySelectorAll('.mode-tab-btn');
      modeButtons.forEach(function(btn) {
        if (btn.getAttribute('data-mode') === activeMode) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });
    },

    /**
     * Actualizar iconos y textos de los botones de sonido
     */
    updateAudioButtons: function() {
      var musicOn = true;
      var sfxOn = true;
      if (window.RuletaArcoiris.audio) {
        musicOn = window.RuletaArcoiris.audio.isMusicEnabled();
        sfxOn = window.RuletaArcoiris.audio.isSfxEnabled();
      }

      var musicBtns = document.querySelectorAll('.btn-toggle-music');
      musicBtns.forEach(function(btn) {
        btn.setAttribute('aria-pressed', musicOn ? 'true' : 'false');
        btn.innerHTML = musicOn ? '🎵 <span class="sr-only">Música activa</span>' : '🔇 <span class="sr-only">Música en silencio</span>';
        btn.title = musicOn ? 'Música: Activada' : 'Música: Desactivada';
      });

      var sfxBtns = document.querySelectorAll('.btn-toggle-sfx');
      sfxBtns.forEach(function(btn) {
        btn.setAttribute('aria-pressed', sfxOn ? 'true' : 'false');
        btn.innerHTML = sfxOn ? '🔔 <span class="sr-only">Efectos activos</span>' : '🔕 <span class="sr-only">Efectos en silencio</span>';
        btn.title = sfxOn ? 'Efectos: Activados' : 'Efectos: Desactivados';
      });
    },

    /**
     * Reflejar el perfil seleccionado en la pantalla de inicio
     */
    updateProfileSelectionUI: function() {
      var state = (window.RuletaArcoiris.storage && window.RuletaArcoiris.storage.get()) || { currentProfile: 'pequenos' };
      var curProfile = state.currentProfile;

      var profileBtns = document.querySelectorAll('.profile-card-btn');
      profileBtns.forEach(function(btn) {
        if (btn.getAttribute('data-profile') === curProfile) {
          btn.classList.add('selected');
          btn.setAttribute('aria-checked', 'true');
        } else {
          btn.classList.remove('selected');
          btn.setAttribute('aria-checked', 'false');
        }
      });
    },

    /**
     * Actualizar a Chispa en la interfaz
     */
    updateChispa: function(state, message) {
      var containers = document.querySelectorAll('.chispa-avatar-container');
      var svgMarkup = renderChispaSvg(state);
      containers.forEach(function(c) {
        c.innerHTML = svgMarkup;
      });

      var bubbles = document.querySelectorAll('.chispa-speech-text');
      bubbles.forEach(function(b) {
        b.textContent = message || '';
      });
    },

    /**
     * Mostrar reto en pantalla y generar los objetos interactivos del tablero
     */
    renderChallenge: function(data) {
      var challenge = data.challenge;
      var boardItems = data.boardItems;
      var totalTargets = data.totalTargets;
      var foundCount = data.foundCount;

      // Actualizar tarjeta de instrucción
      setText('challenge-title', challenge.title);
      setText('challenge-instruction', challenge.instruction);
      setText('targets-counter-badge', 'Encontrados: ' + foundCount + ' de ' + totalTargets);

      var indicator = document.getElementById('instruction-visual-cue');
      if (indicator) {
        var cueHtml = '';
        if (challenge.mode === 'colores' && challenge.targetColor) {
          cueHtml = '<span class="color-sample-pill" style="background-color: ' + challenge.targetColor.hex + '; color: ' + challenge.targetColor.textColor + ';">' +
                      challenge.targetColor.name +
                    '</span>';
        } else if (challenge.mode === 'formas' && challenge.targetShape) {
          cueHtml = '<svg viewBox="0 0 100 100" class="shape-sample-icon" fill="#1E88E5" stroke="#1E88E5" stroke-width="4">' +
                      challenge.targetShape.svgPath +
                    '</svg> <span class="shape-sample-text">' + challenge.targetShape.name + '</span>';
        }
        indicator.innerHTML = cueHtml;
      }

      // Renderizar tablero de objetos
      var boardElem = document.getElementById('game-board');
      if (!boardElem) return;

      var boardHtml = '';
      for (var i = 0; i < boardItems.length; i++) {
        var item = boardItems[i];
        var itemColor = item.color;
        var itemShape = item.shape;

        boardHtml += '<button type="button" class="game-board-item" id="' + item.id + '" ' +
          'data-id="' + item.id + '" ' +
          'aria-label="' + item.ariaLabel + '" ' +
          'tabindex="0">' +
          '<div class="item-inner-card">' +
            '<svg viewBox="0 0 100 100" class="item-shape-svg" fill="' + itemColor.hex + '" stroke="' + itemColor.border + '" stroke-width="3.5">' +
              itemShape.svgPath +
            '</svg>' +
            '<span class="item-check-badge" aria-hidden="true">⭐</span>' +
          '</div>' +
        '</button>';
      }

      boardElem.innerHTML = boardHtml;

      // Desactivar botón de girar mientras se resuelve el reto
      var spinBtn = document.getElementById('btn-spin-wheel');
      if (spinBtn) {
        spinBtn.disabled = true;
        spinBtn.classList.add('disabled');
        spinBtn.setAttribute('aria-disabled', 'true');
        spinBtn.textContent = '¡Encuentra los objetos!';
      }
    },

    /**
     * Manejar acierto de objeto
     */
    handleTargetFound: function(item, found, total) {
      var itemElem = document.getElementById(item.id);
      if (itemElem) {
        itemElem.classList.add('item-found');
        itemElem.disabled = true;
        itemElem.setAttribute('aria-disabled', 'true');
      }

      setText('targets-counter-badge', 'Encontrados: ' + found + ' de ' + total);

      // Efecto visual de rebote alegre en el contador
      var badge = document.getElementById('targets-counter-badge');
      if (badge) {
        badge.classList.remove('badge-bump');
        void badge.offsetWidth;
        badge.classList.add('badge-bump');
      }
    },

    /**
     * Manejar error en objeto
     */
    handleWrongItem: function(item, errors) {
      var itemElem = document.getElementById(item.id);
      if (itemElem) {
        itemElem.classList.remove('item-shake');
        void itemElem.offsetWidth;
        itemElem.classList.add('item-shake');
      }
    },

    /**
     * Resaltar objetivo con pista visual suave
     */
    highlightHintItem: function(targetItem) {
      var itemElem = document.getElementById(targetItem.id);
      if (itemElem) {
        itemElem.classList.add('item-hint-glow');
        setTimeout(function() {
          itemElem.classList.remove('item-hint-glow');
        }, 3200);
      }
    },

    /**
     * Mostrar celebración de victoria de ronda
     */
    showRoundCelebration: function(result) {
      var self = this;
      this.updateHud();

      var rewardData = result.rewardData;
      var newlyUnlocked = rewardData.newlyUnlockedStickers || [];

      var stickerAlertElem = document.getElementById('round-sticker-alert');
      if (stickerAlertElem) {
        if (newlyUnlocked.length > 0) {
          var st = newlyUnlocked[0];
          stickerAlertElem.classList.remove('hidden');
          stickerAlertElem.innerHTML = '<div class="new-sticker-card">' +
            '<div class="new-sticker-badge">¡NUEVA PEGATINA!</div>' +
            '<div class="new-sticker-art">' + st.svg + '</div>' +
            '<div class="new-sticker-title">' + st.name + '</div>' +
            '<div class="new-sticker-desc">' + st.description + '</div>' +
          '</div>';
        } else {
          stickerAlertElem.classList.add('hidden');
          stickerAlertElem.innerHTML = '';
        }
      }

      setText('round-win-stars-total', 'Tienes ' + rewardData.totalStars + ' estrellas acumuladas ⭐');

      this.openModal('modal-round-win');
    },

    /**
     * Continuar tras celebrar la ronda
     */
    continueAfterRoundWin: function() {
      this.closeModal('modal-round-win');

      if (!window.RuletaArcoiris.game) return;

      var curRound = window.RuletaArcoiris.game.getSessionRound();
      if (curRound >= 5) {
        // Sesión de 5 rondas completada
        this.showSessionCelebration();
      } else {
        // Avanzar a la siguiente ronda
        window.RuletaArcoiris.game.nextRound();
        this.resetGameBoardUI();
        this.updateHud();
        this.updateChispa('espera', '¡Siguiente reto listo! ¡Gira la ruleta cuando quieras!');
      }
    },

    /**
     * Pantalla de celebración final de sesión de 5 rondas
     */
    showSessionCelebration: function() {
      if (window.RuletaArcoiris.audio) {
        window.RuletaArcoiris.audio.playSessionWin();
      }

      this.updateChispa('sesion', '¡INCREÍBLE! ¡Completaste las 5 rondas del jardín!');

      if (window.RuletaArcoiris.storage) {
        var state = window.RuletaArcoiris.storage.get();
        setText('session-stats-stars', String(state.totalStars || 0));
        setText('session-stats-rounds', String(state.roundsCompleted || 0));
        setText('session-stats-stickers', String((state.unlockedStickers || []).length));
      }

      this.openModal('modal-session-win');
    },

    /**
     * Reiniciar UI del tablero y rehabilitar botón de girar
     */
    resetGameBoardUI: function() {
      var boardElem = document.getElementById('game-board');
      if (boardElem) boardElem.innerHTML = '<div class="board-empty-message">¡Gira la ruleta para comenzar!</div>';

      setText('challenge-title', 'Gira la ruleta');
      setText('challenge-instruction', 'Toca el botón GIRAR para descubrir tu objetivo.');
      setText('targets-counter-badge', 'Esperando giro... 🎯');

      var indicator = document.getElementById('instruction-visual-cue');
      if (indicator) indicator.innerHTML = '';

      var spinBtn = document.getElementById('btn-spin-wheel');
      if (spinBtn) {
        spinBtn.disabled = false;
        spinBtn.classList.remove('disabled');
        spinBtn.removeAttribute('aria-disabled');
        spinBtn.textContent = '¡GIRAR!';
      }
    },

    /**
     * Renderizar álbum de pegatinas
     */
    renderStickerGallery: function() {
      var grid = document.getElementById('stickers-grid');
      if (!grid || !window.RuletaArcoiris.STICKERS) return;

      var state = (window.RuletaArcoiris.storage && window.RuletaArcoiris.storage.get()) || { totalStars: 0, unlockedStickers: [] };
      var totalStars = state.totalStars || 0;
      var unlocked = state.unlockedStickers || [];

      var html = '';
      var allStickers = window.RuletaArcoiris.STICKERS;

      for (var i = 0; i < allStickers.length; i++) {
        var s = allStickers[i];
        var isUnlocked = (unlocked.indexOf(s.id) !== -1);
        var starsNeeded = s.starsRequired;
        var diff = Math.max(0, starsNeeded - totalStars);

        if (isUnlocked) {
          html += '<div class="sticker-item unlocked" tabindex="0" role="article" aria-label="Pegatina desbloqueada: ' + s.name + '">' +
            '<div class="sticker-badge-icon">⭐</div>' +
            '<div class="sticker-artwork">' + s.svg + '</div>' +
            '<div class="sticker-title">' + s.name + '</div>' +
            '<div class="sticker-status-tag tag-unlocked">¡Conseguida!</div>' +
          '</div>';
        } else {
          html += '<div class="sticker-item locked" tabindex="0" role="article" aria-label="Pegatina bloqueada: ' + s.name + '. Faltan ' + diff + ' estrellas">' +
            '<div class="sticker-lock-icon">🔒</div>' +
            '<div class="sticker-artwork silhouette">' + s.svg + '</div>' +
            '<div class="sticker-title">' + s.name + '</div>' +
            '<div class="sticker-status-tag tag-locked">' +
              (diff === 1 ? 'Falta 1 estrella' : 'Faltan ' + diff + ' estrellas') +
            '</div>' +
          '</div>';
        }
      }

      grid.innerHTML = html;
      setText('stickers-unlocked-counter', unlocked.length + ' de ' + allStickers.length + ' pegatinas');
    },

    /**
     * Actualizar vista de configuración y estadísticas
     */
    renderSettingsView: function() {
      if (!window.RuletaArcoiris.storage) return;
      var state = window.RuletaArcoiris.storage.get();

      setText('stats-stars', String(state.totalStars || 0));
      setText('stats-rounds', String(state.roundsCompleted || 0));
      setText('stats-stickers', String((state.unlockedStickers || []).length));
      setText('stats-perfect', String(state.stats ? state.stats.perfectRounds : 0));

      // Perfil activo en el selector de ajustes
      var select = document.getElementById('settings-profile-select');
      if (select) {
        select.value = state.currentProfile || 'pequenos';
      }
    },

    /**
     * Conectar todos los eventos del DOM
     */
    bindEvents: function() {
      var self = this;

      // Sonido de clic en botones interactivos
      document.addEventListener('click', function(e) {
        var btn = e.target.closest('button, .interactive-click');
        if (btn && window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.playButtonClick();
        }
      });

      // --- PANTALLA DE INICIO ---
      var btnPlay = document.getElementById('btn-start-play');
      if (btnPlay) {
        btnPlay.addEventListener('click', function() {
          self.showScreen('screen-game');
          self.resetGameBoardUI();
        });
      }

      // Selector de perfiles en inicio
      var profileCards = document.querySelectorAll('.profile-card-btn');
      profileCards.forEach(function(card) {
        card.addEventListener('click', function() {
          var pId = card.getAttribute('data-profile');
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.setProfile(pId);
          }
          self.updateProfileSelectionUI();
          self.updateHud();
        });
      });

      // Navegación a Colección / Pegatinas
      var btnStickers = document.querySelectorAll('.btn-goto-stickers');
      btnStickers.forEach(function(btn) {
        btn.addEventListener('click', function() {
          self.showScreen('screen-stickers');
        });
      });

      // Botón volver de Colección
      var btnBackStickers = document.getElementById('btn-back-from-stickers');
      if (btnBackStickers) {
        btnBackStickers.addEventListener('click', function() {
          self.showScreen(previousScreen || 'screen-welcome');
        });
      }

      // Botón Volver al menú desde el juego
      var btnHome = document.getElementById('btn-nav-home');
      if (btnHome) {
        btnHome.addEventListener('click', function() {
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.cancelRound();
          }
          self.showScreen('screen-welcome');
        });
      }

      // --- AJUSTES Y CONFIGURACIÓN ---
      var btnSettings = document.querySelectorAll('.btn-open-settings');
      btnSettings.forEach(function(btn) {
        btn.addEventListener('click', function() {
          self.renderSettingsView();
          self.openModal('modal-settings');
        });
      });

      var btnCloseSettings = document.getElementById('btn-close-settings');
      if (btnCloseSettings) {
        btnCloseSettings.addEventListener('click', function() {
          self.closeModal('modal-settings');
        });
      }

      // Cambio de perfil desde ajustes
      var selectProfile = document.getElementById('settings-profile-select');
      if (selectProfile) {
        selectProfile.addEventListener('change', function(e) {
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.setProfile(e.target.value);
          }
          self.updateProfileSelectionUI();
          self.updateHud();
        });
      }

      // Restablecer progreso
      var btnResetProgress = document.getElementById('btn-request-reset-progress');
      if (btnResetProgress) {
        btnResetProgress.addEventListener('click', function() {
          self.openModal('modal-confirm-reset');
        });
      }

      var btnConfirmReset = document.getElementById('btn-confirm-reset-yes');
      if (btnConfirmReset) {
        btnConfirmReset.addEventListener('click', function() {
          if (window.RuletaArcoiris.storage) {
            window.RuletaArcoiris.storage.reset();
          }
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.setProfile('pequenos');
            window.RuletaArcoiris.game.resetSessionRound();
          }
          self.closeModal('modal-confirm-reset');
          self.closeModal('modal-settings');
          self.updateHud();
          self.updateProfileSelectionUI();
          self.resetGameBoardUI();
          self.updateChispa('bienvenida', '¡Progreso reiniciado! ¡Comencemos una nueva aventura!');
        });
      }

      var btnCancelReset = document.getElementById('btn-confirm-reset-no');
      if (btnCancelReset) {
        btnCancelReset.addEventListener('click', function() {
          self.closeModal('modal-confirm-reset');
        });
      }

      // --- BOTONES DE AUDIO (Música y Efectos) ---
      document.addEventListener('click', function(e) {
        var musicBtn = e.target.closest('.btn-toggle-music');
        if (musicBtn && window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.toggleMusic();
          self.updateAudioButtons();
          return;
        }

        var sfxBtn = e.target.closest('.btn-toggle-sfx');
        if (sfxBtn && window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.toggleSfx();
          self.updateAudioButtons();
          return;
        }
      });

      // --- PESTAÑAS DE MODOS DE JUEGO ---
      var modeTabs = document.querySelectorAll('.mode-tab-btn');
      modeTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          if (window.RuletaArcoiris.wheel && window.RuletaArcoiris.wheel.isSpinning()) return;
          var newMode = tab.getAttribute('data-mode');
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.setMode(newMode);
          }
          self.updateHud();
          self.resetGameBoardUI();
        });
      });

      // --- BOTÓN GIRAR RULETA ---
      var btnSpin = document.getElementById('btn-spin-wheel');
      if (btnSpin) {
        btnSpin.addEventListener('click', function() {
          if (!window.RuletaArcoiris.game || window.RuletaArcoiris.game.isRoundInProgress()) return;

          btnSpin.disabled = true;
          btnSpin.classList.add('disabled');
          btnSpin.setAttribute('aria-disabled', 'true');

          window.RuletaArcoiris.game.spinWheel(function(item) {
            // Giro completado, el reto se generó automáticamente
          });
        });
      }

      // --- BOTÓN PARA REPETIR LA INSTRUCCIÓN CON VOZ ---
      var btnRepeatVoice = document.getElementById('btn-repeat-voice');
      if (btnRepeatVoice) {
        btnRepeatVoice.addEventListener('click', function() {
          if (window.RuletaArcoiris.game && window.RuletaArcoiris.audio) {
            var curChallenge = window.RuletaArcoiris.game.getCurrentChallenge();
            if (curChallenge) {
              window.RuletaArcoiris.audio.playChallengeVoice(curChallenge);
              self.updateChispa('curiosidad', curChallenge.instruction);
            }
          }
        });
      }

      // --- SELECCIÓN DE OBJETOS EN EL TABLERO ---
      var boardContainer = document.getElementById('game-board');
      if (boardContainer) {
        boardContainer.addEventListener('click', function(e) {
          var itemBtn = e.target.closest('.game-board-item');
          if (!itemBtn) return;
          var itemId = itemBtn.getAttribute('data-id');
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.selectItem(itemId);
          }
        });
      }

      // --- CELEBRACIÓN DE RONDA ---
      var btnNextRound = document.getElementById('btn-next-round-continue');
      if (btnNextRound) {
        btnNextRound.addEventListener('click', function() {
          self.continueAfterRoundWin();
        });
      }

      // --- CELEBRACIÓN DE SESIÓN ---
      var btnPlayAnotherSession = document.getElementById('btn-play-another-session');
      if (btnPlayAnotherSession) {
        btnPlayAnotherSession.addEventListener('click', function() {
          self.closeModal('modal-session-win');
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.resetSessionRound();
            window.RuletaArcoiris.game.nextRound();
          }
          self.resetGameBoardUI();
          self.updateHud();
          self.updateChispa('espera', '¡Nueva sesión de 5 rondas! ¡A girar!');
        });
      }

      var btnExitToWelcome = document.getElementById('btn-exit-to-welcome');
      if (btnExitToWelcome) {
        btnExitToWelcome.addEventListener('click', function() {
          self.closeModal('modal-session-win');
          if (window.RuletaArcoiris.game) {
            window.RuletaArcoiris.game.cancelRound();
            window.RuletaArcoiris.game.resetSessionRound();
          }
          self.showScreen('screen-welcome');
        });
      }

      // Accesibilidad con teclado: Cerrar modales con Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          var openModals = document.querySelectorAll('.app-modal:not(.hidden)');
          openModals.forEach(function(m) {
            if (m.id === 'modal-settings' || m.id === 'modal-confirm-reset') {
              self.closeModal(m.id);
            }
          });
        }
      });
    }
  };

  window.RuletaArcoiris.app = app;

  // Inicialización automática tras cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      app.init();
    });
  } else {
    app.init();
  }

})();
