(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var ITEMS = [
    ['🍎', 'apples'], ['⭐', 'stars'], ['🐟', 'fish'], ['🎈', 'balloons'], ['🐞', 'ladybugs'],
    ['🌼', 'flowers'], ['🚗', 'cars'], ['🍪', 'cookies'], ['🦋', 'butterflies'], ['🐥', 'chicks']
  ];

  var level = 1;
  var answer = 0;
  var tapped = 0;
  var locked = false;

  function showCount() {
    U.$('#countSolved').textContent = FunZone.progress.getStat('counts');
  }

  function nextRound() {
    locked = false;
    tapped = 0;
    U.$('#countFb').textContent = '';

    var min = level === 3 ? 4 : 1;
    var max = level === 1 ? 5 : level === 2 ? 10 : 15;
    answer = U.rand(min, max);

    var item = U.pick(ITEMS);
    U.$('#countPrompt').textContent = 'How many ' + item[1] + '?';

    var board = U.$('#countBoard');
    board.innerHTML = '';
    for (var i = 0; i < answer; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'count-item';
      btn.textContent = item[0];
      btn.setAttribute('aria-label', item[1] + ' item');
      btn.style.animationDelay = (i * 40) + 'ms';
      btn.addEventListener('click', onItem);
      board.appendChild(btn);
    }

    var options = [answer];
    var guard = 0;
    while (options.length < 4 && guard++ < 100) {
      var wrong = answer + U.rand(-3, 3);
      if (wrong >= 1 && options.indexOf(wrong) === -1) options.push(wrong);
    }

    var box = U.$('#countAnswers');
    box.innerHTML = '';
    U.shuffle(options).forEach(function (value) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'answer';
      b.textContent = value;
      b.addEventListener('click', function () { check(b, value); });
      box.appendChild(b);
    });

    showCount();
  }

  function onItem(e) {
    var el = e.currentTarget;
    if (el.dataset.n) return;
    tapped++;
    el.dataset.n = tapped;
    FunZone.audio.sfx.flip();
  }

  function check(btn, value) {
    if (locked) return;
    var fb = U.$('#countFb');

    if (value === answer) {
      locked = true;
      btn.classList.add('right');
      FunZone.audio.sfx.good();
      U.confetti(14);
      fb.textContent = answer + '! ' + U.cheer();
      FunZone.progress.bump('counts');
      FunZone.progress.addStars(1);
      showCount();
      setTimeout(nextRound, 1400);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      FunZone.audio.sfx.bad();
      fb.textContent = 'Try counting each one!';
    }
  }

  function init() {
    U.$('#countLvlRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      level = parseInt(b.dataset.lvl, 10);
      U.setPressed('#countLvlRow', 'lvl', String(level));
      nextRound();
    });
    nextRound();
  }

  games.count = { init: init, refresh: showCount };
})();
