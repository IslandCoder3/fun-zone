(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var SYMBOLS = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⭐', '❤️', '🔺', '🟦'];
  var TEMPLATES = {
    1: [[0, 1]],
    2: [[0, 1, 2], [0, 0, 1], [0, 1, 1]],
    3: [[0, 1, 2, 3], [0, 0, 1, 1], [0, 1, 0, 2]]
  };

  var level = 1;
  var answer = '';
  var locked = false;

  function showCount() {
    U.$('#patSolved').textContent = FunZone.progress.getStat('patterns');
  }

  function nextRound() {
    locked = false;
    U.$('#patFb').textContent = '';

    var tpl = U.pick(TEMPLATES[level]);
    var distinct = Math.max.apply(null, tpl) + 1;
    var symbols = U.shuffle(SYMBOLS).slice(0, distinct + 3);
    var unit = tpl.map(function (i) { return symbols[i]; });
    var total = unit.length * 2 + 1;

    var seq = [];
    for (var i = 0; i < total; i++) seq.push(unit[i % unit.length]);
    answer = seq[total - 1];

    var row = U.$('#patRow');
    row.innerHTML = '';
    seq.forEach(function (sym, n) {
      var item = document.createElement('div');
      item.className = 'pat-item' + (n === total - 1 ? ' blank' : '');
      item.textContent = n === total - 1 ? '?' : sym;
      item.style.animationDelay = (n * 40) + 'ms';
      row.appendChild(item);
    });

    var others = U.shuffle(symbols.filter(function (s) { return s !== answer; })).slice(0, 3);
    var box = U.$('#patAnswers');
    box.innerHTML = '';
    U.shuffle([answer].concat(others)).forEach(function (sym) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer emoji';
      btn.textContent = sym;
      btn.addEventListener('click', function () { check(btn, sym); });
      box.appendChild(btn);
    });

    showCount();
  }

  function check(btn, sym) {
    if (locked) return;
    var fb = U.$('#patFb');

    if (sym === answer) {
      locked = true;
      btn.classList.add('right');
      var blank = U.$('#patRow .blank');
      blank.textContent = answer;
      blank.classList.remove('blank');
      blank.classList.add('filled');
      FunZone.audio.sfx.good();
      U.confetti(12);
      fb.textContent = U.cheer();
      FunZone.progress.bump('patterns');
      FunZone.progress.addStars(1);
      showCount();
      setTimeout(nextRound, 1300);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      FunZone.audio.sfx.bad();
      fb.textContent = 'Look at the pattern again!';
    }
  }

  function init() {
    U.$('#patLvlRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      level = parseInt(b.dataset.lvl, 10);
      U.setPressed('#patLvlRow', 'lvl', String(level));
      nextRound();
    });
    nextRound();
  }

  games.pattern = { init: init, refresh: showCount };
})();
