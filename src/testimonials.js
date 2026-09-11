const track = document.querySelector('.testimonial-track');
if (track) {
  const slides = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = index => {
    const next = (index + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  const progress = document.querySelector('.testimonial-progress');
  const thumb = progress.querySelector('.testimonial-thumb');
  const fill = thumb.querySelector('span');
  progress.hidden = false;
  track.classList.add('has-page-indicator');
  thumb.style.width = `${100 / slides.length}%`;
  const updateIndicator = () => {
    thumb.style.left = `${track.scrollLeft / track.scrollWidth * 100}%`;
  };
  new ResizeObserver(updateIndicator).observe(track);
  updateIndicator();
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
      const words = slides[current()].querySelector('blockquote').textContent.trim().split(/\s+/).length;
      // The fill itself is the clock, so the next slide and indicator cannot drift.
      countdown = fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
        duration: Math.max(8000, words * 250 + 2000), fill: 'forwards', easing: 'linear'
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
    updateIndicator();
    scrolling = true;
    countdown?.cancel();
    countdown = null;
    clearTimeout(settling);
    settling = setTimeout(() => { scrolling = false; schedule(); }, 180);
  }, { passive: true });
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
