export function renderFooter() {
  return `<footer class="site-footer">
    <div class="footer-sea" aria-hidden="true">
      <svg class="footer-ship" viewBox="0 0 100 110" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <g class="footer-ship-rock">
          <path d="M16 88 L84 88 L75 102 Q47 109 27 101 Z" fill="#080808"/>
          <path d="M25 94 H77 M35 100 H66 M51 88 V15 M23 88 L51 25 L83 88 M15 88 L7 82 M82 88 L94 79"/>
          <path d="M51 17 Q64 10 77 17 L71 23 Q61 19 51 25" fill="#ed3238" stroke="#ed3238"/>
          <path d="M33 33 Q51 37 71 32 Q65 51 71 69 Q49 75 31 68 Q39 51 33 33 Z" fill="#080808"/>
          <path d="M29 32 H75 M27 70 H76"/>
          <path d="M51 42 C42 42 42 54 47 55 V59 H55 V55 C61 51 60 42 51 42 Z" fill="currentColor" stroke="none"/>
          <g fill="#080808" stroke="none"><circle cx="48" cy="49" r="1.7"/><circle cx="54" cy="49" r="1.7"/><path d="M51 52 L49.5 54 H52.5 Z"/></g>
          <path d="M43 62 L59 68 M43 68 L59 62"/>
          <path d="M56 77 L78 75 L69 86 H56 Z" fill="#080808"/>
        </g>
      </svg>
      <svg class="footer-water" width="100%" height="16" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="footer-waves" width="120" height="16" patternUnits="userSpaceOnUse"><path d="M0 8 Q15 2 30 8 T60 8 T90 8 T120 8" fill="none" stroke="currentColor" stroke-width="1"/></pattern></defs>
        <rect width="100%" height="16" fill="url(#footer-waves)"/>
      </svg>
    </div>
    <a class="footer-identity" href="/">Sovereign Engineering<span>Madeira, Portugal</span></a>
    <nav class="footer-sitemap" aria-label="Footer navigation">
      <div><h2>Program</h2><a href="/#program">The program</a><a href="/#work">What was built</a><a href="/#voices">Testimonials</a><a href="/#apply">Next cohort</a></div>
      <div><h2>Explore</h2><a href="/projects/">Project archive</a><a href="/podcast/">Dialogues</a><a href="/faq/">FAQ</a><a href="/policy/">Policies</a></div>
      <div><h2>Connect</h2><a href="mailto:info@sovereignengineering.io">Get in touch ↗</a><a href="/dialogues.xml">Dialogues RSS ↗</a><a href="https://github.com/soveng">GitHub ↗</a></div>
    </nav>
  </footer>`;
}
