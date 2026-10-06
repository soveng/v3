import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {parseDocument,DomUtils as D} from 'htmlparser2';
import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {blogArticles,json} from './legacy-content.js';
const pages=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[]);
const docs=new Map(pages('dist').map(file=>[file,parseDocument(readFileSync(file,'utf8'))]));
const problems=[];
const redirects=json('legacy-redirects');
const localHosts=['sovereignengineering.io','www.sovereignengineering.io','v3-nine-eta-60.vercel.app'];
function resolve(url,base) {
  let target;try{target=new URL(url,base);}catch{return null;}
  if(!localHosts.includes(target.hostname))return null;
  let path=decodeURIComponent(target.pathname);
  if(redirects[path.replace(/\/$/,'')]) return resolve(redirects[path.replace(/\/$/,'')]+(target.hash&&!redirects[path.replace(/\/$/,'')].includes('#')?target.hash:''),'https://sovereignengineering.io/');
  let file='dist'+path;
  if(existsSync(file)&&statSync(file).isDirectory())file=file.replace(/\/$/,'')+'/index.html';
  if(!existsSync(file)&&!path.split('/').pop().includes('.'))file=file.replace(/\/$/,'')+'/index.html';
  return {file,hash:decodeURIComponent(target.hash.slice(1))};
}
for(const [file,doc] of docs) {
  const base='https://sovereignengineering.io/'+file.slice(5).replace(/index.html$/,'');
  for(const el of D.findAll(el=>el.type==='tag',doc.children)) {
    for(const attr of ['href','src','poster']) {
      const value=el.attribs?.[attr];if(!value||/^(mailto:|tel:|data:|nostr:)/.test(value)||value==='#')continue;
      const target=resolve(value,base);if(!target)continue;
      if(target.file.startsWith('dist/api/'))continue;
      if(!existsSync(target.file)){problems.push(`${file}: missing ${value}`);continue;}
      if(attr==='href'&&target.hash&&docs.has(target.file)&&!D.findOne(el=>el.attribs?.id===target.hash,docs.get(target.file).children))problems.push(`${file}: missing anchor ${value}`);
    }
  }
}
for(const path of json('legacy-urls')) {
 const target=resolve(path,'https://sovereignengineering.io/');
 if(!target||!existsSync(target.file))problems.push(`Legacy URL missing: ${path}`);
}
const rss=readFileSync('dist/dialogues.xml','utf8');
for(const [,url] of rss.matchAll(/<podcast:chapters url="([^"]+)"/g)) {
 const {file}=resolve(url,'https://sovereignengineering.io/');
 assert.ok(existsSync(file),url);assert.ok(JSON.parse(readFileSync(file)).chapters.length>0);
}
for(const file of ['dist/blog/rss.xml','dist/sitemap.xml','dist/sitemap-index.xml'])assert.equal(XMLValidator.validate(readFileSync(file,'utf8')),true,file);
const sitemap=new XMLParser().parse(readFileSync('dist/sitemap.xml','utf8')).urlset.url;
assert.equal(sitemap.length,docs.size-1);assert.ok(!sitemap.some(u=>u.loc.includes('404.html')));
assert.equal(blogArticles().length,15);
assert.match(readFileSync('dist/404.html','utf8'),/name="robots" content="noindex"/);
assert.equal(problems.length,0,[...new Set(problems)].join('\n'));
console.log(`Verified ${docs.size} pages, ${json('legacy-urls').length} legacy URLs, internal links/anchors, chapter files, RSS, and sitemap.`);
