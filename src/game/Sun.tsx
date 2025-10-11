import { DEFAULT_OPACITY, DEFAULT_RADIUS } from "../config";
import { useGameData } from "./GameData";
import { getSecondFraction } from './timeLogic';

/**
 * Sun renders a simplified day/night arc whose position is derived from the
 * current resource remainders (millisecond -> hour). Using resources instead of
 * constructing a Date ensures smooth animation even when the underlying
 * elapsedTime may advance irregularly due to timeSpeed conversions.
 */
export interface SunProps {
  radius?: number;
  showPaths?: boolean; // whether to draw the semicircle guide paths
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number; // pixel size (in SVG units) of the sun icon
}

export default function Sun({ radius = DEFAULT_RADIUS, showPaths = true, className, style, iconSize = 12 }: SunProps) {
  const { data } = useGameData();
  const fractionalSecond = getSecondFraction(data);
  const sec = data.resources['second'] ?? 0;     // whole seconds remainder
  const min = data.resources['minute'] ?? 0;     // minutes remainder
  const hr = data.resources['hour'] ?? 0;        // hours remainder

  // Continuous hour value within [0,24)
  const h = hr + (min + (sec + fractionalSecond) / 60) / 60;

  function daytimeNormalized(hourFloat: number) {
    // Map 6:00 -> 0 and 18:00 -> 1, clamp outside [6,18]
    return Math.min(1, Math.max(0, (hourFloat - 6) / 12));
  }

  function nighttimeNormalized(hourFloat: number) {
    // Night spans 18:00 -> next 6:00 (wrap). We shift hours <18 by +24 so night segment is [18,30]
    const adj = hourFloat < 18 ? hourFloat + 24 : hourFloat;
    return Math.min(1, Math.max(0, (adj - 18) / 12));
  }

  function posOnArcUpper(t: number) {
    const angle = Math.PI * (1 - t); // left (t=0) to right (t=1)
    return { x: radius * Math.cos(angle), y: -radius * Math.sin(angle) };
  }
  function posOnArcLower(t: number) {
    const angle = Math.PI * (-t); // left (t=0) to right (t=1) mirrored below
    return { x: radius * Math.cos(angle), y: -radius * Math.sin(angle) };
  }

  const isDay = h >= 6 && h < 18;
  const pos = isDay ? posOnArcUpper(daytimeNormalized(h)) : posOnArcLower(nighttimeNormalized(h));

  function SunPath(): React.ReactNode {
    return <path
      d={`M -${radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
      stroke="white"
      strokeWidth="1"
      fill="none"
      opacity={DEFAULT_OPACITY}
    />
  }

  function MoonPath(): React.ReactNode {
    return <path
      d={`M -${radius} 0 A ${radius} ${radius} 0 0 0 ${radius} 0`}
      stroke="white"
      strokeWidth="1"
      fill="none"
      opacity={DEFAULT_OPACITY}
    />
  }

  return <g className={className} style={style}>
    {showPaths && <SunPath />}
    {showPaths && <MoonPath />}
    <image
      href="/sun.png"
      x={pos.x - iconSize / 2}
      y={pos.y - iconSize / 2}
      width={iconSize}
      height={iconSize}
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: 'none' }}
    />
  </g>
}