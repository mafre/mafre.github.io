export const SECONDS_INTERVAL = 1000;
export const MINUTE_MODIFIER = 60;
export const MINUTES_INTERVAL = SECONDS_INTERVAL * MINUTE_MODIFIER;
export const HOURS_INTERVAL = MINUTES_INTERVAL * 60;
export const DAYS_INTERVAL = HOURS_INTERVAL * 24;
export const WEEKS_INTERVAL = DAYS_INTERVAL * 7;
export const MONTHS_INTERVAL = DAYS_INTERVAL * 30;
export const YEARS_INTERVAL = DAYS_INTERVAL * 365;

export const GAME_START = new Date(2024, 0, 1, 6, 0, 0);
export const GAME_START_TIMESTAMP = GAME_START.getTime();

export const TICKS_PER_SECOND = 20;
export const MS_PER_TICK = 1000 / TICKS_PER_SECOND;
export const TICK_INTERVAL = MS_PER_TICK;
export const MAX_TICKS_PER_UPDATE = 5; // to avoid spiral of death

export const SAVE_VERSION = 6; // increment when save format changes

// For offline progress calculation, limit to 1 hour max
export const MAX_OFFLINE_MS = 60 * 60 * 1000;
