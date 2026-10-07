import {readFileSync} from 'node:fs';
const aliases=JSON.parse(readFileSync('content/legacy-fragments.json','utf8'));
const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function preserveLegacyFragments(html,path) {
  const mappings={...aliases['*'],...aliases[path]};
  const active={};
  for(const [id,target] of Object.entries(mappings)) {
    if(html.includes(`id="${id}"`))continue;
    const marker=target.startsWith('/')?'footer':target;
    // IDs point to their actual section even without JavaScript.
    const pattern=new RegExp(`<([a-z][\\w-]*)\\b[^>]*\\bid="${marker}"[^>]*>`);
    const match=html.match(pattern);
    if(!match)throw Error(`Missing legacy fragment target ${path}#${id} -> ${target}`);
    html=html.replace(match[0],`${match[0]}<span id="${escape(id)}" class="legacy-anchor" aria-hidden="true"></span>`);
    active[id]=target;
  }
  const config=JSON.stringify(active).replaceAll('<','\\u003c');
  return html.replace('</body>',`<script type="application/json" id="legacy-fragment-map">${config}</script><script type="module" src="/src/legacy-links.js"></script></body>`);
}
