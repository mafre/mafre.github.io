import { useContext, createContext, useState, useCallback } from 'react';

// Core class storing game state. Immutable update pattern: methods return a new instance.
export class GameData {
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly resources: Record<string, number>;

  constructor(init?: Partial<GameData>) {
    const created = init?.createdAt ?? Date.now();
    this.createdAt = created;
    this.updatedAt = init?.updatedAt ?? Date.now();
    this.resources = { ...(init?.resources ?? {}) };
  }

  withPatch(p: Partial<GameData>): GameData {
    return new GameData({
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      resources: this.resources,
      ...p,
    });
  }

  addResource(name: string, delta: number) {
    const current = this.resources[name] ?? 0;
    return this.withPatch({ resources: { ...this.resources, [name]: current + delta } });
  }

  toSerializable() {
    return {
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      resources: this.resources,
    };
  }
  toJSON(): string { return JSON.stringify(this.toSerializable()); }

  static storageKey = 'game:data:v1';
  save() { try { if (typeof localStorage !== 'undefined') localStorage.setItem(GameData.storageKey, this.toJSON()); } catch { /* ignore */ } }

  static load(): GameData {
    try {
      if (typeof localStorage === 'undefined') return new GameData();
      const raw = localStorage.getItem(GameData.storageKey);
      if (!raw) return new GameData();
      const parsed = JSON.parse(raw);
      return new GameData(parsed);
    } catch { return new GameData(); }
  }
}

interface GameDataContextValue { data: GameData; update: (fn: (d: GameData) => GameData) => void; }
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
  return (<GameDataContext.Provider value={{ data, update }}>{children}</GameDataContext.Provider>);
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within GameDataProvider');
  return ctx;
}