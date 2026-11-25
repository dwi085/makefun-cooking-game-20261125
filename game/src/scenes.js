// Deterministic screenshot staging for Sizzle & Serve.
// ?scene=start|assembly|serve|rush sets the game to a real, playable state
// that shows the required elements. No randomness: fixed orders and timers.
(function (global) {
  'use strict';

  var D = global.GameData;

  function stageScene(state, name) {
    state.mode = 'playing';
    state.orders = [];
    state.plate = [];
    state.grill = [null, null];
    state.board = null;
    state.floaters = [];
    state.message = null;
    state.chef.holding = null;

    if (name === 'assembly') {
      // One dish mid-assembly: plate holds bun + grilled patty + cheese,
      // chef carries chopped tomato at the board, a patty sizzles on the grill.
      state.timeLeft = 147;
      state.elapsed = 33;
      state.coins = 86;
      state.served = 4;
      state.combo = 2;
      D.spawnOrder(state, 'smoky');
      D.spawnOrder(state, 'garden');
      state.orders[0].patience = 34;
      state.orders[1].patience = 44;
      state.plate = [
        { id: 'bun', prepped: 'plain' },
        { id: 'patty', prepped: 'grilled' },
        { id: 'cheese', prepped: 'plain' }
      ];
      state.chef.holding = { id: 'tomato', prepped: 'chopped' };
      state.chef.x = 990; state.chef.y = 440;
      state.chef.tx = 990; state.chef.ty = 440;
      state.grill[0] = { item: { id: 'patty', prepped: 'plain' }, progress: 2.4, duration: 4.0, burnt: false };
      state.board = { item: { id: 'lettuce', prepped: 'plain' }, progress: 1.1, duration: 2.0 };
      D.showMessage(state, 'Mid-assembly: add the tomato!', 'The Smoky Melt needs chopped onion next.', 999);
    } else if (name === 'serve') {
      // A plate ready to serve: complete Ember Burger, ticket highlighted,
      // chef at the pass.
      state.timeLeft = 112;
      state.elapsed = 68;
      state.coins = 240;
      state.served = 9;
      state.combo = 4;
      D.spawnOrder(state, 'ember');
      D.spawnOrder(state, 'sunrise');
      D.spawnOrder(state, 'double');
      state.orders[0].patience = 38;
      state.orders[1].patience = 27;
      state.orders[2].patience = 46;
      state.plate = [
        { id: 'bun', prepped: 'plain' },
        { id: 'patty', prepped: 'grilled' },
        { id: 'cheese', prepped: 'plain' }
      ];
      state.chef.x = 240; state.chef.y = 620;
      state.chef.tx = 240; state.chef.ty = 620;
      D.showMessage(state, 'Plate ready — serve it at the pass!', 'Ember Burger matches ticket #1.', 999);
    } else if (name === 'rush') {
      // Service rush: low timer, three impatient tickets, grill full, one burnt patty.
      state.timeLeft = 42;
      state.elapsed = 138;
      state.coins = 410;
      state.served = 15;
      state.combo = 5;
      state.rush = true;
      D.spawnOrder(state, 'double');
      D.spawnOrder(state, 'smoky');
      D.spawnOrder(state, 'ember');
      state.orders[0].patience = 9;
      state.orders[1].patience = 16;
      state.orders[2].patience = 24;
      state.plate = [
        { id: 'bun', prepped: 'plain' },
        { id: 'patty', prepped: 'grilled' }
      ];
      state.chef.holding = { id: 'cheese', prepped: 'plain' };
      state.chef.x = 640; state.chef.y = 640;
      state.chef.tx = 640; state.chef.ty = 640;
      state.grill[0] = { item: { id: 'patty', prepped: 'plain' }, progress: 3.6, duration: 4.0, burnt: false };
      state.grill[1] = { item: { id: 'patty', prepped: 'plain' }, progress: 4.0, duration: 4.0, burnt: true };
      state.board = { item: { id: 'onion', prepped: 'plain' }, progress: 1.6, duration: 2.0 };
    } else {
      // 'start' (default): fresh shift, three tickets, full counters, timer running.
      state.timeLeft = 167;
      state.elapsed = 13;
      state.coins = 28;
      state.served = 1;
      state.combo = 1;
      D.spawnOrder(state, 'ember');
      D.spawnOrder(state, 'garden');
      D.spawnOrder(state, 'sunrise');
      state.orders[0].patience = 41;
      state.orders[1].patience = 47;
      state.orders[2].patience = 44;
      state.chef.x = 640; state.chef.y = 470;
      state.chef.tx = 640; state.chef.ty = 470;
    }
    // Freeze the staged scene: screenshots must not drift between runs.
    state.paused = true;
    state.staged = true;
    // Keep the message visible in the still frame.
    if (state.message) state.message.life = 999;
  }

  global.GameScenes = { stageScene: stageScene };
})(typeof window !== 'undefined' ? window : globalThis);
