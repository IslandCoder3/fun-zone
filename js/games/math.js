(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var op = '+';
  var level = 1;
  var streak = 0;
  var solved = 0;
  var answer = 0;
  var locked = false;

  function nextQuestion() {
    locked = false;
    U.$('#mathFb').textContent = '';

    var a, b;
    if (op === '×') {
      var m = level === 1 ? 5 : level === 2 ? 10 : 12;
      a = U.rand(1, m);
      b = U.rand(1, m);
      answer = a * b;
    } else {
      var max = level === 1 ? 10 : level === 2 ? 30 : 100;
      a = U.rand(1, max);
      b = U.rand(1, max);
      if (op === '-' && b > a) { var t = a; a = b; b = t; }
      answer = op === '+' ? a + b : a - b;
    }
    U.$('#question').textContent = a + ' ' + op + ' ' + b;

    var options = [answer];
    var guard = 0;
    while (options.length < 4 && guard++ < 100) {
      var wrong = answer + U.rand(-6, 6);
      if (wrong >= 0 && options.indexOf(wrong) === -1) options.push(wrong);
    }

    var box = U.$('#answers');
    box.innerHTML = '';
    U.shuffle(options).forEach(function (value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer';
      btn.textContent = value;
      btn.addEventListener('click', function () { check(btn, value); });
      box.appendChild(btn);
    });
  }

  function check(btn, value) {
    if (locked) return;
    var fb = U.$('#mathFb');

    if (value === answer) {
      locked = true;
      btn.classList.add('right');
      streak++;
      solved++;
      U.$('#streak').textContent = streak;
      U.$('#solved').textContent = solved;
      FunZone.audio.sfx.good();
      U.confetti(10);
      fb.textContent = U.cheer();
      FunZone.progress.addStars(1);
      FunZone.progress.setMax('maxStreak', streak);

      if (streak % 5 === 0) {
        fb.textContent = streak + ' in a row! Bonus stars!';
        U.confetti(30);
        FunZone.progress.addStars(2);
      }
      setTimeout(nextQuestion, 1100);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      streak = 0;
      U.$('#streak').textContent = 0;
      FunZone.audio.sfx.bad();
      fb.textContent = 'Not quite. Try again!';
    }
  }

  function init() {
    U.$('#opRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      op = b.dataset.op;
      U.setPressed('#opRow', 'op', op);
      nextQuestion();
    });

    U.$('#lvlRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      level = parseInt(b.dataset.lvl, 10);
      U.setPressed('#lvlRow', 'lvl', String(level));
      nextQuestion();
    });

    nextQuestion();
  }

  games.math = { init: init };
})();
