// The same studded, isometric shapes used by the landing-page building animation.
const bricks = {
  blossom: { width: 2, depth: 2, height: 1, colors: ["#e99ca8", "#bd647a", "#8e425b"] },
  nsite: { width: 4, depth: 2, height: 0.45, colors: ["#83b8ce", "#52869f", "#345b74"] },
  fips: { width: 4, depth: 1, height: 1, colors: ["#9ab88a", "#6b8e60", "#456345"] },
  nostr: { width: 2, depth: 3, height: 1, colors: ["#b8a0da", "#8a6bb3", "#604783"] },
  ecash: { width: 2, depth: 2, height: 0.45, colors: ["#edc574", "#c69444", "#91682f"] },
  mls: { width: 1, depth: 2, height: 1.6, colors: ["#8bbfb6", "#58958c", "#35655f"] },
  marmot: { width: 3, depth: 2, height: 1, colors: ["#eee8dd", "#c4bfb6", "#9f9b95"] },
  mdk: { width: 3, depth: 2, height: 1, colors: ["#e98864", "#bc5d43", "#853e32"], corner: true },
};

export function renderProjectBrick(slug) {
  const brick = bricks[slug];
  if (!brick) throw new Error(`Missing building block for ${slug}`);
  const { width, depth, height, colors, corner } = brick;
  const unit = 14;
  const project = (x, y, z) => [60 + (x - y - (width - depth) / 2) * unit, 45 + (x + y - (width + depth) / 2) * unit * 0.4 - (z - height / 2) * unit * 1.2];
  const polygon = (points, fill) => `<polygon points="${points.map(p => project(...p).join(",")).join(" ")}" fill="${fill}"/>`;
  const piece = (x, y, w, d) => {
    let result = polygon([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,height],[x,y+d,height]], colors[1]);
    result += polygon([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,height],[x+w,y,height]], colors[2]);
    result += polygon([[x,y,height],[x+w,y,height],[x+w,y+d,height],[x,y+d,height]], colors[0]);
    for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) {
      const [cx, cy] = project(x+i+0.5, y+j+0.5, height);
      result += `<path d="M${cx-4.1} ${cy-2.5}v2.5a4.1 1.85 0 0 0 8.2 0v-2.5" fill="${colors[1]}"/><ellipse cx="${cx}" cy="${cy-2.5}" rx="4.1" ry="1.85" fill="${colors[0]}"/>`;
    }
    return result;
  };
  // A corner piece for the toolkit: two interlocking directions to build on.
  const shape = corner ? piece(0, 0, width, 1) + piece(0, 1, 1, 1) : piece(0, 0, width, depth);
  return `<svg class="project-brick" viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><g stroke="#080808" stroke-opacity=".24" stroke-width=".7" stroke-linejoin="round">${shape}</g></svg>`;
}
