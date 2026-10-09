import { animatePodcast } from './podcast-animation.js';

animatePodcast(
  window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  document.querySelector('.podcast-bell-interlude'),
  true,
);
