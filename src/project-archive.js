const form = document.querySelector('.project-filters');
if (form) {
  const cards = [...document.querySelectorAll('.project-record')];
  const status = document.querySelector('.project-results');
  const more = document.querySelector('.project-more');
  const empty = document.querySelector('.project-empty');
  const query = form.elements.q;
  const cohort = form.elements.cohort;
  const params = new URLSearchParams(location.search);
  query.value = params.get('q') || '';
  if (cohort) cohort.value = params.get('cohort') || '';
  let limit = 18;
  form.hidden = status.hidden = false;
  function update(save = true) {
    const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matching = cards.filter(card => (!cohort?.value || card.dataset.cohort === cohort.value) && words.every(word => card.dataset.search.includes(word)));
    cards.forEach(card => { card.hidden = true; });
    matching.slice(0, limit).forEach(card => { card.hidden = false; });
    status.textContent = `${matching.length} ${matching.length === 1 ? 'project' : 'projects'}${matching.length > limit ? ` · Showing ${limit}` : ''}`;
    empty.hidden = matching.length > 0;
    more.hidden = matching.length <= limit;
    if (save) {
      const url = new URL(location.href);
      for (const [key, value] of [['q', query.value.trim()], ['cohort', cohort?.value]]) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
      history.replaceState(null, '', url);
    }
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', () => { limit = 18; update(); });
  form.addEventListener('reset', () => { requestAnimationFrame(() => { limit = 18; update(); query.focus(); }); });
  more.addEventListener('click', () => {
    const firstHidden = cards.filter(c => c.hidden).find(c => (!cohort?.value || c.dataset.cohort === cohort.value) && query.value.trim().toLowerCase().split(/\s+/).every(w => c.dataset.search.includes(w)));
    limit += 18; update();
    if (firstHidden) { firstHidden.tabIndex = -1; firstHidden.focus({ preventScroll: true }); }
  });
  function revealHash() {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target?.classList.contains('project-record')) {
      query.value = ''; if (cohort) cohort.value = ''; limit = cards.length; update(false);
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
  }
  update(false); revealHash();
  window.addEventListener('hashchange', revealHash);
}
document.querySelectorAll('.project-mark img').forEach(img => {
  const fallback = () => { img.hidden = true; img.parentElement.classList.add('missing-mark'); };
  img.addEventListener('error', fallback);
  if (img.complete && !img.naturalWidth) fallback();
});
