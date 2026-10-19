(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var EMOJIS = ['🐶', '🐱', '🦁', '🐸', '🐼', '🦄', '🐙', '🦋', '🐢', '🐵', '🦊', '🐧'];
  var PAIR_COUNT = 8;

  var first = null;
  var second = null;
  var locked = false;
  var moves = 0;
  var pairs = 0;

  function showBest() {
    var best = FunZone.store.get('bestMoves', null);
    U.$('#best').textContent = best ? best : '–';
  }

  function newGame() {
    first = second = null;
    locked = false;
    moves = 0;
    pairs = 0;
    U.$('#moves').textContent = 0;
    U.$('#pairs').textContent = 0;
    U.$('#memFb').textContent = '';
    showBest();

    var chosen = U.shuffle(EMOJIS).slice(0, PAIR_COUNT);
    var deck = U.shuffle(chosen.concat(chosen));
    var grid = U.$('#memGrid');
    grid.innerHTML = '';

    deck.forEach(function (emoji) {
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.dataset.em = emoji;
      tile.setAttribute('aria-label', 'Card');
      tile.innerHTML =
        '<div class="inner">' +
          '<div class="face front">✦</div>' +
          '<div class="face back">' + emoji + '</div>' +
        '</div>';
      tile.addEventListener('click', function () { flip(tile); });
      grid.appendChild(tile);
    });
  }

  function win() {
    var best = FunZone.store.get('bestMoves', null);
    var fb = U.$('#memFb');
    fb.textContent = 'You did it in ' + moves + ' moves!';
    if (!best || moves < best) {
      FunZone.store.set('bestMoves', moves);
      if (best) fb.textContent += ' New best!';
      showBest();
    }
    FunZone.audio.sfx.win();
    U.confetti(40);
    FunZone.progress.addStars(3);
    FunZone.progress.bump('memoryWins');
  }

  function flip(tile) {
    if (locked || tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

    tile.classList.add('flipped');
    FunZone.audio.sfx.flip();

    if (!first) { first = tile; return; }

    second = tile;
    moves++;
    U.$('#moves').textContent = moves;
    locked = true;

    if (first.dataset.em === second.dataset.em) {
      first.classList.add('matched');
      second.classList.add('matched');
      pairs++;
      U.$('#pairs').textContent = pairs;
      FunZone.audio.sfx.match();
      FunZone.progress.addStars(1);
      first = second = null;
      locked = false;

      if (pairs === PAIR_COUNT) setTimeout(win, 450);
    } else {
      setTimeout(function () {
        first.classList.remove('flipped');
        second.classList.remove('flipped');
        first = second = null;
        locked = false;
      }, 800);
    }
  }

  function init() {
    U.$('#memReset').addEventListener('click', newGame);
    newGame();
  }

  games.memory = { init: init, refresh: showBest };
})();
