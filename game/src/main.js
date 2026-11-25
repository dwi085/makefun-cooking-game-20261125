// Boot + game loop for Sizzle & Serve.
(function () {
  'use strict';

  var D = GameData;
  var U = Util;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  var state = D.newState(20261125);
  var last = performance.now();
  var t = 0;

  function startGame() {
    // Mutate the one state object in place (never reassign it): the input
    // handler and the debug handle both hold this same object.
    var fresh = D.newState((Math.random() * 1e9) | 0);
    Object.assign(state, fresh);
    state.mode = 'playing';
    D.spawnOrder(state, 'ember');
    D.spawnOrder(state, 'garden');
    D.showMessage(state, 'Shift started!', 'First tickets are up — get cooking.', 2.5);
    Sfx.unlock();
  }

  function restart() { startGame(); }

  function endShift() {
    state.mode = 'over';
    Sfx.end();
  }

  function update(dt) {
    t += dt;
    if (state.mode !== 'playing' || state.paused) return;

    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.timeLeft <= 60 && !state.rush) {
      state.rush = true;
      D.showMessage(state, 'SERVICE RUSH!', 'Last minute — tickets come in fast!', 2.5);
      Sfx.rush();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endShift();
      return;
    }

    // Orders: patience ticks down; expired tickets are lost.
    for (var i = state.orders.length - 1; i >= 0; i--) {
      var o = state.orders[i];
      o.patience -= dt;
      if (o.patience <= 0) {
        state.orders.splice(i, 1);
        state.lost += 1;
        state.combo = 0;
        state.shake = 6;
        D.addFloater(state, 640, 240, 'Ticket #' + o.id + ' walked out!', '#ff6b4a');
        Sfx.expire();
      }
    }

    // New orders arrive; faster during the rush.
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0 && state.orders.length < D.MAX_ORDERS) {
      D.spawnOrder(state);
      state.nextOrderIn = state.rush ? 6 : 11;
      Sfx.pickup();
    }

    // Chopping board progress.
    if (state.board) {
      state.board.progress += dt;
      if (state.board.progress >= state.board.duration) {
        var done = state.board.item;
        done.prepped = 'chopped';
        state.chef.holding = done;
        state.board = null;
        D.addFloater(state, 995, 280, 'Chopped!', '#9fe08a');
        Sfx.chopDone();
      }
    }

    // Grill progress; patties burn if left too long.
    for (var g = 0; g < 2; g++) {
      var slot = state.grill[g];
      if (!slot) continue;
      slot.progress += dt;
      if (slot.progress >= slot.duration && !slot.burnt) {
        if (slot.progress >= slot.duration + 6) {
          slot.burnt = true;
          slot.item.prepped = 'burnt';
          D.addFloater(state, 1165, 280, 'Burnt!', '#ff6b4a');
          Sfx.expire();
        } else if (!slot.announced) {
          slot.announced = true;
          slot.item.prepped = 'grilled';
          Sfx.grillDone();
        }
      }
    }

    // Chef movement + queued station use.
    GameInput.updateChef(state, dt);

    // Floaters + message decay.
    for (var f = state.floaters.length - 1; f >= 0; f--) {
      state.floaters[f].life -= dt;
      if (state.floaters[f].life <= 0) state.floaters.splice(f, 1);
    }
    if (state.message) {
      state.message.life -= dt;
      if (state.message.life <= 0) state.message = null;
    }
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 20);
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    ctx.save();
    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    }
    GameRender.render(state, ctx, W, H, t);
    ctx.restore();
    requestAnimationFrame(frame);
  }

  // Screenshot scenes (?scene=...) are staged before the first frame so the
  // still frame is exactly the staged state.
  var params = new URLSearchParams(window.location.search);
  var scene = params.get('scene');
  if (scene) {
    GameScenes.stageScene(state, scene);
  }

  GameInput.bindInput(canvas, state, { startGame: startGame, restart: restart });
  requestAnimationFrame(frame);

  // Expose a tiny debug handle for play-testing (not used by the game itself).
  window.__sizzle = { state: state, startGame: startGame };
})();
