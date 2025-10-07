import React, { useMemo } from 'react';
import TimeUtils from '../../time/TimeUtils';
import type { IntervalRenderInfo } from '../../time/IntervalRender';
import { DEFAULT_OPACITY, DEFAULT_SVG_HEIGHT, DEFAULT_SVG_WIDTH } from '../../config';

export default function SunCurve(info: IntervalRenderInfo) {
  const { now } = info;
  const sampleMinutes = 2;
  const scale = 0.6;
  const timeUtils = useMemo(() => new TimeUtils({height: DEFAULT_SVG_HEIGHT, width: DEFAULT_SVG_WIDTH}), []);
  const xOf = (rh: number) => ((rh + 12) / 24) * DEFAULT_SVG_WIDTH * 0.8 + DEFAULT_SVG_WIDTH*0.1;
  const yOfAlt = (alt: number) => DEFAULT_SVG_HEIGHT*scale * (1 - (alt - altMin) / (altMax - altMin));
  const { sunPts, altMin, altMax } = useMemo(() => {
    const stepH = sampleMinutes / 60;
    const relHours: number[] = [];
    for (let h = -12; h <= 12 + 1e-9; h += stepH) relHours.push(parseFloat(h.toFixed(6)));
      const sunPts = relHours.map((rh) => ({ rh, alt: timeUtils.solarAltitudeDeg(timeUtils.addHours(now, rh)) }));
      const altMin = Math.min(...sunPts.map(p=>p.alt));
      const altMax = Math.max(...sunPts.map(p=>p.alt));
      return { sunPts, altMin, altMax };
    }, [now, sampleMinutes]);
  const sunPath = useMemo(() => sunPts.map((p,i)=>`${i? 'L':'M'}${xOf(p.rh)},${yOfAlt(p.alt) + DEFAULT_SVG_HEIGHT*((1 - scale)/2)}`).join(' '), [sunPts, altMin, altMax, DEFAULT_SVG_WIDTH, DEFAULT_SVG_HEIGHT]);
  const sunAltNow = timeUtils.solarAltitudeDeg(now);

  function CurveSun():React.ReactNode {
    return <g transform={`translate(${xOf(0)}, ${yOfAlt(sunAltNow) + DEFAULT_SVG_HEIGHT*((1 - scale)/2)})`}>
      <circle r={3} fill="#e64a19" />
    </g>
  }

  function CurvePath():React.ReactNode {
    return <path d={sunPath} fill="none" stroke="#fff" strokeWidth={1} opacity={DEFAULT_OPACITY} />
  }

  return (
    <g transform={`translate(${-DEFAULT_SVG_WIDTH/2},${-DEFAULT_SVG_HEIGHT/2})`}>
      <CurvePath />
      <CurveSun />
    </g>
  );
};
