const track = document.querySelector('.testimonial-track');
if (track) {
  const slides = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = index => {
    const next = (index + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  let timer;
  let visible = false;
  let hovered = false;
  let touching = false;
  const schedule = () => {
    clearTimeout(timer);
    if (!visible || hovered || touching || document.hidden || reduced.matches || track.contains(document.activeElement)) return;
    const words = slides[current()].querySelector('blockquote').textContent.trim().split(/\s+/).length;
    // Give longer quotes more reading time, and restart after every swipe.
    timer = setTimeout(() => {
      go(current() + 1);
      schedule();
    }, Math.max(8000, words * 250 + 2000));
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0 }).observe(track);
  track.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovered = true; schedule(); }
  });
  track.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  track.addEventListener('pointerdown', () => { touching = true; schedule(); });
  window.addEventListener('pointerup', () => { touching = false; schedule(); });
  window.addEventListener('pointercancel', () => { touching = false; schedule(); });
  track.addEventListener('focusin', schedule);
  track.addEventListener('focusout', () => setTimeout(schedule, 0));
  track.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: current() - 1, ArrowRight: current() + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
}
