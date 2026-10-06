import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {site} from './social-preview.js';
export function prepareRelease(pages) {
  const paths=['/',...pages.filter(p=>p!=='404.html').map(p=>'/'+p.replace(/index\.html$/,''))];
  const urls=paths.map(path=>`<url><loc>${site}${path}</loc></url>`).join('');
  const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  writeFileSync('public/sitemap.xml',sitemap);
  writeFileSync('public/sitemap-0.xml',sitemap);
  writeFileSync('public/sitemap-index.xml',`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${site}/sitemap.xml</loc></sitemap></sitemapindex>`);
  writeFileSync('public/robots.txt',`User-agent: *\n${process.env.VERCEL_ENV==='preview'?'Disallow: /':'Allow: /'}\nSitemap: ${site}/sitemap.xml\n`);
  mkdirSync('public/podcast-social',{recursive:true});
  for(const file of pages.filter(p=>/^podcast\/[^/]+\/index.html$/.test(p))) {
    const html=readFileSync(file,'utf8');const image=new URL(html.match(/property="og:image" content="([^"]+)"/)[1]);
    copyFileSync(`public${image.pathname}`,`public/podcast-social/${file.split('/')[1]}.png`);
  }
}
