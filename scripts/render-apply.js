import { readFileSync } from 'node:fs';

export function renderApply(settings = JSON.parse(readFileSync('content/applications.json', 'utf8'))) {
  if (!['open', 'closed'].includes(settings.status)) throw new Error('Application status must be open or closed');
  const open = settings.status === 'open';
  if (open && !/^https:\/\//.test(settings.applicationUrl || '')) throw new Error('Open applications need an HTTPS application URL');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return `<div class="finale-main" data-applications="${settings.status}">
    <h2>Apply to join<br>the next<br><span>adventure</span></h2>
    <p class="application-invitation">Hard problems. Uncharted territory. Good company.</p>
    <p class="application-status">${open ? 'Applications are open. Join the next cohort.' : 'Applications are closed for now.<br>Details of the next cohort will appear here.'}</p>
    ${open ? `<a href="${escape(settings.applicationUrl)}" class="apply-button"><span>Apply to join the crew</span><span aria-hidden="true">↗</span></a>` : ''}
    <a href="/faq/" class="application-faq">Read the FAQ <span aria-hidden="true">↗</span></a>
  </div>`;
}
