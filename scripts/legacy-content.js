import { imageSize } from 'image-size';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { nip19, verifyEvent } from 'nostr-tools';
import { parse } from 'yaml';

export const json = name => JSON.parse(readFileSync(`content/${name}.json`, 'utf8'));
export const frontmatter = name => parse(readFileSync(`content/${name}.md`, 'utf8').split('---')[1]);
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug = text => text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
export const safeImage = value => /^(https?:\/\/|\/(?!\/))/.test(value || '') ? value : '';
const replacements = {
  'https://sovereignengineering.io/assets/images/sec01-landing.jpg':'/assets/images/sec01-landing.jpg',
  'https://sovereignengineering.io/assets/images/banner.jpg':'/images/banner.png',
  'https://sovereignengineering.io/assets/images/bell-labs.jpg':'/images/blog/bell-labs.jpeg',
  'https://sovereignengineering.io/assets/images/school-of-athens.jpg':'/images/blog/school-of-athens.jpeg',
  'https://sovereignengineering.io/assets/images/sec-loop.jpg':'/images/blog/show-talk-build-loop.jpeg',
};
let headingCounts = new Map();
const markdown = new Marked({gfm:true, renderer: {
  heading({tokens,depth,text}) {
    const key=slug(text), count=headingCounts.get(key)||0;headingCounts.set(key,count+1);
    return `<h${depth} id="${key}${count?'-'+count:''}">${this.parser.parseInline(tokens)}</h${depth}>`;
  }
}});
markdown.use({extensions:[{
  name:'nostrReference',level:'inline',start:source=>source.indexOf('nostr:'),
  tokenizer(source) {const match=/^nostr:((?:naddr1|nevent1|nprofile1|npub1|note1)[023456789acdefghjklmnpqrstuvwxyz]+)/i.exec(source);if(match)return {type:'nostrReference',raw:match[0],entity:match[1]};},
  renderer(token) {try{const decoded=nip19.decode(token.entity);const key=decoded.type==='nprofile'?decoded.data.pubkey:decoded.type==='npub'?decoded.data:null;const entity=key?nip19.npubEncode(key):token.entity;return `<a href="https://njump.me/${entity}">${entity.slice(0,12)}…</a>`;}catch{return escape(token.raw);}}
}]});
export function richMarkdown(content = '', base = null) {
  for (const [old, replacement] of Object.entries(replacements)) content = content.replaceAll(old, replacement);
  headingCounts = new Map();
  return sanitizeHtml(markdown.parse(content), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: { div:['id'],section:['id'],a:['href','title','target','rel'],img:['src','alt','title','loading','decoding','width','height'],code:['class'],h1:['id'],h2:['id'],h3:['id'],h4:['id'],h5:['id'],h6:['id'] },
    allowedSchemes:['https','http','mailto'],
    transformTags: { a: (tag,attrs) => {
      let href=attrs.href?.replace(/^nostr:/i,'https://njump.me/');
      if(base && href?.startsWith('/') && !href.startsWith('//'))href=new URL(href,base).href;
      return {tagName:tag,attribs:{...attrs,href}};
    }, img: (tag, attrs) => {
      let dimensions={};
      if(attrs.src?.startsWith('/')&&!attrs.src.startsWith('//')) {
        const {width,height}=imageSize(readFileSync(`public${attrs.src}`));dimensions={width,height};
      }
      return {tagName:tag,attribs:{...attrs,...dimensions,loading:'lazy',decoding:'async'}};
    } },
  });
}
export function blogArticles() {
  const author='83d999a148625c3d2bb819af3064c0f6a12d7da88f68b2c69221f3a746171d19';
  const covers=json('blog-covers');
  const latest=new Map();
  const tag=(event,name)=>event.tags.find(t=>t[0]===name)?.[1];
  for(const event of json('blog-events')) {
    if(event.kind!==30023 || event.pubkey!==author || !verifyEvent(event) || !tag(event,'d')) throw new Error('Invalid signed blog snapshot');
    const identifier=tag(event,'d'); const old=latest.get(identifier);
    if(!old || event.created_at>old.created_at || (event.created_at===old.created_at && event.id>old.id)) latest.set(identifier,event);
  }
  return [...latest.entries()].map(([identifier,event])=>{
    const path=/^[a-z0-9][a-z0-9_-]*$/.test(identifier)?identifier:`article-${createHash('sha256').update(identifier).digest('hex').slice(0,16)}`;
    const published=Number(tag(event,'published_at'));
    const image=replacements[tag(event,'image')] || safeImage(tag(event,'image'));
    const naddr=nip19.naddrEncode({identifier,pubkey:author,kind:30023,relays:['wss://nos.lol','wss://relay.damus.io']});
    return {identifier,slug:path,title:tag(event,'title')||identifier,summary:tag(event,'summary')||'',image:covers[image]?`${covers[image]}-960.webp`:image,
      publishedAt:Number.isSafeInteger(published)&&published>0&&published<=event.created_at?published:event.created_at,updatedAt:event.created_at,
      html:richMarkdown(event.content, tag(event,'r')?.startsWith('https://dergigi.com/') ? tag(event,'r') : null),url:`https://njump.me/${naddr}`,id:event.id};
  }).sort((a,b)=>b.publishedAt-a.publishedAt||b.updatedAt-a.updatedAt);
}
