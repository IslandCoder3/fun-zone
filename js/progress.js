(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var U = FunZone.util;
  var S = FunZone.store;

  var STARS_PER_LEVEL = 20;
  var DAILY_GOAL = 15;
  var DAILY_BONUS = 3;
  var CHALLENGE_TARGET = 10;
  var CHALLENGE_BONUS = 5;
  var COMBO_STEP = 10;

  var GAMES = [
    { id: 'math',    name: 'Math Pop' },
    { id: 'memory',  name: 'Memory Match' },
    { id: 'color',   name: 'Color Lab' },
    { id: 'spell',   name: 'Spell It' },
    { id: 'count',   name: 'Count It' },
    { id: 'echo',    name: 'Echo' },
    { id: 'pattern', name: 'Pattern Pals' },
    { id: 'shape',   name: 'Shape Hunt' },
    { id: 'clock',   name: 'Clock Time' },
    { id: 'odd',     name: 'Odd One Out' }
  ];

  var STICKERS = [
    '🦄', '🐉', '🚀', '🛸', '🌈', '🍕', '🎸', '🏆', '🦖', '🐙', '🌟', '🎨',
    '🐳', '🦋', '🍦', '⚽', '🎈', '🐼', '🦁', '🍭', '🧸', '🎮', '🌋', '🪁'
  ];

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
    { id: 'explorer',   icon: '🧭', name: 'Explorer',        desc: 'Visit every game',                test: function (p) { return Object.keys(p.stats).filter(function (k) { return k.indexOf('visit_') === 0; }).length >= 10; } },
    { id: 'days-3',     icon: '🔥', name: 'Hot Streak',      desc: 'Play 3 days in a row',            test: function (p) { return p.bestDays >= 3; } },
    { id: 'days-7',     icon: '🌋', name: 'Unstoppable',     desc: 'Play 7 days in a row',            test: function (p) { return p.bestDays >= 7; } }
  ];

  var stars = 0;
  var badges = {};
  var stats = {};
  var stickers = {};
  var streak = { count: 0, best: 0, last: '' };
  var daily = null;
  var combo = 0;
  var currentGame = null;

  /* ---------- Dates ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dayKey(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function dayNumber() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function challengeGame() {
    return GAMES[dayNumber() % GAMES.length];
  }

  function gameName(id) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i].name;
    return id;
  }

  function newDaily() {
    return { date: dayKey(0), stars: 0, goalDone: false, challengeStars: 0, challengeDone: false };
  }

  function rollDaily() {
    if (!daily || daily.date !== dayKey(0)) {
      daily = newDaily();
      S.set('daily', daily);
    }
  }

  function streakValue() {
    return (streak.last === dayKey(0) || streak.last === dayKey(-1)) ? streak.count : 0;
  }

  function touchStreak() {
    if (streak.last === dayKey(0)) return;
    streak.count = (streak.last === dayKey(-1)) ? streak.count + 1 : 1;
    streak.last = dayKey(0);
    if (streak.count > streak.best) streak.best = streak.count;
    S.set('streak', streak);
    if (streak.count > 1) {
      toast(streak.count + '-day streak!', 'Come back tomorrow to keep your flame burning.', '🔥');
    }
  }

  /* ---------- Load / save ---------- */
  function load() {
    stars = S.get('stars', null);
    if (stars === null) {
      try { stars = parseInt(localStorage.getItem('funzone_stars'), 10) || 0; } catch (e) { stars = 0; }
    }
    badges = S.get('badges', {});
    stats = S.get('stats', {});
    stickers = S.get('stickers', {});
    streak = S.get('streak', { count: 0, best: 0, last: '' });
    daily = S.get('daily', null);
    rollDaily();
  }

  function persist() {
    S.set('stars', stars);
    S.set('badges', badges);
    S.set('stats', stats);
    S.set('stickers', stickers);
    S.set('daily', daily);
    S.set('streak', streak);
  }

  function level() {
    return Math.floor(stars / STARS_PER_LEVEL) + 1;
  }

  /* ---------- Toasts and pops ---------- */
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

  function starPop(n) {
    var chip = U.$('#starsChip');
    if (!chip) return;
    var r = chip.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'star-pop';
    el.textContent = '+' + n + ' ⭐';
    el.style.left = (r.left + r.width / 2) + 'px';
    el.style.top = (r.bottom + 4) + 'px';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  }

  /* ---------- Stickers ---------- */
  function giveSticker() {
    var locked = STICKERS.filter(function (s) { return !stickers[s]; });
    if (!locked.length) return null;
    var s = U.pick(locked);
    stickers[s] = Date.now();
    return s;
  }

  /* ---------- Tips from Zippy ---------- */
  function getTip() {
    var name = FunZone.ui.player().name;
    var remaining = Math.max(0, DAILY_GOAL - daily.stars);
    var sv = streakValue();
    var toLevel = STARS_PER_LEVEL - (stars % STARS_PER_LEVEL);
    var ch = challengeGame();

    if (stars === 0) return 'Hi ' + name + '! I\u2019m Zippy. Tap any game to earn your first star!';
    if (!daily.goalDone && sv > 0 && streak.last !== dayKey(0)) {
      return 'Your ' + sv + '-day flame is waiting, ' + name + '! Earn a star today to keep it alive.';
    }
    if (!daily.goalDone && daily.stars > 0) {
      return remaining + ' more star' + (remaining === 1 ? '' : 's') + ' and you hit today\u2019s goal. You can do it!';
    }
    if (!daily.goalDone) return 'Today\u2019s goal is ' + DAILY_GOAL + ' stars. Ready, ' + name + '?';
    if (toLevel <= 5) return 'Only ' + toLevel + ' more star' + (toLevel === 1 ? '' : 's') + ' to reach Level ' + (level() + 1) + '!';
    if (!daily.challengeDone) return 'Today\u2019s challenge is ' + ch.name + '. Stars count double there!';
    var fresh = GAMES.filter(function (g) { return !stats['plays_' + g.id]; });
    if (fresh.length) return 'Psst, you haven\u2019t tried ' + fresh[0].name + ' yet!';
    return 'Goal complete! Come back tomorrow to make it ' + (sv + 1) + ' days in a row.';
  }

  /* ---------- Rendering ---------- */
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

  function renderStickers() {
    var grid = U.$('#stickerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var got = 0;
    STICKERS.forEach(function (s) {
      var on = !!stickers[s];
      if (on) got++;
      var cell = document.createElement('div');
      cell.className = 'sticker' + (on ? '' : ' locked');
      cell.textContent = on ? s : '?';
      cell.setAttribute('aria-label', on ? 'Sticker ' + s : 'Locked sticker');
      grid.appendChild(cell);
    });
    var count = U.$('#stickerCount');
    if (count) count.textContent = got + ' / ' + STICKERS.length + ' collected';
  }

  function renderHeader() {
    var starEl = U.$('#starCount');
    if (starEl) starEl.textContent = stars;

    var lvlEl = U.$('#levelNum');
    if (lvlEl) lvlEl.textContent = level();

    var pct = Math.round((stars % STARS_PER_LEVEL) / STARS_PER_LEVEL * 100);
    var fill = U.$('#xpFill');
    if (fill) fill.style.width = pct + '%';
    var bar = U.$('.xp');
    if (bar) bar.setAttribute('aria-valuenow', String(pct));

    var sv = streakValue();
    var sc = U.$('#streakCount');
    if (sc) sc.textContent = sv;
    var chip = U.$('#streakChip');
    if (chip) {
      var cold = sv === 0 || streak.last !== dayKey(0);
      chip.classList.toggle('cold', cold);
      chip.title = (sv > 0 && cold) ? 'Play today to keep your streak alive!' : 'Days in a row';
    }

    var cc = U.$('#comboChip');
    if (cc) {
      cc.hidden = combo < 3;
      U.$('#comboCount').textContent = combo;
    }

    var p = FunZone.ui.player();
    var av = U.$('#playerAvatar');
    if (av) av.textContent = p.avatar;
    var nm = U.$('#playerName');
    if (nm) nm.textContent = p.name;
  }

  function renderHome() {
    var p = FunZone.ui.player();
    var ch = challengeGame();

    var h = U.$('#heroTitle');
    if (h) {
      var returning = stars > 0;
      h.textContent = '';
      h.appendChild(document.createTextNode(returning ? 'Welcome back, ' : 'Ready to play, '));
      var sp = document.createElement('span');
      sp.className = 'hero-accent';
      sp.textContent = returning ? p.name + '!' : (p.name === 'Explorer' ? 'explorer?' : p.name + '?');
      h.appendChild(sp);
    }

    var tip = U.$('#mascotText');
    if (tip) tip.textContent = getTip();

    var gt = U.$('#goalText');
    if (gt) gt.textContent = Math.min(daily.stars, DAILY_GOAL) + ' / ' + DAILY_GOAL + ' ⭐' + (daily.goalDone ? ' ✓' : '');
    var gpct = Math.min(100, Math.round(daily.stars / DAILY_GOAL * 100));
    var gf = U.$('#goalFill');
    if (gf) gf.style.width = gpct + '%';
    var gb = U.$('.goal-bar');
    if (gb) gb.setAttribute('aria-valuenow', String(gpct));

    var cb = U.$('#challengeBtn');
    if (cb) {
      cb.setAttribute('href', '#' + ch.id);
      cb.textContent = daily.challengeDone ? 'Challenge done ✓ ' + ch.name : 'Today\u2019s challenge: ' + ch.name + ' ⚡';
    }
    var last = S.get('lastGame', null);
    var ct = U.$('#continueBtn');
    if (ct) {
      if (last && last !== ch.id) {
        ct.hidden = false;
        ct.setAttribute('href', '#' + last);
        ct.textContent = 'Continue ' + gameName(last);
      } else {
        ct.hidden = true;
      }
    }

    U.$$('.game-card').forEach(function (card) {
      var route = (card.getAttribute('href') || '').slice(1);
      var art = U.$('.card-art', card);
      var old = U.$('.card-tag', card);
      if (old) old.remove();
      if (!art) return;

      var label = null;
      var cls = '';
      if (route === ch.id) { label = daily.challengeDone ? 'Challenge done ✓' : '⚡ 2× stars today'; cls = 'tag-challenge'; }
      else if (!stats['plays_' + route]) { label = 'New'; cls = 'tag-new'; }

      if (label) {
        var tag = document.createElement('span');
        tag.className = 'card-tag ' + cls;
        tag.textContent = label;
        art.appendChild(tag);
      }
    });

    renderStickers();
    renderBadges();
  }

  function renderPills() {
    var ch = challengeGame();
    GAMES.forEach(function (g) {
      var view = U.$('#view-' + g.id);
      if (!view) return;
      var head = U.$('.game-head > div', view);
      if (!head) return;
      var pill = U.$('.pill', head);
      if (!pill) {
        pill = document.createElement('span');
        pill.className = 'pill';
        head.appendChild(pill);
      }
      var isToday = g.id === ch.id;
      pill.hidden = !isToday;
      pill.textContent = daily.challengeDone
        ? '✓ Today\u2019s challenge complete'
        : '⚡ Today\u2019s challenge: 2× stars (' + Math.min(daily.challengeStars, CHALLENGE_TARGET) + '/' + CHALLENGE_TARGET + ')';
    });
  }

  function render() {
    rollDaily();
    renderHeader();
    renderHome();
    renderPills();
  }

  /* ---------- Badges ---------- */
  function checkBadges() {
    var state = { stars: stars, stats: stats, bestDays: streak.best };
    BADGES.forEach(function (b) {
      if (!badges[b.id] && b.test(state)) {
        badges[b.id] = Date.now();
        var st = giveSticker();
        persist();
        render();
        toast('Badge unlocked!', b.name + ': ' + b.desc + (st ? '  + new sticker ' + st : ''), b.icon);
        FunZone.audio.sfx.win();
        U.confetti(26);
      }
    });
  }

  /* ---------- Rewards ---------- */
  function addStars(n) {
    rollDaily();
    var before = level();
    var isChallenge = !!currentGame && currentGame === challengeGame().id;
    var gain = (n || 1) * (isChallenge ? 2 : 1);

    touchStreak();
    stars += gain;
    daily.stars += gain;

    if (currentGame) {
      stats['plays_' + currentGame] = (stats['plays_' + currentGame] || 0) + 1;
      if (isChallenge) daily.challengeStars += gain;
    }

    combo++;
    if (combo % COMBO_STEP === 0) {
      stars += 3;
      toast('Combo x' + combo + '!', 'You are on a roll. Bonus +3 stars!', '⚡');
    }

    if (!daily.goalDone && daily.stars >= DAILY_GOAL) {
      daily.goalDone = true;
      stars += DAILY_BONUS;
      var s1 = giveSticker();
      FunZone.ui.modal({
        emoji: s1 || '🎯',
        title: 'Daily goal complete!',
        text: '+' + DAILY_BONUS + ' bonus stars' + (s1 ? ' and a brand new sticker' : '') + '. Come back tomorrow to keep your flame going!',
        button: 'Yay!'
      });
    }

    if (!daily.challengeDone && daily.challengeStars >= CHALLENGE_TARGET) {
      daily.challengeDone = true;
      stars += CHALLENGE_BONUS;
      var s2 = giveSticker();
      FunZone.ui.modal({
        emoji: s2 || '⚡',
        title: 'Challenge complete!',
        text: '+' + CHALLENGE_BONUS + ' bonus stars' + (s2 ? ' and a new sticker' : '') + '. Nice work on ' + challengeGame().name + '!',
        button: 'Awesome!'
      });
    }

    var after = level();
    if (after > before) {
      var got = [];
      for (var l = before + 1; l <= after; l++) {
        var st = giveSticker();
        if (st) got.push(st);
      }
      FunZone.ui.modal({
        emoji: got.length ? got[got.length - 1] : '🚀',
        title: 'Level ' + after + '!',
        text: got.length ? 'You unlocked a new sticker. Find it in your sticker book on the home page.' : 'You are getting better every day.',
        button: 'Keep playing'
      });
    }

    persist();
    render();

    var chip = U.$('#starsChip');
    if (chip) {
      chip.classList.remove('pop');
      void chip.offsetWidth;
      chip.classList.add('pop');
    }
    starPop(gain);
    try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) { /* not supported */ }

    checkBadges();
  }

  function miss() {
    if (combo === 0) return;
    combo = 0;
    renderHeader();
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

  function setCurrent(id) {
    currentGame = id;
    if (id) S.set('lastGame', id);
    combo = 0;
    render();
  }

  function reset() {
    stars = 0;
    badges = {};
    stats = {};
    stickers = {};
    streak = { count: 0, best: 0, last: '' };
    daily = newDaily();
    combo = 0;
    S.set('bestMoves', null);
    S.set('echoBest', null);
    S.set('lastGame', null);
    persist();
    render();
  }

  function init() {
    load();
    render();
  }

  FunZone.progress = {
    init: init, render: render, addStars: addStars, miss: miss, bump: bump, setMax: setMax,
    getStat: getStat, visit: visit, setCurrent: setCurrent, reset: reset, toast: toast
  };
})();
