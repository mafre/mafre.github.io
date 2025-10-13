import type React from "react";
import Gear from "./Gear";

// --- Gear + connection primitives ------------------------------------------
export type ConnectionType = "mesh" | "coaxial";

export interface Connection {
  a: string;                 // gear id
  b: string;                 // gear id
  type: ConnectionType;
  backlash?: number;         // extra spacing for mesh (px), default 0
}

// --- Clockwork with overlapping/compound support ---------------------------
export class Clockwork {
  private gears = new Map<string, Gear>();
  private connections: Connection[] = [];

  addGear(gear: Gear) { this.gears.set(gear.id, gear); return gear; }

  // Allow external helpers to inspect a gear by id (read-only)
  getGear(id: string): Gear | undefined {
    return this.gears.get(id);
  }

  /** Return an array of all gears (read-only snapshot) */
  getGears(): Gear[] {
    return Array.from(this.gears.values());
  }

  generateGear(options: {
    id: string;
    ratio?: number; 
    baseTeeth?: number; 
    teethCount?: number;
    radius?: number; 
    teeth?: number; 
    axleId?: string; 
    layer?: number;
    toothRootRatio?: number; 
    toothTopRatio?: number;
    toothDepth?: number;
  }): Gear {
    const ratio =
      options.ratio ?? (
        options.baseTeeth && options.teethCount
          ? options.baseTeeth / options.teethCount
          : undefined
      );
    if (ratio === undefined) throw new Error("ratio or (baseTeeth & teethCount) required");
    const g = new Gear(
      options.id,
      ratio,
      0,
      options.teeth ?? options.teethCount,
      0, 
      0,
      options.radius ?? 50,
      options.layer ?? 0,
      options.axleId,
      options.toothRootRatio,
      options.toothTopRatio,
      options.toothDepth
    );
    return this.addGear(g);
  }

  connect(a: string, b: string, type: ConnectionType, backlash = 0): void {
    if (!this.gears.has(a) || !this.gears.has(b)) throw new Error("unknown gear id");
    this.connections.push({ a, b, type, backlash });
  }

  /**
   * Position all gears by traversing the connection graph.
   * - mesh: place tangent at distance rA + rB + backlash
   * - coaxial: same (x,y) and optional shared axleId
   * Uses BFS from a seed gear; unconnected components are left as-is.
   */
  positionConnected(seedId: string, seedX = 0, seedY = 0): void {
    const seed = this.gears.get(seedId);
    if (!seed) throw new Error("unknown seedId");
    seed.x = seedX; seed.y = seedY;

    const placed = new Set<string>([seedId]);
    const q: string[] = [seedId];

    const adj = new Map<string, Connection[]>();
    for (const c of this.connections) {
      (adj.get(c.a) ?? adj.set(c.a, []).get(c.a)!).push(c);
      (adj.get(c.b) ?? adj.set(c.b, []).get(c.b)!).push({ a: c.b, b: c.a, type: c.type, backlash: c.backlash });
    }

    while (q.length) {
      const curId = q.shift()!;
      const cur = this.gears.get(curId)!;
      const edges = adj.get(curId) ?? [];
      for (const e of edges) {
        const nxt = this.gears.get(e.b)!;
        if (placed.has(nxt.id)) continue;

        if (e.type === "coaxial") {
          nxt.x = cur.x;
          nxt.y = cur.y;
          // keep natural layering; optionally group by axle
          if (!nxt.axleId) nxt.axleId = cur.axleId ?? cur.id;
        } else { // mesh
          // Use tip radii for correct meshing (no intersection)
          const curTipRadius = cur.radius;
          const nxtTipRadius = nxt.radius;
          const d = curTipRadius + nxtTipRadius + (e.backlash ?? 0);
          // place around current at deterministic angle based on ids for stability
          const hash = Math.abs(this.hashPair(cur.id, nxt.id)) % 180;
          const a = (hash * Math.PI) / 180;
          nxt.x = cur.x + Math.cos(a) * d;
          nxt.y = cur.y + Math.sin(a) * d;

          // Adjust rotation so teeth mesh at contact point
          // Find angle from cur to nxt
          const contactAngle = Math.atan2(nxt.y - cur.y, nxt.x - cur.x);

          // For cur, find the nearest tooth tip angle
          const curTeeth = cur.teeth ?? Math.max(4, Math.round(cur.radius * 1.2));
          const curToothAngle = (2 * Math.PI) / curTeeth;
          const curToothIndex = Math.round(((contactAngle - (cur.rotation * Math.PI / 180)) / curToothAngle)) % curTeeth;
          const curTipAngle = (curToothIndex * curToothAngle) + (cur.rotation * Math.PI / 180);

          // Angle difference to align cur tooth tip with contact point
          const angleDiff = contactAngle - curTipAngle;
          cur.rotation = (cur.rotation + (angleDiff * 180 / Math.PI)) % 360;

          // For nxt, set rotation so the gap (root) aligns with the contact point
          const nxtTeeth = nxt.teeth ?? Math.max(4, Math.round(nxt.radius * 1.2));
          const nxtToothAngle = (2 * Math.PI) / nxtTeeth;
          // Force: contact point aligns with gap/root (midpoint between teeth)
          nxt.rotation = ((contactAngle + Math.PI + nxtToothAngle / 2) * 180 / Math.PI) % 360;
        }
        placed.add(nxt.id);
        q.push(nxt.id);
      }
    }
  }

  /**
   * Propagate rotations through the graph.
   * - mesh (external): ωB = -ωA * (zA / zB) if both have teeth; else use ratio fallback.
   * - coaxial: ωB = ωA (locked)
   * Set an absolute rotation on seed, compute the rest.
   */
  solveRotations(seedId: string, seedRotationDeg: number = 0): void {
    const seed = this.gears.get(seedId);
    if (!seed) throw new Error("unknown seedId");

    // Build coaxial groups
    const axleGroups = new Map<string, Set<string>>();
    for (const gear of this.gears.values()) {
      const axle = gear.axleId ?? gear.id;
      if (!axleGroups.has(axle)) axleGroups.set(axle, new Set());
      axleGroups.get(axle)!.add(gear.id);
    }

    // Capture initial rotation (phase) per axle group from current gear rotations
    const initialGroupRotation = new Map<string, number>();
    for (const [axle, members] of axleGroups) {
      const groupGears = Array.from(members);
      const masterId = groupGears.sort()[0];
      const masterGear = this.gears.get(masterId)!;
      initialGroupRotation.set(axle, masterGear.rotation);
    }

    // Helper: set rotation for all gears in a group (and enforce coaxial ratio consistency)
    const setGroupRotation = (axle: string, rotation: number) => {
      // Check ratios in group
      const groupGears = Array.from(axleGroups.get(axle)!);
      const masterId = groupGears.sort()[0];
      const masterGear = this.gears.get(masterId)!;
      const masterRatio = masterGear.ratio;
      let mismatch = false;
      for (const gid of groupGears) {
        const gear = this.gears.get(gid)!;
        if (gear.ratio !== masterRatio) {
          mismatch = true;
        }
      }
      if (mismatch) {
        for (const gid of groupGears) {
          this.gears.get(gid)!.ratio = masterRatio;
        }
      }
      for (const gid of groupGears) {
        this.gears.get(gid)!.rotation = rotation;
      }
    };

  // BFS, propagate by axle group, using deltas from the initial phase to preserve tooth alignment
  const groupVisited = new Set<string>();
  const currentGroupRotation = new Map<string, number>();
  const q: Array<string> = [];

  const seedAxle = seed.axleId ?? seed.id;
  // delta applied to seed group
  const seedDelta = seedRotationDeg - (initialGroupRotation.get(seedAxle) ?? 0);
  currentGroupRotation.set(seedAxle, (initialGroupRotation.get(seedAxle) ?? 0) + seedDelta);
  q.push(seedAxle);

    const adj = new Map<string, Connection[]>();
    for (const c of this.connections) {
      (adj.get(c.a) ?? adj.set(c.a, []).get(c.a)!).push(c);
      (adj.get(c.b) ?? adj.set(c.b, []).get(c.b)!).push({ a: c.b, b: c.a, type: c.type, backlash: c.backlash });
    }

    while (q.length) {
      const axle = q.shift()!;
      if (groupVisited.has(axle)) continue;
      const absRotation = currentGroupRotation.get(axle)!;
      setGroupRotation(axle, absRotation);
      groupVisited.add(axle);

      // Propagate external connections from every gear in this axle group
      const groupGears = Array.from(axleGroups.get(axle)!);
      // compute delta for this group
      const initMaster = initialGroupRotation.get(axle) ?? 0;
      const curMaster = currentGroupRotation.get(axle) ?? initMaster;
      const deltaMaster = curMaster - initMaster;

      for (const gearId of groupGears) {
        const srcGear = this.gears.get(gearId)!;
        const edges = adj.get(gearId) ?? [];
        for (const e of edges) {
          const nxt = this.gears.get(e.b)!;
          const nxtAxle = nxt.axleId ?? nxt.id;
          // skip connections that stay within the same axle group
          if (nxtAxle === axle) continue;
          if (groupVisited.has(nxtAxle)) continue;

          if (e.type === "mesh") {
            const useTeeth = (srcGear.teeth ?? 0) > 0 && (nxt.teeth ?? 0) > 0;
            const ratio = useTeeth
              ? (srcGear.teeth as number) / (nxt.teeth as number)
              : srcGear.ratio / nxt.ratio;
            const deltaN = (-deltaMaster) * ratio;
            const initN = initialGroupRotation.get(nxtAxle) ?? 0;
            let newRotation = initN + deltaN;
            // Apply half-tooth offset for driven gear if requested (here: special-case 'C')
            if (nxt.id === 'C') {
              newRotation = (newRotation) % 360;
            }
            currentGroupRotation.set(nxtAxle, newRotation);
            q.push(nxtAxle);
          } else if (e.type === "coaxial") {
            // coaxial: same delta
            const initN = initialGroupRotation.get(nxtAxle) ?? 0;
            const deltaN = deltaMaster;
            currentGroupRotation.set(nxtAxle, initN + deltaN);
            q.push(nxtAxle);
          }
        }
      }
    }
  }

  /** Quick hash for deterministic mesh angles */
  private hashPair(a: string, b: string): number {
    let h = 2166136261 >>> 0;
    const s = a + "|" + b;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h | 0;
  }

  /** Render all gears; overlapping coaxials are layered by `layer` then id. */
  renderSVG(opts: {
    centerX?: number; 
    centerY?: number;
    drawAxles?: boolean; 
    axleStroke?: string; 
    axleRadius?: number;
    stroke?: string; 
    fill?: string; 
    strokeWidth?: number;
  } = {}): React.ReactNode {
    const cx = opts.centerX ?? 200, cy = opts.centerY ?? 200;
    const stroke = opts.stroke ?? "#222";
    const fill = opts.fill ?? "none";
    const sw = opts.strokeWidth ?? 1;

    const gears = Array.from(this.gears.values())
      .sort((g1, g2) => (g1.layer - g2.layer) || g1.id.localeCompare(g2.id));

    const parts = gears.map(g =>
      g.renderSVG({
        cx: cx + g.x,
        cy: cy + g.y,
        radius: g.radius,
        teeth: g.teeth ?? Math.max(4, Math.round(g.radius * 1.2)),
        stroke, 
        fill, 
        strokeWidth: sw, 
        showPitch: false, 
        id: g.id,
        boreRadius: 5,
        toothDepth: g.toothDepth ?? g.radius * 0.18,
        toothTopRatio: g.toothTopRatio ?? 0.5,
        toothRootRatio: g.toothRootRatio ?? 0.8,
        className: `gear gear-${g.id}`
      })
    );

    if (opts.drawAxles) {
      const groups = new Map<string, { x: number; y: number }>();
      for (const g of gears) {
        const key = g.axleId ?? `axle:${g.id}`;
        
        groups.get(key) ?? groups.set(key, { x: cx + g.x, y: cy + g.y }).get(key)!;
      }
    }

    return <>
    <defs>
      {/* Use userSpaceOnUse and enlarge filter region to avoid clipping of shadows */}
      <filter id="shadow" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
      </filter>
    </defs>
      {parts}
    </>;
  }
}