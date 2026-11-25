// Input for Sizzle & Serve: mouse clicks walk the chef and use stations,
// number keys grab ingredients, Space re-uses the nearest station.
(function (global) {
  'use strict';

  var D = global.GameData;
  var U = global.Util;

  function nearestStation(state) {
    var best = null, bestD = 1e9;
    for (var i = 0; i < D.STATIONS.length; i++) {
      var s = D.STATIONS[i];
      var cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      var d = U.dist(state.chef.x, state.chef.y, cx, cy);
      if (d < bestD) { bestD = d; best = s; }
    }
    return bestD < 190 ? best : null;
  }

  function chefWalkTo(state, x, y) {
    state.chef.tx = U.clamp(x, 40, 1240);
    state.chef.ty = U.clamp(y, 430, 740);
  }

  // Use a station with whatever the chef is holding. Returns a status string.
  function useStation(state, station) {
    var chef = state.chef;
    if (!station) return 'none';
    if (station.type === 'bin') {
      if (chef.holding) { global.Sfx.error(); return 'hands-full'; }
      chef.holding = { id: station.item, prepped: 'plain' };
      global.Sfx.pickup();
      return 'picked-' + station.item;
    }
    if (station.type === 'board') {
      if (state.board) { global.Sfx.error(); return 'board-busy'; }
      if (!chef.holding) { global.Sfx.error(); return 'empty-hands'; }
      var ing = D.INGREDIENTS[chef.holding.id];
      if (ing.kind !== 'fresh') { global.Sfx.error(); return 'no-chop'; }
      state.board = { item: chef.holding, progress: 0, duration: 2.0 };
      chef.holding = null;
      global.Sfx.chop();
      return 'chopping';
    }
    if (station.type === 'grill') {
      var slot = state.grill[0] === null ? 0 : (state.grill[1] === null ? 1 : -1);
      if (slot < 0) { global.Sfx.error(); return 'grill-full'; }
      if (!chef.holding) {
        // Empty hands: collect a finished patty from the grill.
        for (var g = 0; g < 2; g++) {
          var cur = state.grill[g];
          if (cur && cur.progress >= cur.duration && !cur.burnt) {
            chef.holding = cur.item;
            state.grill[g] = null;
            global.Sfx.pickup();
            return 'took-grilled';
          }
        }
        global.Sfx.error();
        return 'empty-hands';
      }
      var ing2 = D.INGREDIENTS[chef.holding.id];
      if (ing2.kind !== 'raw') { global.Sfx.error(); return 'no-grill'; }
      state.grill[slot] = { item: chef.holding, progress: 0, duration: 4.0, burnt: false };
      chef.holding = null;
      global.Sfx.sizzleStart();
      return 'grilling';
    }
    if (station.type === 'plate') {
      if (!chef.holding) { global.Sfx.error(); return 'empty-hands'; }
      var held = chef.holding;
      var ing3 = D.INGREDIENTS[held.id];
      if (held.prepped === 'plain' && ing3.kind !== 'ready') { global.Sfx.error(); return 'not-ready'; }
      if (state.plate.length >= 5) { global.Sfx.error(); return 'plate-full'; }
      state.plate.push(held);
      chef.holding = null;
      global.Sfx.drop();
      return 'plated';
    }
    if (station.type === 'trash') {
      if (!chef.holding && state.plate.length === 0) { global.Sfx.error(); return 'nothing'; }
      if (chef.holding) { chef.holding = null; }
      else { state.plate.pop(); }
      global.Sfx.drop();
      return 'trashed';
    }
    if (station.type === 'pass') {
      var match = D.matchingOrder(state);
      if (!match) { global.Sfx.error(); return 'no-match'; }
      var earned = D.serveOrder(state, match);
      global.Sfx.serve();
      setTimeout(function () { global.Sfx.coin(); }, 120);
      return 'served-' + earned;
    }
    return 'none';
  }

  function grabByKey(state, key) {
    for (var id in D.INGREDIENTS) {
      if (D.INGREDIENTS[id].key === key) {
        if (state.chef.holding) { global.Sfx.error(); return; }
        state.chef.holding = { id: id, prepped: 'plain' };
        global.Sfx.pickup();
        return;
      }
    }
  }

  function bindInput(canvas, state, hooks) {
    function toGameCoords(e) {
      var r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height)
      };
    }

    canvas.addEventListener('pointerdown', function (e) {
      global.Sfx.unlock();
      var p = toGameCoords(e);
      if (state.mode === 'title') { hooks.startGame(); return; }
      if (state.mode === 'over') { hooks.restart(); return; }
      if (state.paused) return;
      var station = D.stationAt(p.x, p.y);
      if (station) {
        // Walk to the station's front edge, then use it on arrival.
        var cx = station.x + station.w / 2;
        var cy = station.y + station.h + 26;
        chefWalkTo(state, cx, cy);
        state.chef.busy = { station: station, at: { x: cx, y: cy } };
      } else {
        state.chef.busy = null;
        chefWalkTo(state, p.x, p.y);
      }
    });

    global.addEventListener('keydown', function (e) {
      if (e.key === 'm' || e.key === 'M') {
        var m = global.Sfx.toggleMute();
        D.addFloater(state, 640, 120, m ? 'SOUND OFF' : 'SOUND ON', '#ffe9c9');
        return;
      }
      if (state.mode === 'title' && (e.key === 'Enter' || e.key === ' ')) { hooks.startGame(); return; }
      if (state.mode === 'over' && e.key === 'Enter') { hooks.restart(); return; }
      if (state.mode !== 'playing') return;
      if (e.key === 'p' || e.key === 'P') { state.paused = !state.paused; return; }
      if (state.paused) return;
      if (e.key >= '1' && e.key <= '6') { grabByKey(state, e.key); return; }
      if (e.key === 't' || e.key === 'T') {
        useStation(state, D.stationById('trash'));
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        var near = nearestStation(state);
        if (near) useStation(state, near);
      }
    });
  }

  // Called every frame: move the chef, fire a queued station use on arrival.
  function updateChef(state, dt) {
    var chef = state.chef;
    var dx = chef.tx - chef.x, dy = chef.ty - chef.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    var step = chef.speed * dt;
    if (d > 4) {
      var nx = chef.x + (dx / d) * Math.min(step, d);
      var ny = chef.y + (dy / d) * Math.min(step, d);
      chef.face = dx >= 0 ? 1 : -1;
      chef.x = nx;
      chef.y = ny;
    } else if (chef.busy) {
      var st = chef.busy.station;
      chef.busy = null;
      useStation(state, st);
    }
  }

  global.GameInput = {
    bindInput: bindInput, useStation: useStation, updateChef: updateChef,
    nearestStation: nearestStation, chefWalkTo: chefWalkTo
  };
})(typeof window !== 'undefined' ? window : globalThis);
