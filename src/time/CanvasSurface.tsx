import React, { useEffect, useMemo, useRef } from "react";

// Reusable canvas component
export type CanvasSurfaceProps = {
  /** CSS pixel width of the canvas element */
  width: number;
  /** CSS pixel height of the canvas element */
  height: number;
  /** Optional override for device pixel ratio used for crisp drawing */
  pixelRatio?: number;
  /** Called after the context is (re)prepared; do your drawing here */
  onDraw?: (
    ctx: CanvasRenderingContext2D,
    info: { width: number; height: number; pixelRatio: number; canvas: HTMLCanvasElement }
  ) => void;
  /** Optional background color for the visible canvas */
  background?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function CanvasSurface({
  width,
  height,
  pixelRatio,
  onDraw,
  background = "transparent",
  className,
  style,
}: CanvasSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dpr = useMemo(() => {
    const r = pixelRatio ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    // clamp to reasonable range
    return Math.max(1, Math.min(3, r));
  }, [pixelRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set the display size via CSS and internal bitmap via width/height.
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const targetW = Math.max(1, Math.floor(width * dpr));
    const targetH = Math.max(1, Math.floor(height * dpr));

    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset transform, then scale for DPR.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    if (background !== "transparent") {
      ctx.save();
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    onDraw?.(ctx, { width, height, pixelRatio: dpr, canvas });
  }, [width, height, dpr, onDraw, background]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", borderRadius: "1rem", ...style }}
      aria-label="Canvas surface"
    />
  );
}
