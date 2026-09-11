const sea = document.querySelector('.footer-sea');
if (sea) {
  const ship = sea.querySelector('.footer-ship');
  const water = sea.querySelector('.footer-water');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  function draw() {
    frame = 0;
    if (reduced.matches) {
      ship.style.removeProperty('transform');
      ship.style.removeProperty('opacity');
      water.style.removeProperty('clip-path');
      return;
    }
    const top = sea.getBoundingClientRect().top + scrollY;
    const start = top - innerHeight * .95;
    // The footer must finish its entrance even on pages with little room to scroll.
    const end = Math.min(top - innerHeight * .55, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
    const eased = progress * progress * (3 - 2 * progress);
    const distance = Math.min(sea.clientWidth * .32, 280);
    ship.style.transform = `translateX(calc(-50% - ${distance * (1 - eased)}px))`;
    ship.style.opacity = String(eased);
    water.style.clipPath = `inset(0 ${(1 - eased) * 50}% 0 ${(1 - eased) * 50}%)`;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(document.body);
  new IntersectionObserver(([entry]) => {
    sea.style.setProperty('--ship-motion', entry.isIntersecting ? 'running' : 'paused');
  }).observe(sea);
  schedule();
}
