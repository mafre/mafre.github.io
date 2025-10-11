import { GameData } from './GameData';
import type { AbilityDef } from './abilities';
import { ABILITY_DEFS } from './abilities';
import { SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR } from './gameConfig';

export interface AdvanceOptions {
  abilityDefs?: AbilityDef[];
}

// Ordered list of time unit tiers (keep in sync with GameEngine & level derivation)
export const TIME_UNIT_ORDER = ['second','minute','hour','day','week','month','year'];

// Note: fractional milliseconds toward next second are stored per GameData instance (secondCarryMs)

/** Return current fractional part of the ongoing second (0 <= f < 1) for a GameData instance. */
export function getSecondFraction(gd: GameData) {
  return (gd.secondCarryMs ?? 0) / SECOND;
}

// Upgrade ladder definition
const LADDER: Array<{ threshold: number; from: string; to: string; cost: number }> = [
  { threshold: MINUTE, from: 'second', to: 'minute', cost: 60 },
  { threshold: HOUR, from: 'minute', to: 'hour', cost: 60 },
  { threshold: DAY, from: 'hour', to: 'day', cost: 24 },
  { threshold: WEEK, from: 'day', to: 'week', cost: 7 },
  { threshold: MONTH, from: 'week', to: 'month', cost: 4 }, // simplified (approx 4 weeks)
  { threshold: YEAR, from: 'month', to: 'year', cost: 12 }, // 12 simplified months
];

/**
 * Advance game time based on a new real elapsedTime reading.
 * Applies timeSpeed & ability bonuses, performs cascading unit upgrades, and derives level.
 */
export function advanceGameTime(gd: GameData, elapsedTime: number, opts: AdvanceOptions = {}): GameData {
  const abilityDefs = opts.abilityDefs ?? ABILITY_DEFS;
  let next = gd;

  // Advance elapsed time and directly accumulate whole seconds (drop milliseconds as a resource)
  const prevMs = gd.elapsedTime;
  const newMs = elapsedTime;
  let rawDelta = newMs - prevMs;
  if (rawDelta < 0) rawDelta = 0;
  if (rawDelta > 0) {
    next = next.setTime(newMs);
    const scaled = rawDelta * gd.timeSpeed; // apply base time speed before abilities
    let carry = next.secondCarryMs + scaled;
    const wholeSeconds = Math.floor(carry / SECOND);
    if (wholeSeconds > 0) {
      carry -= wholeSeconds * SECOND;
      next = next.addResource('second', wholeSeconds);
    }
    if (carry !== next.secondCarryMs) {
      next = next.withPatch({ secondCarryMs: carry });
    }
  }

  // Compute effective speed (abilities may depend on resources after ms addition)
  const effectiveSpeed = next.effectiveTimeSpeed(abilityDefs);
  const simulatedElapsed = next.elapsedTime * effectiveSpeed;

  // Cascade upgrades
  let changed = true;
  let safety = 0;
  while (changed && safety < 100) {
    changed = false;
    for (const step of LADDER) {
      const available = next.resources[step.from] ?? 0;
      if (simulatedElapsed >= step.threshold && available >= step.cost) {
        const conversions = Math.floor(available / step.cost);
        if (conversions > 0) {
            // setResource preserves existing total for fromUnit; addResource increments total for toUnit
            next = next
              .setResource(step.from, available - conversions * step.cost)
              .addResource(step.to, conversions);
          changed = true;
        }
      }
    }
    safety++;
  }

  // Derive level based on obtained tiers
  next = next.deriveLevelFromResources(TIME_UNIT_ORDER);
  return next;
}
