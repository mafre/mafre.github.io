import { createContext, useCallback, useContext, useState } from 'react';

// Core class storing game state. Immutable update pattern: methods return a new instance.
export class GameData {
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly resources: Record<string, number>;
  readonly elapsedTime: number;
  readonly level: number;
  readonly timeSpeed: number;
  readonly purchasedAbilities: string[];
  readonly totals: Record<string, number>;

  constructor(init?: Partial<GameData>) {
    const created = init?.createdAt ?? Date.now();
    this.createdAt = created;
    this.updatedAt = init?.updatedAt ?? Date.now();
    this.resources = { ...(init?.resources ?? {}) };
    this.level = init?.level ?? 0;
    this.elapsedTime = init?.elapsedTime ?? 0;
    this.timeSpeed = init?.timeSpeed ?? 1;
    this.purchasedAbilities = [...(init?.purchasedAbilities ?? [])];
    // Ensure totals never below current resources (migration / consistency)
    const totalsRaw: Record<string, number> = { ...(init as any)?.totals ?? {} };
    for (const [k, v] of Object.entries(this.resources)) {
      if ((totalsRaw[k] ?? 0) < v) totalsRaw[k] = v;
    }
    this.totals = totalsRaw;
  }

  withPatch(p: Partial<GameData>): GameData {
    return new GameData({
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      resources: this.resources,
      elapsedTime: this.elapsedTime,
      level: this.level,
      timeSpeed: this.timeSpeed,
      purchasedAbilities: this.purchasedAbilities,
      totals: this.totals,
      ...p,
    });
  }

  addResource(name: string, delta: number) {
    if (delta === 0) return this;
    const current = this.resources[name] ?? 0;
    const totalPrev = this.totals[name] ?? 0;
    return this.withPatch({
      resources: { ...this.resources, [name]: current + delta },
      totals: { ...this.totals, [name]: totalPrev + Math.max(0, delta) }
    });
  }

  setResource(name: string, value: number) {
    const current = this.resources[name] ?? 0;
    const delta = value - current;
    if (delta <= 0) {
      // No increase; just set the resource (totals unchanged)
      return this.withPatch({ resources: { ...this.resources, [name]: value } });
    }
    const totalPrev = this.totals[name] ?? 0;
    return this.withPatch({
      resources: { ...this.resources, [name]: value },
      totals: { ...this.totals, [name]: totalPrev + delta }
    });
  }

  setTime(newTime: number) {
    return this.withPatch({ elapsedTime: newTime });
  }

  addTime(delta: number) {
    return this.withPatch({ elapsedTime: this.elapsedTime + delta });
  }

  addLevel() {
    return this.withPatch({level: this.level + 1})
  }

  setLevel(newLevel: number) {
    return this.withPatch({ level: newLevel });
  }

  setTimeSpeed(mult: number) {
    if (!Number.isFinite(mult) || mult <= 0) return this; // ignore invalid
    return this.withPatch({ timeSpeed: mult });
  }

  /** Derive level from an ordered list of time unit keys (lowest -> highest). */
  deriveLevelFromResources(order: string[]) {
    let highest = 0;
    for (let i = 0; i < order.length; i++) {
      if ((this.resources[order[i]] ?? 0) > 0) highest = i;
    }
    if (highest !== this.level) return this.withPatch({ level: highest });
    return this;
  }

  /**
   * Upgrade to next time unit if the current elapsed time meets or exceeds the specified threshold.
   * thresholdMs: minimum elapsedTime required to perform upgrade.
   * fromUnit: resource key to decrement/consume.
   * toUnit: resource key to increment.
   * cost: how many of fromUnit to convert (default 1000 if converting ms->s, etc.)
   */
  upgradeNextTimeUnit(thresholdMs: number, fromUnit: string, toUnit: string, cost: number) {
    if (this.elapsedTime < thresholdMs) return this; // not yet time
    const available = this.resources[fromUnit] ?? 0;
    if (available < cost) return this; // not enough to convert
    // Use setResource for fromUnit (no totals increase), addResource for toUnit (totals increase)
    return this
      .setResource(fromUnit, available - cost)
      .addResource(toUnit, 1);
  }

  toSerializable() {
    return {
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      resources: this.resources,
      elapsedTime: this.elapsedTime,
      level: this.level,
      timeSpeed: this.timeSpeed,
      purchasedAbilities: this.purchasedAbilities,
      totals: this.totals,
    };
  }
    hasAbility(id: string) { return this.purchasedAbilities.includes(id); }
  purchaseAbility(id: string) {
    if (this.hasAbility(id)) return this;
    return this.withPatch({ purchasedAbilities: [...this.purchasedAbilities, id] });
  }
  effectiveTimeSpeed(abilityDefs: { id: string; effect?: { timeSpeedAdd?: number }; condition?: (g: GameData) => boolean }[]) {
    let speed = this.timeSpeed;
    for (const def of abilityDefs) {
      if (!this.hasAbility(def.id)) continue;
      if (def.condition && !def.condition(this)) continue;
      speed += def.effect?.timeSpeedAdd ?? 0;
    }
    return speed;
  }
  toJSON(): string {
    return JSON.stringify(this.toSerializable());
  }

  static storageKey = 'game:data:v1';
  save() {
    try {
      if (typeof localStorage !== 'undefined')
        localStorage.setItem(GameData.storageKey, this.toJSON());
    } catch {
      /* ignore */
    }
  }

  static load(): GameData {
    try {
      if (typeof localStorage === 'undefined') return new GameData();
      const raw = localStorage.getItem(GameData.storageKey);
      if (!raw) return new GameData();
      const parsed = JSON.parse(raw);

      return new GameData(parsed);
    } catch {
      return new GameData();
    }
  }
}

interface GameDataContextValue {
  data: GameData;
  update: (fn: (d: GameData) => GameData) => void;
}
const GameDataContext = createContext<GameDataContextValue | null>(null);

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<GameData>(() => GameData.load());
  const update = useCallback((fn: (d: GameData) => GameData) => {
    setData((prev) => {
      const next = fn(prev);
      next.save();
      return next;
    });
  }, []);
  return <GameDataContext.Provider value={{ data, update }}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within GameDataProvider');
  return ctx;
}
