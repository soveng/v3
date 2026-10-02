const reduced = matchMedia('(prefers-reduced-motion: reduce)');
for (const gallery of document.querySelectorAll('[data-swag-gallery]')) {
  const main = gallery.querySelector('.swag-main-image');
  const views = [...gallery.querySelectorAll('.swag-views a')];
  let sequence = 0;
  for (const view of views) view.addEventListener('click', async event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const current = ++sequence;
    const image = new Image();
    image.src = view.href;
    try { await image.decode(); } catch { return; }
    if (current !== sequence) return;
    main.getAnimations().forEach(animation => animation.cancel());
    main.src = image.src;
    main.alt = view.dataset.imageLabel;
    views.forEach(link => link === view ? link.setAttribute('aria-current','true') : link.removeAttribute('aria-current'));
    if (!reduced.matches) main.animate([{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}], {duration:280,easing:'ease-out'});
  });
}
