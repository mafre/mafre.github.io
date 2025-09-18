import { useContext, createContext, useState, useCallback } from 'react';

// Core class storing game state. Immutable update pattern: methods return a new instance.
export class GameData {
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly score: number;
  readonly level: number;
  readonly xp: number;
  readonly resources: Record<string, number>;

  constructor(init?: Partial<GameData>) {
    this.createdAt = init?.createdAt ?? Date.now();
    this.updatedAt = init?.updatedAt ?? Date.now();
    this.score = init?.score ?? 0;
    this.level = init?.level ?? 1;
    this.xp = init?.xp ?? 0;
    this.resources = { ...(init?.resources ?? {}) };
  }

  withPatch(p: Partial<GameData>): GameData {
    return new GameData({
      ...this,
      ...p,
      updatedAt: Date.now(),
    });
  }

  addScore(delta: number) {
    return this.withPatch({ score: this.score + delta });
  }
  addXp(delta: number) {
    const newXp = this.xp + delta;
    // Simple level logic: every 100 xp => +1 level
    const addedLevels = Math.floor(newXp / 100) - Math.floor(this.xp / 100);
    return this.withPatch({ xp: newXp, level: this.level + addedLevels });
  }
  addResource(name: string, delta: number) {
    const current = this.resources[name] ?? 0;
    return this.withPatch({ resources: { ...this.resources, [name]: current + delta } });
  }

  toJSON(): string {
    return JSON.stringify({
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      score: this.score,
      level: this.level,
      xp: this.xp,
      resources: this.resources,
    });
  }

  static storageKey = 'game:data:v1';

  save() {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(GameData.storageKey, this.toJSON()); } catch {}
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
    setData(prev => {
      const next = fn(prev);
      next.save();
      return next;
    });
  }, []);

  return GameDataContext.Provider({ value: { data, update }, children });
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within GameDataProvider');
  return ctx;
}
