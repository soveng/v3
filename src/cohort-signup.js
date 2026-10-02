for (const form of document.querySelectorAll('[data-cohort-signup]')) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    if (button.disabled) return;
    const feedback = form.querySelector('.signup-feedback');
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    feedback.textContent = 'Signing you up…';
    try {
      const response = await fetch(form.action, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      feedback.textContent = result.message || 'Signup is temporarily unavailable. Please try again later.';
      if (response.ok) form.reset();
    } catch { feedback.textContent = 'We couldn’t send your request. Please try again.'; }
    finally { button.disabled = false; form.removeAttribute('aria-busy'); }
  });
}
