import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {parseDocument,DomUtils} from 'htmlparser2';
const run=promisify(execFile);
const base=new URL(process.argv[2]||'https://v3-nine-eta-60.vercel.app');
const contract=JSON.parse(readFileSync('content/legacy-links.json','utf8'));
const links=new Set(contract.urls);
// Check both spellings: Vercel normalizes slashes before custom redirects.
for(const link of [...links]) {
 const url=new URL(link,base);
 if(url.pathname!=='/'&&!url.pathname.split('/').filter(Boolean).at(-1).includes('.')) {
  url.pathname=url.pathname.endsWith('/')?url.pathname.slice(0,-1):url.pathname+'/';
  links.add(url.pathname+url.search+url.hash);
 }
}
const paths=[...new Set([...links].map(link=>{const u=new URL(link,base);return u.pathname+u.search;}))];
const results=new Map();let cursor=0;let completed=0;
await Promise.all(Array.from({length:6},async()=>{
 while(cursor<paths.length){
  const path=paths[cursor++];
  try{
   const {stdout}=await run('curl',['-sSL','--retry','1','--max-time','25','--max-redirs','6','-w','\n%{json}',new URL(path,base).href],{encoding:'utf8',maxBuffer:15*1024*1024});
   const split=stdout.lastIndexOf('\n');const meta=JSON.parse(stdout.slice(split+1));
   const body=meta.content_type?.includes('text/html')?stdout.slice(0,split):'';
   const doc=body?parseDocument(body):null;
   const ids=new Set(doc?DomUtils.findAll(el=>!!el.attribs?.id,doc.children).map(el=>el.attribs.id):[]);
   results.set(path,{status:meta.http_code,final:meta.url_effective,type:meta.content_type,ids});
  }catch(error){results.set(path,{error:error.message});}
  completed++;if(completed%100===0)console.log(`Checked ${completed}/${paths.length} live paths`);
 }
}));
const failures=[];
for(const link of links){
 const u=new URL(link,base);const result=results.get(u.pathname+u.search);
 if(result.status!==200){failures.push(`${link}: ${result.status||result.error}`);continue;}
 if(/\.(png|jpe?g|webp|svg|gif|avif|ico)$/i.test(u.pathname)&&!result.type?.startsWith('image/'))failures.push(`${link}: incorrect image type ${result.type}`);
 // curl reports any explicit fragment set by redirects; otherwise browsers inherit the original.
 const fragment=new URL(result.final).hash||u.hash;
 if(fragment&&!result.ids.has(decodeURIComponent(fragment.slice(1))))failures.push(`${link}: missing fragment ${fragment} at ${result.final}`);
}
assert.equal(failures.length,0,failures.join('\n'));
console.log(`Verified ${links.size} live paths and fragments (${paths.length} HTTP requests), including trailing-slash variants.`);
