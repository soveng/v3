const mappings=JSON.parse(document.getElementById('legacy-fragment-map')?.textContent || '{}');
let interacted=false;
for(const event of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(event,()=>{interacted=true;},{once:true,passive:true});
export function settleDeepLink() {
  if(interacted)return;
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  if(!id)return;
  const destination=mappings[id];
  if(destination?.startsWith('/')) { location.replace(destination); return; }
  let element=document.getElementById(destination||id);
  if(!element)return;
  if(element.classList.contains('legacy-anchor'))element=element.closest('.reading-section, .faq-section, .project-record, details')||element;
  if(element instanceof HTMLDetailsElement)element.open=true;
  element.scrollIntoView({behavior:'instant',block:'start'});
}
settleDeepLink();
window.addEventListener('hashchange',()=>{interacted=false;settleDeepLink();});
window.addEventListener('load',settleDeepLink,{once:true});
document.fonts.ready.then(()=>requestAnimationFrame(()=>requestAnimationFrame(settleDeepLink)));
