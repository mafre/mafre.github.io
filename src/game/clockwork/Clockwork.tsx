import Gear from './Gear';
import GearRotationEngine from './GearRotationEngine';
import GearLayoutEngine from './GearLayoutEngine';

// --- Gear + connection primitives ------------------------------------------
export type ConnectionType = 'mesh' | 'coaxial';

export interface Connection {
	a: string; // gear id
	b: string; // gear id
	type: ConnectionType;
	backlash?: number; // extra spacing for mesh (px), default 0
}

// --- Clockwork with overlapping/compound support ---------------------------
export class Clockwork {
	private gears = new Map<string, Gear>();
	private connections: Connection[] = [];

	addGear(gear: Gear) {
		this.gears.set(gear.id, gear);
		return gear;
	}

	// Allow external helpers to inspect a gear by id (read-only)
	getGear(id: string): Gear | undefined {
		return this.gears.get(id);
	}

	/** Return an array of all gears (read-only snapshot) */
	getGears(): Gear[] {
		return Array.from(this.gears.values());
	}

	/** Return all connections (read-only snapshot) */
	getConnections(): Connection[] {
		return [...this.connections];
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
			options.ratio ??
			(options.baseTeeth && options.teethCount
				? options.baseTeeth / options.teethCount
				: undefined);
		if (ratio === undefined) throw new Error('ratio or (baseTeeth & teethCount) required');
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
		if (!this.gears.has(a) || !this.gears.has(b)) throw new Error('unknown gear id');
		this.connections.push({ a, b, type, backlash });
	}

	/**
	 * Position all gears by traversing the connection graph.
	 * - mesh: place tangent at distance rA + rB + backlash
	 * - coaxial: same (x,y) and optional shared axleId
	 * Uses BFS from a seed gear; unconnected components are left as-is.
	 */
	positionConnected(seedId: string, seedX = 0, seedY = 0): void {
		GearLayoutEngine.positionConnected(this.gears, this.connections, seedId, seedX, seedY);
	}

	/**
	 * Propagate rotations through the graph.
	 * - mesh (external): ωB = -ωA * (zA / zB) if both have teeth; else use ratio fallback.
	 * - coaxial: ωB = ωA (locked)
	 * Set an absolute rotation on seed, compute the rest.
	 */
	solveRotations(seedId: string, seedRotationDeg: number = 0): void {
		GearRotationEngine.solveRotations(this.gears, this.connections, seedId, seedRotationDeg);
	}

	/**
	 * Incrementally propagate a rotation delta from a seed gear to all connected gears.
	 * Assumes the seed gear's rotation has ALREADY been advanced by `deltaDeg`.
	 * Only applies incremental changes to other axle groups, preserving existing phases.
	 *
	 * This avoids the "reset to initial phase" behavior of `solveRotations` which
	 * captures current rotations as baselines each call (preventing motion). Use this
	 * for real-time animation where gears are advanced discretely (e.g. escapement).
	 */
	propagateDelta(seedId: string, deltaDeg: number): void {
		GearRotationEngine.propagateDelta(this.gears, this.connections, seedId, deltaDeg);
	}
}
