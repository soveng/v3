import { createFipsAnimation } from "./fips-animation";

export function createPlantAnimation(canvas, species, seed, reduced = false, options = {}) {
  if (species === "mycelium") return createFipsAnimation(canvas, reduced, options);
  // Keep the original garden palette; standalone pages opt into brighter ink.
  const color = (light, dark) => options.theme === "dark" ? dark : light;
  const context = canvas.getContext("2d");
  const state = { progress: reduced ? 1 : 0 };
  const speciesConfig = {
    cherry: { height: .7, leaves: 17, leafLength: .13, leafWidth: .027, trunk: color("#553a35", "#a78072"), trunkWidth: 8, leaf: color("#4c7148", "#86ac72"), accent: "#ed7e91", flowers: 21, crown: false, shape: "pointed" },
    cashew: { height: 0, leaves: 0, leafLength: 0, leafWidth: 0, trunk: "#9b622d", trunkWidth: 0, leaf: "#d8ad68", accent: "#f1cf8b", flowers: 0, crown: false, shape: "cashew" },
    banyan: { height: .8, leaves: 28, leafLength: .16, leafWidth: .045, trunk: color("#604933", "#ac9372"), trunkWidth: 16, leaf: color("#2f6644", "#629d76"), accent: "#ed3238", flowers: 0, crown: true, shape: "broad", roots: false },
    papyrus: { height: .82, leaves: 34, leafLength: .19, leafWidth: .009, trunk: color("#71884d", "#a8b978"), trunkWidth: 7, leaf: color("#5c8b55", "#8eb47d"), accent: "#d9b83e", flowers: 0, crown: true, shape: "needle" },
    mangrove: { height: .67, leaves: 24, leafLength: .13, leafWidth: .035, trunk: color("#594737", "#aa9276"), trunkWidth: 13, leaf: color("#346c52", "#6caa87"), accent: "#ed3238", flowers: 0, crown: false, shape: "broad", roots: false },
    dandelion: { height: .65, leaves: 25, leafLength: .11, leafWidth: .025, trunk: color("#3d6b42", "#83a773"), trunkWidth: 6, leaf: color("#386f45", "#79a86e"), accent: "#ed3e2f", flowers: 12, crown: false, shape: "pointed" }
  };
  const config = speciesConfig[species];
  const papyrusCrownCache = new Map();
  let papyrusCacheWidth = 0;
  const puzzleGlobe = species === "banyan" ? new Image() : null;
  if (puzzleGlobe) {
    puzzleGlobe.onload = () => draw();
    puzzleGlobe.src = "/images/wikipedia-globe.svg";
  }
  if (species === "mangrove") canvas.dataset.rootX = .5 + Math.sin(seed) * .012;

  const smooth = value => value * value * (3 - 2 * value);
  const clamp = value => Math.max(0, Math.min(1, value));
  const noise = value => Math.sin((value + seed * 17.13) * 91.73) * .5 + .5;
  const cashews = [10, 8, 7, 5, 3, 1].flatMap((count, row) =>
    Array.from({ length: count }, (_, column) => ({
      row,
      x: (column - (count - 1) / 2) / 10 + (noise(row * 13 + column) - .5) * .018,
      y: row * .073,
      rotation: (noise(row * 31 + column + 70) - .5) * 1.8,
      scale: .82 + noise(row * 17 + column + 140) * .32
    }))
  );

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (papyrusCacheWidth !== Math.round(width * ratio)) {
      papyrusCrownCache.clear();
      papyrusCacheWidth = Math.round(width * ratio);
    }
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function stemPoint(t, width, height) {
    const rootX = width / 2;
    const rootY = height * .96;
    const lean = (seed % 2 ? -1 : 1) * width * .035;
    return {
      x: rootX + Math.sin(t * Math.PI * 1.35 + seed) * width * .012 + lean * t,
      y: rootY - t * height * config.height
    };
  }

  function drawStem(progress, width, height) {
    const stemGrowth = smooth(clamp(progress / .58));
    context.beginPath();
    for (let step = 0; step <= 50; step += 1) {
      const t = stemGrowth * step / 50;
      const point = stemPoint(t, width, height);
      if (step === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.strokeStyle = config.trunk;
    context.lineWidth = config.trunkWidth;
    context.lineCap = "round";
    context.stroke();
    context.strokeStyle = "rgba(255,255,255,.18)";
    context.lineWidth = 1.2;
    context.stroke();
  }

  function drawLeaf(x, y, angle, length, width, growth, color, shape) {
    if (growth <= 0) return;
    const grownLength = length * growth;
    const shapeWidth = shape === "coin" ? 1.5 : shape === "needle" ? .48 : shape === "broad" ? 1.2 : 1;
    const grownWidth = width * shapeWidth * Math.sin(growth * Math.PI / 2);
    const endX = x + Math.cos(angle) * grownLength;
    const endY = y + Math.sin(angle) * grownLength;
    const normalX = -Math.sin(angle) * grownWidth;
    const normalY = Math.cos(angle) * grownWidth;
    const bend = (shape === "needle" ? .08 : .2) * grownLength;
    const bendX = -Math.sin(angle) * bend;
    const bendY = Math.cos(angle) * bend;

    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(
      x + (endX - x) * .34 + normalX + bendX,
      y + (endY - y) * .34 + normalY + bendY,
      x + (endX - x) * .75 + normalX * .5,
      y + (endY - y) * .75 + normalY * .5,
      endX,
      endY
    );
    context.bezierCurveTo(
      x + (endX - x) * .75 - normalX * .5,
      y + (endY - y) * .75 - normalY * .5,
      x + (endX - x) * .34 - normalX + bendX,
      y + (endY - y) * .34 - normalY + bendY,
      x,
      y
    );
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = "rgba(8,35,19,.5)";
    context.lineWidth = 1;
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo((x + endX) / 2 + bendX, (y + endY) / 2 + bendY, endX, endY);
    context.strokeStyle = "rgba(238,232,221,.38)";
    context.stroke();
  }

  function drawLeaves(progress, width, height) {
    // Keep the banyan canopy within its vertical drawing space on wide screens.
    const leafScale = species === "banyan" ? Math.min(width, height * 1.2) : width;
    for (let index = 0; index < config.leaves; index += 1) {
      const fraction = index / Math.max(1, config.leaves - 1);
      const threshold = .14 + fraction * .68;
      const growth = smooth(clamp((progress - threshold) / .2));
      let attach = config.crown ? .72 + (index % 4) * .055 : .18 + fraction * .75;
      let angle;
      if (config.crown) {
        angle = -Math.PI + .24 + fraction * (Math.PI - .48);
      } else {
        const side = index % 2 ? 1 : -1;
        angle = side > 0 ? -.55 - noise(index) * .35 : -2.6 + noise(index) * .35;
      }
      angle += (noise(index + 40) - .5) * .22;
      const point = stemPoint(attach, width, height);
      const length = leafScale * config.leafLength * (.68 + noise(index + 80) * .45);
      const leafWidth = leafScale * config.leafWidth * (.75 + noise(index + 120) * .4);
      const shade = index % 3 === 0 ? config.leaf : index % 3 === 1 ? color("#315f3d", "#568966") : color("#54834a", "#8ab474");
      drawLeaf(point.x, point.y, angle, length, leafWidth, growth, shade, config.shape);
    }
  }

  function drawFlowers(progress, width, height) {
    const flowerNoise = index => {
      const value = Math.sin(index * 127.1 + seed * 31.7) * 43758.5453;
      return value - Math.floor(value);
    };
    for (let index = 0; index < config.flowers; index += 1) {
      const threshold = species === "cherry" ? .58 + index / config.flowers * .22 : .62 + index * .025;
      const growth = smooth(clamp((progress - threshold) / .2));
      if (!growth) continue;
      const side = index % 2 ? 1 : -1;
      let x, y;
      if (species === "cherry") {
        // Use the same geometry as the leaves, so every bloom rests on the plant.
        const leafIndex = index < 12 ? index + 5 : index - 4;
        const fraction = leafIndex / (config.leaves - 1);
        const point = stemPoint(.18 + fraction * .75, width, height);
        const leafSide = leafIndex % 2 ? 1 : -1;
        let angle = leafSide > 0 ? -.55 - noise(leafIndex) * .35 : -2.6 + noise(leafIndex) * .35;
        angle += (noise(leafIndex + 40) - .5) * .22;
        const leafGrowth = smooth(clamp((progress - (.14 + fraction * .68)) / .2));
        const length = width * config.leafLength * (.68 + noise(leafIndex + 80) * .45) * leafGrowth;
        const position = index < 12 ? .82 : .04;
        x = point.x + Math.cos(angle) * length * position;
        y = point.y + Math.sin(angle) * length * position;
      } else {
        const point = stemPoint(.72 + (index % 4) * .065, width, height);
        x = point.x + side * width * (.025 + index * .007);
        y = point.y - index * 5;
      }
      const radius = species === "cherry"
        ? Math.max(4, Math.min(13, width * .01)) * (.55 + flowerNoise(index + 320) * 1.1) * growth
        : width * .012 * growth;
      context.save();
      context.translate(x, y);
      context.rotate(side * .45);
      const petals = species === "cherry" ? 5 : 4;
      for (let petal = 0; petal < petals; petal += 1) {
        context.rotate(Math.PI * 2 / petals);
        context.beginPath();
        context.ellipse(0, -radius, radius * .7, radius * 1.35, 0, 0, Math.PI * 2);
        context.fillStyle = config.accent;
        context.fill();
      }
      context.beginPath();
      context.arc(0, 0, radius * .45, 0, Math.PI * 2);
      context.fillStyle = "#f1c34b";
      context.fill();
      context.restore();
    }
  }

  function drawCashewPile(progress, width, height) {
    const baseX = width / 2;
    const baseY = height * .9;
    const nutSize = Math.max(22, Math.min(44, width * .035));
    cashews.forEach((nut, index) => {
      const start = index / cashews.length * .88;
      const growth = smooth(clamp((progress - start) / .085));
      if (!growth) return;
      const x = baseX + nut.x * Math.min(width, 980);
      const y = baseY - nut.y * Math.min(width, 820) - (1 - growth) * height * .13;
      context.save();
      context.translate(x, y);
      context.rotate(nut.rotation * growth);
      context.scale(nut.scale * growth, nut.scale * growth);
      context.lineCap = "round";
      context.strokeStyle = "rgba(55,31,15,.22)";
      context.lineWidth = nutSize * .62;
      context.beginPath(); context.moveTo(-nutSize * .28, -nutSize * .36); context.bezierCurveTo(-nutSize * .65, -nutSize * .02, -nutSize * .32, nutSize * .55, nutSize * .2, nutSize * .35); context.stroke();
      context.strokeStyle = index % 3 === 0 ? "#d09a52" : index % 3 === 1 ? "#e0b76f" : "#c78d45";
      context.lineWidth = nutSize * .5;
      context.beginPath(); context.moveTo(-nutSize * .28, -nutSize * .42); context.bezierCurveTo(-nutSize * .68, -nutSize * .06, -nutSize * .34, nutSize * .5, nutSize * .22, nutSize * .3); context.stroke();
      context.strokeStyle = "rgba(255,235,181,.52)";
      context.lineWidth = nutSize * .08;
      context.beginPath(); context.moveTo(-nutSize * .34, -nutSize * .38); context.bezierCurveTo(-nutSize * .55, -.04 * nutSize, -nutSize * .27, nutSize * .27, nutSize * .06, nutSize * .24); context.stroke();
      context.restore();
    });
    // A handful of deliberate zaps land on individual nuts as the pile grows.
    [8, 15, 22, 28, 33].forEach((index, strike) => {
      const nut = cashews[index];
      const start = index / cashews.length * .88 + .055;
      const phase = reduced ? .55 : (progress - start) / .12;
      if (phase <= 0 || phase >= 1 || (reduced && strike % 2 === 0)) return;
      const growth = smooth(clamp((progress - index / cashews.length * .88) / .085));
      const x = baseX + nut.x * Math.min(width, 980);
      const y = baseY - nut.y * Math.min(width, 820) - (1 - growth) * height * .13 - nutSize * .15;
      const length = Math.min(135, Math.max(75, width * .13));
      const side = strike % 2 ? -1 : 1;
      const fade = Math.sin(phase * Math.PI);
      context.save();
      context.globalAlpha = fade;
      context.lineCap = "round";
      context.lineJoin = "round";
      if (!reduced) {
        const points = [[x + side * length * .3, y - length], [x - side * length * .04, y - length * .53], [x + side * length * .2, y - length * .58], [x, y]];
        context.beginPath();
        points.forEach(([px, py], point) => point ? context.lineTo(px, py) : context.moveTo(px, py));
        context.strokeStyle = "rgba(237,50,56,.16)"; context.lineWidth = 9; context.stroke();
        context.strokeStyle = "#ed5834"; context.lineWidth = 3; context.stroke();
        context.strokeStyle = "#ffe2a0"; context.lineWidth = 1; context.stroke();
      }
      const glow = context.createRadialGradient(x, y, 0, x, y, nutSize * 1.25);
      glow.addColorStop(0, "rgba(255,179,56,.5)"); glow.addColorStop(1, "rgba(255,179,56,0)");
      context.fillStyle = glow;
      context.fillRect(x - nutSize * 1.25, y - nutSize * 1.25, nutSize * 2.5, nutSize * 2.5);
      for (let spark = 0; spark < 5; spark++) {
        const angle = Math.PI + (spark + .25) / 5 * Math.PI;
        const distance = nutSize * (.35 + phase * .9);
        context.beginPath();
        context.moveTo(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance);
        context.lineTo(x + Math.cos(angle) * (distance + 5), y + Math.sin(angle) * (distance + 5));
        context.strokeStyle = spark % 2 ? "#ed5834" : "#c89335";
        context.lineWidth = 1.5; context.stroke();
      }
      context.restore();
    });
  }

  function papyrusCrown(index, radius) {
    if (papyrusCrownCache.has(index)) return papyrusCrownCache.get(index);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const extent = Math.ceil(radius * 1.4 + 8);
    const bitmap = document.createElement("canvas");
    bitmap.width = bitmap.height = Math.ceil(extent * 2 * ratio);
    const paint = bitmap.getContext("2d");
    paint.setTransform(ratio, 0, 0, ratio, extent * ratio, extent * ratio);
    paint.lineCap = "round";
      for (let ray = 0; ray < 44; ray++) {
        const angle = ray / 44 * Math.PI * 2;
        const reach = radius * (.65 + noise(ray + index * 53) * .35);
        const dx = Math.cos(angle) * reach;
        const dy = Math.sin(angle) * reach * .48;
        const droop = reach * (.25 + noise(ray + 90) * .15);
        const endX = 0 + dx, endY = 0 + dy + droop;
        paint.beginPath(); paint.moveTo(0, 0);
        paint.bezierCurveTo(0 + dx * .35, 0 + dy * .45 - reach * .22, 0 + dx * .82, 0 + dy - reach * .12, endX, endY);
        paint.strokeStyle = ray % 3 ? color("#66854b", "#a1bc7e") : color("#9aa35a", "#c7cb8b");
        paint.lineWidth = ray % 5 ? .8 : 1.25; paint.stroke();
        // Tiny terminal branchlets give the crown its feathery papyrus texture.
        for (const side of [-1, 1]) {
          paint.beginPath(); paint.moveTo(endX - dx * .09, endY - droop * .35);
          paint.quadraticCurveTo(endX + side * reach * .035, endY - 5, endX + side * reach * .07, endY + 3);
          paint.strokeStyle = color("rgba(121,136,72,.7)", "rgba(173,191,126,.85)"); paint.lineWidth = .55; paint.stroke();
        }
      }
      paint.beginPath(); paint.arc(0, 0, 2, 0, Math.PI * 2);
      paint.fillStyle = color("#56723d", "#91ad6c"); paint.fill();
    const crown = { bitmap, extent };
    papyrusCrownCache.set(index, crown);
    return crown;
  }

  function drawPapyrus(progress, width, height) {
    const spread = Math.min(width, 1000);
    const baseX = width * .5;
    const baseY = height * .96;
    // Bare, slender stems rise from one clump, each ending in a fine umbrella.
    const stalks = [[-.21, .55, .75], [.2, .62, .85], [-.1, .77, .9], [.1, .7, .85], [0, .84, 1]];
    context.lineCap = "round";
    stalks.forEach(([offset, tall, crownScale], index) => {
      const growth = smooth(clamp((progress - index * .045) / .55));
      if (!growth) return;
      const rootX = baseX + (index - 2) * 3;
      const x = baseX + offset * spread;
      const y = baseY - height * tall;
      const topX = rootX + (x - rootX) * growth;
      const topY = baseY + (y - baseY) * growth;
      context.beginPath(); context.moveTo(rootX, baseY);
      context.bezierCurveTo(rootX + offset * spread * .12, baseY - height * tall * growth * .4, topX - offset * spread * .12, topY + height * .15 * growth, topX, topY);
      context.strokeStyle = index % 2 ? color("#668044", "#a1b774") : color("#496a3c", "#7d9e66");
      context.lineWidth = Math.max(2.5, Math.min(5, width * .005)); context.stroke();
      context.strokeStyle = "rgba(205,207,130,.5)"; context.lineWidth = .8; context.stroke();
      const bloom = smooth(clamp((progress - .38 - index * .045) / .4));
      if (!bloom) return;
      const { bitmap, extent } = papyrusCrown(index, Math.min(145, width * .22) * crownScale);
      context.drawImage(bitmap, topX - extent * bloom, topY - extent * bloom, extent * 2 * bloom, extent * 2 * bloom);
    });
  }

  function drawDandelion(progress, width, height) {
    const base = { x: width * .46, y: height * .96 };
    const head = { x: width * .49, y: height * .32 };
    const growth = smooth(clamp(progress / .4));
    const radius = Math.max(44, Math.min(95, width * .15));
    context.lineCap = "round";
    // A basal rosette of toothed leaves leaves the flower stalk bare.
    for (let leaf = 0; leaf < 6; leaf++) {
      const side = leaf % 2 ? 1 : -1;
      const length = Math.min(width * .24, 190) * (.65 + noise(leaf + 55) * .35) * growth;
      context.save(); context.translate(base.x, base.y); context.rotate(side * (.55 + leaf * .12));
      context.beginPath(); context.moveTo(0, 0);
      for (let tooth = 1; tooth <= 8; tooth++) {
        const t = tooth / 9;
        context.lineTo(-Math.sin(t * Math.PI) * length * (tooth % 2 ? .18 : .055), -length * t);
      }
      context.lineTo(0, -length);
      for (let tooth = 8; tooth >= 1; tooth--) {
        const t = tooth / 9;
        context.lineTo(Math.sin(t * Math.PI) * length * (tooth % 2 ? .18 : .055), -length * t);
      }
      context.closePath(); context.fillStyle = leaf % 2 ? color("#567842", "#95b479") : color("#3f673b", "#739860"); context.fill();
      context.beginPath(); context.moveTo(0, 0); context.lineTo(0, -length);
      context.strokeStyle = "rgba(216,222,153,.55)"; context.lineWidth = .8; context.stroke(); context.restore();
    }
    const crownY = base.y + (head.y - base.y) * growth;
    context.beginPath(); context.moveTo(base.x, base.y);
    context.bezierCurveTo(base.x - 12, base.y - height * .24 * growth, head.x + 12, crownY + height * .2 * growth, head.x, crownY);
    context.strokeStyle = color("#6e854a", "#a4bb79"); context.lineWidth = 4; context.stroke();
    context.strokeStyle = "rgba(213,218,153,.5)"; context.lineWidth = 1; context.stroke();
    const bloom = smooth(clamp((progress - .25) / .25));
    if (!bloom) return;
    context.beginPath(); context.arc(head.x, crownY, 7 * bloom, 0, Math.PI * 2);
    context.fillStyle = color("#998a5d", "#c9bd92"); context.fill();
    for (let seedIndex = 0; seedIndex < 42; seedIndex++) {
      const angle = seedIndex * 2.39996;
      const reach = radius * Math.sqrt((seedIndex + 1) / 42) * bloom;
      const departure = .55 + (seedIndex % 13) / 13 * .28;
      const flight = seedIndex % 5 === 0 ? 0 : smooth(clamp((progress - departure) / .3));
      const x = head.x + Math.cos(angle) * reach + flight * width * (.2 + noise(seedIndex + 90) * .3);
      const y = crownY + Math.sin(angle) * reach - flight * height * (.08 + noise(seedIndex + 125) * .2) + Math.sin(flight * Math.PI * 2) * 12;
      const rotation = angle + Math.PI / 2 + flight * .65;
      if (flight === 0) {
        context.beginPath(); context.moveTo(head.x, crownY); context.lineTo(x, y);
        context.strokeStyle = color("rgba(139,143,115,.28)", "rgba(216,222,196,.45)"); context.lineWidth = .6; context.stroke();
      }
      context.save(); context.translate(x, y); context.rotate(rotation); context.globalAlpha = bloom;
      const tuft = Math.max(6, radius * .12);
      context.beginPath(); context.moveTo(0, 9); context.lineTo(0, 0);
      context.strokeStyle = color("#9b8962", "#c9b990"); context.lineWidth = 1; context.stroke();
      for (let hair = 0; hair < 9; hair++) {
        const fan = Math.PI + hair / 8 * Math.PI;
        context.beginPath(); context.moveTo(0, 0);
        context.quadraticCurveTo(Math.cos(fan) * tuft * .5, Math.sin(fan) * tuft * .7, Math.cos(fan) * tuft, Math.sin(fan) * tuft - 2);
        context.strokeStyle = hair % 2 ? color("#b7b9a4", "#ebe9d8") : color("#969d86", "#c4ceb1"); context.lineWidth = .65; context.stroke();
      }
      context.restore();
    }
  }

  function drawKnowledgeFruit(progress, width, height) {
    if (!puzzleGlobe?.complete || !puzzleGlobe.naturalWidth) return;
    const fruits = [[-.075, .79, .9], [.085, .84, 1]];
    fruits.forEach(([offset, attach, scale], index) => {
      const growth = smooth(clamp((progress - .6 - index * .06) / .22));
      if (!growth) return;
      const branch = stemPoint(attach, width, height);
      const x = branch.x + offset * Math.min(width, 1000);
      const y = branch.y + 8;
      const size = Math.max(44, Math.min(76, width * .09)) * scale * growth;
      context.beginPath(); context.moveTo(branch.x, branch.y);
      context.quadraticCurveTo(x, branch.y - 12, x, y + 5);
      context.strokeStyle = color("#604933", "#ac9372"); context.lineWidth = 1.8; context.stroke();
      context.drawImage(puzzleGlobe, x - size / 2, y, size, size * puzzleGlobe.naturalHeight / puzzleGlobe.naturalWidth);
    });
  }

  function drawGroundCover(progress, width, height) {
    const growth = smooth(clamp(progress / .4));
    if (!growth) return;
    const base = stemPoint(0, width, height);
    const spread = Math.min(85, width * .20);
    context.save();
    context.translate(base.x, base.y);
    context.globalAlpha = growth;
    // A low, irregular ground line separates the plant from its underground network.
    context.beginPath();
    context.moveTo(-spread / 2, 3);
    context.bezierCurveTo(-spread * .25, -1, spread * .22, 5, spread / 2, 1);
    context.strokeStyle = color("#8c896b", "#b4b294");
    context.lineWidth = 1.2;
    context.stroke();
    const bladeCount = 42;
    for (let i = 0; i < bladeCount; i++) {
      const t = i / (bladeCount - 1);
      const x = (t - .5) * spread * .92;
      const envelope = Math.sin(t * Math.PI);
      const length = (7 + noise(i + 810) * 23) * (.45 + envelope * .55) * growth;
      const lean = (noise(i + 920) - .5) * 20;
      const y = 2 + Math.sin(i * 2.4) * 1.5;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + lean * .2, y - length * .65, x + lean, y - length);
      context.strokeStyle = [color("#59734b", "#8eab76"), color("#83915b", "#b4c68b"), color("#446647", "#759974")][i % 3];
      context.lineWidth = 1 + noise(i + 730) * .7;
      context.lineCap = 'round';
      context.stroke();
    }
    context.restore();
  }

  function drawAntenna(progress, width, height) {
    const growth = smooth(clamp((progress - .68) / .24));
    if (!growth) return;
    const tip = stemPoint(1, width, height);
    const size = Math.max(28, Math.min(42, width * .035));
    context.save();
    context.translate(tip.x, tip.y);
    context.globalAlpha = growth;
    context.strokeStyle = color("#594737", "#aa9276");
    context.lineWidth = 3;
    context.beginPath(); context.moveTo(0, 0); context.lineTo(0, -82 * growth); context.stroke();
    context.translate(0, -82 * growth);
    context.scale(growth, growth);
    // A rooftop-style directional aerial: reflector, folded dipole, and directors.
    context.rotate(-Math.PI / 10);
    context.strokeStyle = color("#696b60", "#c3c8b5");
    context.lineWidth = 2.5;
    context.beginPath(); context.moveTo(-size, 0); context.lineTo(size * 1.4, 0); context.stroke();
    for (const [position, halfLength] of [[-.9, .72], [.05, .53], [.48, .46], [.9, .39], [1.3, .32]]) {
      context.beginPath();
      context.moveTo(size * position, -size * halfLength);
      context.lineTo(size * position, size * halfLength);
      context.lineWidth = position < 0 ? 2.5 : 1.8;
      context.stroke();
    }
    context.beginPath();
    context.roundRect(-size * .5, -size * .59, size * .17, size * 1.18, size * .08);
    context.lineWidth = 1.8; context.stroke();
    context.fillStyle = "#ed3238";
    context.fillRect(-size * .52, -3, size * .21, 6);
    context.beginPath();
    context.moveTo(-size * .42, 3);
    context.quadraticCurveTo(-size * .3, size * .55, size * .12, size * .58);
    context.strokeStyle = color("#594737", "#aa9276"); context.lineWidth = 1; context.stroke();
    context.restore();
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);
    if (species === "cashew") {
      drawCashewPile(state.progress, width, height);
      return;
    }
    if (species === "dandelion") {
      drawDandelion(state.progress, width, height);
      return;
    }
    if (species === "papyrus") {
      drawPapyrus(state.progress, width, height);
      return;
    }
    if (config.roots) {
      const rootGrowth = smooth(clamp(state.progress / .34));
      const root = stemPoint(0, width, height);
      context.strokeStyle = config.trunk;
      context.lineWidth = config.trunkWidth * .55;
      context.lineCap = "round";
      [-1, 1].forEach(side => {
        context.beginPath(); context.moveTo(root.x, root.y);
        context.bezierCurveTo(root.x + side * width * .035 * rootGrowth, root.y - height * .1 * rootGrowth, root.x + side * width * .09 * rootGrowth, root.y - height * .035, root.x + side * width * .13 * rootGrowth, root.y);
        context.stroke();
      });
    }
    drawStem(state.progress, width, height);
    drawLeaves(state.progress, width, height);
    drawFlowers(state.progress, width, height);
    if (species === "mangrove") {
      drawAntenna(state.progress, width, height);
      drawGroundCover(state.progress, width, height);
    }
    if (species === "banyan") drawKnowledgeFruit(state.progress, width, height);
  }

  resize();
  window.addEventListener("resize", resize);
  return { state, draw };
}

