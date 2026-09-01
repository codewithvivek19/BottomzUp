/**
 * Bottomz Up — Light heat control knob (vanilla)
 * Reactor-knob concept: raw angle → snap ticks → spring body
 * Emits: heatknobchange / heatknobcommit  detail: { value 0-100, deg }
 */
(function () {
  'use strict';

  const MIN_DEG = -135;
  const MAX_DEG = 135;
  const TOTAL_TICKS = 40;
  const DEG_PER_TICK = (MAX_DEG - MIN_DEG) / TOTAL_TICKS;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clampDeg(d) {
    if (d < MIN_DEG) return MIN_DEG;
    if (d > MAX_DEG) return MAX_DEG;
    return d;
  }

  function valueToDeg(v) {
    const t = Math.min(100, Math.max(0, v)) / 100;
    return MIN_DEG + t * (MAX_DEG - MIN_DEG);
  }

  function degToValue(d) {
    return ((d - MIN_DEG) / (MAX_DEG - MIN_DEG)) * 100;
  }

  function snapDeg(d) {
    return Math.round(d / DEG_PER_TICK) * DEG_PER_TICK;
  }

  function createSpring(opts) {
    const stiffness = opts.stiffness || 400;
    const damping = opts.damping || 35;
    const mass = opts.mass || 0.8;
    let value = opts.value || 0;
    let target = value;
    let velocity = 0;
    let raf = null;
    const onUpdate = opts.onUpdate || function () {};

    function step() {
      const disp = value - target;
      const force = -stiffness * disp - damping * velocity;
      const accel = force / mass;
      velocity += accel * (1 / 60);
      value += velocity * (1 / 60);
      onUpdate(value, velocity);
      if (Math.abs(velocity) < 0.05 && Math.abs(value - target) < 0.05) {
        value = target;
        velocity = 0;
        onUpdate(value, 0);
        raf = null;
        return;
      }
      raf = requestAnimationFrame(step);
    }

    return {
      set(t, immediate) {
        target = t;
        if (immediate || reduceMotion) {
          value = t;
          velocity = 0;
          onUpdate(value, 0);
          if (raf) cancelAnimationFrame(raf);
          raf = null;
          return;
        }
        if (!raf) raf = requestAnimationFrame(step);
      },
      get() {
        return value;
      },
    };
  }

  function haptic(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (_) {}
  }

  function mount(root) {
    if (!root || root.dataset.hkMounted === '1') return null;
    root.dataset.hkMounted = '1';

    const defaultVal = Number(root.dataset.value || 37);
    let rawDeg = valueToDeg(defaultVal);
    let snap = snapDeg(rawDeg);
    let dragging = false;
    let lastTick = Math.round((snap - MIN_DEG) / DEG_PER_TICK);

    // Build DOM if empty shell
    if (!root.querySelector('.hk-knob')) {
      root.classList.add('hk-stage');
      root.innerHTML = buildHTML(defaultVal);
    }

    const knob = root.querySelector('.hk-knob');
    const glow = root.querySelector('.hk-glow');
    const ticks = root.querySelectorAll('.hk-tick');
    const readout = root.querySelector('[data-hk-display]');
    const readoutShell = root.querySelector('.hk-readout-value');
    const heatLabel = root.querySelector('[data-hk-heat-label]');
    const tickArms = root.querySelectorAll('.hk-tick-arm');

    const spring = createSpring({
      value: snap,
      onUpdate(v) {
        root.style.setProperty('--hk-smooth', v + 'deg');
        updateTicks(v);
        updateReadout(degToValue(v));
      },
    });

    function updateGlow(deg) {
      const p = degToValue(deg) / 100;
      root.style.setProperty('--hk-glow', String(0.08 + p * 0.4));
      if (glow) glow.style.opacity = String(0.08 + p * 0.4);
    }

    function updateTicks(deg) {
      tickArms.forEach((arm) => {
        const angle = Number(arm.dataset.angle);
        const tick = arm.querySelector('.hk-tick');
        if (!tick) return;
        tick.classList.toggle('is-on', deg >= angle - 0.01);
      });
    }

    function updateReadout(val) {
      const n = Math.round(val);
      root.dataset.value = String(n);
      root.style.setProperty('--hk-value', String(n));
      const pad = String(n).padStart(3, '0');
      if (readout) readout.textContent = pad;
      if (readoutShell) readoutShell.setAttribute('data-display', pad);
      if (knob) knob.setAttribute('aria-valuenow', String(n));
    }

    function emit(type, deg) {
      const value = Math.round(degToValue(deg));
      root.dispatchEvent(
        new CustomEvent(type, {
          bubbles: true,
          detail: { value, deg, snapped: snap },
        })
      );
    }

    function setFromValue(v, opts) {
      opts = opts || {};
      const deg = snapDeg(valueToDeg(v));
      rawDeg = deg;
      snap = deg;
      spring.set(deg, opts.immediate);
      updateGlow(deg);
      updateReadout(degToValue(deg));
      if (!opts.silent) emit('heatknobchange', deg);
    }

    function setHeatLabel(text) {
      if (heatLabel) heatLabel.textContent = text || '';
    }

    function onPointerDown(e) {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      root.classList.add('is-dragging');
      document.body.style.userSelect = 'none';
      try {
        knob.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    function pointerToDeg(clientX, clientY) {
      const rect = knob.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = clientX - cx;
      const y = clientY - cy;
      let degs = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (degs > 180) degs -= 360;
      return clampDeg(degs);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const degs = pointerToDeg(e.clientX, e.clientY);
      rawDeg = degs;
      updateGlow(degs);

      const nextSnap = snapDeg(degs);
      if (nextSnap !== snap) {
        snap = nextSnap;
        const tick = Math.round((snap - MIN_DEG) / DEG_PER_TICK);
        if (tick !== lastTick) {
          lastTick = tick;
          haptic(6);
        }
        spring.set(snap);
        emit('heatknobchange', snap);
      } else {
        // light follows raw while body stays snapped
        root.style.setProperty('--hk-deg', degs + 'deg');
      }
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      document.body.style.userSelect = '';
      spring.set(snap);
      emit('heatknobcommit', snap);
      try {
        if (e && e.pointerId != null) knob.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    knob.addEventListener('pointerdown', onPointerDown);
    knob.addEventListener('pointermove', onPointerMove);
    knob.addEventListener('pointerup', onPointerUp);
    knob.addEventListener('pointercancel', onPointerUp);

    knob.addEventListener('keydown', (e) => {
      let v = degToValue(snap);
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFromValue(Math.min(100, v + 100 / TOTAL_TICKS));
        emit('heatknobcommit', snap);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFromValue(Math.max(0, v - 100 / TOTAL_TICKS));
        emit('heatknobcommit', snap);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFromValue(0);
        emit('heatknobcommit', snap);
      } else if (e.key === 'End') {
        e.preventDefault();
        setFromValue(100);
        emit('heatknobcommit', snap);
      }
    });

    // Initial paint
    spring.set(snap, true);
    updateGlow(snap);
    updateTicks(snap);
    updateReadout(defaultVal);

    return {
      root,
      setValue: setFromValue,
      getValue: () => Math.round(degToValue(snap)),
      setHeatLabel,
    };
  }

  function buildHTML(val) {
    const arms = [];
    for (let i = 0; i <= TOTAL_TICKS; i++) {
      const angle = (i / TOTAL_TICKS) * (MAX_DEG - MIN_DEG) + MIN_DEG;
      arms.push(
        `<div class="hk-tick-arm" data-angle="${angle}" style="transform:rotate(${angle}deg)"><span class="hk-tick"></span></div>`
      );
    }
    const pad = String(Math.round(val)).padStart(3, '0');
    return `
      <p class="hk-kicker">Heat motor · twist</p>
      <div class="hk-wrap">
        <div class="hk-glow" aria-hidden="true"></div>
        <div class="hk-ticks" aria-hidden="true">${arms.join('')}</div>
        <div class="hk-knob-anchor">
          <div class="hk-knob" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(val)}" aria-label="Wing heat level">
            <div class="hk-knob-body">
              <div class="hk-knob-sheen" aria-hidden="true"></div>
              <div class="hk-knob-cap">
                <span class="hk-indicator" aria-hidden="true"></span>
                <span class="hk-cap-label">Heat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hk-readout">
        <span class="hk-readout-label">Output</span>
        <span class="hk-readout-value" data-display="${pad}"><span data-hk-display>${pad}</span><span class="hk-readout-unit">%</span></span>
        <span class="hk-heat-label" data-hk-heat-label>Mild</span>
      </div>
    `;
  }

  function initAll() {
    const nodes = document.querySelectorAll('[data-heat-knob]');
    const instances = [];
    nodes.forEach((el) => {
      // allow remount if shell recreated
      if (!el.querySelector('.hk-knob')) delete el.dataset.hkMounted;
      const inst = mount(el);
      if (inst) instances.push(inst);
    });
    window.__heatKnobs = instances;
    return instances;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.__initHeatKnobs = initAll;
  window.__heatKnobUtils = { valueToDeg, degToValue, MIN_DEG, MAX_DEG };
})();
