(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var games = FunZone.games = FunZone.games || {};
  var U = FunZone.util;

  var FREQS = [392, 330, 523, 659];

  var seq = [];
  var idx = 0;
  var round = 0;
  var accepting = false;
  var runId = 0;

  function pads() { return U.$$('#echoPads .pad'); }
  function isActive() { return U.$('#view-echo').classList.contains('active'); }

  function showBest() {
    var best = FunZone.store.get('echoBest', 0);
    U.$('#echoBest').textContent = best ? best : '–';
  }

  function light(i) {
    var pad = pads()[i];
    pad.classList.add('lit');
    if (isActive()) FunZone.audio.tone(FREQS[i], 0.32);
    setTimeout(function () { pad.classList.remove('lit'); }, 360);
  }

  function playSequence() {
    var id = ++runId;
    accepting = false;
    idx = 0;
    U.$('#echoFb').textContent = 'Watch closely…';

    seq.forEach(function (pad, i) {
      setTimeout(function () { if (id === runId) light(pad); }, 700 + i * 700);
    });
    setTimeout(function () {
      if (id !== runId) return;
      accepting = true;
      U.$('#echoFb').textContent = 'Your turn!';
    }, 700 + seq.length * 700);
  }

  function nextRound() {
    seq.push(U.rand(0, 3));
    round = seq.length;
    U.$('#echoRound').textContent = round;
    playSequence();
  }

  function start() {
    seq = [];
    round = 0;
    U.$('#echoStartLabel').textContent = 'Restart';
    nextRound();
  }

  function press(i) {
    if (!accepting) return;
    light(i);

    if (i === seq[idx]) {
      idx++;
      if (idx === seq.length) {
        accepting = false;
        U.$('#echoFb').textContent = U.cheer();
        FunZone.progress.addStars(1);
        FunZone.progress.setMax('echoRounds', round);

        var best = FunZone.store.get('echoBest', 0);
        if (round > (best || 0)) {
          FunZone.store.set('echoBest', round);
          showBest();
        }
        setTimeout(nextRound, 1000);
      }
    } else {
      accepting = false;
      runId++;
      FunZone.audio.sfx.bad();
      U.$('#echoFb').textContent = 'Oops! You completed ' + (round - 1) + (round - 1 === 1 ? ' round.' : ' rounds.');
      U.$('#echoStartLabel').textContent = 'Play again';
    }
  }

  function init() {
    pads().forEach(function (pad) {
      pad.addEventListener('click', function () { press(parseInt(pad.dataset.i, 10)); });
    });
    U.$('#echoStart').addEventListener('click', start);
    showBest();
  }

  games.echo = { init: init, refresh: showBest };
})();
