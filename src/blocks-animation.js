import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function animateBlocks(reducedMotion) {
  const section = document.querySelector(".chapter-alumni");
  const stage = section.querySelector(".blocks-stage");
  const canvas = section.querySelector(".blocks-canvas");
  const context = canvas.getContext("2d");
  const state = { progress: reducedMotion ? 1 : 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const bricks = [];
  const colors = [
    ["#eee8dd", "#c4bfb6", "#9f9b95"],
    ["#ed3238", "#b3232b", "#791b24"],
    ["#648b9c", "#406777", "#284450"],
  ];
  // The upper landing ends on the lower landing's sightline. In projection,
  // all four ascending flights close into one impossible loop.
  const steps = 7;
  const rise = .24;
  const slope = .45;
  const longStep = 1 + 2 * rise / slope;
  const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  let u = 0, v = 0;
  for (let flight = 0; flight < 4; flight++) {
    const [du, dv] = directions[flight];
    const run = flight < 2 ? longStep : 1;
    for (let step = 0; step < steps; step++) {
      const index = flight * steps + step;
      bricks.push({ u: u + du * run * .5, v: v + dv * run * .5,
        z: (index + .5) * rise, du, dv, run, flight, index });
      u += du * run; v += dv * run;
    }
  }
  const rawPoint = (u, v, z) => ({ x: u - v, y: (u + v) * slope - z });
  const outline = bricks.flatMap(brick => {
    const { u, v, z, du, dv, run } = brick;
    return [-1, 1].flatMap(a => [-1, 1].map(b => rawPoint(u + du * run * a / 2 - dv * b, v + dv * run * a / 2 + du * b, z)));
  });
  const bounds = { left: Math.min(...outline.map(p => p.x)), right: Math.max(...outline.map(p => p.x)),
    top: Math.min(...outline.map(p => p.y)) - 1, bottom: Math.max(...outline.map(p => p.y)) + 1.2 };
  let frame = 0;

  function draw() {
    frame = 0;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const unit = Math.min(width * .78 / (bounds.right - bounds.left), height * .72 / (bounds.bottom - bounds.top));
    const originX = width * .54 - (bounds.left + bounds.right) / 2 * unit;
    const originY = height * .57 - (bounds.top + bounds.bottom) / 2 * unit;
    const project = (u, v, z, fall = 0) => {
      const p = rawPoint(u, v, z);
      return { x: originX + p.x * unit, y: originY + p.y * unit - fall };
    };
    function face(points, color) {
      context.beginPath();
      points.forEach((p, index) => index ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
      context.closePath();
      context.fillStyle = color;
      context.fill();
      context.strokeStyle = "rgba(8,8,8,.25)";
      context.lineWidth = .75;
      context.stroke();
    }
    const shadow = context.createRadialGradient(width * .5, originY + unit * 2, 0, width * .5, originY + unit * 2, unit * 5);
    shadow.addColorStop(0, "rgba(100,139,156,.12)");
    shadow.addColorStop(1, "rgba(100,139,156,0)");
    context.fillStyle = shadow;
    context.fillRect(0, originY - unit * 2, width, unit * 6);

    const paintOrder = [3, 0, 2, 1].flatMap(flight => bricks.filter(brick => brick.flight === flight));
    function drawBrick({ u, v, z, du, dv, run, flight, index }) {
      const arrival = index / bricks.length * .86;
      const raw = clamp((state.progress - arrival) / .14);
      if (!raw) return;
      const fall = Math.pow(1 - raw, 3) * unit * 3;
      const color = colors[index === 0 ? 1 : index === 14 ? 2 : 0];
      const point = (along, across, elevation = z) => project(u + du * along - dv * across, v + dv * along + du * across, elevation, fall);
      const half = run * .495;
      const corners = [point(-half, -.98), point(half, -.98), point(half, .98), point(-half, .98)];
      context.globalAlpha = Math.min(1, raw * 4);
      // Visible vertical faces give every tread the same upward step.
      for (let edge = 0; edge < 4; edge++) {
        const a = corners[edge], b = corners[(edge + 1) % 4];
        if (b.x < a.x) face([a, b, { x: b.x, y: b.y + unit * .65 }, { x: a.x, y: a.y + unit * .65 }], edge % 2 ? color[2] : color[1]);
      }
      face(corners, color[0]);
      for (const across of [-.48, .48]) {
        const stud = point(0, across);
        const radius = unit * .2;
        context.fillStyle = color[1];
        context.beginPath(); context.ellipse(stud.x, stud.y, radius, radius * .45, 0, 0, Math.PI * 2); context.fill();
        context.fillStyle = color[0];
        context.beginPath(); context.ellipse(stud.x, stud.y - unit * .09, radius, radius * .45, 0, 0, Math.PI * 2); context.fill();
        context.strokeStyle = "rgba(8,8,8,.22)"; context.lineWidth = .6; context.stroke();
      }
    }
    paintOrder.forEach(drawBrick);
    // This overlap is the impossible joint, revealed as the loop closes.
    if (state.progress > .96) drawBrick(bricks[0]);
    context.globalAlpha = 1;
  }

  const render = () => { if (!frame) frame = requestAnimationFrame(draw); };
  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }
  if (!reducedMotion) {
    section.classList.add("blocks-scroll");
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(state, {
      progress: 1,
      ease: "none",
      onUpdate: render,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + (section.offsetHeight - stage.offsetHeight),
        scrub: .6,
        invalidateOnRefresh: true,
      },
    });
  }
  resize();
  window.addEventListener("resize", resize);
}
