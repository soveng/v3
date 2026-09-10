// Keep links to individual FAQ answers useful, including on direct arrival.
function openAnswer() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const answer = document.getElementById(id);
  if (answer instanceof HTMLDetailsElement) {
    answer.open = true;
    answer.scrollIntoView();
  }
}
openAnswer();
window.addEventListener("hashchange", openAnswer);
