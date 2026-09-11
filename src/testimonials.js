const track = document.querySelector('.testimonial-track');
if (track) {
  const slides = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const perView = () => matchMedia('(min-width: 1001px)').matches ? 3 : 1;
  const last = () => Math.max(0, slides.length - perView());
  const stride = () => slides[1].offsetLeft - slides[0].offsetLeft;
  const current = () => Math.min(last(), Math.round(track.scrollLeft / stride()));
  const go = index => {
    const next = index > last() ? 0 : index < 0 ? last() : index;
    track.scrollTo({ left: next * stride(), behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  const progress = document.querySelector('.testimonial-progress');
  const fill = progress.querySelector('.timer-fill');
  progress.hidden = false;
  track.classList.add('has-page-indicator');
  let countdown;
  let settling;
  let scrolling = false;
  let visible = false;
  let hovered = false;
  let touching = false;
  const schedule = () => {

    const paused = !visible || hovered || touching || scrolling || document.hidden || reduced.matches || track.contains(document.activeElement);
    if (paused) { countdown?.pause(); return; }
    if (!countdown) {
      const words = Math.max(...slides.slice(current(), current() + perView()).map(slide => slide.querySelector('blockquote').textContent.trim().split(/\s+/).length));
      // The fill itself is the clock, so the next slide and indicator cannot drift.
      countdown = fill.animate([{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], {
        duration: Math.max(5000, words * 160 + 1000), fill: 'forwards', easing: 'linear'
      });
      countdown.onfinish = () => go(current() + 1);
    }
    countdown.play();
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
  track.addEventListener('scroll', () => {
    scrolling = true;
    countdown?.cancel();
    countdown = null;
    clearTimeout(settling);
    settling = setTimeout(() => { scrolling = false; schedule(); }, 180);
  }, { passive: true });
  new ResizeObserver(() => {
    countdown?.cancel();
    countdown = null;
    schedule();
  }).observe(track);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: current() - 1, ArrowRight: current() + 1, Home: 0, End: last() };
    if (!(event.key in targets)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
}
