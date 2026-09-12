import "./footer-animation.js";
import "./testimonials.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animatePodcast } from "./podcast-animation";
import { createPlantAnimation } from "./plant-animation";
import { animateIceberg } from "./iceberg-animation";
import { animateShip } from "./ship-animation";
import { animateBlocks } from "./blocks-animation";
import { animateDemo } from "./demo-animation";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function forceScrollTop() {
  if (location.hash) return;
  const previousBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.style.scrollBehavior = previousBehavior;
}

forceScrollTop();
window.addEventListener("load", forceScrollTop, { once: true });
window.addEventListener("pageshow", forceScrollTop);

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
animateIceberg(reduced);
animateShip(reduced);
animateDemo(reduced);
animateBlocks(reduced);
animatePodcast(reduced);

// Hold the scene for one breath, using the same scrolling model as the opening.
if (!reduced) {
  const breathSection = document.querySelector(".chapter-break");
  const breathStage = breathSection.querySelector(".breath-stage");
  const cloud = breathSection.querySelector(".breath-cloud");
  breathSection.classList.add("breathing-scroll");
  gsap.set(cloud, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: .68, opacity: .45 });
  gsap.timeline({
    scrollTrigger: {
      trigger: breathSection,
      start: "top top",
      end: () => "+=" + (breathSection.offsetHeight - breathStage.offsetHeight),
      scrub: .8,
      invalidateOnRefresh: true,
    },
  })
    .to(cloud, { scale: 1, opacity: .9, duration: 4, ease: "sine.inOut" })
    .to(cloud, { scale: .68, opacity: .45, duration: 6, ease: "sine.inOut" })
    .fromTo(breathSection.querySelector(".chapter-body"), { "--breath-drift": "0px" }, {
      "--breath-drift": () => `${Math.min(64, breathStage.clientHeight * .07)}px`,
      duration: 10,
      ease: "none",
    }, 0);
}

const homeNav = document.querySelector(".nav-home");
const updateNav = trigger => {
  const visible = trigger.progress > 0;
  homeNav.classList.toggle("is-visible", visible);
  homeNav.inert = !visible;
};
ScrollTrigger.create({
  trigger: ".ice-journey",
  start: () => {
    if (reduced) return "top top";
    const section = document.querySelector(".ice-journey");
    const distance = section.offsetHeight - section.querySelector(".ice-stage").offsetHeight;
    // Break the ice occupies the first 43% of the shared iceberg sequence.
    return `top+=${distance * .43 * .5} top`;
  },
  end: "max",
  onUpdate: updateNav,
  onRefresh: updateNav,
});

const SHARD_COLUMNS = 125;
const SHARD_ROWS = 80;
const SHARD_COUNT = SHARD_COLUMNS * SHARD_ROWS;

function createShardGlobe(canvas, image) {
  const context = canvas.getContext("2d", { alpha: true });
  const state = { progress: 0, rotation: 0 };
  const shards = Array.from({ length: SHARD_COUNT }, (_, index) => ({
    column: index % SHARD_COLUMNS,
    row: Math.floor(index / SHARD_COLUMNS),
    scatterX: Math.sin(index * 91.137) * .22,
    scatterY: Math.cos(index * 47.713) * .22,
    angle: Math.sin(index * 17.17) * Math.PI
  }));

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }

  function render() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const viewRatio = width / height;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;
    if (imageRatio > viewRatio) {
      sourceWidth = image.naturalHeight * viewRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / viewRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    const targetWidth = width / SHARD_COLUMNS;
    const targetHeight = height / SHARD_ROWS;
    const sourceTileWidth = sourceWidth / SHARD_COLUMNS;
    const sourceTileHeight = sourceHeight / SHARD_ROWS;
    const radius = Math.min(width, height) * .31;
    const centerX = width / 2;
    const centerY = height / 2;
    const assembleProgress = gsap.utils.clamp(0, 1, state.progress / .32);
    const rawFlattenProgress = gsap.utils.clamp(0, 1, (state.progress - .48) / .32);
    const flattenProgress = rawFlattenProgress * rawFlattenProgress * (3 - 2 * rawFlattenProgress);
    const flightScatter = Math.sin(flattenProgress * Math.PI) * Math.max(width, height) * .045;

    const projected = shards.map(shard => {
      const madeiraLongitude = -16.9595 * Math.PI / 180;
      const madeiraLatitude = 32.7607 * Math.PI / 180;
      const worldLongitude = ((shard.column + .5) / SHARD_COLUMNS) * Math.PI * 2 - Math.PI;
      const longitude = worldLongitude - madeiraLongitude + state.rotation;
      const latitude = Math.PI / 2 - ((shard.row + .5) / SHARD_ROWS) * Math.PI;
      const latitudeRadius = Math.cos(latitude);
      const worldY = Math.sin(latitude);
      const worldZ = latitudeRadius * Math.cos(longitude);
      const centeredY = worldY * Math.cos(madeiraLatitude) - worldZ * Math.sin(madeiraLatitude);
      const depth = worldY * Math.sin(madeiraLatitude) + worldZ * Math.cos(madeiraLatitude);
      const sphereX = centerX + latitudeRadius * Math.sin(longitude) * radius;
      const sphereY = centerY - centeredY * radius;
      const depthScale = .28 + ((depth + 1) / 2) * .72;
      return { ...shard, depth, depthScale, sphereX, sphereY };
    }).sort((a, b) => a.depth - b.depth);

    projected.forEach(shard => {
      const targetX = shard.column * targetWidth + targetWidth / 2;
      const targetY = shard.row * targetHeight + targetHeight / 2;
      const cloudX = shard.sphereX + shard.scatterX * Math.max(width, height) * 1.9;
      const cloudY = shard.sphereY + shard.scatterY * Math.max(width, height) * 1.9;
      const globeX = gsap.utils.interpolate(cloudX, shard.sphereX, assembleProgress);
      const globeY = gsap.utils.interpolate(cloudY, shard.sphereY, assembleProgress);
      const x = gsap.utils.interpolate(globeX, targetX, flattenProgress) + shard.scatterX * flightScatter;
      const y = gsap.utils.interpolate(globeY, targetY, flattenProgress) + shard.scatterY * flightScatter;
      const globeSize = Math.max(2.4, Math.min(targetWidth, targetHeight) * .5) * shard.depthScale;
      const cloudSize = Math.max(1.2, globeSize * .34);
      const formedSize = gsap.utils.interpolate(cloudSize, globeSize, assembleProgress);
      const tileWidth = gsap.utils.interpolate(formedSize, targetWidth + .35, flattenProgress);
      const tileHeight = gsap.utils.interpolate(formedSize, targetHeight + .35, flattenProgress);
      const rotation = shard.angle * (1 - assembleProgress * .82) * (1 - flattenProgress);
      const shade = .28 + ((shard.depth + 1) / 2) * .72;

      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      const shardAlpha = gsap.utils.interpolate(.55, shade, assembleProgress) * (1 - flattenProgress) + flattenProgress;
      context.globalAlpha = shardAlpha;
      context.drawImage(
        image,
        sourceX + shard.column * sourceTileWidth,
        sourceY + shard.row * sourceTileHeight,
        sourceTileWidth + .2,
        sourceTileHeight + .2,
        -tileWidth / 2,
        -tileHeight / 2,
        tileWidth,
        tileHeight
      );
      context.restore();
    });

  }

  resize();
  window.addEventListener("resize", resize);
  return { state, render };
}


async function runExperience() {
  gsap.set(".prologue", { display: "grid" });
  const cityImage = document.querySelector(".city img");
  try { await cityImage.decode(); } catch { /* Browser can still draw loaded fallback. */ }
  const shardCanvas = document.querySelector(".shard-canvas");
  const globe = createShardGlobe(shardCanvas, cityImage);

  document.body.classList.add("sharding");
  document.body.style.overflow = "hidden";
  gsap.set(".title-line", { opacity: 0 });
  gsap.set(".opening-kicker", { opacity: 0 });
  const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
  opening
    .from(".prologue-mark", { opacity: 0, scale: .7, duration: .6 })
    .from(".prologue-code", { opacity: 0, y: 8, duration: .35 }, "<.15")
    .from(".prologue-line span", { scaleX: 0, duration: 1.1, ease: "power2.inOut" }, "<.1")
    .from(".prologue-status", { opacity: 0, duration: .35 })
    .to(".prologue", { clipPath: "inset(0 0 100% 0)", duration: .85, ease: "power4.inOut", delay: .3, onComplete: () => {
      gsap.set(".prologue", { display: "none" });
      document.body.style.overflow = "";
      ScrollTrigger.refresh();
    }})
    .from(".opening-meta", { opacity: 0, duration: .6 }, "<.3");

  gsap.to(".city-bloom", { scale: 1.25, opacity: .55, duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

  const firstLine = "Build the tools.";
  const secondLine = "Ship the future.";
  const totalCharacters = firstLine.length + secondLine.length;
  const firstTarget = document.querySelector(".typed-one");
  const secondTarget = document.querySelector(".typed-two");
  let shardFrame = 0;
  const scheduleShardRender = () => {
    if (shardFrame) return;
    shardFrame = requestAnimationFrame(() => {
      shardFrame = 0;
      globe.render();
    });
  };

  ScrollTrigger.create({
    trigger: ".opening",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: self => {
      const progress = self.progress;
      globe.state.progress = progress;
      const assembleProgress = gsap.utils.clamp(0, 1, progress / .32);
      const flattenProgress = gsap.utils.clamp(0, 1, (progress - .48) / .32);
      const spinProgress = gsap.utils.clamp(0, 1, (progress - .32) / .16);
      globe.state.rotation = gsap.utils.interpolate(-.7, 0, assembleProgress) + spinProgress * Math.PI * 4 + flattenProgress * .15;
      scheduleShardRender();

      const rawBlendProgress = gsap.utils.clamp(0, 1, (progress - .76) / .1);
      const blendProgress = rawBlendProgress * rawBlendProgress * (3 - 2 * rawBlendProgress);
      document.body.classList.remove("sharding");
      gsap.set(cityImage, { opacity: blendProgress });
      gsap.set(shardCanvas, { display: blendProgress >= 1 ? "none" : "block", opacity: 1 - blendProgress });
      const dimProgress = gsap.utils.clamp(0, 1, (progress - .7) / .1);
      const brightness = gsap.utils.interpolate(1.35, .42, dimProgress);
      const saturation = gsap.utils.interpolate(1.2, .7, dimProgress);
      shardCanvas.style.filter = `brightness(${brightness}) saturate(${saturation}) contrast(1.25)`;

      const typeProgress = gsap.utils.clamp(0, 1, (progress - .82) / .16);
      const visibleCharacters = Math.floor(typeProgress * totalCharacters);
      firstTarget.textContent = firstLine.slice(0, Math.min(firstLine.length, visibleCharacters));
      secondTarget.textContent = secondLine.slice(0, Math.max(0, visibleCharacters - firstLine.length));
      gsap.set(".title-line", { opacity: visibleCharacters > 0 ? 1 : 0 });
      gsap.set(".opening-kicker", { opacity: gsap.utils.clamp(0, 1, (progress - .76) / .08) });
      gsap.set(".ghost-word", { yPercent: progress * -70, opacity: progress * .7 });
      gsap.set(".opening-meta", { opacity: 1 - gsap.utils.clamp(0, 1, (progress - .72) / .12) });
    }
  });

  gsap.utils.toArray(".manifesto-copy p").forEach((line, index) => {
    gsap.from(line, { x: index % 2 ? 80 : -80, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: line, start: "top 85%" } });
  });

  gsap.utils.toArray(".chapter").forEach(chapter => {
    if (chapter.closest(".ice-journey")) return;
    gsap.from(chapter.querySelector("h2"), { yPercent: 70, opacity: 0, duration: 1, ease: "power4.out", scrollTrigger: { trigger: chapter, start: "top 60%" } });
    gsap.from(chapter.querySelector(".chapter-body"), { y: 40, opacity: 0, duration: .8, delay: .2, scrollTrigger: { trigger: chapter, start: "top 55%" } });
    const numeral = chapter.querySelector(".chapter-number");
    if (numeral) gsap.to(numeral, { yPercent: -18, scrollTrigger: { trigger: chapter, start: "top bottom", end: "bottom top", scrub: 1 } });
  });

  gsap.utils.toArray(".project-plant").forEach((project, index) => {
    const plant = project.querySelector(".botanical");
    const renderer = createPlantAnimation(plant, plant.dataset.species, index + 1, reduced);
    const copy = project.querySelector(".plant-copy");
    ScrollTrigger.create({
      trigger: project,
      start: "top 88%",
      end: "bottom 52%",
      scrub: true,
      onUpdate: self => {
        renderer.state.progress = self.progress;
        renderer.draw();
        const copyProgress = gsap.utils.clamp(0, 1, (self.progress - .72) / .2);
        gsap.set(plant, { rotate: ["mycelium", "mangrove"].includes(plant.dataset.species) ? 0 : (index % 2 ? 1 : -1) * 10 * self.progress, transformOrigin: "50% 100%" });
        gsap.set(copy, { opacity: copyProgress, y: (1 - copyProgress) * 32 });
      }
    });
  });
  gsap.from(".finale-main h2", { y: 100, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".finale", start: "top 55%" } });
}

if (!reduced) {
  // Earlier scenes expand the document as their scroll classes are added.
  // Measure every trigger again once all scenes and fonts have settled.
  Promise.all([runExperience(), document.fonts.ready]).then(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
} else {
  document.querySelectorAll(".botanical").forEach((plant, index) => {
    createPlantAnimation(plant, plant.dataset.species, index + 1, reduced);
  });
}

const light = document.querySelector(".cursor-light");
window.addEventListener("pointermove", event => {
  if (reduced) return;
  gsap.to(light, { x: event.clientX, y: event.clientY, duration: 1.2, ease: "power3.out" });
  if (window.scrollY < window.innerHeight * 2.4) {
    const x = event.clientX / window.innerWidth - .5;
    const y = event.clientY / window.innerHeight - .5;
    gsap.to(".city img", { x: x * -24, y: y * -16, duration: 1.5, ease: "power3.out", overwrite: "auto" });
  }
});

document.querySelectorAll('a[href="#"]').forEach(link => link.addEventListener("click", event => event.preventDefault()));
