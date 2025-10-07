import { GameData } from './GameData';

export interface AbilityDef {
  id: string;
  level: number;
  name: string;
  description: string;
  effect?: { timeSpeedAdd?: number };
  condition?: (g: GameData) => boolean;
}

const allEqual = (g: GameData, keys: string[]) => {
  if (!keys.length) return false;
  const base = g.resources[keys[0]] ?? 0;
  return base > 0 && keys.every(k => (g.resources[k] ?? 0) === base);
};

export const ABILITY_DEFS: AbilityDef[] = [
  { id: 'chronomancy', level: 3, name: 'Chronomancy', description: 'Boost timeSpeed by 10 when ms, sec, min equal.', effect: { timeSpeedAdd: 10 }, condition: g => allEqual(g, ['second','minute']) },
  { id: 'calibration', level: 0, name: 'Calibration', description: '+0.1 speed.', effect: { timeSpeedAdd: 0.1 } },
  { id: 'second-surge', level: 1, name: 'Second Surge', description: '+1 speed if seconds >= 10.', effect: { timeSpeedAdd: 1 }, condition: g => (g.resources['second'] ?? 0) >= 10 },
];

export function abilitiesForLevel(level: number) { return ABILITY_DEFS.filter(a => a.level === level); }