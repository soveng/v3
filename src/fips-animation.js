// A mycelium-inspired mesh. All growth and packet movement follow the scroll.
export function createFipsAnimation(canvas, reducedMotion) {
  const context = canvas.getContext("2d");
  const state = { progress: reducedMotion ? 1 : 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const noise = seed => Math.sin(seed * 127.1 + 31.7) * .5 + .5;
  const nodes = Array.from({ length: 35 }, (_, index) => {
    const column = index % 7;
    const row = Math.floor(index / 7);
    return {
      x: .12 + column * .125 + (noise(index) - .5) * .055,
      y: .32 + row * .105 + (noise(index + 55) - .5) * .08,
      // Separate colonies spread from opposite sides before joining.
      arrival: Math.min(column, 6 - column) * .09 + row * .035,
    };
  });
  const edges = [];
  for (let index = 0; index < nodes.length; index++) {
    if (index % 7 < 6) edges.push([index, index + 1]);
    if (index < 28) edges.push([index, index + 7]);
    if (index < 28 && index % 7 < 6 && index % 2 === 0) edges.push([index, index + 8]);
  }
  const route = [14, 15, 8, 9, 10, 17, 18, 19, 20];

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    if (!width || !height) return;
    const progress = clamp(state.progress);
    const spread = Math.min(width, 1200);
    const card = canvas.closest(".project-plant");
    const copyHeight = card.querySelector(".plant-copy").offsetHeight;
    const meshHeight = Math.max(120, Math.min(height, card.clientHeight - copyHeight - 48));
    const point = index => ({
      x: (width - spread) / 2 + nodes[index].x * spread,
      y: nodes[index].y / .8 * meshHeight,
    });
    const curve = (a, b, t, bend) => {
      const start = point(a);
      const end = point(b);
      return {
        x: start.x + (end.x - start.x) * t + Math.sin(t * Math.PI) * bend,
        y: start.y + (end.y - start.y) * t + Math.sin(t * Math.PI * 2) * bend * .5,
      };
    };
    function thread(a, b, growth, offset = 0) {
      const bend = (noise(a * 7 + b) - .5) * Math.min(40, width * .05);
      context.beginPath();
      for (let step = 0; step <= 24; step++) {
        const p = curve(a, b, step / 24 * growth, bend);
        if (!step) context.moveTo(p.x + offset, p.y);
        else context.lineTo(p.x + offset, p.y);
      }
      context.stroke();
    }

    context.lineCap = "round";
    // Fine secondary filaments keep the network organic rather than a rigid grid.
    for (const [a, b] of edges) {
      const arrival = Math.max(nodes[a].arrival, nodes[b].arrival);
      const growth = smooth((progress - arrival) / .25);
      if (!growth) continue;
      context.globalAlpha = growth;
      context.strokeStyle = "#9aa48c";
      context.lineWidth = .65;
      thread(a, b, growth, 3);
      context.strokeStyle = "#486448";
      context.lineWidth = 1.4;
      thread(a, b, growth);
    }
    context.globalAlpha = 1;

    // A signal hops along one route once the colonies have connected.
    const travel = clamp((progress - .62) / .36) * (route.length - 1);
    context.strokeStyle = "#ed3238";
    context.lineWidth = 2;
    for (let index = 0; index < route.length - 1; index++) {
      const growth = clamp(travel - index);
      if (growth) thread(route[index], route[index + 1], growth);
    }

    nodes.forEach((node, index) => {
      const growth = smooth((progress - node.arrival) / .2);
      if (!growth) return;
      const p = point(index);
      const routeIndex = route.indexOf(index);
      const reached = progress > .62 && routeIndex >= 0 && routeIndex <= travel;
      context.globalAlpha = growth;
      context.beginPath();
      context.arc(p.x, p.y, (reached ? 4.5 : 3) * growth, 0, Math.PI * 2);
      context.fillStyle = reached ? "#ed3238" : "#486448";
      context.fill();
      context.beginPath();
      context.arc(p.x, p.y, (reached ? 10 : 7) * growth, 0, Math.PI * 2);
      context.strokeStyle = reached ? "rgba(237,50,56,.25)" : "rgba(72,100,72,.2)";
      context.lineWidth = 1;
      context.stroke();
    });
    context.globalAlpha = 1;

    if (travel > 0 && travel < route.length - 1) {
      const hop = Math.floor(travel);
      const a = route[hop];
      const b = route[hop + 1];
      const bend = (noise(a * 7 + b) - .5) * Math.min(40, width * .05);
      const p = curve(a, b, travel - hop, bend);
      const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22);
      glow.addColorStop(0, "rgba(237,50,56,.4)");
      glow.addColorStop(1, "rgba(237,50,56,0)");
      context.fillStyle = glow;
      context.fillRect(p.x - 22, p.y - 22, 44, 44);
      context.fillStyle = "#ed3238";
      context.beginPath();
      context.arc(p.x, p.y, 5, 0, Math.PI * 2);
      context.fill();
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
