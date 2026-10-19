(function () {
  'use strict';

  var FunZone = window.FunZone = window.FunZone || {};
  var KEY = 'funzone_v2';
  var data = {};

  function load() {
    try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
  }

  load();

  FunZone.store = {
    get: function (key, fallback) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback;
    },
    set: function (key, value) {
      data[key] = value;
      save();
    }
  };
})();
