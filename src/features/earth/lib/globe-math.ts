export type Vec3 = { x: number; y: number; z: number };

export type ProjectedDot = {
  screenX: number;
  screenY: number;
  z: number;
  visible: boolean;
};

const DEG2RAD = Math.PI / 180;

export function latLngToCartesian(lat: number, lng: number): Vec3 {
  const la = lat * DEG2RAD;
  const lo = lng * DEG2RAD;
  return {
    x: Math.cos(la) * Math.sin(lo),
    y: -Math.sin(la),
    z: Math.cos(la) * Math.cos(lo),
  };
}

export function rotatePoint(p: Vec3, rotY: number, rotX: number): Vec3 {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = p.x * cosY - p.z * sinY;
  const z1 = p.x * sinY + p.z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = p.y * cosX - z1 * sinX;
  const z2 = p.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

export function projectToScreen(
  p: Vec3,
  centerX: number,
  centerY: number,
  radius: number,
): ProjectedDot {
  return {
    screenX: centerX + p.x * radius,
    screenY: centerY + p.y * radius,
    z: p.z,
    visible: p.z > 0.02,
  };
}

export function precomputeCartesian(dots: readonly [number, number][]): Float64Array {
  const arr = new Float64Array(dots.length * 3);
  for (let i = 0; i < dots.length; i++) {
    const v = latLngToCartesian(dots[i][0], dots[i][1]);
    arr[i * 3] = v.x;
    arr[i * 3 + 1] = v.y;
    arr[i * 3 + 2] = v.z;
  }
  return arr;
}
