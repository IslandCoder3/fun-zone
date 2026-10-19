(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var NS = 'http://www.w3.org/2000/svg';

  var level = 1;
  var answer = '';
  var locked = false;
  var handH, handM;

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function buildClock() {
    var svg = U.$('#clockSvg');
    svg.innerHTML = '';
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 92, 'class': 'clock-face' }));

    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180;
      var big = i % 5 === 0;
      var r1 = big ? 78 : 84;
      var r2 = 88;
      svg.appendChild(svgEl('line', {
        x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a),
        x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a),
        'class': 'tick' + (big ? ' big' : '')
      }));
    }

    for (var n = 1; n <= 12; n++) {
      var ang = n * 30 * Math.PI / 180;
      var t = svgEl('text', { x: 100 + 64 * Math.sin(ang), y: 100 - 64 * Math.cos(ang), 'class': 'clock-num' });
      t.textContent = n;
      svg.appendChild(t);
    }

    handH = svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 56, 'class': 'hand-h' });
    handM = svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 34, 'class': 'hand-m' });
    svg.appendChild(handH);
    svg.appendChild(handM);
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 7, 'class': 'clock-dot' }));
  }

  function setTime(h, m) {
    var hourDeg = (h % 12) * 30 + m * 0.5;
    var minDeg = m * 6;
    handH.setAttribute('transform', 'rotate(' + hourDeg + ' 100 100)');
    handM.setAttribute('transform', 'rotate(' + minDeg + ' 100 100)');
  }

  function fmt(h, m) {
    return h + ':' + (m < 10 ? '0' + m : m);
  }

  function minutesFor() {
    if (level === 1) return [0];
    if (level === 2) return [0, 30];
    var all = [];
    for (var m = 0; m < 60; m += 5) all.push(m);
    return all;
  }

  function showCount() {
    U.$('#clockSolved').textContent = FunZone.progress.getStat('clocks');
  }

  function nextRound() {
    locked = false;
    U.$('#clockFb').textContent = '';

    var mins = minutesFor();
    var h = U.rand(1, 12);
    var m = U.pick(mins);
    answer = fmt(h, m);
    setTime(h, m);

    var options = [answer];
    var guard = 0;
    while (options.length < 4 && guard++ < 200) {
      var h2 = ((h - 1 + U.rand(-3, 3) + 12) % 12) + 1;
      var m2 = U.pick(mins);
      var s = fmt(h2, m2);
      if (options.indexOf(s) === -1) options.push(s);
    }

    var box = U.$('#clockAnswers');
    box.innerHTML = '';
    U.shuffle(options).forEach(function (value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer time';
      btn.textContent = value;
      btn.addEventListener('click', function () { check(btn, value); });
      box.appendChild(btn);
    });

    showCount();
  }

  function check(btn, value) {
    if (locked) return;
    var fb = U.$('#clockFb');

    if (value === answer) {
      locked = true;
      btn.classList.add('right');
      FunZone.audio.sfx.good();
      U.confetti(12);
      fb.textContent = U.cheer();
      FunZone.progress.bump('clocks');
      FunZone.progress.addStars(1);
      showCount();
      setTimeout(nextRound, 1400);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      FunZone.audio.sfx.bad();
      fb.textContent = 'Check the short and long hands!';
    }
  }

  function init() {
    buildClock();
    U.$('#clockLvlRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      level = parseInt(b.dataset.lvl, 10);
      U.setPressed('#clockLvlRow', 'lvl', String(level));
      nextRound();
    });
    nextRound();
  }

  games.clock = { init: init, refresh: showCount };
})();
