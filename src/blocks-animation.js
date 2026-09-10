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
  // Two towers grow separately, then join across the gap.
  for (let v = 0; v < 3; v++) {
    for (let u = 0; u < 8; u += 2) bricks.push({ u, v, z: 0 });
  }
  for (let z = 1; z <= 2; z++) {
    for (let v = 0; v < 3; v++) {
      for (const u of [0, 6]) bricks.push({ u, v, z });
    }
  }
  for (const u of [0, 2, 4, 6]) bricks.push({ u, v: 1, z: 3 });
  bricks.push({ u: 0, v: 1, z: 4 }, { u: 6, v: 1, z: 4 }, { u: 6, v: 1, z: 5 });
  let frame = 0;

  function draw() {
    frame = 0;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const unit = Math.min(width / 12, height / 11);
    const originX = width * .31;
    const originY = height * .53;
    const project = (u, v, z, fall = 0) => ({
      x: originX + (u - v) * unit,
      y: originY + (u + v) * unit * .4 - z * unit * .7 - fall,
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

    bricks.forEach(({ u, v, z }, index) => {
      const arrival = index / bricks.length * .88;
      const raw = clamp((state.progress - arrival) / .12);
      if (!raw) return;
      const settled = 1 - Math.pow(1 - raw, 3);
      const fall = (1 - settled) * unit * 4;
      const color = colors[z === 3 ? 1 : (index + z) % 3];
      const gap = .035;
      const x = u + gap, y = v + gap;
      const length = 2 - gap * 2, depth = 1 - gap * 2;
      const top = z + .9;
      const a = project(x, y, top, fall);
      const b = project(x + length, y, top, fall);
      const c = project(x + length, y + depth, top, fall);
      const d = project(x, y + depth, top, fall);
      context.globalAlpha = Math.min(1, raw * 3);
      face([b, project(x + length, y, z, fall), project(x + length, y + depth, z, fall), c], color[2]);
      face([d, c, project(x + length, y + depth, z, fall), project(x, y + depth, z, fall)], color[1]);
      face([a, b, c, d], color[0]);
      for (const offset of [.5, 1.5]) {
        const stud = project(u + offset, v + .5, top, fall);
        const radius = unit * .22;
        context.fillStyle = color[1];
        context.beginPath();
        context.ellipse(stud.x, stud.y, radius, radius * .47, 0, 0, Math.PI);
        context.lineTo(stud.x - radius, stud.y - unit * .1);
        context.ellipse(stud.x, stud.y - unit * .1, radius, radius * .47, 0, Math.PI, Math.PI * 2);
        context.closePath();
        context.fill();
        context.fillStyle = color[0];
        context.beginPath();
        context.ellipse(stud.x, stud.y - unit * .1, radius, radius * .47, 0, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "rgba(255,255,255,.22)";
        context.stroke();
      }
    });
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
