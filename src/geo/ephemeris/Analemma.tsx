import React, { useMemo } from 'react';
import TimeUtils from '../../time/TimeUtils';

interface AnalemmaPoint {
  day: number; // day-of-year
  decl: number; // solar declination (deg)
  eot: number;  // equation of time (minutes)
}

interface AnalemmaProps {
  samplesPerDay?: number; // optional refinement for multi-time curves
  time?: Date; // reference date (year & tz)
  style?: React.CSSProperties;
}

/**
 * Analemma visualization: plots solar declination vs equation-of-time across the year.
 * Classic figure-eight shape. X = EoT (minutes), Y = decl (deg).
 */
export default function Analemma({
  time = new Date(),
  samplesPerDay = 1
}: AnalemmaProps) {
  const utils = useMemo(() => new TimeUtils({ height: 80, width: 80 }), []);
  const points: AnalemmaPoint[] = useMemo(() => {
    const yr = time.getUTCFullYear();
    const arr: AnalemmaPoint[] = [];
    for (let day = 1; day <= 365; day++) {
      // Use UTC noon to reduce DST / timezone distortion
      const base = new Date(Date.UTC(yr, 0, day, 12, 0, 0));
      // Optionally sample different hours, but for a classical analemma we usually fix clock time
      let declSum = 0;
      let eotSum = 0;
      for (let s = 0; s < samplesPerDay; s++) {
        const d = new Date(base.getTime() + (s / samplesPerDay) * 3600_000); // shift within the hour
        declSum += utils.solarDeclinationDeg(d);
        eotSum += utils.equationOfTimeMinutes(d);
      }
      arr.push({ day, decl: declSum / samplesPerDay, eot: eotSum / samplesPerDay });
    }
    return arr;
  }, [time, samplesPerDay, utils]);

  // Scales
  const declVals = points.map(p => p.decl);
  const eotVals = points.map(p => p.eot);
  const declMin = Math.min(...declVals);
  const declMax = Math.max(...declVals);
  const eotMin = Math.min(...eotVals);
  const eotMax = Math.max(...eotVals);
  const pad = 20;
  const innerW = utils.innerW - pad * 2;
  const innerH = utils.innerH - pad * 2;

  const xOf = (eot: number) => pad + ((eot - eotMin) / (eotMax - eotMin)) * innerW - innerW / 2 - pad;
  const yOf = (decl: number) => pad + innerH - ((decl - declMin) / (declMax - declMin)) * innerH - innerH / 2 - pad;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${xOf(p.eot)},${yOf(p.decl)}`).join(' ');

  const today = utils.dayOfYear(time);
  const todayPoint = points[today - 1];

  return (
    <>
		<g>
			<path d={path} fill="none" stroke="#aaa" strokeWidth={1} />
		</g>
        {todayPoint && (
          <g>
            <circle cx={xOf(todayPoint.eot)} cy={yOf(todayPoint.decl)} r={3} fill="#e64a19" />
          </g>
        )}
	</>
  );
}
