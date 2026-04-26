import { rotatePoint, projectToScreen } from './globe-math';

export type DotColor = [number, number, number];

export type CategoryWeights = {
  person: number;
  place: number;
  thing: number;
};

const PERSON: DotColor = [110, 90, 235];
const PLACE: DotColor = [30, 190, 140];
const THING: DotColor = [250, 165, 30];
const DEFAULT: DotColor = [185, 190, 200];

function smoothColor(
  ox: number,
  oy: number,
  oz: number,
  w: CategoryWeights,
): DotColor {
  const s1 = 0.5 + 0.5 * Math.sin(Math.atan2(oz, ox) * 1.4 + oy * 2.2);
  const s2 = 0.5 + 0.5 * Math.sin(Math.atan2(ox, oy) * 1.1 + oz * 2.8 + 2.1);
  const s3 = 0.5 + 0.5 * Math.sin(Math.atan2(oy, oz) * 1.7 + ox * 1.9 + 4.3);

  const f1 = s1 * w.person;
  const f2 = s2 * w.place;
  const f3 = s3 * w.thing;
  const sum = f1 + f2 + f3 || 1;

  return [
    (PERSON[0] * f1 + PLACE[0] * f2 + THING[0] * f3) / sum,
    (PERSON[1] * f1 + PLACE[1] * f2 + THING[1] * f3) / sum,
    (PERSON[2] * f1 + PLACE[2] * f2 + THING[2] * f3) / sum,
  ];
}

type VisibleDot = {
  sx: number;
  sy: number;
  depth: number;
  r: number;
  g: number;
  b: number;
};

export function drawGlobe(
  ctx: CanvasRenderingContext2D,
  size: number,
  rotY: number,
  rotX: number,
  cartesian: Float64Array,
  weights: CategoryWeights | null,
  dpr: number,
): void {
  const w = size * dpr;
  ctx.clearRect(0, 0, w, w);

  const center = size / 2;
  const radius = size * 0.44;

  drawSphereBase(ctx, center, radius);

  const count = cartesian.length / 3;
  const hasData = weights && (weights.person + weights.place + weights.thing) > 0;

  const visible: VisibleDot[] = [];
  for (let i = 0; i < count; i++) {
    const ox = cartesian[i * 3];
    const oy = cartesian[i * 3 + 1];
    const oz = cartesian[i * 3 + 2];

    const p = rotatePoint({ x: ox, y: oy, z: oz }, rotY, rotX);
    if (p.z <= 0.05) continue;

    const proj = projectToScreen(p, center, center, radius);
    const depth = Math.min(p.z * 1.3, 1);

    const color = hasData ? smoothColor(ox, oy, oz, weights!) : DEFAULT;
    visible.push({
      sx: proj.screenX,
      sy: proj.screenY,
      depth,
      r: color[0],
      g: color[1],
      b: color[2],
    });
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();

  const glowSize = Math.max(3, radius / 22);
  for (const dot of visible) {
    const alpha = dot.depth * 0.07;
    const r = glowSize * dot.depth;
    const grad = ctx.createRadialGradient(dot.sx, dot.sy, 0, dot.sx, dot.sy, r);
    grad.addColorStop(0, `rgba(${dot.r | 0},${dot.g | 0},${dot.b | 0},${alpha.toFixed(3)})`);
    grad.addColorStop(1, `rgba(${dot.r | 0},${dot.g | 0},${dot.b | 0},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(dot.sx - r, dot.sy - r, r * 2, r * 2);
  }

  const dotBase = Math.max(1.1, radius / 80);
  for (const dot of visible) {
    const alpha = dot.depth * 0.7;
    ctx.fillStyle = `rgba(${dot.r | 0},${dot.g | 0},${dot.b | 0},${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(dot.sx, dot.sy, dotBase * dot.depth, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  drawSpecularHighlight(ctx, center, radius);
}

function drawSphereBase(ctx: CanvasRenderingContext2D, center: number, radius: number): void {
  const lx = center - radius * 0.2;
  const ly = center - radius * 0.25;

  const grad = ctx.createRadialGradient(lx, ly, 0, center, center, radius);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.6, '#f8f9fc');
  grad.addColorStop(0.85, '#f0f2f7');
  grad.addColorStop(1, '#e8ecf4');

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawSpecularHighlight(ctx: CanvasRenderingContext2D, center: number, radius: number): void {
  const hx = center - radius * 0.3;
  const hy = center - radius * 0.35;
  const hr = radius * 0.3;

  const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
  grad.addColorStop(0, 'rgba(255,255,255,0.25)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}
