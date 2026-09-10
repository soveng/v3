// FIPS grows underground from the exact base of the TollGate mangrove.
export function createFipsAnimation(canvas, reducedMotion) {
  const context = canvas.getContext("2d");
  const state = { progress: reducedMotion ? 1 : 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let seed = 812;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const branches = [];
  const tips = [];
  const source = document.querySelector('#tollgate .botanical');
  const rootX = Number(source.dataset.rootX);

  function grow(start, angle, length, depth, parent = null) {
    const end = {
      x: start.x + Math.cos(angle) * length * .65,
      y: Math.max(.08, Math.min(.92, start.y + Math.sin(angle) * length)),
    };
    const bend = (random() - .5) * length * .8;
    const branch = {
      start, end, depth, parent,
      control: { x: (start.x + end.x) / 2 - Math.sin(angle) * bend,
        y: (start.y + end.y) / 2 + Math.cos(angle) * bend },
      arrival: depth * .095 + random() * .025,
      hairs: Array.from({ length: 3 }, () => ({ t: .25 + random() * .6, side: random() > .5 ? 1 : -1, length: .006 + random() * .012 })),
    };
    branches.push(branch);
    if (depth === 5) { tips.push(branch); return; }
    for (const side of [-1, 1]) {
      const direction = angle + side * (.25 + random() * .4);
      grow(end, Math.max(.2, Math.min(Math.PI - .2, direction)), length * (.65 + random() * .13), depth + 1, branch);
    }
  }

  const trunk = {
    start: { x: rootX, y: 0 }, end: { x: rootX + .012, y: .14 },
    control: { x: rootX - .018, y: .08 },
    depth: 0, arrival: 0, hairs: [], parent: null,
  };
  branches.push(trunk);
  for (const angle of [.35, .9, 1.5, 2.15, 2.75]) {
    grow(trunk.end, angle, .23 + random() * .03, 1, trunk);
  }
  const ancestry = branch => branch ? [...ancestry(branch.parent), branch] : [];
  const deepest = tips.reduce((a, b) => a.end.y > b.end.y ? a : b);
  let sortedTips = [...tips].sort((a, b) => a.end.x - b.end.x);
  let routes = [ancestry(sortedTips[Math.floor(sortedTips.length * .15)]), ancestry(deepest), ancestry(sortedTips[Math.floor(sortedTips.length * .85)])];
  let rootDepth = Math.max(...tips.map(tip => tip.end.y));
  const desktop = { branches: [...branches], tips: sortedTips, routes, rootDepth };
  let portrait = false;

  function layoutRoots(width, height) {
    portrait = width <= 720 && height > width;
    branches.length = 0;
    if (!portrait) {
      branches.push(...desktop.branches);
      sortedTips = desktop.tips; routes = desktop.routes; rootDepth = desktop.rootDepth;
      return;
    }
    // Build in screen pixels: a deeper screen gets more branching, not longer cells.
    seed = 812;
    rootDepth = .96;
    const ends = [];
    const point = (x, y) => ({ x: x / width, y: y / height });
    function segment(start, end, parent, depth, bend) {
      const branch = { start, end, parent, depth,
        control: point((start.x + end.x) * width / 2 + bend, (start.y + end.y) * height / 2),
        arrival: Math.min(.49, start.y * .5),
        hairs: Array.from({ length: 3 }, () => ({ t: .2 + random() * .65, side: random() > .5 ? 1 : -1, length: .009 + random() * .012 })),
      };
      branches.push(branch);
      return branch;
    }
    function lateral(start, angle, length, parent, depth) {
      const x = start.x * width + Math.cos(angle) * length;
      const y = start.y * height + Math.sin(angle) * length;
      if (x < 18 || x > width - 18 || y > height * .98) return;
      const branch = segment(start, point(x, y), parent, depth, (random() - .5) * length * .6);
      if (depth >= 5) { ends.push(branch); return; }
      lateral(branch.end, angle - .4, length * .62, branch, depth + 1);
      lateral(branch.end, angle + .55, length * .68, branch, depth + 1);
    }
    const count = Math.ceil(height / 52);
    let parent = null;
    let start = point(rootX * width, 0);
    for (let index = 1; index <= count; index++) {
      const t = index === count ? 1 : (index + (random() - .5) * .45) / count;
      const x = width * (rootX + Math.sin(t * Math.PI * 3) * .075 + smooth((t - .55) / .45) * .25);
      const branch = segment(start, point(x, height * .96 * t), parent, .4 + t * 2.5, (random() - .5) * 30);
      const side = index % 2 ? -1 : 1;
      lateral(branch.end, (side < 0 ? 2.65 : .55) + (random() - .5) * .35, Math.min(80, width * .2) * (.7 + random() * .4), branch, 2);
      parent = branch; start = branch.end;
    }
    ends.push(parent);
    sortedTips = ends.sort((a, b) => a.end.x - b.end.x);
    const lower = ends.filter(branch => branch.end.y > .55);
    routes = [ancestry(lower[0] || parent), ancestry(parent), ancestry(lower[lower.length - 1] || parent)];
  }
  let visible = false;
  let frame = 0;
  let elapsed = 0;
  let previousTime = 0;

  function tick(time) {
    frame = 0;
    if (!visible || reducedMotion || state.progress < .5) { previousTime = 0; return; }
    if (previousTime) elapsed += Math.min(time - previousTime, 50) / 1000;
    previousTime = time;
    draw();
  }

  function at(branch, t) {
    const u = 1 - t;
    return { x: u * u * branch.start.x + 2 * u * t * branch.control.x + t * t * branch.end.x,
      y: u * u * branch.start.y + 2 * u * t * branch.control.y + t * t * branch.end.y };
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    if (!width || !height) return;
    const progress = clamp(state.progress);
    const spread = width;
    const project = p => ({ x: p.x * spread, y: p.y / rootDepth * height * .96 });
    const copy = canvas.closest(".project-plant").querySelector(".plant-copy");
    const copyTop = copy.offsetTop - parseFloat(canvas.style.top);
    const inkOpacity = y => 1 - smooth((y - copyTop + 50) / 100) * .65;
    const size = Math.max(.65, spread / 1000);
    context.lineCap = "round";

    function filament(branch, start, end, color, weight) {
      const steps = 18;
      for (let step = 0; step < steps; step++) {
        const t = start + (end - start) * step / steps;
        const a = project(at(branch, t));
        const b = project(at(branch, start + (end - start) * (step + 1) / steps));
        context.beginPath();
        context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
        context.globalAlpha = inkOpacity((a.y + b.y) / 2);
        context.strokeStyle = color;
        context.lineWidth = weight * (1 - t * .38);
        context.stroke();
      }
    }

    for (const branch of branches) {
      const growth = smooth((progress / .65 - branch.arrival) / .2);
      if (!growth) continue;
      const weight = (12 * Math.pow(.53, branch.depth) + .25) * size;
      filament(branch, 0, growth, branch.depth < 2 ? "#594737" : "#8b8063", weight);
      // Pale edges and tiny lateral hairs give each root a tapered, fibrous texture.
      filament(branch, 0, growth, "rgba(193,177,140,.38)", weight * .3);
      for (const hair of branch.hairs) {
        const reach = smooth((growth - hair.t) / .25);
        if (!reach) continue;
        const p = at(branch, hair.t);
        const next = at(branch, hair.t + .01);
        const angle = Math.atan2(next.y - p.y, next.x - p.x) + hair.side * .9;
        const a = project(p);
        const b = project({ x: p.x + Math.cos(angle) * hair.length * reach, y: p.y + Math.sin(angle) * hair.length * reach * (portrait ? width / height : 1) });
        context.beginPath(); context.moveTo(a.x, a.y);
        context.quadraticCurveTo(a.x, b.y, b.x, b.y);
        context.strokeStyle = "rgba(124,113,83,.42)";
        context.globalAlpha = inkOpacity(a.y);
        context.lineWidth = .55 * size; context.stroke();
      }
    }

    // A few trailing rootlets reach across the headline and description themselves.
    const canvasRect = canvas.getBoundingClientRect();
    const titleRect = copy.querySelector("h3").getBoundingClientRect();
    const textRect = copy.querySelector("p").getBoundingClientRect();
    for (let index = 0; !portrait && index < 3; index++) {
      const start = sortedTips[Math.floor(sortedTips.length * (.72 + index * .08))].end;
      const end = {
        x: (titleRect.right - canvasRect.left - titleRect.width * (.05 + index * .12)) / width,
        y: (textRect.bottom - canvasRect.top + 12 + index * 12) / (height * .96) * rootDepth,
      };
      const rootlet = { start, end, control: { x: end.x - .04, y: start.y + (end.y - start.y) * .3 } };
      filament(rootlet, 0, smooth((progress / .65 - .55) / .2), "rgba(139,128,99,.8)", .9 * size);
    }

    // Slow, repeated packets make the network readable even while scrolling pauses.
    if (progress >= .5) routes.forEach((route, routeIndex) => {
      const phase = reducedMotion ? .65 : (elapsed / 12 + routeIndex / 3) % 1;
      const travel = phase * route.length;
      const reverse = routeIndex === 1;
      const ordered = reverse ? [...route].reverse() : route;
      ordered.forEach((branch, index) => {
        const head = clamp(travel - index);
        const tail = clamp(travel - .85 - index);
        if (head > tail) filament(branch, reverse ? 1 - tail : tail, reverse ? 1 - head : head, "rgba(218,75,43,.9)", 2.4 * size);
      });
      const branch = ordered[Math.min(ordered.length - 1, Math.floor(travel))];
      const t = travel % 1;
      const p = project(at(branch, reverse ? 1 - t : t));
      const radius = Math.max(15, 20 * size);
      const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      glow.addColorStop(0, "rgba(237,110,65,.65)");
      glow.addColorStop(1, "rgba(237,110,65,0)");
      context.globalAlpha = inkOpacity(p.y);
      context.fillStyle = glow;
      context.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      context.beginPath(); context.arc(p.x, p.y, Math.max(2.5, 3 * size), 0, Math.PI * 2);
      context.fillStyle = "#ed5834"; context.fill();
    });
    context.globalAlpha = 1;
    if (visible && !reducedMotion && progress >= .5 && !frame) frame = requestAnimationFrame(tick);
  }

  function resize() {
    const card = canvas.closest(".project-plant");
    const sourceRect = source.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const top = sourceRect.top + source.clientHeight * .96 - cardRect.top;
    canvas.style.top = `${top}px`;
    canvas.style.left = `${sourceRect.left - cardRect.left}px`;
    canvas.style.width = `${source.clientWidth}px`;
    canvas.style.height = `${Math.max(120, card.clientHeight + 80 - top)}px`;
    layoutRoots(canvas.clientWidth, canvas.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) draw();
    else { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
  });
  observer.observe(canvas);
  resize();
  window.addEventListener("resize", resize);
  document.fonts.ready.then(resize);
  return { state, draw };
}
