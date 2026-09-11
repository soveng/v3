const journey = document.querySelector('.mountain-journey');
if (journey) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = journey.querySelector('.mountain-scene');
  const chapters = [...journey.querySelectorAll('.mountain-chapter')];
  const world = scene.querySelector('.mountain-world');
  const trail = scene.querySelector('.mountain-trail');
  const route = scene.querySelector('#mountain-route');
  const routeLength = route.getTotalLength();
  const crew = [...scene.querySelectorAll('.mountain-crew circle')];
  const stars = scene.querySelector('.mountain-stars');
  const night = scene.querySelector('.mountain-night');
  const ideas = scene.querySelector('.mountain-ideas');
  const demo = scene.querySelector('.mountain-demo');
  const build = scene.querySelector('.mountain-build');
  const sun = scene.querySelector('.mountain-sun-core');
  const glow = scene.querySelector('.mountain-sun');
  const mist = scene.querySelector('.mountain-mist');
  const caption = journey.querySelector('.mountain-caption');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const campStop = scene.querySelector('#mountain-ascent').getTotalLength() / routeLength;
  const summitStop = scene.querySelector('#mountain-summit-route').getTotalLength() / routeLength;
  let frame = 0;
  let visible = true;

  function draw() {
    frame = 0;
    if (!visible && !reduced.matches) return;
    const rect = journey.getBoundingClientRect();
    const unit = chapters[0].offsetHeight;
    const raw = Math.max(0, Math.min(chapters.length - 1, -rect.top / unit));
    // A chapter is most visible around its own scroll position. Complete each
    // journey leg while that day's copy is visible, rather than the day before.
    const index = Math.min(chapters.length - 1, Math.floor(raw + .5));
    const leg = day => smooth((raw - (day - .3)) / .5);
    const progress = reduced.matches ? 0 : campStop * leg(2)
      + (summitStop - campStop) * leg(4) + (1 - summitStop) * leg(5);
    const camp = reduced.matches ? 0 : smooth((raw - 2.2) / .3) * (1 - smooth((raw - 4.5) / .2));
    const presentation = reduced.matches ? 0 : smooth((raw - 6) / .2) * (1 - smooth((raw - 6.5) / .3));
    const building = reduced.matches ? 0 : smooth((raw - 5.2) / .2) * (1 - smooth((raw - 6) / .2));
    const zoom = reduced.matches ? 1 : 1 + camp * .13;
    world.setAttribute('transform', `translate(${660 * (1 - zoom)} ${440 * (1 - zoom)}) scale(${zoom})`);
    trail.style.strokeDashoffset = String(reduced.matches ? 0 : (1 - progress) * 100);
    crew.forEach((dot, i) => {
      const point = route.getPointAtLength(Math.max(0, progress - i * .012) * routeLength);
      dot.setAttribute('cx', point.x - (progress < .02 ? i * 8 : 0));
      dot.setAttribute('cy', point.y - 5 - (progress < .02 ? i % 2 * 7 : 0));
      dot.style.opacity = String(1 - (reduced.matches ? 0 : smooth((raw - 6.5) / .5) * .65));
    });
    // Each day starts in daylight, passes through night, and rises into the next.
    const darkness = reduced.matches ? 0 : (1 - Math.cos(Math.max(0, raw - 1) * Math.PI * 2)) / 2;
    stars.style.opacity = String(darkness * .85);
    night.style.opacity = String(darkness * .78);
    ideas.style.opacity = String(camp);
    ideas.setAttribute('transform', `translate(0 ${10 * (1 - camp)})`);
    demo.style.opacity = String(presentation);
    build.style.opacity = String(building);
    const sunY = 200 + darkness * 520;
    sun.setAttribute('cy', sunY);
    glow.setAttribute('cy', sunY);
    sun.style.opacity = String(.65 * (1 - smooth(darkness)));
    mist.setAttribute('transform', `translate(${reduced.matches ? 0 : raw * 8} 0)`);
    caption.textContent = reduced.matches ? 'Valley → Mountain → Valley'
      : index === 5 && raw >= 5.2 ? 'Day 05 / The 24-hour build begins'
      : index === 6 ? (raw < 6 ? 'Day 06 / Finish building' : 'Day 06 / Demo Day')
      : chapters[index].querySelector('.mountain-day').textContent;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function configure() {
    journey.classList.toggle('mountain-enhanced', !reduced.matches);
    schedule();
  }
  // As on the homepage, measure only once the stylesheet is ready.
  async function start() {
    await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.sheet ? Promise.resolve() : new Promise(resolve => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
    })));
    configure();
    const target = chapters.find(chapter => `#${chapter.id}` === location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', configure);
    new ResizeObserver(schedule).observe(journey);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }).observe(journey);
  }
  start();
}
