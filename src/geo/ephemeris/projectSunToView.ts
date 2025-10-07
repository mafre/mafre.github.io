export type SunPoint = {
  x: number;                 // pixel X in [0, size]
  y: number;                 // pixel Y in [0, size]
  inView: boolean;           // true if altitude >= 0 (above horizon)
  clampedAltitudeDeg: number;// altitude after clamping for projection
};

/**
 * Project (altitudeDeg, azimuthDeg) onto a square view, default 100x100 px.
 * - Zenith (90°) -> center
 * - Horizon (0°) -> circle near edge (radius = size/2 - padding)
 * - Below horizon (<0°) -> clamped to the horizon ring (inView=false)
 *
 * Screen coords:
 *   (0,0) is top-left, +x to the right, +y downward.
 *   0° azimuth (North) is up, angles increase clockwise (E=90°, S=180°, W=270°).
 */
export default function projectSunToView(
  altitudeDeg: number,
  azimuthDeg: number,
  opts: { size?: number; padding?: number; round?: boolean } = {}
): SunPoint {
  const size = opts.size ?? 100;
  const padding = opts.padding ?? 2; // small margin from the edge
  const round = opts.round ?? true;

  const cx = size / 2;
  const cy = size / 2;
  const R = Math.max(0, Math.min(cx, cy) - padding);

  // Clamp altitude for projection; mark visibility separately.
  const inView = altitudeDeg >= 0;
  const altClamped = Math.max(0, Math.min(90, altitudeDeg));

  // Map altitude to radius: 90° -> 0 (center), 0° -> R (edge)
  const r = (1 - altClamped / 90) * R;

  // Convert compass azimuth (0°=N, clockwise) to screen coords:
  // x = cx + r * sin(theta), y = cy - r * cos(theta), where theta=azimuth in radians
  const theta = (azimuthDeg * Math.PI) / 180;
  let x = cx + r * Math.sin(theta);
  let y = cy - r * Math.cos(theta);

  if (round) {
    x = Math.round(x);
    y = Math.round(y);
  }

  // Clamp to view bounds just in case
  x = Math.max(0, Math.min(size, x));
  y = Math.max(0, Math.min(size, y));

  return { x, y, inView, clampedAltitudeDeg: altClamped };
}
