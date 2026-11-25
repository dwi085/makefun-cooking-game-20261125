// Synthesised sound effects for Sizzle & Serve — WebAudio only, no audio files.
(function (global) {
  'use strict';

  var ctx = null;
  var muted = false;
  var sizzleNode = null;

  function ensureCtx() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    var ac = ensureCtx();
    if (!ac) return;
    var t0 = ac.currentTime;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(dur, vol, filterFreq) {
    if (muted) return;
    var ac = ensureCtx();
    if (!ac) return;
    var len = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ac.createBufferSource();
    src.buffer = buf;
    var filt = ac.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq || 1800;
    var gain = ac.createGain();
    gain.gain.value = vol || 0.15;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ac.destination);
    src.start();
  }

  var Sfx = {
    unlock: function () { ensureCtx(); },
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },

    pickup: function () { tone(520, 0.09, 'triangle', 0.12, 760); },
    drop: function () { tone(340, 0.08, 'triangle', 0.10, 260); },
    chop: function () { noiseBurst(0.07, 0.22, 900); tone(180, 0.06, 'square', 0.06, 120); },
    chopDone: function () { tone(660, 0.12, 'triangle', 0.12, 880); },
    sizzleStart: function () { noiseBurst(0.25, 0.10, 3200); },
    grillDone: function () { tone(587, 0.1, 'sine', 0.12); setTimeout(function () { tone(880, 0.14, 'sine', 0.12); }, 90); },
    serve: function () {
      tone(523, 0.1, 'sine', 0.14);
      setTimeout(function () { tone(659, 0.1, 'sine', 0.14); }, 90);
      setTimeout(function () { tone(784, 0.18, 'sine', 0.16); }, 180);
    },
    coin: function () { tone(988, 0.08, 'square', 0.07, 1319); },
    expire: function () { tone(220, 0.3, 'sawtooth', 0.10, 110); },
    error: function () { tone(160, 0.15, 'square', 0.09, 120); },
    rush: function () {
      tone(440, 0.12, 'square', 0.10);
      setTimeout(function () { tone(440, 0.12, 'square', 0.10); }, 150);
      setTimeout(function () { tone(587, 0.2, 'square', 0.10); }, 300);
    },
    end: function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        setTimeout(function () { tone(f, 0.22, 'triangle', 0.13); }, i * 130);
      });
    }
  };

  global.Sfx = Sfx;
})(typeof window !== 'undefined' ? window : globalThis);
