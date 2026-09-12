# Sovereign Engineering

Website for Sovereign Engineering.

`src/entry.js` waits for the page stylesheet before starting animations. This
keeps canvas sizes and pinned scroll distances correct when CSS loads slowly.

The homepage's iceberg sequence is drawn in canvas by
`src/iceberg-animation.js`. Scrolling pins the scene, opens the fault, and
descends from week 01 into weeks 02–03. Reduced-motion visitors see both
chapters in a static, sequential layout.

`src/ship-animation.js` assembles and launches the SVG sailboat;
`src/blocks-animation.js` assembles a small house from eighteen regular 2×4
bricks, with an open doorway, blue foundation, and stepped red roof.
Both scenes follow scrolling and use an unpinned static layout for reduced motion.

`src/demo-animation.js` lights a projector, reveals an app, and clicks its button
to complete a task in the red Demo Day section. The short pinned sequence follows
scrolling; reduced motion and no JavaScript show the completed SVG scene.

`src/plant-animation.js` is the shared renderer for the seven showcase plants.
The homepage drives growth with scrolling; `src/project-plant.js` plays it once
over time on the individual project pages, pausing while offscreen. FIPS packets
continue through the roots after growth finishes. Reduced motion shows the
finished illustration, and visitors without JavaScript see the project logo.
Project pages opt into a brighter dark-background palette; the homepage keeps
its original colors. Plant species and seeds are set in `content/project-stories.json`.

`src/fips-animation.js` grows a branching root network directly from the base
of TollGate’s mangrove, showing FIPS emerging from TollGate. The two canvases
share a root anchor, and TollGate stays upright to preserve that connection.
A low patch of grass marks the ground between TollGate’s trunk and the roots.
The deeper root section grows with scrolling; three slow packet pulses repeat
while the network is visible, traveling outward and back toward TollGate.
Reduced-motion visitors see a static view, and offscreen animation is paused.
Portrait screens generate additional short, staggered root branches in pixel
coordinates rather than stretching the desktop network vertically.

## Podcast and FAQ content

The podcast archive, individual episodes, FAQ, and policies are static pages
generated when Vite starts or builds. Edit the sources, then restart the dev
server to regenerate the pages:

- `public/dialogues.xml`: the No Solutions RSS feed and source for all episodes.
  Preserve existing GUIDs, enclosures, and titles (titles determine the existing
  episode URLs). Add new episodes here, then rebuild.
- `content/faq.md`: FAQ answers, in YAML frontmatter with Markdown answers.
- `content/policy.md`: selection and participation policies.
- `content/mountain.md`: the seven-day mountain cohort narrative for 2027,
  available at `/mountain/` and linked only from the footer.
- `scripts/generate-pages.js`: shared page layout and content rendering.
- `src/podcast-animation.js`: the homepage bell-curve scroll sequence.
  Its characters use the [Bell Curve template](https://imgflip.com/memegenerator/533936279/Bell-Curve)
  stored unchanged at `public/images/bell-curve-meme.png`. SVG crops and filters
  isolate the characters and match the site's colours; the curve is drawn in SVG.
  Reduced-motion visitors get the complete static illustration.

The root `podcast/`, `faq/`, `policy/`, `projects/`, and `mountain/` directories are generated and ignored
by Git. They are replaced during generation; do not edit or store source in them.
The build does not fetch content from the live site. Audio, episode artwork,
and transcripts remain hosted at their original URLs. Players load audio only
when requested.

Content and podcast artwork were migrated from
[`soveng/website`](https://github.com/soveng/website/tree/a7bdb068bed022c9dcb7b466a16b6227629c8994).
The feed is preserved verbatim, including Podcasting 2.0 metadata. FAQ cohort
links now point to `/#apply`; the policy's philosophy link points to the program
section while new philosophy copy is pending. Nostr verification metadata is
preserved at `/.well-known/nostr.json`.

The final homepage invitation is rendered by `scripts/render-apply.js`. Set
`content/applications.json` to `"status": "open"` and supply the HTTPS
`applicationUrl` to show the primary application button. The closed state shows a
short availability message and a subtle FAQ link. Keep the FAQ’s cohort details
in sync when opening applications.

Before public release:

- Finish the intended concept, philosophy, and loop copy.
- Confirm the next cohort's dates and application status; SEC-08 is currently
  shown as concluded, matching the source site's closed applications.
- Decide how legacy routes such as `/concept`, `/philosophy`, `/loop`,
  `/books`, and `/timeline` should be retained or redirected.
- Verify external media playback and subscription on the production domain.
  Canonical and social URLs assume `https://sovereignengineering.io`.

## Projects and testimonials

The project archive preserves 154 entries across SEC-00 through SEC-07,
including the original cohort URLs, project anchors, descriptions, and resource
links. Search and cohort filters enhance the static directory; without JavaScript
all entries remain visible. The seven homepage highlights link to dedicated
project stories. Testimonials appear immediately before Apply on the homepage in a swipeable
carousel with all original quotes and author portraits: three visible on desktop
and one on smaller screens. Swipe, horizontal scrolling, and keyboard
controls move through the slides. Automatic advance allows at least five seconds
per quote, with extra reading time for longer quotes. A circular timer at the top-right of the carousel counts down to the next
slide, pauses with playback, and resets after a swipe. It pauses offscreen, in hidden
tabs, during hover, focus, or touch, and for reduced-motion visitors. Native horizontal
scrolling remains available without JavaScript.

- `content/projects.json`: original archive entries.
- `content/cohorts.json`: cohort introductions.
- `content/project-stories.json`: featured project explanations and related work.
- `content/testimonials.json`: original community quotes and attribution links.
- `scripts/generate-projects.js`: archive, story, and testimonial rendering.
- `src/project-archive.js`: search, filtering, and progressive results.
- `src/testimonials.js`: carousel keyboard navigation and automatic advance.

Archive content and local project logos were migrated from `soveng/website` at
`8bfb0bc`. Restart Vite after editing content to regenerate the pages.

The shared footer’s sea divider and ship follow scrolling via
`src/footer-animation.js`. The ship sails into the center as the waves appear;
reduced-motion and no-JavaScript visitors see the completed scene.

The mountain page uses one continuous SVG landscape in `scripts/render-mountain.js`.
`src/mountain.js` follows scrolling through the valley, ascent, device-free camp, summit,
descent and 24-hour build, demos, and departure. Each day has its own chapter,
with the sun setting and rising between days as you scroll. The scene stays pinned while the
chapters pass; mobile places the illustration below the copy. Reduced motion and
no JavaScript show the landscape and chapters in a normal document flow. Exact
dates, location, and applications remain unannounced.

## Run locally

If you only want to run the website:

```sh
git clone https://github.com/soveng/v3.git
cd v3
npm ci
npm run dev
```

## Contribute

Use a fork so you can make changes without editing the original repository.

- **Fork:** your copy of this repository on GitHub.
- **Origin:** your fork after you clone it.
- **Upstream:** the original [`soveng/v3`](https://github.com/soveng/v3) repository.
- **Branch:** a separate place for one change.
- **Pull request:** a request to add your change to the upstream repository.

### 1. Fork the repository

Sign in to GitHub, open [`soveng/v3`](https://github.com/soveng/v3), click
**Fork**, then click **Create fork**.

### 2. Clone your fork

Replace `YOUR-USERNAME` with your GitHub username:

```sh
git clone https://github.com/YOUR-USERNAME/v3.git
cd v3
npm ci
```

### 3. Add the upstream repository

This only needs to be done once:

```sh
git remote add upstream https://github.com/soveng/v3.git
git remote -v
```

`origin` should point to your fork. `upstream` should point to `soveng/v3`.

### 4. Pull the latest changes

Do this before starting new work:

```sh
git switch master
git pull upstream master
git push origin master
```

This downloads upstream changes and updates your fork.

### 5. Create a branch

Use a short name describing the problem:

```sh
git switch -c short-problem-name
```

Keep the branch focused on one problem. Make changes here, not on `master`.

### 6. Test and commit

Run the site and check your change. Press `Ctrl+C` to stop it:

```sh
npm run dev
```

Then build, review, and commit your files:

```sh
npm run build
git status
git add .
git commit -m "problem: describe unwanted behavior"
```

Check `git status` before `git add .` so you know which files will be saved.

### 7. Push your branch

```sh
git push -u origin short-problem-name
```

### 8. Open a pull request

1. Open your fork on GitHub.
2. Click **Compare & pull request**.
3. Confirm the base repository is `soveng/v3` and the base branch is `master`.
4. Explain the problem, your change, and how you tested it.
5. Click **Create pull request**.

For your next contribution, pull upstream again and create a new branch.

## Social previews

Every page gets its own 1200×630 PNG card and Open Graph / Twitter card
metadata at build time. `scripts/social-preview.js` renders the designs using
local fonts and artwork; no browser, external image service, or network access
is needed during the build. The mountain card reuses the mountain illustration
and opener from `content/mountain.md`. The homepage uses the supplied figure
and city image in `src/assets/social-landing.png`. Project and dialogue cards use their
page titles. Generated images live in `public/social/` (ignored by Git) and
use content hashes so a changed design gets a new image URL.

Canonical and image URLs use `SITE_URL` when set, otherwise Vercel’s
`VERCEL_PROJECT_PRODUCTION_URL`, with the current production alias
`https://v3-nine-eta-60.vercel.app` as the local fallback. When the custom domain
moves to this site, set `SITE_URL=https://sovereignengineering.io` in Vercel and
redeploy. This keeps previews from requesting v3 images from the old website.
For a preview deployment that needs independent metadata, set `SITE_URL` to
that deployment’s public HTTPS origin.

Run `npm run check:social` to build and validate every page’s metadata, image
URL, PNG dimensions, and content hash. EB Garamond and DM Mono are bundled in
`scripts/social-fonts/` with their SIL Open Font License files, from the
[Google Fonts repository](https://github.com/google/fonts).

## Deploy to Vercel

1. Import [`soveng/v3`](https://github.com/soveng/v3) at
   [vercel.com/new](https://vercel.com/new).
2. Click **Deploy**.

`vercel.json` configures Vite, `npm run build`, and the `dist` output.

Or deploy from a local clone:

```sh
npx vercel
npx vercel --prod
```

The two Wikifreedia fruits use the unmodified
[Wikipedia puzzle-globe SVG](https://commons.wikimedia.org/wiki/File:Wikipedia-logo-v2.svg),
by Wikimedia (version 1 by Nohat, concept by Paullusmagnus), under
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
The original SVG is stored in `public/images/wikipedia-globe.svg` and rendered
at different sizes in the plant canvas.
