import { createPlantAnimation } from './plant-animation';

const art = document.querySelector('.project-plant-art');
if (art) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = art.querySelector('canvas');
  async function start() {
    await Promise.all([
      document.fonts.ready,
      ...[...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.sheet ? Promise.resolve() : new Promise(resolve => {
        link.addEventListener('load', resolve, {once:true});
        link.addEventListener('error', resolve, {once:true});
      })),
    ]);
    const renderer = createPlantAnimation(canvas, art.dataset.plantSpecies, Number(art.dataset.plantSeed), reduced.matches, {standalone:true, theme:'dark'});
    art.classList.add('is-ready');
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let visible = false;
    const duration = art.dataset.plantSpecies === 'mycelium' ? 10000 : 8500;
    function tick(time) {
      frame = 0;
      if (!visible || document.hidden || reduced.matches) { previous = 0; return; }
      if (previous) elapsed += Math.min(time - previous, 80);
      previous = time;
      renderer.state.progress = Math.min(1, elapsed / duration);
      renderer.draw();
      if (elapsed < duration) frame = requestAnimationFrame(tick);
    }
    function resume() {
      if (!frame && visible && !document.hidden && !reduced.matches && elapsed < duration) frame = requestAnimationFrame(tick);
    }
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
      else resume();
    }).observe(art);
    document.addEventListener('visibilitychange', () => { previous = 0; resume(); });
    reduced.addEventListener('change', () => {
      renderer.state.reducedMotion = reduced.matches;
      if (reduced.matches) {
        cancelAnimationFrame(frame); frame = 0; elapsed = duration;
        renderer.state.progress = 1; renderer.draw();
      } else resume();
    });
  }
  start().catch(error => console.error('Could not start project plant:', error));
}
