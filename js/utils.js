(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};

  var CHEERS = ['Great job!', 'Awesome!', 'You rock!', 'Super!', 'Fantastic!', 'Brilliant!', 'Woohoo!'];
  var CONFETTI_COLORS = ['#7c5cff', '#ff5d9e', '#ffb020', '#1fbf8f', '#2aa7ff'];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[rand(0, arr.length - 1)];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = rand(0, i);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function cheer() {
    return pick(CHEERS);
  }

  function setPressed(containerSelector, attr, value) {
    $$(containerSelector + ' button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset[attr] === value));
    });
  }

  function confetti(count) {
    var total = count || 16;
    for (var i = 0; i < total; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = rand(0, 98) + 'vw';
      piece.style.background = pick(CONFETTI_COLORS);
      piece.style.setProperty('--dx', rand(-120, 120) + 'px');
      piece.style.setProperty('--rot', rand(200, 900) + 'deg');
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      piece.style.width = rand(7, 12) + 'px';
      piece.style.height = rand(9, 16) + 'px';
      document.body.appendChild(piece);
      (function (el) { setTimeout(function () { el.remove(); }, 2800); })(piece);
    }
  }

  FunZone.util = {
    $: $, $$: $$, rand: rand, pick: pick, shuffle: shuffle,
    cheer: cheer, confetti: confetti, setPressed: setPressed
  };
})();
