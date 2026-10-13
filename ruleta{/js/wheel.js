/**
 * RULETA ARCOÍRIS - Renderizado SVG y Mecánica de Rotación Matemática
 * Espacio de nombres: window.RuletaArcoiris.wheel
 */
(function() {
  'use strict';

  window.RuletaArcoiris = window.RuletaArcoiris || {};

  var containerElement = null;
  var svgElement = null;
  var wheelGroupElement = null;
  var pointerElement = null;

  var currentItems = [];
  var currentType = 'colores'; // 'colores' | 'formas'
  var isSpinning = false;
  var currentRotation = 0; // Grados acumulados
  var tickTimer = null;
  var lastTickSector = -1;

  var SVG_SIZE = 400;
  var CENTER = 200;
  var RADIUS = 175;
  var INNER_RADIUS = 36; // Centro decorativo

  /**
   * Convertir coordenadas polares (ángulo en grados desde las 12h hacia la derecha, radio)
   * a coordenadas cartesianas SVG (x, y)
   */
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  /**
   * Crear el path SVG de un sector circular (cuña)
   */
  function createSectorPath(cx, cy, r, startAngle, endAngle) {
    var start = polarToCartesian(cx, cy, r, endAngle);
    var end = polarToCartesian(cx, cy, r, startAngle);
    var largeArcFlag = (endAngle - startAngle) <= 180 ? '0' : '1';

    return [
      'M', cx, cy,
      'L', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  }

  var wheelManager = {
    /**
     * Inicializar contenedor de la ruleta
     */
    init: function(containerId) {
      containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.error('RuletaArcoiris: No se encontró el contenedor de la ruleta #' + containerId);
        return;
      }
      this.render();
    },

    /**
     * Establecer los elementos mostrados en la ruleta ('colores' o 'formas')
     */
    setItems: function(items, type) {
      currentItems = items || [];
      currentType = type || 'colores';
      this.render();
    },

    getItems: function() {
      return currentItems;
    },

    isSpinning: function() {
      return isSpinning;
    },

    /**
     * Renderizar la ruleta vectorial SVG
     */
    render: function() {
      if (!containerElement) return;

      var n = currentItems.length;
      if (n === 0) return;

      var arcAngle = 360 / n;

      var html = '<div class="wheel-wrapper" role="region" aria-label="Ruleta interactiva">' +
        '<div class="wheel-pointer-container">' +
          '<svg class="wheel-pointer" viewBox="0 0 60 70" aria-hidden="true">' +
            '<defs>' +
              '<filter id="pointer-shadow" x="-20%" y="-20%" width="140%" height="140%">' +
                '<feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#263238" flood-opacity="0.35"/>' +
              '</filter>' +
              '<linearGradient id="pointer-grad" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0%" stop-color="#FF5252"/>' +
                '<stop offset="50%" stop-color="#D50000"/>' +
                '<stop offset="100%" stop-color="#B71C1C"/>' +
              '</linearGradient>' +
            '</defs>' +
            '<path d="M30 65 L8 15 Q6 8 14 8 L46 8 Q54 8 52 15 Z" fill="url(#pointer-grad)" stroke="#FFFFFF" stroke-width="3.5" filter="url(#pointer-shadow)"/>' +
            '<circle cx="30" cy="22" r="7" fill="#FFD54F" stroke="#FFFFFF" stroke-width="2"/>' +
          '</svg>' +
        '</div>' +
        '<svg id="wheel-svg" class="wheel-disc" viewBox="0 0 ' + SVG_SIZE + ' ' + SVG_SIZE + '" aria-hidden="true">' +
          '<defs>' +
            '<filter id="wheel-shadow" x="-10%" y="-10%" width="120%" height="120%">' +
              '<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#1A237E" flood-opacity="0.25"/>' +
            '</filter>' +
            '<radialGradient id="rim-gradient" cx="50%" cy="50%" r="50%">' +
              '<stop offset="85%" stop-color="#FFFFFF"/>' +
              '<stop offset="100%" stop-color="#CFD8DC"/>' +
            '</radialGradient>' +
          '</defs>' +
          // Borde exterior decorativo con luces
          '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="192" fill="#37474F" stroke="#263238" stroke-width="4" filter="url(#wheel-shadow)"/>' +
          '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="185" fill="url(#rim-gradient)"/>';

      // Bombillas/puntos de luz decorativos en el borde
      var numLights = 18;
      for (var l = 0; l < numLights; l++) {
        var lightAngle = (360 / numLights) * l;
        var lp = polarToCartesian(CENTER, CENTER, 188, lightAngle);
        var lightColor = (l % 2 === 0) ? '#FFD54F' : '#FF4081';
        html += '<circle cx="' + lp.x.toFixed(1) + '" cy="' + lp.y.toFixed(1) + '" r="4.5" fill="' + lightColor + '" stroke="#FFFFFF" stroke-width="1.2"/>';
      }

      // Grupo giratorio de sectores
      html += '<g id="wheel-rotator" style="transform-origin: ' + CENTER + 'px ' + CENTER + 'px; transform: rotate(' + currentRotation + 'deg);">';

      // Paleta de fondo suave para sectores del modo formas
      var shapeBgColors = ['#E1F5FE', '#FFF8E1', '#F1F8E9', '#FCE4EC', '#EDE7F6', '#FFF3E0'];

      for (var i = 0; i < n; i++) {
        var item = currentItems[i];
        // El sector i está centrado en i * arcAngle
        // El sector 0 está centrado exactamente a las 12h (0 grados)
        var startAngle = (i * arcAngle) - (arcAngle / 2);
        var endAngle = (i * arcAngle) + (arcAngle / 2);
        var midAngle = i * arcAngle;

        var sectorPath = createSectorPath(CENTER, CENTER, RADIUS, startAngle, endAngle);

        var fillColor = '#FFFFFF';
        var textColor = '#37474F';

        if (currentType === 'colores') {
          fillColor = item.hex || '#CCCCCC';
          textColor = item.textColor || '#FFFFFF';
        } else {
          fillColor = shapeBgColors[i % shapeBgColors.length];
        }

        html += '<g class="wheel-sector" data-index="' + i + '">' +
          '<path d="' + sectorPath + '" fill="' + fillColor + '" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>';

        // Contenido del sector (ícono o texto)
        var contentRadius = RADIUS * 0.65;
        var cp = polarToCartesian(CENTER, CENTER, contentRadius, midAngle);

        if (currentType === 'colores') {
          // Texto del color
          html += '<g transform="translate(' + cp.x.toFixed(1) + ',' + cp.y.toFixed(1) + ') rotate(' + (midAngle + 90) + ')">' +
            '<text text-anchor="middle" dominant-baseline="central" fill="' + textColor + '" font-size="19" font-weight="800" font-family="system-ui, sans-serif" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.35));">' +
              (item.name || '') +
            '</text>' +
          '</g>';
        } else {
          // Ícono vectorial de la figura
          var shapeColor = '#1E88E5'; // Color neutro vibrante para la figura en modo formas
          if (i === 1) shapeColor = '#E53935';
          if (i === 2) shapeColor = '#43A047';
          if (i === 3) shapeColor = '#FB8C00';
          if (i === 4) shapeColor = '#8E24AA';
          if (i === 5) shapeColor = '#00ACC1';

          var iconSize = 44;
          var halfSize = iconSize / 2;

          html += '<g transform="translate(' + (cp.x - halfSize).toFixed(1) + ',' + (cp.y - halfSize).toFixed(1) + ')">' +
            '<svg viewBox="0 0 100 100" width="' + iconSize + '" height="' + iconSize + '" fill="' + shapeColor + '" stroke="' + shapeColor + '" stroke-width="4">' +
              (item.svgPath || '') +
            '</svg>' +
          '</g>';

          // Etiqueta de la forma
          var textRadius = RADIUS * 0.35;
          var tp = polarToCartesian(CENTER, CENTER, textRadius, midAngle);
          html += '<g transform="translate(' + tp.x.toFixed(1) + ',' + tp.y.toFixed(1) + ') rotate(' + (midAngle + 90) + ')">' +
            '<text text-anchor="middle" dominant-baseline="central" fill="#37474F" font-size="12" font-weight="700" font-family="system-ui, sans-serif">' +
              (item.name || '') +
            '</text>' +
          '</g>';
        }

        html += '</g>';
      }

      // Centro de la ruleta (buje decorativo)
      html += '</g>' + // Cierre de wheel-rotator
        '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + INNER_RADIUS + '" fill="#FFFFFF" stroke="#37474F" stroke-width="4" filter="url(#wheel-shadow)"/>' +
        '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="26" fill="#FFD54F" stroke="#FFA000" stroke-width="3"/>' +
        '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="10" fill="#E53935"/>' +
      '</svg>' +
      '</div>';

      containerElement.innerHTML = html;
      svgElement = document.getElementById('wheel-svg');
      wheelGroupElement = document.getElementById('wheel-rotator');
    },

    /**
     * Calcular el ángulo final requerido para que el sector targetIndex quede exactamente bajo el puntero
     * @param {number} targetIndex - Índice del sector a alinear con el puntero superior
     * @returns {number} Ángulo absoluto en grados
     */
    calculateTargetAngle: function(targetIndex) {
      var n = currentItems.length;
      if (n === 0) return currentRotation;

      var arcAngle = 360 / n;

      // El sector targetIndex está centrado originalmente en:
      // theta = targetIndex * arcAngle
      // El puntero está en las 12h (0 grados).
      // Tras rotar clockwise por R grados:
      // (theta + R) % 360 === 0
      // R % 360 === (360 - theta % 360) % 360
      var targetBaseMod = (360 - ((targetIndex * arcAngle) % 360)) % 360;

      var currentMod = ((currentRotation % 360) + 360) % 360;
      var forwardDelta = (targetBaseMod - currentMod + 360) % 360;

      // Al menos MIN_SPIN_ROTATIONS vueltas completas (4 a 5)
      var minRotations = (window.RuletaArcoiris.CONSTANTS && window.RuletaArcoiris.CONSTANTS.MIN_SPIN_ROTATIONS) || 4;
      var fullTurns = minRotations * 360;

      return currentRotation + fullTurns + forwardDelta;
    },

    /**
     * Obtener el índice del sector que está actualmente alineado bajo el puntero a las 12h
     */
    getSectorUnderPointer: function(rotationDegrees) {
      var n = currentItems.length;
      if (n === 0) return 0;
      var arcAngle = 360 / n;

      // Ángulo original del punto que ahora está a las 12h (0 grados):
      var rotMod = ((rotationDegrees % 360) + 360) % 360;
      var originalAngleAtPointer = (360 - rotMod) % 360;

      // El sector i cubre [i*arc - arc/2, i*arc + arc/2]
      var shifted = (originalAngleAtPointer + (arcAngle / 2)) % 360;
      var index = Math.floor(shifted / arcAngle) % n;
      return index;
    },

    /**
     * Hacer girar la ruleta hacia el elemento destino elegido
     * @param {number} targetIndex - Índice del objetivo seleccionado
     * @param {Function} onComplete - Callback que recibe el elemento seleccionado
     */
    spinTo: function(targetIndex, onComplete) {
      if (isSpinning) return;
      if (!wheelGroupElement) {
        wheelGroupElement = document.getElementById('wheel-rotator');
      }
      if (!wheelGroupElement || currentItems.length === 0) return;

      isSpinning = true;
      var targetItem = currentItems[targetIndex];
      var targetAngle = this.calculateTargetAngle(targetIndex);

      var durationMs = (window.RuletaArcoiris.CONSTANTS && window.RuletaArcoiris.CONSTANTS.SPIN_DURATION_MS) || 3400;

      // Sonido de inicio de giro
      if (window.RuletaArcoiris.audio) {
        window.RuletaArcoiris.audio.playWheelSpinStart();
      }

      // Animación con aceleración y desaceleración fluida
      // Curva cubic-bezier clásica de ruleta: arranque veloz y desaceleración suave y larga
      wheelGroupElement.style.transition = 'transform ' + durationMs + 'ms cubic-bezier(0.15, 0.85, 0.25, 1)';
      wheelGroupElement.style.transform = 'rotate(' + targetAngle + 'deg)';

      // Planificar tics de sonido a medida que los sectores cruzan el puntero
      var startTime = performance.now();
      var startRotation = currentRotation;
      var self = this;
      lastTickSector = this.getSectorUnderPointer(startRotation);

      if (tickTimer) clearInterval(tickTimer);
      tickTimer = setInterval(function() {
        var elapsed = performance.now() - startTime;
        var progress = Math.min(1, elapsed / durationMs);

        // Aproximación con la curva de bezier de desaceleración para simular el paso de sectores
        // Bezier cúbico aproximado: 1 - Math.pow(1 - progress, 3.2)
        var eased = 1 - Math.pow(1 - progress, 3.2);
        var currentApproxRotation = startRotation + ((targetAngle - startRotation) * eased);
        var curSector = self.getSectorUnderPointer(currentApproxRotation);

        if (curSector !== lastTickSector) {
          lastTickSector = curSector;
          if (window.RuletaArcoiris.audio) {
            window.RuletaArcoiris.audio.playTick();
          }
        }

        if (progress >= 1) {
          clearInterval(tickTimer);
          tickTimer = null;
        }
      }, 50);

      // Finalización del giro
      var completed = false;
      function handleComplete() {
        if (completed) return;
        completed = true;

        if (tickTimer) {
          clearInterval(tickTimer);
          tickTimer = null;
        }

        currentRotation = targetAngle;
        isSpinning = false;

        // Sonido de campana al detenerse
        if (window.RuletaArcoiris.audio) {
          window.RuletaArcoiris.audio.playWheelStop();
        }

        // Resaltar visualmente el sector ganador
        self.highlightSector(targetIndex);

        if (typeof onComplete === 'function') {
          setTimeout(function() {
            onComplete(targetItem, targetIndex);
          }, 350);
        }
      }

      // Timeout de seguridad que coincide con la duración
      setTimeout(handleComplete, durationMs + 50);
    },

    /**
     * Resaltar temporalmente el sector ganador
     */
    highlightSector: function(index) {
      if (!svgElement) return;
      var sectors = svgElement.querySelectorAll('.wheel-sector');
      sectors.forEach(function(sec) {
        sec.classList.remove('sector-winner');
      });
      var winner = svgElement.querySelector('.wheel-sector[data-index="' + index + '"]');
      if (winner) {
        winner.classList.add('sector-winner');
      }
    },

    /**
     * Reiniciar estado visual
     */
    reset: function() {
      if (tickTimer) {
        clearInterval(tickTimer);
        tickTimer = null;
      }
      isSpinning = false;
    }
  };

  window.RuletaArcoiris.wheel = wheelManager;

})();
