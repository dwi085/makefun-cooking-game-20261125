// Game state for Sizzle & Serve: ingredients, recipes, orders, stations, scoring.
(function (global) {
  'use strict';

  var U = global.Util;

  // --- Ingredients ---------------------------------------------------------
  // kind: 'raw' (needs the grill), 'fresh' (needs the chopping board),
  // 'ready' (goes straight on the plate).
  var INGREDIENTS = {
    bun:     { id: 'bun',     name: 'Brioche Bun',   kind: 'ready', color: '#e8a94e', dark: '#b97a26', key: '1' },
    patty:   { id: 'patty',   name: 'Beef Patty',    kind: 'raw',   color: '#c65a4a', dark: '#8f3325', key: '2' },
    cheese:  { id: 'cheese',  name: 'Cheddar',       kind: 'ready', color: '#ffc93c', dark: '#d99a06', key: '3' },
    tomato:  { id: 'tomato',  name: 'Tomato',        kind: 'fresh', color: '#e8452c', dark: '#a92a17', key: '4' },
    lettuce: { id: 'lettuce', name: 'Lettuce',       kind: 'fresh', color: '#7dc242', dark: '#4d8a24', key: '5' },
    onion:   { id: 'onion',   name: 'Red Onion',     kind: 'fresh', color: '#b678c9', dark: '#7d4a94', key: '6' }
  };

  // A processed item is { id, prepped: 'grilled' | 'chopped' | 'plain' }.
  function processedName(item) {
    var base = INGREDIENTS[item.id].name;
    if (item.prepped === 'grilled') return 'Grilled ' + base;
    if (item.prepped === 'chopped') return 'Chopped ' + base;
    return base;
  }

  // --- Recipes ---------------------------------------------------------------
  // needs: list of { id, prepped } the plate must hold, in any order.
  var RECIPES = [
    { id: 'ember',   name: 'Ember Burger',  price: 14,
      needs: [{ id: 'bun', prepped: 'plain' }, { id: 'patty', prepped: 'grilled' }, { id: 'cheese', prepped: 'plain' }] },
    { id: 'garden',  name: 'Garden Stack',  price: 12,
      needs: [{ id: 'bun', prepped: 'plain' }, { id: 'tomato', prepped: 'chopped' }, { id: 'lettuce', prepped: 'chopped' }, { id: 'cheese', prepped: 'plain' }] },
    { id: 'smoky',   name: 'Smoky Melt',    price: 16,
      needs: [{ id: 'bun', prepped: 'plain' }, { id: 'patty', prepped: 'grilled' }, { id: 'cheese', prepped: 'plain' }, { id: 'onion', prepped: 'chopped' }] },
    { id: 'sunrise', name: 'Sunrise Bun',   price: 13,
      needs: [{ id: 'bun', prepped: 'plain' }, { id: 'patty', prepped: 'grilled' }, { id: 'tomato', prepped: 'chopped' }] },
    { id: 'double',  name: 'Double Trouble', price: 20,
      needs: [{ id: 'bun', prepped: 'plain' }, { id: 'patty', prepped: 'grilled' }, { id: 'patty', prepped: 'grilled' }, { id: 'cheese', prepped: 'plain' }] }
  ];

  function recipeById(id) {
    for (var i = 0; i < RECIPES.length; i++) if (RECIPES[i].id === id) return RECIPES[i];
    return null;
  }

  // --- Stations ---------------------------------------------------------------
  // x,y,w,h are in canvas pixels. type: 'bin' | 'board' | 'grill' | 'plate' | 'trash' | 'pass'
  var STATIONS = [
    { id: 'bin-bun',     type: 'bin',   item: 'bun',     x: 60,  y: 300, w: 120, h: 96,  label: 'BUNS' },
    { id: 'bin-patty',   type: 'bin',   item: 'patty',   x: 200, y: 300, w: 120, h: 96,  label: 'PATTIES' },
    { id: 'bin-cheese',  type: 'bin',   item: 'cheese',  x: 340, y: 300, w: 120, h: 96,  label: 'CHEDDAR' },
    { id: 'bin-tomato',  type: 'bin',   item: 'tomato',  x: 480, y: 300, w: 120, h: 96,  label: 'TOMATOES' },
    { id: 'bin-lettuce', type: 'bin',   item: 'lettuce', x: 620, y: 300, w: 120, h: 96,  label: 'LETTUCE' },
    { id: 'bin-onion',   type: 'bin',   item: 'onion',   x: 760, y: 300, w: 120, h: 96,  label: 'ONIONS' },
    { id: 'board',       type: 'board',                 x: 920, y: 290, w: 150, h: 116, label: 'CHOPPING BOARD' },
    { id: 'grill',       type: 'grill',                 x: 1090, y: 290, w: 150, h: 116, label: 'GRILL' },
    { id: 'plate',       type: 'plate',                 x: 480, y: 520, w: 320, h: 170, label: 'PLATING STATION' },
    { id: 'trash',       type: 'trash',                 x: 1120, y: 560, w: 120, h: 110, label: 'TRASH' },
    { id: 'pass',        type: 'pass',                  x: 60,  y: 520, w: 360, h: 170, label: 'SERVICE PASS — serve here' }
  ];

  function stationById(id) {
    for (var i = 0; i < STATIONS.length; i++) if (STATIONS[i].id === id) return STATIONS[i];
    return null;
  }

  function stationAt(x, y) {
    for (var i = STATIONS.length - 1; i >= 0; i--) {
      var s = STATIONS[i];
      if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s;
    }
    return null;
  }

  // --- Game state ---------------------------------------------------------------
  var SHIFT_SECONDS = 180;
  var ORDER_PATIENCE = 50;
  var MAX_ORDERS = 3;

  function newState(seed) {
    return {
      rng: U.makeRng(seed || 20261125),
      mode: 'title',            // 'title' | 'playing' | 'over'
      timeLeft: SHIFT_SECONDS,
      elapsed: 0,
      coins: 0,
      served: 0,
      lost: 0,
      combo: 0,
      bestCombo: 0,
      rush: false,
      rushAnnounced: false,
      orders: [],               // { id, recipe, patience, maxPatience, flash }
      nextOrderId: 1,
      nextOrderIn: 1.5,
      chef: { x: 640, y: 470, tx: 640, ty: 470, speed: 340, holding: null, busy: null, face: 1 },
      board: null,              // { item, progress, duration }
      grill: [null, null],      // two slots: { item, progress, duration, burnt }
      plate: [],                // processed items on the plate
      floaters: [],             // { x, y, text, color, life }
      message: null,            // { text, sub, life }
      paused: false,
      shake: 0,
      sizzle: 0
    };
  }

  function spawnOrder(state, recipeId) {
    var recipe = recipeId ? recipeById(recipeId) : U.pick(state.rng, RECIPES);
    var order = {
      id: state.nextOrderId++,
      recipe: recipe,
      patience: ORDER_PATIENCE,
      maxPatience: ORDER_PATIENCE,
      flash: 0
    };
    state.orders.push(order);
    return order;
  }

  function plateMatches(state, recipe) {
    var have = state.plate.slice();
    for (var i = 0; i < recipe.needs.length; i++) {
      var need = recipe.needs[i];
      var found = -1;
      for (var j = 0; j < have.length; j++) {
        if (have[j].id === need.id && have[j].prepped === need.prepped) { found = j; break; }
      }
      if (found < 0) return false;
      have.splice(found, 1);
    }
    return have.length === 0;
  }

  function matchingOrder(state) {
    for (var i = 0; i < state.orders.length; i++) {
      if (plateMatches(state, state.orders[i].recipe)) return state.orders[i];
    }
    return null;
  }

  function serveOrder(state, order) {
    var tip = Math.round(order.recipe.price * 0.5 * (order.patience / order.maxPatience));
    var earned = order.recipe.price + tip;
    state.coins += earned;
    state.served += 1;
    state.combo += 1;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;
    state.orders.splice(state.orders.indexOf(order), 1);
    state.plate = [];
    var pass = stationById('pass');
    state.floaters.push({ x: pass.x + pass.w / 2, y: pass.y - 8, text: '+$' + earned, color: '#ffd94d', life: 1.4 });
    if (state.combo >= 3) {
      state.floaters.push({ x: pass.x + pass.w / 2, y: pass.y - 38, text: 'COMBO x' + state.combo + '!', color: '#ff9d5c', life: 1.4 });
    }
    return earned;
  }

  function addFloater(state, x, y, text, color) {
    state.floaters.push({ x: x, y: y, text: text, color: color || '#ffffff', life: 1.2 });
  }

  function showMessage(state, text, sub, life) {
    state.message = { text: text, sub: sub || '', life: life || 2.2 };
  }

  global.GameData = {
    INGREDIENTS: INGREDIENTS, RECIPES: RECIPES, STATIONS: STATIONS,
    SHIFT_SECONDS: SHIFT_SECONDS, ORDER_PATIENCE: ORDER_PATIENCE, MAX_ORDERS: MAX_ORDERS,
    newState: newState, spawnOrder: spawnOrder, recipeById: recipeById,
    stationById: stationById, stationAt: stationAt, plateMatches: plateMatches,
    matchingOrder: matchingOrder, serveOrder: serveOrder,
    addFloater: addFloater, showMessage: showMessage, processedName: processedName
  };
})(typeof window !== 'undefined' ? window : globalThis);
