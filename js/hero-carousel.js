/**
 * Hero food autoplay only — no dots, progress bar, or user navigation.
 */
(function () {
  'use strict';

  const hero = document.getElementById('hero');
  const stage = document.getElementById('fbxFoodStage');
  if (!hero || !stage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 2800; /* snappier autoplay */

  const foods = Array.from(stage.querySelectorAll('.fbx-food'));
  const n = foods.length;
  if (!n) return;

  let index = 0;
  let timer = null;

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
      /* No click-to-navigate */
      el.style.pointerEvents = 'none';
      el.style.cursor = 'default';
    });

    stage.setAttribute('aria-label', 'Featured dishes');
  }

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
    if (!reduceMotion) {
      timer = window.setTimeout(() => goTo(index + 1), INTERVAL);
    }
  }

  function stopTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else if (!reduceMotion) restartTimer();
  });

  /* Strip any leftover chrome from markup */
  const dots = document.getElementById('fbxFoodDots');
  const progress = document.getElementById('fbxFoodProgress');
  if (dots) dots.remove();
  if (progress) progress.remove();

  requestAnimationFrame(() => hero.classList.add('is-ready'));

  applySlots();
  window.setTimeout(() => {
    appearCenter();
    if (!reduceMotion) restartTimer();
  }, 400);
})();
