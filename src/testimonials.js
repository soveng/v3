const track = document.querySelector('.testimonial-track');
if (track) {
  const slides = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = index => {
    const next = (index + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: current() - 1, ArrowRight: current() + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
}
