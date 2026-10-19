(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var U = FunZone.util;
  var S = FunZone.store;

  var STARS_PER_LEVEL = 20;

  var BADGES = [
    { id: 'first-star', icon: '⭐', name: 'First Star',      desc: 'Earn your first star',            test: function (p) { return p.stars >= 1; } },
    { id: 'stars-25',   icon: '🌟', name: 'Star Collector',  desc: 'Collect 25 stars',                test: function (p) { return p.stars >= 25; } },
    { id: 'stars-100',  icon: '🏆', name: 'Super Learner',   desc: 'Collect 100 stars',               test: function (p) { return p.stars >= 100; } },
    { id: 'streak-5',   icon: '🔥', name: 'On Fire',         desc: 'Get 5 in a row in Math Pop',      test: function (p) { return (p.stats.maxStreak || 0) >= 5; } },
    { id: 'memory-win', icon: '🧠', name: 'Memory Master',   desc: 'Finish a Memory Match game',      test: function (p) { return (p.stats.memoryWins || 0) >= 1; } },
    { id: 'words-5',    icon: '🔤', name: 'Word Wizard',     desc: 'Spell 5 words',                   test: function (p) { return (p.stats.words || 0) >= 5; } },
    { id: 'count-10',   icon: '🔢', name: 'Counting Champ',  desc: 'Count 10 groups correctly',       test: function (p) { return (p.stats.counts || 0) >= 10; } },
    { id: 'mixes-5',    icon: '🎨', name: 'Color Explorer',  desc: 'Try all 5 magic mixes',           test: function (p) { return (p.stats.mixes || 0) >= 5; } },
    { id: 'echo-5',     icon: '🎵', name: 'Sharp Ears',      desc: 'Reach round 5 in Echo',           test: function (p) { return (p.stats.echoRounds || 0) >= 5; } },
    { id: 'patterns-10',icon: '🧩', name: 'Pattern Pro',     desc: 'Complete 10 patterns',            test: function (p) { return (p.stats.patterns || 0) >= 10; } },
    { id: 'shapes-10',  icon: '🔷', name: 'Shape Spotter',   desc: 'Find 10 shapes',                  test: function (p) { return (p.stats.shapes || 0) >= 10; } },
    { id: 'clock-10',   icon: '⏰', name: 'Time Keeper',     desc: 'Read the clock 10 times',         test: function (p) { return (p.stats.clocks || 0) >= 10; } },
    { id: 'odd-10',     icon: '🔍', name: 'Sharp Eye',       desc: 'Spot 10 odd ones out',            test: function (p) { return (p.stats.odd || 0) >= 10; } },
    { id: 'explorer',   icon: '🧭', name: 'Explorer',        desc: 'Visit every game',                test: function (p) { return Object.keys(p.stats).filter(function (k) { return k.indexOf('visit_') === 0; }).length >= 10; } }
  ];

  var stars = 0;
  var badges = {};
  var stats = {};

  function load() {
    stars = S.get('stars', null);
    if (stars === null) {
      /* Carry over stars from the first version of the site */
      try { stars = parseInt(localStorage.getItem('funzone_stars'), 10) || 0; } catch (e) { stars = 0; }
    }
    badges = S.get('badges', {});
    stats = S.get('stats', {});
  }

  function persist() {
    S.set('stars', stars);
    S.set('badges', badges);
    S.set('stats', stats);
  }

  function level() {
    return Math.floor(stars / STARS_PER_LEVEL) + 1;
  }

  function toast(title, text, icon) {
    var box = U.$('#toasts');
    if (!box) return;

    var el = document.createElement('div');
    el.className = 'toast';

    var ic = document.createElement('div');
    ic.className = 'toast-icon';
    ic.textContent = icon || '🎉';

    var body = document.createElement('div');
    var t = document.createElement('div');
    t.className = 'toast-title';
    t.textContent = title;
    var d = document.createElement('div');
    d.className = 'toast-text';
    d.textContent = text;
    body.appendChild(t);
    body.appendChild(d);

    el.appendChild(ic);
    el.appendChild(body);
    box.appendChild(el);

    setTimeout(function () { el.classList.add('out'); }, 3600);
    setTimeout(function () { el.remove(); }, 4000);
  }

  function renderBadges() {
    var grid = U.$('#badgeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var unlocked = 0;

    BADGES.forEach(function (b) {
      var isOn = !!badges[b.id];
      if (isOn) unlocked++;

      var card = document.createElement('div');
      card.className = 'badge' + (isOn ? '' : ' locked');

      var icon = document.createElement('div');
      icon.className = 'badge-icon';
      icon.textContent = b.icon;
      var name = document.createElement('div');
      name.className = 'badge-name';
      name.textContent = b.name;
      var desc = document.createElement('div');
      desc.className = 'badge-desc';
      desc.textContent = b.desc;

      card.appendChild(icon);
      card.appendChild(name);
      card.appendChild(desc);
      grid.appendChild(card);
    });

    var count = U.$('#badgeCount');
    if (count) count.textContent = unlocked + ' / ' + BADGES.length + ' unlocked';
  }

  function render() {
    var starEl = U.$('#starCount');
    if (starEl) starEl.textContent = stars;

    var lvlEl = U.$('#levelNum');
    if (lvlEl) lvlEl.textContent = level();

    var pct = Math.round((stars % STARS_PER_LEVEL) / STARS_PER_LEVEL * 100);
    var fill = U.$('#xpFill');
    if (fill) fill.style.width = pct + '%';
    var bar = U.$('.xp');
    if (bar) bar.setAttribute('aria-valuenow', String(pct));

    renderBadges();
  }

  function checkBadges() {
    var state = { stars: stars, stats: stats };
    BADGES.forEach(function (b) {
      if (!badges[b.id] && b.test(state)) {
        badges[b.id] = Date.now();
        persist();
        renderBadges();
        toast('Badge unlocked!', b.name + ': ' + b.desc, b.icon);
        FunZone.audio.sfx.win();
        U.confetti(26);
      }
    });
  }

  function addStars(n) {
    var before = level();
    stars += (n || 1);
    persist();
    render();

    var chip = U.$('#starsChip');
    if (chip) {
      chip.classList.remove('pop');
      void chip.offsetWidth;
      chip.classList.add('pop');
    }

    if (level() > before) {
      toast('Level ' + level() + '!', 'You are getting better every day.', '🚀');
      U.confetti(30);
    }
    checkBadges();
  }

  function bump(name, n) {
    stats[name] = (stats[name] || 0) + (n || 1);
    persist();
    checkBadges();
  }

  function setMax(name, value) {
    if (value > (stats[name] || 0)) {
      stats[name] = value;
      persist();
      checkBadges();
    }
  }

  function getStat(name) {
    return stats[name] || 0;
  }

  function visit(id) {
    var key = 'visit_' + id;
    if (!stats[key]) {
      stats[key] = 1;
      persist();
      checkBadges();
    }
  }

  function reset() {
    stars = 0;
    badges = {};
    stats = {};
    S.set('bestMoves', null);
    S.set('echoBest', null);
    persist();
    render();
  }

  function init() {
    load();
    render();
  }

  FunZone.progress = {
    init: init, addStars: addStars, bump: bump, setMax: setMax,
    getStat: getStat, visit: visit, reset: reset, toast: toast
  };
})();
