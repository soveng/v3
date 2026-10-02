import { readFileSync } from 'node:fs';

export function generateLibrary({ write, layout, escape: e }) {
  const books = JSON.parse(readFileSync('content/books.json', 'utf8'));
  const timeline = JSON.parse(readFileSync('content/timeline.json', 'utf8'));
  const id = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  write('books/index.html', layout('Books', 'The Sovereign Engineering bookshelf: dialogue, freedom, software, and the way we live together.', '/books/', `
    <header class="library-hero"><h1>The bookshelf.</h1><p class="content-lead">On dialogue, freedom, and building things together.</p></header>
    <div class="bookshelf">${books.map(book => `<article class="book-entry" id="${id(book.title)}">
      <a class="book-cover" href="${e(book.links[0].url)}" tabindex="-1" aria-hidden="true"><img src="${e(book.cover)}" alt="" width="240" height="360" loading="lazy"></a>
      <div class="book-copy"><p class="book-author">${e(book.author)}</p><h2><a href="${e(book.links[0].url)}">${e(book.title)}</a></h2><p class="book-description">${e(book.description)}</p>
      <div class="book-links">${book.links.map(link => `<a class="text-link" href="${e(link.url)}">${e(link.name)} <span aria-hidden="true">↗</span></a>`).join('')}</div></div>
    </article>`).join('')}</div>`, '/images/sovereign-engineering.png'));
  const years = [...new Set(timeline.map(item => item.year))];
  write('timeline/index.html', layout('Timeline', 'Sovereign Engineering, from the first conversations in Madeira to the next cohort.', '/timeline/', `
    <header class="library-hero"><h1>The story so far.</h1><p class="content-lead">From the first conversations in Madeira to the next adventure.</p></header>
    <nav class="timeline-years" aria-label="Jump to a year">${years.map(year => `<a href="#year-${year}">${year}</a>`).join('')}</nav>
    <div class="timeline">${years.map(year => `<section class="timeline-year" id="year-${year}" aria-labelledby="heading-${year}"><h2 id="heading-${year}">${year}</h2><ol class="timeline-events">${timeline.filter(item => item.year === year).map(item => `<li class="timeline-event${item.upcoming ? ' is-upcoming' : ''}" id="${e(item.id)}"><p class="timeline-date">${e(item.date)}${item.upcoming ? ' / Ahead' : ''}</p><h3>${e(item.title)}</h3><p class="timeline-description">${e(item.description)}</p><a class="text-link" href="${e(item.link)}">${e(item.linkLabel)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ol></section>`).join('')}</div>`, '/images/sovereign-engineering.png'));
}
