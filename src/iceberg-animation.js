import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function animateIceberg(reducedMotion) {
  const section = document.querySelector(".ice-journey");
  const stage = section.querySelector(".ice-stage");
  const canvas = section.querySelector(".ice-canvas");
  const context = canvas.getContext("2d");
  const intro = section.querySelector(".chapter-intro");
  const deep = section.querySelector(".chapter-build");
  const state = { progress: reducedMotion ? .18 : 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const noise = seed => Math.sin(seed * 91.73 + 17.1) * .5 + .5;
  // Outer edges and a shared, crooked fault line, from summit to submerged base.
  const layers = [
    [-.32, -.08, -.08, -.08], [-.18, -.25, -.025, .09],
    [-.06, -.33, .035, .25], [0, -.43, 0, .4],
    [.3, -.51, -.045, .49], [.7, -.46, .035, .45],
    [1.1, -.4, -.03, .37], [1.55, -.32, .045, .3],
    [2, -.25, -.025, .22], [2.6, -.08, -.08, -.08],
  ];
  const palettes = [
    ["#d4edf0", "#94c8d4", "#5b9cb1", "#b4d9e1"],
    ["#99c5d3", "#497f98", "#70aabd", "#c2dce5"],
  ];
  let frame = 0;

  function draw() {
    frame = 0;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const progress = state.progress;
    const fracture = smooth((progress - .25) / .3);
    const descent = smooth((progress - .43) / .54);
    const unit = Math.min(width * .85, 1080) * (1 + descent * .28);
    const verticalUnit = height * .9;
    const center = width * (.66 - descent * .08);
    const waterline = height * .48 - descent * height * 1.65;
    const gap = fracture * unit * .19;
    const project = (x, y, side = 0) => ({
      x: center + x * unit + side * gap,
      y: waterline + y * verticalUnit,
    });

    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, `rgb(${16 - descent * 13},${37 - descent * 19},${51 - descent * 21})`);
    sky.addColorStop(1, "#050b12");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    if (waterline > 0) {
      const haze = context.createRadialGradient(center, waterline, 0, center, waterline, width * .7);
      haze.addColorStop(0, "rgba(99,164,190,.16)");
      haze.addColorStop(1, "rgba(99,164,190,0)");
      context.fillStyle = haze;
      context.fillRect(0, 0, width, Math.min(waterline, height));
    }

    function triangle(points, color, shade) {
      context.beginPath();
      points.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
      context.closePath();
      context.fillStyle = color;
      context.fill();
      if (shade > 0) {
        context.fillStyle = `rgba(1,25,43,${shade})`;
        context.fill();
      }
    }

    [-1, 1].forEach((side, sideIndex) => {
      const rows = layers.map(([y, left, fault, right], index) => {
        const outer = side < 0 ? left : right;
        const ridge = outer * .52 + fault * .48 + (index ? (noise(index + sideIndex * 20) - .5) * .025 : 0);
        return [project(outer, y, side), project(ridge, y, side), project(fault, y, side)];
      });
      for (let row = 0; row < rows.length - 1; row++) {
        const shade = row < 3 ? 0 : Math.min(.76, .35 + row * .035 + descent * .1);
        for (let strip = 0; strip < 2; strip++) {
          const color = palettes[sideIndex];
          triangle([rows[row][strip], rows[row + 1][strip], rows[row][strip + 1]], color[(row + strip) % 4], shade);
          triangle([rows[row][strip + 1], rows[row + 1][strip], rows[row + 1][strip + 1]], color[(row + strip + 2) % 4], shade);
        }
      }
      // The fresh faces of the split catch the light as the view sinks.
      context.beginPath();
      const reveal = clamp((progress - .12) / .25) * (layers.length - 1);
      for (let index = 0; index <= Math.floor(reveal); index++) {
        const p = project(layers[index][2], layers[index][0], side);
        index ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y);
      }
      if (reveal < layers.length - 1) {
        const index = Math.floor(reveal);
        const t = reveal - index;
        const a = layers[index], b = layers[index + 1];
        const p = project(a[2] + (b[2] - a[2]) * t, a[0] + (b[0] - a[0]) * t, side);
        context.lineTo(p.x, p.y);
      }
      context.strokeStyle = `rgba(177,234,250,${.25 + fracture * .55})`;
      context.lineWidth = 1.5;
      context.stroke();
    });

    // A translucent sea lets the submerged mass become visible before diving.
    const sea = context.createLinearGradient(0, Math.max(0, waterline), 0, height);
    sea.addColorStop(0, "rgba(7,55,76,.33)");
    sea.addColorStop(1, "rgba(2,12,24,.72)");
    context.fillStyle = sea;
    context.fillRect(0, Math.max(0, waterline), width, height);
    if (waterline > -30) {
      for (let index = 0; index < 16; index++) {
        const x = noise(index + 60) * width;
        const y = waterline + noise(index + 90) * 30;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 15 + noise(index + 30) * 70, y);
        context.strokeStyle = `rgba(175,223,232,${.1 + noise(index) * .15})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }
    // Small fragments drift out from the opening fault.
    for (let index = 0; index < 18; index++) {
      const side = index % 2 ? 1 : -1;
      const y = noise(index + 140) * 1.8;
      const p = project(side * fracture * noise(index + 170) * .16, y, side * .35);
      const size = (2 + noise(index + 200) * 7) * fracture;
      if (!size) continue;
      context.globalAlpha = .5 * fracture;
      triangle([{ x: p.x, y: p.y }, { x: p.x + size, y: p.y + size * .5 }, { x: p.x - size * .4, y: p.y + size }], "#9bcbdc", 0);
    }
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
    section.classList.add("ice-animated");
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(deep, { autoAlpha: 0 });
    deep.inert = true;
    gsap.to(state, {
      progress: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + (section.offsetHeight - stage.offsetHeight),
        scrub: .7,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const introOpacity = 1 - smooth((state.progress - .43) / .12);
        const deepOpacity = smooth((state.progress - .55) / .12);
        gsap.set(intro, { autoAlpha: introOpacity });
        gsap.set(deep, { autoAlpha: deepOpacity });
        intro.inert = introOpacity === 0;
        deep.inert = deepOpacity === 0;
        render();
      },
    });
  }
  resize();
  window.addEventListener("resize", resize);
}
