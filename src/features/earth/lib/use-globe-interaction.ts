import { useEffect, useRef, useCallback } from 'react';
import { drawGlobe, CategoryWeights } from './globe-renderer';

const AUTO_SPIN = 0.00015;
const FRICTION = 0.94;
const VELOCITY_THRESHOLD = 0.00005;
const MAX_TILT = Math.PI / 3;

type GlobeState = {
  rotY: number;
  rotX: number;
  velY: number;
  velX: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  lastTime: number;
  prevTimestamp: number;
};

export function useGlobeInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cartesian: Float64Array | null,
  weights: CategoryWeights | null,
  size: number,
) {
  const state = useRef<GlobeState>({
    rotY: 0,
    rotX: -0.28,
    velY: 0,
    velX: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    prevTimestamp: 0,
  });

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cartesian) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf: number;

    function frame(timestamp: number) {
      const s = state.current;
      const dt = s.prevTimestamp ? Math.min(timestamp - s.prevTimestamp, 50) : 16;
      s.prevTimestamp = timestamp;

      if (!s.dragging) {
        if (Math.abs(s.velY) > VELOCITY_THRESHOLD || Math.abs(s.velX) > VELOCITY_THRESHOLD) {
          s.rotY += s.velY * dt;
          s.rotX += s.velX * dt;
          s.velY *= FRICTION;
          s.velX *= FRICTION;
        } else {
          s.velY = 0;
          s.velX = 0;
          if (!prefersReducedMotion.current) {
            s.rotY += AUTO_SPIN * dt;
          }
        }
      }

      s.rotX = Math.max(-MAX_TILT, Math.min(MAX_TILT, s.rotX));

      drawGlobe(ctx!, size, s.rotY, s.rotX, cartesian!, weights, dpr);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, cartesian, weights, size]);

  const radius = size * 0.44;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastTime = performance.now();
    s.velY = 0;
    s.velX = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;

    const now = performance.now();
    const dt = Math.max(now - s.lastTime, 1);
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;

    const dRotY = dx / radius;
    const dRotX = -dy / radius;

    s.rotY += dRotY;
    s.rotX += dRotX;
    s.velY = dRotY / dt;
    s.velX = dRotX / dt;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastTime = now;
  }, [radius]);

  const onPointerUp = useCallback(() => {
    state.current.dragging = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
