import { readFileSync } from "node:fs";

export function generateProjects({ write, layout, escape: e }) {
  const projects = JSON.parse(readFileSync("content/projects.json", "utf8"));
  const intros = JSON.parse(readFileSync("content/cohorts.json", "utf8"));
  const stories = JSON.parse(readFileSync("content/project-stories.json", "utf8"));
  const cohorts = [...new Set(projects.map(p => p.cohort))].sort().reverse();
  const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const href = url => {
    if (!/^https?:\/\//.test(url) && !/^\/(?!\/)/.test(url)) throw new Error(`Invalid project URL: ${url}`);
    return e(url);
  };
  const link = (url, label, cls = "") => `<a class="${cls}" href="${href(url)}">${e(label)} <span aria-hidden="true">↗</span></a>`;
  const storyFor = p => stories.find(s => s.matches.includes(p.name));
  const entries = cohort => projects.filter(p => p.cohort === cohort).sort((a, b) => a.name.localeCompare(b.name));
  const intro = cohort => {
    const data = intros[cohort];
    if (!data) return "";
    if (data.body) return data.body.map(part => part.type === "link" ? link(part.href, part.text) : e(part.text)).join("");
    return `${data.leadLink ? link(data.leadLink.href, data.leadLink.label) + " " : ""}${e(data.paragraph)}`;
  };
  const mark = (p, large = false) => `<div class="project-mark${large ? " project-mark-large" : ""}" aria-hidden="true">${p.logo ? `<img src="${href(p.logo)}" alt="" width="80" height="80" loading="lazy" decoding="async">` : `<span>${e(p.name.slice(0, 1))}</span>`}</div>`;
  const card = (p, overview = false) => {
    const story = storyFor(p);
    const id = slug(p.name);
    const links = [...(p.link ? [{ link: p.link, linkText: p.linkText || "Project" }] : []), ...(p.extraLinks || [])];
    return `<article class="project-record" id="${overview ? p.cohort + "-" : ""}${id}" data-cohort="${e(p.cohort)}" data-search="${e([p.name, p.description, p.cohort].join(" ").toLowerCase())}">
      <div class="project-record-top">${mark(p)}${overview ? `<a class="project-cohort-tag" href="/projects/${p.cohort}/#${id}">${p.cohort}</a>` : ""}</div>
      <h3>${story ? `<a href="/projects/${story.slug}/">${e(p.name)} <span aria-hidden="true">↗</span></a>` : e(p.name)}</h3>
      <p>${e(p.description)}</p>
      <div class="project-record-links">${story ? link(`/projects/${story.slug}/`, "Read the story", "project-story-link") : ""}${links.map(l => link(l.link, l.linkText)).join("")}</div>
    </article>`;
  };
  const directory = (list, overview) => `<section class="archive-explorer" aria-labelledby="directory-title">
    <div class="archive-section-heading"><h2 id="directory-title">${overview ? "Explore the work." : "Built in this cohort."}</h2></div>
    <form class="project-filters" role="search" hidden>
      <label>Find a project<input type="search" name="q" placeholder="Search names, ideas, protocols…" autocomplete="off"></label>
      ${overview ? `<label>Cohort<select name="cohort"><option value="">All cohorts</option>${cohorts.map(c => `<option>${c}</option>`).join("")}</select></label>` : ""}
      <button type="reset">Clear</button>
    </form>
    <p class="project-results" role="status" aria-live="polite" hidden></p>
    <div class="project-record-grid">${list.map(p => card(p, overview)).join("")}</div>
    <p class="project-empty" hidden>No projects found. Try another name or clear the filters.</p>
    <button class="project-more" type="button" hidden>Show more projects ↓</button>
    </section>`;
  const scripts = '<script type="module" src="/src/project-archive.js"></script>';
  const summary = (c, compact = false) => `<a class="cohort-tile${compact ? " compact" : ""}" href="/projects/${c}/"><span class="cohort-code">${c}</span><h3>${e(intros[c]?.theme || c)}</h3><p>${entries(c).length} projects <span aria-hidden="true">↗</span></p></a>`;
  const heroArt = (name, logo) => `<div class="project-identity" aria-hidden="true"><svg viewBox="0 0 400 400"><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="200" cy="200" r="145"/><circle cx="200" cy="200" r="110" stroke-dasharray="2 9"/><path d="M200 345 V290 M55 200 H110 M290 200 H345 M98 98 L137 137 M263 263 L302 302 M98 302 L137 263 M263 137 L302 98"/></g><g fill="#ed3238"><circle cx="200" cy="345" r="5"/><circle cx="55" cy="200" r="5"/><circle cx="302" cy="98" r="5"/></g></svg>${logo ? `<img src="${href(logo)}" alt="" width="110" height="110">` : `<span>${e(name[0])}</span>`}</div>`;
  write("projects/index.html", layout("Project archive", "Explore projects built across Sovereign Engineering cohorts.", "/projects/", `<div class="project-archive">
    <header class="projects-hero"><div><p class="section-index">Sovereign Engineering / Project archive</p><h1>Built here.<br><em>Out there.</em></h1><p class="content-lead">Tools, protocols, and experiments from builders who came together to ship something real.</p></div><a class="text-link" href="#directory-title">Explore the archive ↓</a></header>
    <section class="cohort-overview" aria-labelledby="cohorts-title"><div class="archive-section-heading"><h2 id="cohorts-title">Every cohort leaves a mark.</h2><p>SEC-00 — SEC-07</p></div><div class="cohort-grid">${cohorts.map(c => summary(c)).join("")}</div><p class="archive-note">The archive currently runs through SEC-07. SEC-08 projects have not been added yet.</p></section>
    ${directory(cohorts.flatMap(entries), true)}${scripts}</div>`, "/images/sovereign-engineering.png"));
  for (const [index, cohort] of cohorts.entries()) {
    const pager = `<nav class="cohort-pager" aria-label="Adjacent cohorts">${cohorts[index + 1] ? `<a href="/projects/${cohorts[index + 1]}/">← ${cohorts[index + 1]}</a>` : '<span></span>'}<a href="/projects/">All cohorts</a>${cohorts[index - 1] ? `<a href="/projects/${cohorts[index - 1]}/">${cohorts[index - 1]} →</a>` : '<span></span>'}</nav>`;
    write(`projects/${cohort}/index.html`, layout(`${cohort} — ${intros[cohort]?.theme || "Projects"}`, `Projects built during ${cohort} at Sovereign Engineering.`, `/projects/${cohort}/`, `<div class="project-archive"><a class="text-link" href="/projects/">← Project archive</a><header class="cohort-hero"><p class="section-index">${cohort}</p><h1>${e(intros[cohort]?.theme || cohort)}<span class="cohort-ghost" aria-hidden="true">${cohort.slice(-2)}</span></h1><p class="content-lead">${intro(cohort)}</p></header>${pager}${directory(entries(cohort), false)}${pager}${scripts}</div>`, "/images/sovereign-engineering.png"));
  }
  for (const [index, story] of stories.entries()) {
    const related = projects.filter(p => [...story.matches, ...story.related].includes(p.name));
    const first = related.map(p => p.cohort).sort()[0];
    const next = stories[(index + 1) % stories.length];
    write(`projects/${story.slug}/index.html`, layout(story.name, story.intro, `/projects/${story.slug}/`, `<div class="project-story"><a class="text-link" href="/projects/">← Project archive</a>
      <header class="project-story-hero"><div><p class="section-index">Sovereign Engineering / ${first}</p><h1>${e(story.name)}</h1><p class="project-tagline">${e(story.tagline)}</p><p class="content-lead">${e(story.intro)}</p></div>${heroArt(story.name, story.logo)}</header>
      <div class="story-layout"><aside class="story-links"><p class="section-index">Explore the project</p>${story.links.map(([label, url]) => link(url, label)).join("")}</aside><div class="story-prose">${story.sections.map(s => `<section><h2>${e(s.title)}</h2><p>${e(s.text)}</p></section>`).join("")}</div></div>
      <section class="project-lineage"><div class="archive-section-heading"><h2>Roots & further growth.</h2><p>From the cohort archive</p></div>${related.map(p => `<a href="/projects/${p.cohort}/#${slug(p.name)}"><span>${p.cohort}</span><strong>${e(p.name)}</strong><span aria-hidden="true">↗</span></a>`).join("")}</section>
      <a class="next-project" href="/projects/${next.slug}/"><span class="section-index">Keep exploring</span><strong>${e(next.name)} ↗</strong></a>${scripts}</div>`, story.logo));
  }
}

export function renderTestimonials() {
  const quotes = JSON.parse(readFileSync("content/testimonials.json", "utf8"));
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const render = q => `<figure class="alumni-quote"><blockquote><p>${escape(q.content)}</p></blockquote><figcaption><a href="https://njump.to/${escape(q.noteid || q.npub)}">${escape(q.name)} ↗</a><span>${escape(q.designation)}</span></figcaption></figure>`;
  const featured = [quotes[0], quotes[2], quotes[4]];
  return `<section class="testimonials" id="voices" aria-labelledby="voices-title"><div class="testimonials-heading"><p class="section-index">From the people who were there</p><h2 id="voices-title">In good company.</h2></div><div class="testimonials-grid">${featured.map(render).join("")}</div><details class="more-testimonials"><summary>More voices from the community <span aria-hidden="true">+</span></summary><div class="testimonials-grid">${quotes.filter(q => !featured.includes(q)).map(render).join("")}</div></details></section>`;
}
