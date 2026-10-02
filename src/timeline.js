const timeline = document.querySelector('.timeline');
if (timeline) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = [...timeline.querySelectorAll('.timeline-event')];
  const years = [...timeline.querySelectorAll('.timeline-year')];
  const links = [...document.querySelectorAll('.timeline-years a')];
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;

  function draw() {
    frame = 0;
    const height = innerHeight;
    const readingLine = height * .65;
    // Read all geometry first; text transforms don't change these anchors.
    const positions = events.map(event => event.getBoundingClientRect());
    const yearPositions = years.map(year => year.getBoundingClientRect());
    let active = -1;
    positions.forEach((rect, index) => { if (rect.top + 9 <= readingLine) active = index; });
    events.forEach((event, index) => {
      const rect = positions[index];
      const reveal = clamp((height * .9 - rect.top) / (height * .28));
      event.style.setProperty('--reveal', reduced.matches ? 1 : reveal * reveal * (3 - 2 * reveal));
      event.style.setProperty('--trace', reduced.matches ? 1 : clamp((readingLine - rect.top) / rect.height));
      event.classList.toggle('is-reached', index <= active);
      event.classList.toggle('is-current', index === active);
    });
    let activeYear = -1;
    yearPositions.forEach((rect, index) => { if (rect.top <= readingLine) activeYear = index; });
    years.forEach((year, index) => year.classList.toggle('is-current-year', index === activeYear));
    links.forEach((link, index) => {
      if (index === activeYear) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    timeline.classList.toggle('timeline-animated', !reduced.matches);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(timeline);
  document.fonts.ready.then(schedule);
  schedule();
}
