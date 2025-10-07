
// Synodic month (new moon to new moon)
const SYNODIC_MONTH = 29.53058867; // days
// Reference new moon: 2000-01-06 18:14 UT (approx)
const REF_JD = 2451550.1;

function toJulianDate(date: Date): number {
  // Algorithm: Fliegel & Van Flandern
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1..12
  const day = date.getUTCDate() + (date.getUTCHours() + (date.getUTCMinutes() + date.getUTCSeconds() / 60) / 60) / 24;
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd;
}

export interface MoonPhaseInfo {
  phaseFraction: number; // 0..1 (0=new, 0.5=full)
  illumination: number;  // 0..1 lit fraction
  ageDays: number;       // age in days since new moon
  phaseName: string;
}

export function computeMoonPhase(date: Date): MoonPhaseInfo {
  const jd = toJulianDate(date);
  const daysSinceRef = jd - REF_JD;
  let phase = (daysSinceRef / SYNODIC_MONTH) % 1;
  if (phase < 0) phase += 1;
  const age = phase * SYNODIC_MONTH;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2; // 0=new, 1=full

  const phaseName = (() => {
    if (phase < 0.01 || phase > 0.99) return 'New Moon';
    if (phase < 0.24) return 'Waxing Crescent';
    if (phase < 0.26) return 'First Quarter';
    if (phase < 0.49) return 'Waxing Gibbous';
    if (phase < 0.51) return 'Full Moon';
    if (phase < 0.74) return 'Waning Gibbous';
    if (phase < 0.76) return 'Last Quarter';
    return 'Waning Crescent';
  })();

  return { phaseFraction: phase, illumination, ageDays: age, phaseName };
}