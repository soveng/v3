const reduced = matchMedia('(prefers-reduced-motion: reduce)');
for (const gallery of document.querySelectorAll('[data-swag-gallery]')) {
  const main = gallery.querySelector('.swag-main-image');
  const frame = gallery.querySelector('.swag-image-frame');
  function clearTransition() {
    frame.querySelectorAll('.swag-image-outgoing').forEach(image => {
      image.getAnimations().forEach(animation => animation.cancel());
      image.remove();
    });
  }
  reduced.addEventListener('change', () => { if (reduced.matches) clearTransition(); });
  const views = [...gallery.querySelectorAll('.swag-views a')];
  let sequence = 0;
  for (const view of views) view.addEventListener('click', async event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const current = ++sequence;
    if (main.src === view.href) return;
    const image = new Image();
    image.src = view.href;
    try { await image.decode(); } catch { return; }
    if (current !== sequence) return;
    clearTransition();
    const previous = main.cloneNode();
    previous.removeAttribute('id');
    previous.removeAttribute('loading');
    previous.alt = '';
    previous.setAttribute('aria-hidden', 'true');
    previous.classList.add('swag-image-outgoing');
    main.src = image.src;
    main.alt = view.dataset.imageLabel;
    views.forEach(link => link === view ? link.setAttribute('aria-current','true') : link.removeAttribute('aria-current'));
    if (!reduced.matches) {
      frame.append(previous);
      const animation = previous.animate([{opacity:1},{opacity:0}], {duration:200,easing:'ease-out',fill:'forwards'});
      animation.finished.then(() => previous.remove(), () => previous.remove());
    }
  });
}
