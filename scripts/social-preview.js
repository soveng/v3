import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { parse } from 'yaml';
import { renderMountain } from './render-mountain.js';

// Until the custom domain moves to v3, cards must resolve on this deployment.
const origin = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://v3-nine-eta-60.vercel.app');
const parsedOrigin = new URL(origin);
if (parsedOrigin.protocol !== 'https:' || parsedOrigin.pathname !== '/' || parsedOrigin.search || parsedOrigin.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without a path, query, or fragment');
}
export const site = parsedOrigin.origin;
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const font = { loadSystemFonts: false, fontFiles: ['scripts/social-fonts/EBGaramond.ttf', 'scripts/social-fonts/DMMono-Regular.ttf'], defaultFontFamily: 'EB Garamond' };
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">${body}</svg>`;
const dataImage = file => {
  const type = {'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'}[extname(file)];
  return type ? `data:${type};base64,${readFileSync(file).toString('base64')}` : null;
};
const brandmark = dataImage('src/assets/brandmark.svg');
const cover = dataImage('public/images/nosolutions-cover.jpg');
const widthCache = new Map();
function textWidth(text, size) {
  if (!widthCache.has(text)) {
    const renderer = new Resvg(svg(`<text y="120" font-family="EB Garamond" font-size="100">${e(text)}</text>`), {font});
    widthCache.set(text, renderer.innerBBox()?.width || 0);
  }
  return widthCache.get(text) * size / 100;
}
function fitTitle(title, explicitLines) {
  for (let size = explicitLines ? 100 : 86; size >= 38; size -= 2) {
    const lines = explicitLines ? [...explicitLines] : [''];
    if (!explicitLines) for (const word of title.split(/\s+/)) {
      const candidate = `${lines.at(-1)} ${word}`.trim();
      if (lines.at(-1) && textWidth(candidate, size) > 660) lines.push(word);
      else lines[lines.length - 1] = candidate;
    }
    if (lines.length <= 3 && lines.every(line => textWidth(line, size) <= 660) && lines.length * size <= (explicitLines ? 290 : 250)) return {lines,size};
  }
  throw new Error(`Social preview title is too long: ${title}`);
}
let mountainArt;
function art(path, image) {
  if (path === '/mountain/') {
    mountainArt ||= renderMountain().match(/<svg class="mountain-scene"[\s\S]*?<\/svg>/)[0]
      .replace('stroke-dasharray="100"', 'stroke-dasharray="none"')
      .replace(/<svg[^>]*>/, '<svg x="590" y="100" width="650" height="500" viewBox="170 20 1000 880">');
    return `${mountainArt}<rect x="590" y="100" width="650" height="90" fill="url(#fade-down)"/><rect x="590" y="550" width="650" height="50" fill="url(#fade-up)"/><rect x="580" y="100" width="250" height="500" fill="url(#fade)"/>`;
  }
  if (path.startsWith('/podcast/')) {
    return `<image x="805" y="205" width="310" height="310" href="${cover}"/><path d="M805 545 H1115" stroke="#ed3238" stroke-width="3"/>`;
  }
  if (path === '/') {
    return `<circle cx="965" cy="295" r="145" fill="#ed3238"/><g fill="none" stroke="#eee8dd" opacity=".5">${Array.from({length:8},(_,i)=>`<path d="M730 ${465+i*14} Q790 ${445+i*14} 850 ${465+i*14} T970 ${465+i*14} T1090 ${465+i*14} T1210 ${465+i*14}"/>`).join('')}</g><g transform="translate(865 215)" stroke="#eee8dd" stroke-width="2" fill="#080808"><path d="M0 193 H190 L165 221 H35Z M60 193 V0 M128 193 V32"/><path d="M16 24 Q60 36 103 24 L96 136 Q60 148 20 136Z M105 53 Q130 61 162 53 L170 153 Q134 165 103 153Z"/><path d="M5 192 L60 5 L108 192 M92 192 L128 36 L184 192" fill="none"/></g>`;
  }
  const logo = image?.startsWith('/images/showcase/') ? dataImage(`public${image}`) : null;
  return `<g transform="translate(960 345)"><g fill="none" stroke="#66765d"><circle r="170"/><circle r="128" stroke-dasharray="2 9"/><path d="M0 170 V128 M-170 0 H-128 M128 0 H170 M-120-120 L-90-90 M90 90 L120 120"/></g><g fill="#ed3238"><circle cy="170" r="6"/><circle cx="-170" r="6"/><circle cx="120" cy="-120" r="6"/></g>${logo ? `<image x="-66" y="-66" width="132" height="132" href="${logo}"/>` : `<path d="M0 108 V-60 M0 0 Q-85-3-77-72 Q-9-67 0 0 M0-30 Q67-25 73-106 Q4-95 0-30" fill="#53694e" stroke="#aab599" stroke-width="2"/>`}</g>`;
}
export function socialPreview(title, description, path, image) {
  const mountain = path === '/mountain/';
  const home = path === '/';
  const episode = path.startsWith('/podcast/') && path !== '/podcast/';
  const chapter = mountain ? parse(readFileSync('content/mountain.md','utf8').split('---')[1]).chapters[0] : null;
  const cardTitle = home ? 'Build the tools. Ship the future.' : mountain ? chapter.title : title.replace(/ — No Solutions$/, '');
  const explicitLines = home ? ['Build the tools.', 'Ship the future.'] : mountain ? chapter.title.split(/(?<=\.)\s+/) : null;
  const {lines,size} = fitTitle(cardTitle, explicitLines);
  const label = home ? 'SIX WEEKS / MADEIRA' : mountain ? chapter.day.toUpperCase() : episode ? 'NO SOLUTIONS / DIALOGUES' : path === '/podcast/' ? 'FREE-FLOWING DIALOGUES' : path.startsWith('/projects/') ? 'PROJECTS / OPEN BUILDING BLOCKS' : 'SOVEREIGN ENGINEERING / THE DETAILS';
  const subtitle = home ? 'A program to ship something real.' : mountain ? 'Dialogical development. From dialogue to demo.' : path.startsWith('/podcast/') ? 'Walking towards a better internet.' : path.startsWith('/projects/') ? 'Explore the work. Connect the ideas.' : 'The program, the people, and what to expect.';
  const background = mountain ? '#102529' : '#080808';
  const card = svg(`<defs><linearGradient id="fade"><stop stop-color="${background}"/><stop offset="1" stop-color="${background}" stop-opacity="0"/></linearGradient><linearGradient id="fade-down" x2="0" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${background}" stop-opacity="0"/></linearGradient><linearGradient id="fade-up" x2="0" y2="1"><stop stop-color="${background}" stop-opacity="0"/><stop offset="1" stop-color="${background}"/></linearGradient></defs><rect width="1200" height="630" fill="${background}"/>${art(path,image)}<image x="58" y="46" width="46" height="54" href="${brandmark}"/><g fill="#eee8dd" font-family="DM Mono" font-size="17" letter-spacing="2"><text x="124" y="68">SOVEREIGN</text><text x="124" y="92">ENGINEERING</text></g><text x="60" y="176" font-family="DM Mono" font-size="16" letter-spacing="1.4" fill="${mountain?'#e5aa80':'#a7a29a'}">${e(label)}</text><g font-family="EB Garamond" font-size="${size}" letter-spacing="-2">${lines.map((line,i)=>`<text x="57" y="${270+i*size*.96}" fill="${i===lines.length-1&&lines.length>1?(mountain?'#e5aa80':'#ed3238'):'#eee8dd'}">${e(line)}</text>`).join('')}</g><text x="60" y="${Math.max(450,285+lines.length*size*.96)}" font-family="EB Garamond" font-size="27" fill="#c5c4b9">${e(subtitle)}</text><path d="M60 567 H700" stroke="#536057"/><text x="60" y="600" font-family="DM Mono" font-size="14" letter-spacing="2" fill="#a7a29a">THINK TOGETHER. BUILD TOGETHER.</text>`);
  const png = new Resvg(card,{font}).render().asPng();
  const hash = createHash('sha256').update(png).digest('hex').slice(0,12);
  const filename = `${path === '/' ? 'home' : path.slice(1,-1).replaceAll('/','-')}-${hash}.png`;
  mkdirSync('public/social', {recursive:true});
  writeFileSync(`public/social/${filename}`,png);
  const imageUrl = `${site}/social/${filename}`;
  const alt = `${title} — Sovereign Engineering. ${cardTitle}`;
  return `<link rel="canonical" href="${site}${path}">
  <meta property="og:site_name" content="Sovereign Engineering">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${site}${path}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${e(alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(title)}">
  <meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${e(alt)}">`;
}
export function homeSocialPreview() {
  return socialPreview('Sovereign Engineering','Six weeks in Madeira. Think together through dialogue, and build tools people can run themselves.','/');
}
