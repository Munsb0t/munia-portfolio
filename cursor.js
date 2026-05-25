/* =========================================================
   Shared custom cursor controller — identical behaviour to
   the homepage. Self-creates its element, so a page only needs
   to link cursor.css and load this script.
========================================================= */
(function () {
  const ok = matchMedia('(hover: hover) and (pointer: fine)').matches
          && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) return;

  let cursor = document.getElementById('cy-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'cy-cursor';
    cursor.id = 'cy-cursor';
    cursor.innerHTML = '<span class="cy-cursor__blob"></span>';
    document.body.appendChild(cursor);
  }
  const disc = cursor.querySelector('.cy-cursor__blob');

  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, visible = false;

  const show = () => cursor.classList.remove('is-hidden');
  const hide = () => cursor.classList.add('is-hidden');

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!visible) { cx = mx; cy = my; visible = true; }
    show();
  }, { passive: true });

  // Broad set of "we're back" signals so the cursor can NEVER get stuck hidden
  // (it used to stay invisible until reload after alt-tab / clicking a live iframe /
  // an OS notification stole focus, because only mousemove could bring it back).
  addEventListener('pointermove', show, { passive: true });
  document.addEventListener('pointerover', show);
  document.addEventListener('mouseenter', show);
  addEventListener('focus', show);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') show(); });

  // hide only when the pointer truly leaves the window or it loses focus
  document.addEventListener('mouseleave', hide);
  addEventListener('blur', hide);

  let str = 0, ang = 0, lastT = performance.now();
  const lerp = (a, b, t) => a + (b - a) * t;

  (function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.max(8, now - lastT);
    lastT = now;
    const vx = mx - cx, vy = my - cy;
    cx += vx * 0.28; cy += vy * 0.28;
    const hovering = cursor.classList.contains('is-hover');
    const speed = Math.hypot(vx, vy) / dt * 16;
    const targetStr = hovering ? 0 : Math.min(speed / 22, 1);
    if (speed > 0.4) ang = Math.atan2(vy, vx);
    str = lerp(str, targetStr, 0.25);
    const stretch = 1 + str * 0.8, squash = 1 - str * 0.45;
    disc.style.transform =
      `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(${ang}rad) scale(${stretch.toFixed(3)}, ${squash.toFixed(3)})`;
  })();

  /* superset of interactive targets across all pages → bloom state */
  const HOVER = 'a, button, [role="button"], input, textarea, [contenteditable], ' +
                '.magnetic, .oval-btn, .cta, .boundary-pill, .retro-pill, .fsoc, ' +
                '.w3-row, .now-card, .menu, .close-btn, .skill-tag, .dm-card, ' +
                '.ct-chip, .ct-copy, .ab-chip, .gb-tile, .gb-die';

  document.addEventListener('mouseover', (e) => { if (e.target.closest?.(HOVER)) cursor.classList.add('is-hover'); });
  document.addEventListener('mouseout',  (e) => { if (e.target.closest?.(HOVER)) cursor.classList.remove('is-hover'); });
  addEventListener('mousedown', () => { cursor.classList.add('is-down'); show(); });
  addEventListener('mouseup',   () => cursor.classList.remove('is-down'));
})();
