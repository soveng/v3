import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

function pages(directory) {
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry => {
    const path = join(directory,entry.name);
    return entry.isDirectory() ? pages(path) : path.endsWith('.html') ? [path] : [];
  });
}
const files = pages('dist');
assert.ok(files.includes('dist/index.html') && files.includes('dist/mountain/index.html'));
const images = new Set();
for (const file of files) {
  const html = readFileSync(file,'utf8');
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head,`${file}: missing head`);
  const metas = [...head.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"[^>]*>/g)];
  const get = name => {
    const matches = metas.filter(m=>m[1]===name);
    assert.equal(matches.length,1,`${file}: expected one ${name}`);
    assert.ok(matches[0][2] && !/undefined|\[object Object\]/.test(matches[0][2]),`${file}: invalid ${name}`);
    return matches[0][2];
  };
  assert.equal(get('og:title'),get('twitter:title'));
  assert.equal(get('og:description'),get('twitter:description'));
  assert.equal(get('og:image'),get('twitter:image'));
  assert.equal(get('og:image:alt'),get('twitter:image:alt'));
  assert.equal(get('og:site_name'),'Sovereign Engineering');
  assert.equal(get('og:type'),'website');
  assert.equal(get('twitter:card'),'summary_large_image');
  assert.equal(get('og:image:type'),'image/png');
  assert.equal(get('og:image:width'),'1200');
  assert.equal(get('og:image:height'),'630');
  const canonical = [...head.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(canonical.length,1);
  assert.equal(get('og:url'),canonical[0][1]);
  const image = new URL(get('og:image'));
  const page = new URL(get('og:url'));
  assert.equal(page.protocol,'https:');
  assert.equal(image.origin,page.origin);
  assert.equal(page.pathname,file.slice(4).replace(/index\.html$/,''));
  assert.ok(image.pathname.startsWith('/social/'));
  const png = readFileSync(`dist${image.pathname}`);
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),1200);
  assert.equal(png.readUInt32BE(20),630);
  assert.ok(png.length<5_000_000,`${file}: oversized preview`);
  assert.ok(image.pathname.endsWith(`${createHash('sha256').update(png).digest('hex').slice(0,12)}.png`));
  images.add(image.pathname);
}
assert.equal(images.size,files.length,'Each page should have its own preview');
console.log(`Verified social metadata and unique 1200×630 PNGs for all ${files.length} pages.`);
