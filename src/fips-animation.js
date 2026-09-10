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
  const route = ancestry(deepest);

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
    const project = p => ({ x: p.x * spread, y: p.y * height });
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
        context.strokeStyle = color;
        context.lineWidth = weight * (1 - t * .38);
        context.stroke();
      }
    }

    for (const branch of branches) {
      const growth = smooth((progress - branch.arrival) / .2);
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
        const b = project({ x: p.x + Math.cos(angle) * hair.length * reach, y: p.y + Math.sin(angle) * hair.length * reach });
        context.beginPath(); context.moveTo(a.x, a.y);
        context.quadraticCurveTo(a.x, b.y, b.x, b.y);
        context.strokeStyle = "rgba(124,113,83,.42)";
        context.lineWidth = .55 * size; context.stroke();
      }
    }

    const travel = clamp((progress - .74) / .25) * route.length;
    route.forEach((branch, index) => {
      const growth = clamp(travel - index);
      if (growth) filament(branch, 0, growth, "rgba(190,79,57,.72)", 1.5 * size);
    });
    if (travel > 0 && travel < route.length) {
      const branch = route[Math.floor(travel)];
      const t = travel % 1;
      const p = project(at(branch, t));
      const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14 * size);
      glow.addColorStop(0, "rgba(237,110,65,.45)");
      glow.addColorStop(1, "rgba(237,110,65,0)");
      context.fillStyle = glow;
      context.fillRect(p.x - 14 * size, p.y - 14 * size, 28 * size, 28 * size);
    }
  }

  function resize() {
    const card = canvas.closest(".project-plant");
    const sourceRect = source.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const top = sourceRect.top + source.clientHeight * .96 - cardRect.top;
    canvas.style.top = `${top}px`;
    canvas.style.left = `${sourceRect.left - cardRect.left}px`;
    canvas.style.width = `${source.clientWidth}px`;
    canvas.style.height = `${Math.max(120, card.clientHeight - card.querySelector(".plant-copy").offsetHeight - 48 - top)}px`;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  resize();
  window.addEventListener("resize", resize);
  document.fonts.ready.then(resize);
  return { state, draw };
}
