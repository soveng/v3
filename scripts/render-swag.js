import { readFileSync } from 'node:fs';
import sanitizeHtml from 'sanitize-html';

export function generateSwag({ write, layout, escape: e }) {
  const html = value => sanitizeHtml(value, { allowedTags: ['p', 'a'], allowedAttributes: { a: ['href', 'target', 'rel'] } });
  const { shop, shopLabel, heading, intro, products } = JSON.parse(readFileSync('content/swag.json', 'utf8'));
  write('swag/index.html', layout('Swag', 'Shirts, hats, and designs from Sovereign Engineering cohorts.', '/swag/', `
    <header class="swag-hero"><div><h1>${e(heading)}</h1><div class="content-lead swag-intro">${html(intro)}</div></div><img src="/images/swag/black-hat.webp" alt="Sovereign Engineering Black Hat Design" width="800" height="600"></header>
    <div class="swag-collection">${products.map((product, index) => `<section class="swag-product" id="${product.cohort.toLowerCase()}" aria-labelledby="swag-heading-${index}">
      <div class="swag-gallery" data-swag-gallery>
        <div class="swag-image-frame"><img class="swag-main-image" id="sec${String(index+1).padStart(2,'0')}-main" src="${e(product.images[0].src)}" alt="${e(product.cohort)} — ${e(product.images[0].label)}" width="1200" height="1000" loading="lazy"></div>
        <div class="swag-views" aria-label="${e(product.cohort)} image views">${product.images.map((image, i) => `<a href="${e(image.src)}" aria-label="${e(product.cohort)} — ${e(image.label)}" data-image-label="${e(product.cohort)} — ${e(image.label)}"${i===0?' aria-current="true"':''}><img src="${e(image.src)}" alt="" width="64" height="64" loading="lazy"></a>`).join('')}</div>
      </div>
      <div class="swag-copy"><h2 id="swag-heading-${index}">${e(product.title)}</h2><div class="swag-description">${html(product.body)}</div></div>
    </section>`).join('')}</div>
    <section class="swag-shop"><a class="text-link" href="${e(shop)}" target="_blank" rel="noopener noreferrer">${e(shopLabel)}</a></section>
    <script type="module" src="/src/swag.js"></script>`, '/images/swag/black-hat.webp'));
}
