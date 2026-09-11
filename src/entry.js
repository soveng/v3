// Vite places module scripts before the extracted stylesheet in production.
// Wait for styles before measuring the pinned scenes, including on a cold cache.
async function start() {
  await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(link => {
    if (link.sheet) return Promise.resolve();
    return new Promise((resolve, reject) => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', () => reject(new Error(`Could not load stylesheet: ${link.href}`)), { once: true });
    });
  }));
  await import('./main.js');
}
start().catch(error => console.error('Could not start page animations:', error));
