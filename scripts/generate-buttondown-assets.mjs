import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const output = 'public/images/buttondown';
mkdirSync(output, { recursive: true });
const mark = Buffer.from(readFileSync('src/assets/brandmark.svg', 'utf8').replaceAll('#fff', '#eee8dd')).toString('base64');
const ship = (x, y, width, height) => `<image x="${x}" y="${y}" width="${width}" height="${height}" href="data:image/svg+xml;base64,${mark}"/>`;
const font = { loadSystemFonts: false, fontFiles: ['scripts/social-fonts/EBGaramond.ttf', 'scripts/social-fonts/DMMono-Regular.ttf'] };
const exportPng = (name, width, height, body) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#080808"/>${body}</svg>`;
  writeFileSync(`${output}/${name}.png`, new Resvg(svg, { font }).render().asPng());
};
exportPng('icon', 300, 300, ship(66, 52, 168, 195));
const background = readFileSync('src/assets/social-landing.png').toString('base64');
exportPng('share', 1200, 630, `
  <defs>
    <filter id="monochrome" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter>
    <linearGradient id="fade"><stop stop-color="#080808"/><stop offset="1" stop-color="#080808" stop-opacity="0"/></linearGradient>
  </defs>
  <image x="570" y="-130" width="660" height="1163" href="data:image/png;base64,${background}" filter="url(#monochrome)"/>
  <rect x="570" width="250" height="630" fill="url(#fade)"/>
  ${ship(60, 43, 42, 49)}
  <g fill="#eee8dd" font-family="DM Mono" font-size="17" letter-spacing="2"><text x="122" y="64">SOVEREIGN</text><text x="122" y="89">ENGINEERING</text></g>
  <text x="60" y="178" fill="#a7a29a" font-family="DM Mono" font-size="16" letter-spacing="2">COHORT UPDATES</text>
  <g font-family="EB Garamond" font-size="116" letter-spacing="-2"><text x="56" y="292" fill="#ed3238">The next</text><text x="56" y="399" fill="#eee8dd">adventure.</text></g>
  <text x="60" y="463" fill="#c5c4b9" font-family="EB Garamond" font-size="29">Cohort dates. Application details.</text>
  <path d="M60 550 H615" stroke="#536057"/>
  <text x="60" y="589" fill="#a7a29a" font-family="DM Mono" font-size="15" letter-spacing="1">BUTTONDOWN.COM/SOVENG</text>
`);
console.log('Exported Buttondown icon (300×300) and share image (1200×630).');
