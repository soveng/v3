const track = document.querySelector('.testimonial-track');
if (track) {
  const slides = [...track.children];
  const controls = document.querySelector('.testimonial-controls');
  const position = controls.querySelector('.testimonial-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const update = () => { position.textContent = `${current() + 1} / ${slides.length}`; };
  const go = index => {
    const next = (index + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  controls.hidden = false;
  controls.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => go(current() + Number(button.dataset.direction)));
  });
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: current() - 1, ArrowRight: current() + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
  let timer;
  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  }, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
}
