(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var WORDS = [
    ['🐶', 'DOG'], ['🐱', 'CAT'], ['🌞', 'SUN'], ['🐟', 'FISH'], ['🌳', 'TREE'], ['🍎', 'APPLE'],
    ['🚗', 'CAR'], ['📚', 'BOOK'], ['🐸', 'FROG'], ['🏠', 'HOUSE'], ['⭐', 'STAR'], ['🍌', 'BANANA'],
    ['🦆', 'DUCK'], ['🌙', 'MOON'], ['🐘', 'ELEPHANT'], ['🎈', 'BALLOON'], ['🚌', 'BUS'], ['🐝', 'BEE']
  ];

  var queue = [];
  var current = null;
  var guess = [];
  var locked = false;

  function showCount() {
    U.$('#wordsCount').textContent = FunZone.progress.getStat('words');
  }

  function nextWord() {
    if (!queue.length) {
      queue = U.shuffle(WORDS.map(function (_, i) { return i; }));
    }
    current = WORDS[queue.pop()];
    guess = [];
    locked = false;

    U.$('#spellFb').textContent = '';
    U.$('#pic').textContent = current[0];

    var letters = current[1].split('');
    var scrambled = letters;
    var tries = 0;
    do {
      scrambled = U.shuffle(letters);
      tries++;
    } while (scrambled.join('') === current[1] && tries < 10);

    var box = U.$('#letters');
    box.innerHTML = '';
    scrambled.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'letter';
      btn.textContent = ch;
      btn.addEventListener('click', function () { pick(btn, ch); });
      box.appendChild(btn);
    });

    renderSlots();
    showCount();
  }

  function renderSlots() {
    var slots = U.$('#slots');
    slots.innerHTML = '';
    for (var i = 0; i < current[1].length; i++) {
      var d = document.createElement('div');
      d.className = 'slot' + (guess[i] ? ' filled' : '');
      d.textContent = guess[i] ? guess[i].ch : '';
      slots.appendChild(d);
    }
  }

  function pick(btn, ch) {
    if (locked || btn.disabled) return;

    btn.disabled = true;
    guess.push({ ch: ch, btn: btn });
    FunZone.audio.sfx.flip();
    renderSlots();

    if (guess.length !== current[1].length) return;

    var attempt = guess.map(function (g) { return g.ch; }).join('');
    var fb = U.$('#spellFb');

    if (attempt === current[1]) {
      locked = true;
      FunZone.audio.sfx.good();
      U.confetti(20);
      fb.textContent = current[1] + '! ' + U.cheer();
      FunZone.audio.speak(current[1]);
      FunZone.progress.bump('words');
      FunZone.progress.addStars(2);
      showCount();
      setTimeout(nextWord, 1800);
    } else {
      FunZone.audio.sfx.bad();
      fb.textContent = 'Not quite. Try again!';
      var slots = U.$('#slots');
      slots.classList.add('shake');
      setTimeout(function () {
        slots.classList.remove('shake');
        clearGuess();
      }, 450);
    }
  }

  function clearGuess() {
    if (locked) return;
    guess.forEach(function (g) { g.btn.disabled = false; });
    guess = [];
    renderSlots();
  }

  function init() {
    U.$('#clearBtn').addEventListener('click', function () {
      U.$('#spellFb').textContent = '';
      clearGuess();
    });
    U.$('#skipBtn').addEventListener('click', nextWord);
    U.$('#sayBtn').addEventListener('click', function () { FunZone.audio.speak(current[1]); });
    nextWord();
  }

  games.spell = { init: init, refresh: showCount };
})();
