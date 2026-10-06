const section = document.querySelector('[data-blog-activity]');
if (section) {
  let disposed = false;
  const cleanups = [];
  const observer = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    try {
      const {mountBlogActivity} = await import('./activity');
      if (!disposed) cleanups.push(mountBlogActivity(section));
    } catch {
      section.querySelectorAll('[role="status"]').forEach(el => { el.textContent = 'Nostr activity is unavailable right now.'; });
    }
  },{rootMargin:'400px'});
  observer.observe(section);
  import('./profiles').then(({mountBlogProfiles}) => {
    if (!disposed) cleanups.push(mountBlogProfiles(document.querySelector('.article-body'),section.dataset.profileRelays.split(' ')));
  }).catch(() => {});
  window.addEventListener('pagehide', () => { disposed=true; observer.disconnect(); cleanups.forEach(stop=>stop()); }, {once:true});
}
