(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var GROUPS = [
    { name: 'animals',  items: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐸'] },
    { name: 'fruits',   items: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉'] },
    { name: 'vehicles', items: ['🚗', '🚌', '🚂', '🚲', '✈️', '🚀', '🚜'] },
    { name: 'balls',    items: ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐'] },
    { name: 'weather',  items: ['🌞', '🌧️', '⛄', '🌈', '🌪️', '⚡'] },
    { name: 'snacks',   items: ['🍕', '🍔', '🍟', '🌭', '🍩', '🍪'] },
    { name: 'plants',   items: ['🌳', '🌷', '🌵', '🌻', '🍀', '🌴'] }
  ];

  var level = 1;
  var locked = false;
  var groupName = '';

  function showCount() {
    U.$('#oddSolved').textContent = FunZone.progress.getStat('odd');
  }

  function nextRound() {
    locked = false;
    U.$('#oddFb').textContent = '';

    var pair = U.shuffle(GROUPS).slice(0, 2);
    var main = pair[0];
    var other = pair[1];
    groupName = main.name;

    var total = 3 + level;
    var same = U.shuffle(main.items).slice(0, total - 1);
    var odd = U.pick(other.items);

    var entries = same.map(function (e) { return { emoji: e, odd: false }; });
    entries.push({ emoji: odd, odd: true });

    var board = U.$('#oddBoard');
    board.innerHTML = '';
    U.shuffle(entries).forEach(function (entry, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'odd-item';
      btn.textContent = entry.emoji;
      btn.setAttribute('aria-label', 'Option ' + (i + 1));
      btn.style.animationDelay = (i * 50) + 'ms';
      btn.addEventListener('click', function () { check(btn, entry); });
      board.appendChild(btn);
    });

    showCount();
  }

  function check(btn, entry) {
    if (locked) return;
    var fb = U.$('#oddFb');

    if (entry.odd) {
      locked = true;
      btn.classList.add('right');
      FunZone.audio.sfx.good();
      U.confetti(12);
      fb.textContent = 'Yes! The others are all ' + groupName + '.';
      FunZone.progress.bump('odd');
      FunZone.progress.addStars(1);
      showCount();
      setTimeout(nextRound, 1800);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      FunZone.audio.sfx.bad();
      fb.textContent = 'Hmm, look again!';
    }
  }

  function init() {
    U.$('#oddLvlRow').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      level = parseInt(b.dataset.lvl, 10);
      U.setPressed('#oddLvlRow', 'lvl', String(level));
      nextRound();
    });
    nextRound();
  }

  games.odd = { init: init, refresh: showCount };
})();
