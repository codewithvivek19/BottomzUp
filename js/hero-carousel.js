/**
 * FreshBox hero — food conveyor only
 * designlang + Framer DOM study of https://freshbox.framer.website
 *
 * Text is STATIC (no copy carousel).
 * Food images reposition with appear animation and autoplay.
 * Adaptive slots are pure CSS; this only cycles classes + a11y.
 */
(function () {
  'use strict';

  const hero = document.getElementById('hero');
  const stage = document.getElementById('fbxFoodStage');
  if (!hero || !stage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 4200;

  const foods = Array.from(stage.querySelectorAll('.fbx-food'));
  const dotsWrap = document.getElementById('fbxFoodDots');
  const progress = document.querySelector('#fbxFoodProgress span');
  const n = foods.length;
  if (!n) return;

  let index = 0;
  let timer = null;
  let paused = false;

  function clearSlots(el) {
    el.classList.remove(
      'is-center',
      'is-right',
      'is-left',
      'is-far-right',
      'is-far-left',
      'is-hidden',
      'is-appear'
    );
  }

  function applySlots() {
    foods.forEach((el, i) => {
      clearSlots(el);
      const rel = (i - index + n) % n;
      if (rel === 0) {
        el.classList.add('is-center');
        el.setAttribute('aria-hidden', 'false');
      } else if (rel === 1) {
        el.classList.add('is-right');
        el.setAttribute('aria-hidden', 'true');
      } else if (rel === n - 1) {
        el.classList.add('is-left');
        el.setAttribute('aria-hidden', 'true');
      } else if (rel === 2) {
        el.classList.add('is-far-right');
        el.setAttribute('aria-hidden', 'true');
      } else if (rel === n - 2) {
        el.classList.add('is-far-left');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.classList.add('is-hidden');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    if (dotsWrap) {
      dotsWrap.querySelectorAll('.fbx-food-dot').forEach((d, i) => {
        const on = i === index;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', String(on));
      });
    }

    stage.setAttribute('aria-label', 'Featured dish ' + (index + 1) + ' of ' + n);
  }

  /** FreshBox appear on the food that becomes center: translateY(60px) + fade */
  function appearCenter() {
    const center = foods[index];
    if (!center || reduceMotion) return;
    center.classList.add('is-appear');
    void center.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        center.classList.remove('is-appear');
      });
    });
  }

  function goTo(i) {
    index = ((i % n) + n) % n;
    applySlots();
    appearCenter();
    restartTimer();
  }

  function restartTimer() {
    stopTimer();
    if (progress) {
      progress.classList.remove('is-run');
      void progress.offsetWidth;
      if (!paused && !reduceMotion) {
        progress.style.setProperty('--fbx-ms', INTERVAL + 'ms');
        progress.classList.add('is-run');
      }
    }
    if (!paused && !reduceMotion) {
      timer = window.setTimeout(() => goTo(index + 1), INTERVAL);
    }
  }

  function stopTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function pause() {
    paused = true;
    stopTimer();
    if (progress) progress.classList.remove('is-run');
  }

  function resume() {
    if (reduceMotion) return;
    paused = false;
    restartTimer();
  }

  // Dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    foods.forEach((food, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fbx-food-dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      const label =
        (food.querySelector('img') && food.querySelector('img').alt) || 'Dish ' + (i + 1);
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  // Click satellite food → bring to center
  foods.forEach((el, i) => {
    el.addEventListener('click', () => {
      if (i !== index) goTo(i);
    });
  });

  stage.addEventListener('mouseenter', pause);
  stage.addEventListener('mouseleave', resume);

  let tx = null;
  stage.addEventListener(
    'touchstart',
    (e) => {
      tx = e.changedTouches[0].clientX;
      pause();
    },
    { passive: true }
  );
  stage.addEventListener(
    'touchend',
    (e) => {
      if (tx == null) return;
      const dx = e.changedTouches[0].clientX - tx;
      tx = null;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
      resume();
    },
    { passive: true }
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else resume();
  });

  // Keyboard when stage focused
  stage.tabIndex = 0;
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  });

  // Text appear (static) then start food autoplay
  requestAnimationFrame(() => hero.classList.add('is-ready'));

  applySlots();
  window.setTimeout(() => {
    appearCenter();
    if (!reduceMotion) restartTimer();
  }, 450);
})();
