(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var U = FunZone.util;

  var ROUTES = ['home', 'math', 'memory', 'color', 'spell', 'count', 'echo', 'pattern', 'shape', 'clock', 'odd'];

  /* ---------- Router (hash based, so the back button works) ---------- */
  function initRouter() {
    var views = U.$$('.view');
    var links = U.$$('.nav-link');
    var main = U.$('#main');
    var firstRun = true;

    function go() {
      var id = (location.hash || '#home').slice(1);
      if (ROUTES.indexOf(id) === -1) id = 'home';
      if (id !== 'home') FunZone.progress.visit(id);

      var title = 'Fun Zone';
      views.forEach(function (v) {
        var on = v.id === 'view-' + id;
        v.classList.toggle('active', on);
        if (on) title = v.dataset.title;
      });

      links.forEach(function (a) {
        if (a.dataset.route === id) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });

      document.title = (id === 'home' ? 'Fun Zone – Learn & Play' : title + ' – Fun Zone');
      FunZone.audio.stopSpeaking();

      if (!firstRun) {
        window.scrollTo(0, 0);
        main.focus({ preventScroll: true });
      }
      firstRun = false;
    }

    window.addEventListener('hashchange', go);
    go();
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    U.$('#themeIcon').setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
    var meta = U.$('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#12101f' : '#f6f5ff');
  }

  function initTheme() {
    var saved = FunZone.store.get('theme', null);
    var theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);

    U.$('#themeBtn').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      FunZone.store.set('theme', next);
      applyTheme(next);
    });
  }

  /* ---------- Sound + reset ---------- */
  function showMute() {
    U.$('#muteIcon').setAttribute('href', FunZone.audio.isMuted() ? '#i-volume-x' : '#i-volume');
  }

  function initControls() {
    showMute();
    U.$('#muteBtn').addEventListener('click', function () {
      FunZone.audio.toggleMute();
      showMute();
    });

    U.$('#resetProgress').addEventListener('click', function () {
      if (!window.confirm('Reset all stars, levels and badges?')) return;
      FunZone.progress.reset();
      Object.keys(FunZone.games).forEach(function (name) {
        if (FunZone.games[name].refresh) FunZone.games[name].refresh();
      });
      FunZone.progress.toast('Fresh start', 'Your progress has been reset.', '🔄');
    });
  }

  function start() {
    FunZone.progress.init();
    initTheme();
    initControls();

    Object.keys(FunZone.games).forEach(function (name) {
      FunZone.games[name].init();
    });

    initRouter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
