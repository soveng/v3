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
  // A small community house: foundation, open doorway, lintel, stepped roof.
  const add = (u, v, z, length, depth, color) => bricks.push({ u, v, z, length, depth, color, index: bricks.length });
  for (const v of [0, 2]) for (const u of [0, 4]) add(u, v, 0, 4, 2, 2);
  for (const z of [1, 2]) for (const u of [0, 6]) add(u, 0, z, 2, 4, 0);
  for (const v of [0, 2]) for (const u of [0, 4]) add(u, v, 3, 4, 2, 0);
  for (const u of [1, 3, 5]) add(u, 0, 4, 2, 4, 1);
  for (const u of [2, 4]) add(u, 0, 5, 2, 4, 1);
  add(3, 0, 6, 2, 4, 1);
  let frame = 0;

  function draw() {
    frame = 0;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const unit = Math.min(width * .78 / 12, height * .8 / 12);
    const originX = width * .54 - unit * 2;
    const originY = height * .59;
    const project = (u, v, z, fall = 0) => ({
      x: originX + (u - v) * unit,
      y: originY + (u + v) * unit * .4 - z * unit * 1.2 - fall,
    });
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

    function drawBrick({ u, v, z, length, depth, color: colorIndex, index }) {
      const arrival = index / bricks.length * .86;
      const raw = clamp((state.progress - arrival) / .14);
      if (!raw) return;
      const fall = Math.pow(1 - raw, 3) * unit * 3;
      const color = colors[colorIndex];
      const point = (x, y, elevation = z + 1) => project(u + x, v + y, elevation, fall);
      const a = point(.025, .025), b = point(length - .025, .025);
      const c = point(length - .025, depth - .025), d = point(.025, depth - .025);
      context.globalAlpha = Math.min(1, raw * 4);
      face([b, point(length - .025, .025, z), point(length - .025, depth - .025, z), c], color[2]);
      face([d, c, point(length - .025, depth - .025, z), point(.025, depth - .025, z)], color[1]);
      face([a, b, c, d], color[0]);
      for (let x = .5; x < length; x++) {
        for (let y = .5; y < depth; y++) {
          const stud = point(x, y);
          const radius = unit * .29;
          context.fillStyle = color[1];
          context.beginPath(); context.ellipse(stud.x, stud.y, radius, radius * .45, 0, 0, Math.PI * 2); context.fill();
          context.fillStyle = color[0];
          context.beginPath(); context.ellipse(stud.x, stud.y - unit * .18, radius, radius * .45, 0, 0, Math.PI * 2); context.fill();
          context.strokeStyle = "rgba(8,8,8,.22)"; context.lineWidth = .6; context.stroke();
        }
      }
    }
    bricks.forEach(drawBrick);
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
