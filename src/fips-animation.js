// Two branching colonies grow together; a signal follows their living filaments.
export function createFipsAnimation(canvas, reducedMotion) {
  const context = canvas.getContext("2d");
  const state = { progress: reducedMotion ? 1 : 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let seed = 812;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const branches = [];
  const tips = [[], []];

  function grow(start, angle, length, depth, colony, parent = null) {
    const end = {
      x: Math.max(.035, Math.min(.965, start.x + Math.cos(angle) * length)),
      y: Math.max(.08, Math.min(.92, start.y + Math.sin(angle) * length * 1.5)),
    };
    const bend = (random() - .5) * length * .8;
    const branch = {
      start, end, depth, colony, parent,
      control: { x: (start.x + end.x) / 2 - Math.sin(angle) * bend,
        y: (start.y + end.y) / 2 + Math.cos(angle) * bend },
      arrival: depth * .095 + random() * .025,
      hairs: Array.from({ length: 3 }, () => ({ t: .25 + random() * .6, side: random() > .5 ? 1 : -1, length: .006 + random() * .012 })),
    };
    branches.push(branch);
    if (depth === 4) { tips[colony].push(branch); return; }
    for (const side of [-1, 1]) {
      grow(end, angle + side * (.25 + random() * .55), length * (.62 + random() * .16), depth + 1, colony, branch);
    }
  }

  for (const colony of [0, 1]) {
    const origin = { x: colony ? .71 : .29, y: colony ? .48 : .52 };
    for (let arm = 0; arm < 6; arm++) {
      grow(origin, arm / 6 * Math.PI * 2 + (random() - .5) * .35, .095 + random() * .025, 0, colony);
    }
  }

  // Nearby root tips fuse naturally, with no regular grid or node markers.
  const candidates = tips[0].flatMap(a => tips[1].map(b => ({ a, b, distance: Math.hypot(a.end.x - b.end.x, a.end.y - b.end.y) })))
    .sort((a, b) => a.distance - b.distance);
  const joins = [];
  const used = new Set();
  for (const { a, b, distance } of candidates) {
    if (used.has(a) || used.has(b) || (distance > .19 && joins.length)) continue;
    joins.push({ start: a.end, end: b.end, control: { x: (a.end.x + b.end.x) / 2, y: (a.end.y + b.end.y) / 2 + .025 }, depth: 4, arrival: .53, hairs: [], a, b });
    used.add(a); used.add(b);
    if (joins.length === 7) break;
  }
  const ancestry = branch => branch ? [...ancestry(branch.parent), branch] : [];
  const bridge = joins[0];
  const route = [...ancestry(bridge.a).map(branch => ({ branch, reverse: false })),
    { branch: bridge, reverse: false },
    ...ancestry(bridge.b).reverse().map(branch => ({ branch, reverse: true }))];

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
    const spread = Math.min(width, 1100);
    const card = canvas.closest(".project-plant");
    const meshHeight = Math.max(120, Math.min(height, card.clientHeight - card.querySelector(".plant-copy").offsetHeight - 48));
    const project = p => ({ x: (width - spread) / 2 + p.x * spread, y: p.y * meshHeight });
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

    for (const branch of [...branches, ...joins]) {
      const growth = smooth((progress - branch.arrival) / .2);
      if (!growth) continue;
      const weight = (3.6 * Math.pow(.65, branch.depth) + .3) * size;
      filament(branch, 0, growth, branch.depth < 2 ? "#536448" : "#899475", weight);
      // Pale edges and tiny lateral hairs give each root a tapered, fibrous texture.
      filament(branch, 0, growth, "rgba(193,196,156,.48)", weight * .3);
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
        context.strokeStyle = "rgba(109,127,86,.42)";
        context.lineWidth = .55 * size; context.stroke();
      }
    }

    const travel = clamp((progress - .74) / .25) * route.length;
    route.forEach(({ branch, reverse }, index) => {
      const growth = clamp(travel - index);
      if (growth) filament(branch, reverse ? 1 : 0, reverse ? 1 - growth : growth, "rgba(190,79,57,.72)", 1.5 * size);
    });
    if (travel > 0 && travel < route.length) {
      const { branch, reverse } = route[Math.floor(travel)];
      const t = travel % 1;
      const p = project(at(branch, reverse ? 1 - t : t));
      const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14 * size);
      glow.addColorStop(0, "rgba(237,110,65,.45)");
      glow.addColorStop(1, "rgba(237,110,65,0)");
      context.fillStyle = glow;
      context.fillRect(p.x - 14 * size, p.y - 14 * size, 28 * size, 28 * size);
    }
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  resize();
  window.addEventListener("resize", resize);
  document.fonts.ready.then(draw);
  return { state, draw };
}
