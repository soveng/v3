import { readFileSync } from 'node:fs';

export function generateSwag({ write, layout, escape: e }) {
  const { shop, products } = JSON.parse(readFileSync('content/swag.json', 'utf8'));
  write('swag/index.html', layout('Swag', 'Shirts, hats, and designs from Sovereign Engineering cohorts.', '/swag/', `
    <header class="swag-hero"><div><h1>Wear the work.</h1><p class="content-lead">Shirts, hats, and a little cohort history.</p><a class="text-link" href="${e(shop)}">Visit the webshop <span aria-hidden="true">↗</span></a></div><img src="/images/swag/black-hat.webp" alt="Sovereign Engineering black hat" width="800" height="600"></header>
    <div class="swag-collection">${products.map((product, index) => `<section class="swag-product" id="${product.cohort.toLowerCase()}" aria-labelledby="swag-heading-${index}">
      <div class="swag-gallery" data-swag-gallery>
        <div class="swag-image-frame"><img class="swag-main-image" id="sec${String(index+1).padStart(2,'0')}-main" src="${e(product.images[0].src)}" alt="${e(product.cohort)} — ${e(product.images[0].label)}" width="1200" height="1000" loading="lazy"></div>
        <div class="swag-views" aria-label="${e(product.cohort)} image views">${product.images.map((image, i) => `<a href="${e(image.src)}" data-image-label="${e(product.cohort)} — ${e(image.label)}"${i===0?' aria-current="true"':''}><img src="${e(image.src)}" alt="" width="64" height="64" loading="lazy"><span>${e(image.label)}</span></a>`).join('')}</div>
      </div>
      <div class="swag-copy"><p class="section-index">${e(product.cohort)}</p><h2 id="swag-heading-${index}">${e(product.title)}</h2><p class="swag-description">${e(product.description)}</p>
      ${product.credit?`<p class="swag-credit">Design by <a href="${e(product.credit.url)}">${e(product.credit.name)} ↗</a></p>`:''}
      <a class="text-link" href="/projects/${e(product.cohort)}/">Explore the cohort <span aria-hidden="true">↗</span></a>
      ${product.links?.length?`<div class="swag-references">${product.links.map(link=>`<a href="${e(link.url)}">${e(link.label)} ↗</a>`).join('')}</div>`:''}</div>
    </section>`).join('')}</div>
    <section class="swag-shop"><h2>Find your next favorite.</h2><a class="text-link" href="${e(shop)}">Visit the webshop <span aria-hidden="true">↗</span></a></section>
    <script type="module" src="/src/swag.js"></script>`, '/images/swag/black-hat.webp'));
}
