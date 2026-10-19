(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var SHAPES = [
    { name: 'circle',    min: 1, svg: '<circle cx="50" cy="50" r="38"/>' },
    { name: 'square',    min: 1, svg: '<rect x="14" y="14" width="72" height="72" rx="4"/>' },
    { name: 'triangle',  min: 1, svg: '<polygon points="50,10 92,86 8,86"/>' },
    { name: 'star',      min: 1, svg: '<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38"/>' },
    { name: 'rectangle', min: 2, svg: '<rect x="8" y="26" width="84" height="48" rx="4"/>' },
    { name: 'heart',     min: 2, svg: '<path d="M50 88 C10 58 6 32 24 20 C38 11 50 22 50 30 C50 22 62 11 76 20 C94 32 90 58 50 88 Z"/>' },
    { name: 'diamond',   min: 2, svg: '<polygon points="50,6 90,50 50,94 10,50"/>' },
    { name: 'hexagon',   min: 3, svg: '<polygon points="50,6 88,28 88,72 50,94 12,72 12,28"/>' },
    { name: 'pentagon',  min: 3, svg: '<polygon points="50,6 94,38 77,90 23,90 6,38"/>' },
    { name: 'oval',      min: 3, svg: '<ellipse cx="50" cy="50" rx="42" ry="28"/>' }
  ];
  var COLORS = ['#7c5cff', '#ff5d9e', '#ffb020', '#1fbf8f', '#2aa7ff', '#ff7a59'];

  var level = 1;
  var target = null;
  var locked = false;

  function showCount() {
    U.$('#shapeSolved').textContent = FunZone.progress.getStat('shapes');
  }

  function nextRound() {
    locked = false;
    U.$('#shapeFb').textContent = '';

    var pool = SHAPES.filter(function (s) { return s.min <= level; });
    target = U.pick(pool);
    var others = U.shuffle(pool.filter(function (s) { return s !== target; })).slice(0, 3);
    var colors = U.shuffle(COLORS);

    U.$('#shapePrompt').textContent = 'Find the ' + target.name;

    var box = U.$('#shapeOptions');
    box.innerHTML = '';
    U.shuffle([target].concat(others)).forEach(function (shape, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shape-btn';
      btn.setAttribute('aria-label', shape.name);
      btn.innerHTML = '<svg viewBox="0 0 100 100" fill="' + colors[i % colors.length] + '" aria-hidden="true">' + shape.svg + '</svg>';
      btn.addEventListener('click', function () { check(btn, shape); });
      box.appendChild(btn);
    });

    showCount();
  }

  function check(btn, shape) {
    if (locked) return;
    var fb = U.$('#shapeFb');

    if (shape === target) {
      locked = true;
      btn.classList.add('right');
      FunZone.audio.sfx.good();
      FunZone.audio.speak(target.name);
      U.confetti(12);
      fb.textContent = 'Yes, a ' + target.name + '!';
      FunZone.progress.bump('shapes');
      FunZone.progress.addStars(1);
      showCount();
      setTimeout(nextRound, 1400);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      FunZone.audio.sfx.bad();
      fb.textContent = 'That is a ' + shape.name + '. Try again!';
    }
  }

  function init() {
    U.$('#shapeLvlRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      level = parseInt(b.dataset.lvl, 10);
      U.setPressed('#shapeLvlRow', 'lvl', String(level));
      nextRound();
    });
    nextRound();
  }

  games.shape = { init: init, refresh: showCount };
})();
