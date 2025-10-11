import { useEffect, useRef, useState } from 'react';
import { DEFAULT_OPACITY } from '../config';

// Render an analog clock showing the user's local wall-clock time.
export default function RealClock() {
  const clockRadius = 45;
  const [now, setNow] = useState<Date>(() => new Date());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setNow(new Date());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const ms = now.getMilliseconds();
  const sec = now.getSeconds() + ms / 1000; // smooth second hand
  const min = now.getMinutes() + sec / 60;  // smooth minute hand
  const hr12 = (now.getHours() % 12) + min / 60; // smooth hour hand

  const secondAngle = (sec / 60) * 360;
  const minuteAngle = (min / 60) * 360;
  const hourAngle = (hr12 / 12) * 360;

  return (
    <>
      <image
        href="/clock_bg.png"
        width={256}
        height={256}
        x={-128}
        y={-128}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: 'none' }}
      />
      {/* Hour tick marks */}
      {[...Array(12)].map((_, i) => {
        const angle = i * 30 * (Math.PI / 180);
        const x1 = clockRadius * Math.cos(angle);
        const y1 = clockRadius * Math.sin(angle);
        const x2 = (clockRadius + 5) * Math.cos(angle);
        const y2 = (clockRadius + 5) * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#fff"
            strokeWidth="3"
            opacity={DEFAULT_OPACITY}
          />
        );
      })}
      {/* Minute tick marks */}
      {[...Array(60)].map((_, i) => {
        if (i % 5 === 0) return null;
        const angle = i * 6 * (Math.PI / 180);
        const x1 = clockRadius * Math.cos(angle);
        const y1 = clockRadius * Math.sin(angle);
        const x2 = (clockRadius + 3) * Math.cos(angle);
        const y2 = (clockRadius + 3) * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#fff"
            strokeWidth="1"
            opacity={DEFAULT_OPACITY * 0.6}
          />
        );
      })}
      {/* Hands */}
      <image
        href="/hour.png"
        width={clockRadius * 2}
        height={clockRadius * 2}
        x={-clockRadius}
        y={-clockRadius}
        preserveAspectRatio="xMidYMid meet"
        transform={`rotate(${hourAngle})`}
        style={{ pointerEvents: 'none' }}
      />
      <image
        href="/minute.png"
        width={clockRadius * 2}
        height={clockRadius * 2}
        x={-clockRadius}
        y={-clockRadius}
        preserveAspectRatio="xMidYMid meet"
        transform={`rotate(${minuteAngle})`}
        style={{ pointerEvents: 'none' }}
      />
      <image
        href="/second.png"
        width={clockRadius * 2}
        height={clockRadius * 2}
        x={-clockRadius}
        y={-clockRadius}
        preserveAspectRatio="xMidYMid meet"
        transform={`rotate(${secondAngle})`}
        style={{ pointerEvents: 'none' }}
      />
      {/* Center cap */}
      <image
        href="/center.png"
        width={10}
        height={10}
        x={-5}
        y={-5}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
