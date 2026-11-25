// Canvas rendering for Sizzle & Serve: kitchen, order board, counters, chef, plates.
(function (global) {
  'use strict';

  var D = global.GameData;
  var U = global.Util;

  function drawIngredient(ctx, x, y, r, item, t) {
    var ing = D.INGREDIENTS[item.id];
    ctx.save();
    ctx.translate(x, y);
    if (item.id === 'bun') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, 2, r, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f7cf8a';
      ctx.beginPath(); ctx.arc(0, 2, r * 0.82, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff3d6';
      [[-r * 0.4, -r * 0.45], [0, -r * 0.6], [r * 0.4, -r * 0.45]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.09, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = ing.dark;
      ctx.fillRect(-r, 2, r * 2, r * 0.28);
    } else if (item.id === 'patty') {
      var col = item.prepped === 'grilled' ? '#7a3b22' : ing.color;
      ctx.fillStyle = col;
      U.roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.arc(i * r * 0.55, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
      }
      if (item.prepped === 'grilled') {
        ctx.strokeStyle = '#4a2413'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.3); ctx.lineTo(r * 0.6, r * 0.3);
        ctx.moveTo(-r * 0.6, r * 0.3); ctx.lineTo(r * 0.6, -r * 0.3); ctx.stroke();
      }
    } else if (item.id === 'cheese') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.moveTo(-r, r * 0.5); ctx.lineTo(r, r * 0.5); ctx.lineTo(0, -r * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ing.dark;
      [[-r * 0.35, r * 0.1], [r * 0.25, -r * 0.1], [0, r * 0.3]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.11, 0, Math.PI * 2); ctx.fill();
      });
    } else if (item.id === 'tomato') {
      ctx.fillStyle = item.prepped === 'chopped' ? '#ff7a5c' : ing.color;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      if (item.prepped === 'chopped') {
        ctx.fillStyle = '#ffd9c9';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff9d7a';
        for (var k = 0; k < 5; k++) {
          var a = (k / 5) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 0.12, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.fillStyle = '#4d8a24';
        ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-r * 0.3, -r * 1.25); ctx.lineTo(r * 0.3, -r * 1.25); ctx.closePath(); ctx.fill();
      }
    } else if (item.id === 'lettuce') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.quadraticCurveTo(0, -r * 0.5, r * 0.7, 0); ctx.stroke();
      if (item.prepped === 'chopped') {
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.5); ctx.lineTo(r * 0.5, r * 0.5);
        ctx.moveTo(r * 0.5, -r * 0.5); ctx.lineTo(-r * 0.5, r * 0.5); ctx.stroke();
      }
    } else if (item.id === 'onion') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#efe2f5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlate(ctx, x, y, r, plate) {
    ctx.fillStyle = '#f4f1ea';
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9c2b2'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.8, r * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
    var n = plate.length;
    for (var i = 0; i < n; i++) {
      var px = x + (i - (n - 1) / 2) * r * 0.62;
      drawIngredient(ctx, px, y - 6 - i * 7, r * 0.42, plate[i], 0);
    }
  }

  function drawChef(ctx, chef, t) {
    var bob = Math.abs(Math.sin(t * 9)) * 3;
    var moving = U.dist(chef.x, chef.y, chef.tx, chef.ty) > 6;
    ctx.save();
    ctx.translate(chef.x, chef.y - (moving ? bob : 0));
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 26, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    // body (apron)
    ctx.fillStyle = '#f4f1ea';
    U.roundRect(ctx, -20, -6, 40, 34, 10); ctx.fill();
    ctx.fillStyle = '#e2574c';
    ctx.fillRect(-20, 8, 40, 6);
    // head
    ctx.fillStyle = '#ffcf9e';
    ctx.beginPath(); ctx.arc(0, -20, 15, 0, Math.PI * 2); ctx.fill();
    // chef hat
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-9, -32, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -36, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -32, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-14, -34, 28, 8);
    // eyes
    ctx.fillStyle = '#2b1d16';
    ctx.beginPath(); ctx.arc(-5 * chef.face, -20, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5 * chef.face, -20, 2, 0, Math.PI * 2); ctx.fill();
    // arms
    ctx.strokeStyle = '#ffcf9e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-26, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, 2); ctx.lineTo(26, 12); ctx.stroke();
    // held item above head
    if (chef.holding) {
      drawIngredient(ctx, 0, -58, 16, chef.holding, t);
    }
    ctx.restore();
  }

  function drawOrderTicket(ctx, order, x, y, w, h, t) {
    var frac = order.patience / order.maxPatience;
    var urgent = frac < 0.35;
    ctx.save();
    if (urgent && Math.floor(t * 3) % 2 === 0) ctx.globalAlpha = 0.92;
    ctx.fillStyle = urgent ? '#fff0e0' : '#fffaf0';
    U.roundRect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = urgent ? '#e8452c' : '#d9c9a8'; ctx.lineWidth = 3;
    U.roundRect(ctx, x, y, w, h, 10); ctx.stroke();
    // recipe name
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('#' + order.id + '  ' + order.recipe.name, x + 12, y + 24);
    // needed items row
    var ix = x + 14;
    order.recipe.needs.forEach(function (need) {
      drawIngredient(ctx, ix + 15, y + 52, 14, need, t);
      ix += 34;
    });
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillStyle = '#7a5a34';
    ctx.textAlign = 'right';
    ctx.fillText('$' + order.recipe.price, x + w - 12, y + 26);
    // patience bar
    ctx.fillStyle = '#e8ddc9';
    U.roundRect(ctx, x + 12, y + h - 16, w - 24, 8, 4); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#7dc242' : (frac > 0.25 ? '#ffb02e' : '#e8452c');
    U.roundRect(ctx, x + 12, y + h - 16, (w - 24) * frac, 8, 4); ctx.fill();
    ctx.restore();
  }

  function render(state, ctx, W, H, t) {
    // --- floor: warm checker tiles
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(0, 0, W, H);
    var tile = 64;
    for (var ty = 0; ty < H / tile; ty++) {
      for (var tx = 0; tx < W / tile; tx++) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#c98f5f' : '#bd8252';
        ctx.fillRect(tx * tile, ty * tile, tile, tile);
      }
    }
    // --- back wall
    ctx.fillStyle = '#7a4a2e';
    ctx.fillRect(0, 0, W, 118);
    ctx.fillStyle = '#f3e3c2';
    for (var wx = 0; wx < W; wx += 96) {
      ctx.fillRect(wx + 8, 14, 80, 88);
      ctx.fillStyle = '#e8d3ac';
      ctx.fillRect(wx + 8, 14, 80, 10);
      ctx.fillStyle = '#f3e3c2';
    }
    ctx.fillStyle = '#5d3a22';
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('H A S T Y   H E A R T H   K I T C H E N', W / 2, 62);
    ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillStyle = '#8a6a44';
    ctx.fillText('Sizzle & Serve — cook fast, serve faster', W / 2, 88);

    // --- HUD bar
    ctx.fillStyle = 'rgba(43,29,22,0.92)';
    U.roundRect(ctx, 16, 128, W - 32, 52, 12); ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe9c9';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    var timeColor = state.timeLeft <= 30 ? '#ff6b4a' : '#ffe9c9';
    ctx.fillStyle = timeColor;
    ctx.fillText('⏱  ' + U.formatTime(state.timeLeft), 36, 162);
    ctx.fillStyle = '#ffd94d';
    ctx.fillText('◉  $' + state.coins, 210, 162);
    ctx.fillStyle = '#ffe9c9';
    ctx.fillText('Served: ' + state.served + '   Lost: ' + state.lost, 380, 162);
    ctx.fillStyle = '#ff9d5c';
    ctx.fillText(state.combo >= 2 ? 'COMBO x' + state.combo : '', 620, 162);
    ctx.textAlign = 'right';
    ctx.fillStyle = state.rush ? '#ff6b4a' : '#9fe08a';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(state.rush ? '⚠ SERVICE RUSH! Orders come faster!' : 'Shift in progress — keep cooking!', W - 36, 162);
    ctx.textAlign = 'left';

    // --- ORDER BOARD
    ctx.fillStyle = '#4a2f1c';
    U.roundRect(ctx, 16, 192, 400, 92, 12); ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('📋  ORDER BOARD', 32, 220);
    ctx.fillStyle = '#ffe9c9';
    ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Match a plate to a ticket, then serve at the pass.', 32, 246);
    ctx.fillText('Fresh orders arrive as you cook.', 32, 268);
    var ox = 432;
    for (var oi = 0; oi < state.orders.length; oi++) {
      drawOrderTicket(ctx, state.orders[oi], ox, 192, 260, 92, t);
      ox += 272;
    }
    if (state.orders.length === 0) {
      ctx.fillStyle = '#ffe9c9';
      ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('No orders yet — fresh tickets coming…', 450, 244);
    }

    // --- ingredient bins + prep stations
    D.STATIONS.forEach(function (s) {
      ctx.save();
      if (s.type === 'bin') {
        ctx.fillStyle = '#6b4423';
        U.roundRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
        ctx.fillStyle = '#a9743f';
        U.roundRect(ctx, s.x + 6, s.y + 6, s.w - 12, s.h - 12, 8); ctx.fill();
        var ing = D.INGREDIENTS[s.item];
        drawIngredient(ctx, s.x + s.w / 2, s.y + 38, 22, { id: s.item, prepped: 'plain' }, t);
        ctx.fillStyle = '#fff3d6';
        ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.label, s.x + s.w / 2, s.y + s.h - 10);
        ctx.fillStyle = '#ffd94d';
        ctx.font = 'bold 12px "Trebuchet MS", Verdana, sans-serif';
        ctx.fillText('[' + ing.key + ']', s.x + s.w - 14, s.y + 18);
      } else if (s.type === 'board') {
        ctx.fillStyle = '#6b4423';
        U.roundRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
        ctx.fillStyle = '#e8c491';
        U.roundRect(ctx, s.x + 10, s.y + 10, s.w - 20, s.h - 34, 6); ctx.fill();
        if (state.board) {
          drawIngredient(ctx, s.x + s.w / 2, s.y + 42, 20, state.board.item, t);
          var frac = state.board.progress / state.board.duration;
          ctx.fillStyle = '#d9c9a8';
          U.roundRect(ctx, s.x + 14, s.y + s.h - 28, s.w - 28, 8, 4); ctx.fill();
          ctx.fillStyle = '#7dc242';
          U.roundRect(ctx, s.x + 14, s.y + s.h - 28, (s.w - 28) * frac, 8, 4); ctx.fill();
          ctx.fillStyle = '#3a2a1a';
          ctx.font = 'bold 12px "Trebuchet MS", Verdana, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CHOPPING… ' + Math.ceil((1 - frac) * state.board.duration) + 's', s.x + s.w / 2, s.y + s.h - 32);
        } else {
          ctx.fillStyle = '#8a6a44';
          ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔪  chop fresh veg here', s.x + s.w / 2, s.y + 48);
        }
        ctx.fillStyle = '#fff3d6';
        ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
        ctx.fillText(s.label, s.x + s.w / 2, s.y + s.h - 8);
      } else if (s.type === 'grill') {
        ctx.fillStyle = '#3a3a3a';
        U.roundRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
        ctx.fillStyle = '#555555';
        for (var gx = 0; gx < 4; gx++) {
          ctx.fillRect(s.x + 14 + gx * 32, s.y + 12, 6, s.h - 48);
        }
        var flame = 0.5 + 0.5 * Math.sin(t * 7);
        var anyCooking = state.grill[0] || state.grill[1];
        if (anyCooking) {
          ctx.fillStyle = 'rgba(255,' + Math.floor(120 + 80 * flame) + ',40,' + (0.35 + 0.3 * flame) + ')';
          ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, s.y + s.h - 30, 46, 10, 0, 0, Math.PI * 2); ctx.fill();
        }
        state.grill.forEach(function (slot, gi) {
          if (!slot) return;
          var sx = s.x + 40 + gi * 70;
          drawIngredient(ctx, sx, s.y + 44, 20, slot.item, t);
          var fr = slot.progress / slot.duration;
          ctx.fillStyle = '#d9c9a8';
          U.roundRect(ctx, sx - 26, s.y + 66, 52, 7, 3); ctx.fill();
          ctx.fillStyle = slot.burnt ? '#e8452c' : '#ff9d3c';
          U.roundRect(ctx, sx - 26, s.y + 66, 52 * Math.min(1, fr), 7, 3); ctx.fill();
          if (slot.burnt) {
            ctx.fillStyle = '#ff6b4a';
            ctx.font = 'bold 12px "Trebuchet MS", Verdana, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('BURNT!', sx, s.y + 88);
          }
        });
        ctx.fillStyle = '#fff3d6';
        ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.label + '  🔥', s.x + s.w / 2, s.y + s.h - 8);
      } else if (s.type === 'plate') {
        ctx.fillStyle = '#6b4423';
        U.roundRect(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
        ctx.fillStyle = '#a9743f';
        U.roundRect(ctx, s.x + 8, s.y + 8, s.w - 16, s.h - 40, 8); ctx.fill();
        drawPlate(ctx, s.x + s.w / 2, s.y + 78, 74, state.plate);
        var match = D.matchingOrder(state);
        ctx.fillStyle = match ? '#9fe08a' : '#fff3d6';
        ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(match ? '✓ READY TO SERVE — take it to the pass!' : s.label + ' — click to add held food', s.x + s.w / 2, s.y + s.h - 10);
      } else if (s.type === 'trash') {
        ctx.fillStyle = '#4a4a4a';
        U.roundRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
        ctx.fillStyle = '#666666';
        U.roundRect(ctx, s.x + 24, s.y + 22, s.w - 48, s.h - 44, 6); ctx.fill();
        ctx.fillStyle = '#fff3d6';
        ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🗑', s.x + s.w / 2, s.y + 52);
        ctx.fillText(s.label, s.x + s.w / 2, s.y + s.h - 8);
      } else if (s.type === 'pass') {
        var matchP = D.matchingOrder(state);
        ctx.fillStyle = matchP ? '#2f7a3a' : '#6b4423';
        U.roundRect(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
        ctx.fillStyle = matchP ? '#57b368' : '#a9743f';
        U.roundRect(ctx, s.x + 8, s.y + 8, s.w - 16, s.h - 40, 8); ctx.fill();
        ctx.fillStyle = '#fff3d6';
        ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        if (matchP) {
          ctx.fillText('🍽  SERVE  #' + matchP.id + '  ' + matchP.recipe.name + '  🍽', s.x + s.w / 2, s.y + 34);
          drawPlate(ctx, s.x + s.w / 2, s.y + 100, 56, state.plate);
          ctx.fillStyle = '#ffd94d';
          ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
          ctx.fillText('CLICK TO SERVE  +$' + matchP.recipe.price, s.x + s.w / 2, s.y + s.h - 10);
        } else {
          ctx.fillText('SERVICE PASS', s.x + s.w / 2, s.y + 34);
          ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
          ctx.fillStyle = '#ffe9c9';
          ctx.fillText('Finished plates go out here.', s.x + s.w / 2, s.y + 62);
          ctx.fillText('Match a ticket first!', s.x + s.w / 2, s.y + 86);
          ctx.fillStyle = '#fff3d6';
          ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
          ctx.fillText(s.label, s.x + s.w / 2, s.y + s.h - 10);
        }
      }
      ctx.restore();
    });

    // --- chef
    drawChef(ctx, state.chef, t);

    // --- floaters
    ctx.textAlign = 'center';
    state.floaters.forEach(function (f) {
      ctx.globalAlpha = U.clamp(f.life, 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(f.text, f.x, f.y - (1.4 - f.life) * 30);
    });
    ctx.globalAlpha = 1;

    // --- message banner (bottom strip: never covers the order board)
    if (state.message) {
      ctx.globalAlpha = U.clamp(state.message.life, 0, 1);
      ctx.fillStyle = 'rgba(43,29,22,0.9)';
      U.roundRect(ctx, W / 2 - 260, 706, 520, 64, 12); ctx.fill();
      ctx.fillStyle = '#ffd94d';
      ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(state.message.text, W / 2, 734);
      ctx.fillStyle = '#ffe9c9';
      ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(state.message.sub, W / 2, 758);
      ctx.globalAlpha = 1;
    }

    // --- rush banner
    if (state.rush && state.mode === 'playing') {
      ctx.fillStyle = '#e8452c';
      ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      var pulse = 0.7 + 0.3 * Math.sin(t * 6);
      ctx.globalAlpha = pulse;
      ctx.fillText('★ SERVICE RUSH ★', W / 2, 420);
      ctx.globalAlpha = 1;
    }

    // --- paused (staged screenshot scenes freeze without the overlay)
    if (state.paused && !state.staged) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffe9c9';
      ctx.font = 'bold 44px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', W / 2, H / 2);
      ctx.font = '18px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Press P to keep cooking', W / 2, H / 2 + 36);
    }

    // --- title screen
    if (state.mode === 'title') {
      ctx.fillStyle = 'rgba(43,29,22,0.82)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd94d';
      ctx.font = 'bold 64px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('SIZZLE & SERVE', W / 2, 260);
      ctx.fillStyle = '#ffe9c9';
      ctx.font = 'bold 28px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Hasty Hearth Kitchen', W / 2, 310);
      ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Tickets fly in on the order board. Grab ingredients, chop the fresh ones,', W / 2, 380);
      ctx.fillText('grill the patties, build the plate, and serve it at the pass before the ticket expires.', W / 2, 410);
      ctx.fillText('3-minute shift. Tips for fast service. Combos for streaks. Don\'t burn the patties!', W / 2, 440);
      ctx.fillStyle = '#9fe08a';
      ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('CLICK or press ENTER to start your shift', W / 2, 520);
      ctx.fillStyle = '#ffe9c9';
      ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Mouse: click stations to walk & use them  •  Keys 1–6: grab ingredients  •  Space: use station  •  T: trash  •  P: pause', W / 2, 570);
    }

    // --- game over screen
    if (state.mode === 'over') {
      ctx.fillStyle = 'rgba(43,29,22,0.86)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd94d';
      ctx.font = 'bold 52px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('SHIFT OVER!', W / 2, 250);
      var rank = state.served >= 12 ? 'S — HEAD CHEF!' : state.served >= 8 ? 'A — SOUS CHEF' : state.served >= 5 ? 'B — LINE COOK' : 'C — STAGE';
      ctx.fillStyle = '#9fe08a';
      ctx.font = 'bold 34px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Rank: ' + rank, W / 2, 320);
      ctx.fillStyle = '#ffe9c9';
      ctx.font = '24px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Coins earned: $' + state.coins, W / 2, 380);
      ctx.fillText('Dishes served: ' + state.served + '    Lost tickets: ' + state.lost + '    Best combo: x' + state.bestCombo, W / 2, 420);
      ctx.fillStyle = '#ff9d5c';
      ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText('Press ENTER to cook another shift', W / 2, 500);
    }
    ctx.textAlign = 'left';
  }

  global.GameRender = { render: render, drawIngredient: drawIngredient, drawPlate: drawPlate };
})(typeof window !== 'undefined' ? window : globalThis);
