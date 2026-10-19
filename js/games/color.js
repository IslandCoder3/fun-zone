(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var NAMED_COLORS = [
    ['Red', 255, 0, 0], ['Orange', 255, 150, 0], ['Yellow', 255, 235, 0], ['Green', 0, 180, 60],
    ['Lime', 150, 255, 0], ['Sky Blue', 120, 200, 255], ['Blue', 0, 70, 255], ['Purple', 150, 40, 200],
    ['Pink', 255, 130, 190], ['Hot Pink', 255, 20, 140], ['Brown', 130, 80, 40], ['Black', 0, 0, 0],
    ['White', 255, 255, 255], ['Gray', 128, 128, 128], ['Cyan', 0, 230, 230], ['Peach', 255, 200, 160],
    ['Dark Green', 0, 100, 40], ['Navy', 0, 0, 120], ['Maroon', 128, 0, 0], ['Gold', 255, 200, 0]
  ];

  function dot(hex) {
    return '<span class="dot" style="background:' + hex + '"></span>';
  }

  var MIXES = [
    { id: 'orange', label: dot('#f00') + ' + ' + dot('#ff0') + ' = Orange',   rgb: [255, 150, 0] },
    { id: 'green',  label: dot('#00f') + ' + ' + dot('#ff0') + ' = Green',    rgb: [0, 180, 60] },
    { id: 'purple', label: dot('#f00') + ' + ' + dot('#00f') + ' = Purple',   rgb: [150, 40, 200] },
    { id: 'pink',   label: dot('#f00') + ' + ' + dot('#fff') + ' = Pink',     rgb: [255, 130, 190] },
    { id: 'sky',    label: dot('#00f') + ' + ' + dot('#fff') + ' = Sky Blue', rgb: [120, 200, 255] }
  ];

  var rIn, gIn, bIn;
  var tried = {};

  function hex2(v) {
    var s = v.toString(16);
    return (s.length < 2 ? '0' : '') + s;
  }

  function update() {
    var r = +rIn.value, g = +gIn.value, b = +bIn.value;
    var rgb = 'rgb(' + r + ',' + g + ',' + b + ')';

    U.$('#swatch').style.background = rgb;
    U.$('#hexCode').textContent = ('#' + hex2(r) + hex2(g) + hex2(b)).toUpperCase();

    rIn.style.background = 'linear-gradient(90deg, rgb(0,' + g + ',' + b + '), rgb(255,' + g + ',' + b + '))';
    gIn.style.background = 'linear-gradient(90deg, rgb(' + r + ',0,' + b + '), rgb(' + r + ',255,' + b + '))';
    bIn.style.background = 'linear-gradient(90deg, rgb(' + r + ',' + g + ',0), rgb(' + r + ',' + g + ',255))';

    var best = NAMED_COLORS[0];
    var bestDist = Infinity;
    NAMED_COLORS.forEach(function (c) {
      var d = Math.pow(c[1] - r, 2) + Math.pow(c[2] - g, 2) + Math.pow(c[3] - b, 2);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    U.$('#colorName').textContent = best[0];
  }

  function applyMix(mix) {
    rIn.value = mix.rgb[0];
    gIn.value = mix.rgb[1];
    bIn.value = mix.rgb[2];
    update();
    FunZone.audio.sfx.match();

    if (!tried[mix.id]) {
      tried[mix.id] = true;
      FunZone.progress.addStars(1);
      FunZone.progress.bump('mixes');
    }
  }

  function init() {
    rIn = U.$('#r');
    gIn = U.$('#g');
    bIn = U.$('#b');

    [rIn, gIn, bIn].forEach(function (el) { el.addEventListener('input', update); });

    var row = U.$('#mixRow');
    MIXES.forEach(function (mix) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mix-btn';
      btn.innerHTML = mix.label;
      btn.addEventListener('click', function () { applyMix(mix); });
      row.appendChild(btn);
    });

    update();
  }

  games.color = { init: init };
})();
