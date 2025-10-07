// Central mapping of time unit -> clock hand color used by Clock and Stats display.
// Keep in sync with extra hand logic in Clock.
export const CLOCK_HAND_COLORS: Record<string, string> = {
  second: '#e64a19',
  minute: '#000000',
  hour: '#000000',
  day: '#4caf50',
  week: '#2196f3',
  month: '#9c27b0',
  year: '#ff9800',
};

/** Return a color swatch style object for a given unit or undefined if none. */
export function getClockHandColor(unit: string): string | undefined {
  return CLOCK_HAND_COLORS[unit];
}
