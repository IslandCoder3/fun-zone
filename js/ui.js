(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var U = FunZone.util;
  var S = FunZone.store;

  var AVATARS = ['🐼', '🐯', '🦄', '🐙', '🐸', '🤖', '🚀', '🦁'];

  var queue = [];
  var showing = false;
  var chosenAvatar = AVATARS[0];

  function isNative(dlg) { return typeof dlg.showModal === 'function'; }

  function openDlg(dlg) {
    if (isNative(dlg)) {
      try { dlg.showModal(); return; } catch (e) { /* fall through */ }
    }
    dlg.setAttribute('open', '');
  }

  /* Returns true when a native "close" event will follow */
  function closeDlg(dlg) {
    if (isNative(dlg)) {
      try { dlg.close(); return true; } catch (e) { /* fall through */ }
    }
    dlg.removeAttribute('open');
    return false;
  }

  function player() {
    var p = S.get('player', null);
    return p && p.name ? p : { name: 'Explorer', avatar: AVATARS[0] };
  }

  /* ---------- Celebration dialogs (queued) ---------- */
  function done() {
    if (!showing) return;
    showing = false;
    pump();
  }

  function pump() {
    if (showing || !queue.length) return;

    if (U.$('#profileDialog').hasAttribute('open')) {
      setTimeout(pump, 600);
      return;
    }

    var o = queue.shift();
    showing = true;
    U.$('#celebrateEmoji').textContent = o.emoji || '🎉';
    U.$('#celebrateTitle').textContent = o.title || 'Great job!';
    U.$('#celebrateText').textContent = o.text || '';
    U.$('#celebrateBtn').textContent = o.button || 'Awesome!';

    openDlg(U.$('#celebrateDialog'));
    FunZone.audio.sfx.win();
    U.confetti(30);
    setTimeout(function () { U.$('#celebrateBtn').focus(); }, 60);
  }

  function modal(opts) {
    queue.push(opts);
    pump();
  }

  /* ---------- Profile dialog ---------- */
  function paintAvatars() {
    var grid = U.$('#avatarGrid');
    grid.innerHTML = '';
    AVATARS.forEach(function (a) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-btn';
      btn.textContent = a;
      btn.setAttribute('aria-label', 'Buddy ' + a);
      btn.setAttribute('aria-pressed', String(a === chosenAvatar));
      btn.addEventListener('click', function () {
        chosenAvatar = a;
        U.$('#profilePreview').textContent = a;
        U.$$('#avatarGrid .avatar-btn').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.textContent === a));
        });
        FunZone.audio.sfx.flip();
      });
      grid.appendChild(btn);
    });
  }

  function openProfile(first) {
    var p = player();
    chosenAvatar = p.avatar;
    U.$('#nameInput').value = first ? '' : p.name;
    U.$('#profilePreview').textContent = chosenAvatar;
    U.$('#profileTitle').textContent = first ? 'Who\u2019s playing?' : 'Your profile';
    U.$('#profileSave').textContent = first ? 'Let\u2019s play!' : 'Save';
    paintAvatars();
    openDlg(U.$('#profileDialog'));
    setTimeout(function () { U.$('#nameInput').focus(); }, 60);
  }

  function saveProfile() {
    var name = U.$('#nameInput').value.replace(/\s+/g, ' ').trim().slice(0, 14) || 'Explorer';
    S.set('player', { name: name, avatar: chosenAvatar });
    FunZone.progress.render();
  }

  function init() {
    U.$('#celebrateBtn').addEventListener('click', function () {
      var viaEvent = closeDlg(U.$('#celebrateDialog'));
      if (!viaEvent) done();
    });
    U.$('#celebrateDialog').addEventListener('close', done);

    var form = U.$('#profileForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      saveProfile();
      closeDlg(U.$('#profileDialog'));
    });
    U.$('#profileDialog').addEventListener('close', function () {
      /* Closed with Escape on first visit: still give them a profile */
      if (!S.get('player', null)) {
        S.set('player', { name: 'Explorer', avatar: chosenAvatar });
        FunZone.progress.render();
      }
    });

    U.$('#playerBtn').addEventListener('click', function () { openProfile(false); });

    if (!S.get('player', null)) {
      setTimeout(function () { openProfile(true); }, 500);
    }
  }

  FunZone.ui = { init: init, modal: modal, profile: openProfile, player: player };
})();
