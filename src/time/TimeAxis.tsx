import { useMemo } from "react";
import TimeUtils from "./TimeUtils";

export type TimeAxisProps = {
  timeUtils: TimeUtils;
  baseClockHours: number; // local clock time in hours [0..24)
  tickStepHours?: number;
  fontSize?: number;
  axisStroke?: string;
  tickStroke?: string;
  labelFill?: string;
};

/**
 * TimeAxis — draws the center horizontal axis, ticks and labels using a provided scale.
 * This component renders within the inner drawing area (assumes parent translated by padding).
 */
export function TimeAxis({
  timeUtils,
  baseClockHours,
  tickStepHours = 1,
  fontSize = 12,
  labelFill = "#fff",
}: TimeAxisProps) {
  const ticks = useMemo(() => timeUtils.ticks(tickStepHours), [timeUtils, tickStepHours]);
  const y = timeUtils.axisY();

  return (
  <g>
    {ticks.map((rh) => (
      <g key={rh} transform={`translate(${timeUtils.xOf(rh)}, ${y - 30})`}>
        <text x={-14} y={18} fontSize={fontSize} fill={labelFill}>
          {TimeUtils.formatLabel(baseClockHours, rh)}
        </text>
      </g>
    ))}
  </g>
  );
}