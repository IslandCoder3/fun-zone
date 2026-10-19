(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};

  var muted = FunZone.store.get('muted', false);
  var ctx = null;

  function beep(freq, dur, type, delay) {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.16, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur);
    } catch (e) { /* audio not available */ }
  }

  var sfx = {
    good:  function () { beep(523, 0.15, 'triangle'); beep(659, 0.15, 'triangle', 0.12); beep(784, 0.25, 'triangle', 0.24); },
    bad:   function () { beep(220, 0.25, 'sawtooth'); },
    flip:  function () { beep(440, 0.08, 'square'); },
    match: function () { beep(660, 0.12, 'triangle'); beep(880, 0.2, 'triangle', 0.1); },
    win:   function () { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.22, 'triangle', i * 0.14); }); }
  };

  function speak(text) {
    if (muted || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech not available */ }
  }

  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function toggleMute() {
    muted = !muted;
    FunZone.store.set('muted', muted);
    if (muted) stopSpeaking();
    return muted;
  }

  FunZone.audio = {
    sfx: sfx,
    speak: speak,
    stopSpeaking: stopSpeaking,
    toggleMute: toggleMute,
    tone: function (freq, dur) { beep(freq, dur || 0.3, 'sine'); },
    isMuted: function () { return muted; }
  };
})();
