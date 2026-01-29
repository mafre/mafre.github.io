import Gear from './Gear';
import type { Connection } from './Clockwork';

/**
 * Utility responsible only for computing and propagating gear rotations.
 *
 * It does not position gears or know anything about rendering – the sole
 * responsibility is: given a graph of gears + connections and a seed
 * rotation, compute consistent rotations for all connected gears.
 */
export class GearRotationEngine {

	/**
	 * Public entry: compute and propagate rotations from a seed gear.
	 * Delegates to smaller helpers for validation, grouping and traversal.
	 */
	static solveRotations(
		gears: Map<string, Gear>,
		connections: Connection[],
		seedId: string,
		seedRotationDeg: number = 0
	): void {
		const seed = this.requireSeedGear(gears, seedId);
		const axleGroups = this.buildAxleGroups(gears);
		const initialGroupRotation = this.snapshotInitialGroupRotation(gears, axleGroups);
		const adj = this.buildAdjacency(connections);
		this.propagateFromSeed({
			gears,
			axleGroups,
			initialGroupRotation,
			adj,
			seed,
			seedRotationDeg,
		});
	}

	// --- validation / setup -------------------------------------------------

	private static requireSeedGear(gears: Map<string, Gear>, seedId: string): Gear {
		const seed = gears.get(seedId);
		if (!seed) throw new Error('unknown seedId');
		return seed;
	}

	private static buildAxleGroups(gears: Map<string, Gear>): Map<string, Set<string>> {
		const axleGroups = new Map<string, Set<string>>();
		for (const gear of gears.values()) {
			const axle = gear.axleId ?? gear.id;
			if (!axleGroups.has(axle)) axleGroups.set(axle, new Set());
			axleGroups.get(axle)!.add(gear.id);
		}
		return axleGroups;
	}

	private static snapshotInitialGroupRotation(
		gears: Map<string, Gear>,
		axleGroups: Map<string, Set<string>>
	): Map<string, number> {
		const initial = new Map<string, number>();
		for (const [axle, members] of axleGroups) {
			const groupGears = Array.from(members);
			const masterId = groupGears.sort()[0];
			const masterGear = gears.get(masterId)!;
			initial.set(axle, masterGear.rotation);
		}
		return initial;
	}

	private static buildAdjacency(connections: Connection[]): Map<string, Connection[]> {
		const adj = new Map<string, Connection[]>();
		for (const c of connections) {
			(adj.get(c.a) ?? adj.set(c.a, []).get(c.a)!).push(c);
			(adj.get(c.b) ?? adj.set(c.b, []).get(c.b)!).push({
				a: c.b,
				b: c.a,
				type: c.type,
				backlash: c.backlash,
			});
		}
		return adj;
	}

	// --- core propagation ---------------------------------------------------

	private static propagateFromSeed(params: {
		gears: Map<string, Gear>;
		axleGroups: Map<string, Set<string>>;
		initialGroupRotation: Map<string, number>;
		adj: Map<string, Connection[]>;
		seed: Gear;
		seedRotationDeg: number;
	}): void {
		const { gears, axleGroups, initialGroupRotation, adj, seed, seedRotationDeg } = params;
		const groupVisited = new Set<string>();
		const currentGroupRotation = new Map<string, number>();
		const queue: string[] = [];

		const seedAxle = seed.axleId ?? seed.id;
		const seedInitial = initialGroupRotation.get(seedAxle) ?? 0;
		const seedDelta = seedRotationDeg - seedInitial;
		currentGroupRotation.set(seedAxle, seedInitial + seedDelta);
		queue.push(seedAxle);

		while (queue.length) {
			const axle = queue.shift()!;
			if (groupVisited.has(axle)) continue;

			const absRotation = currentGroupRotation.get(axle)!;
			this.setGroupRotation(gears, axleGroups, axle, absRotation);
			groupVisited.add(axle);

			const { deltaMaster, groupGears } = this.computeGroupDelta(
				axle,
				axleGroups,
				initialGroupRotation,
				currentGroupRotation
			);

			this.propagateToNeighbors({
				gears,
				axle,
				groupVisited,
				groupGears,
				adj,
				initialGroupRotation,
				currentGroupRotation,
				deltaMaster,
				queue,
			});
		}
	}

	private static setGroupRotation(
		gears: Map<string, Gear>,
		axleGroups: Map<string, Set<string>>,
		axle: string,
		rotation: number
	): void {
		const groupGears = Array.from(axleGroups.get(axle)!);
		const masterId = groupGears.sort()[0];
		const masterGear = gears.get(masterId)!;
		const masterRatio = masterGear.ratio;
		for (const gid of groupGears) {
			const g = gears.get(gid)!;
			g.ratio = masterRatio;
			g.rotation = rotation;
		}
	}

	private static computeGroupDelta(
		axle: string,
		axleGroups: Map<string, Set<string>>,
		initialGroupRotation: Map<string, number>,
		currentGroupRotation: Map<string, number>
	): { deltaMaster: number; groupGears: string[] } {
		const groupGears = Array.from(axleGroups.get(axle)!);
		const initMaster = initialGroupRotation.get(axle) ?? 0;
		const curMaster = currentGroupRotation.get(axle) ?? initMaster;
		const deltaMaster = curMaster - initMaster;
		return { deltaMaster, groupGears };
	}

	private static propagateToNeighbors(params: {
		gears: Map<string, Gear>;
		axle: string;
		groupVisited: Set<string>;
		groupGears: string[];
		adj: Map<string, Connection[]>;
		initialGroupRotation: Map<string, number>;
		currentGroupRotation: Map<string, number>;
		deltaMaster: number;
		queue: string[];
	}): void {
		const {
			gears,
			axle,
			groupVisited,
			groupGears,
			adj,
			initialGroupRotation,
			currentGroupRotation,
			deltaMaster,
			queue,
		} = params;

		for (const gearId of groupGears) {
			const srcGear = gears.get(gearId)!;
			const edges = adj.get(gearId) ?? [];
			for (const e of edges) {
				const nxt = gears.get(e.b)!;
				const nxtAxle = nxt.axleId ?? nxt.id;
				if (nxtAxle === axle || groupVisited.has(nxtAxle)) continue;

				if (e.type === 'mesh') {
					this.propagateMesh(
						{ srcGear, nxt, nxtAxle, deltaMaster },
						initialGroupRotation,
						currentGroupRotation,
						queue
					);
				} else if (e.type === 'coaxial') {
					this.propagateCoaxial({ axleRotation: currentGroupRotation.get(axle) ?? 0, nxtAxle }, currentGroupRotation, queue);
				}
			}
		}
	}

	private static propagateMesh(
		params: { srcGear: Gear; nxt: Gear; nxtAxle: string; deltaMaster: number },
		initialGroupRotation: Map<string, number>,
		currentGroupRotation: Map<string, number>,
		queue: string[]
	): void {
		const { srcGear, nxt, nxtAxle, deltaMaster } = params;
		const useTeeth = (srcGear.teeth ?? 0) > 0 && (nxt.teeth ?? 0) > 0;
		const ratio = useTeeth
			? (srcGear.teeth as number) / (nxt.teeth as number)
			: srcGear.ratio / nxt.ratio;
		const deltaN = -deltaMaster * ratio;
		const initN = initialGroupRotation.get(nxtAxle) ?? 0;
		let newRotation = initN + deltaN;
		newRotation = ((newRotation % 360) + 360) % 360;
		currentGroupRotation.set(nxtAxle, newRotation);
		queue.push(nxtAxle);
	}

	private static propagateCoaxial(
		params: { axleRotation: number; nxtAxle: string },
		currentGroupRotation: Map<string, number>,
		queue: string[]
	): void {
		const { axleRotation, nxtAxle } = params;
		currentGroupRotation.set(nxtAxle, axleRotation);
		queue.push(nxtAxle);
	}

	/**
	 * Incrementally propagate a rotation delta from a seed gear to all connected gears.
	 *
	 * Assumes the seed gear's rotation has ALREADY been advanced by `deltaDeg`.
	 * Only applies incremental changes to other axle groups, preserving existing phases.
	 */
	static propagateDelta(
		gears: Map<string, Gear>,
		connections: Connection[],
		seedId: string,
		deltaDeg: number
	): void {
		if (Math.abs(deltaDeg) < 1e-9) return;
		const seed = gears.get(seedId);
		if (!seed) throw new Error('unknown seedId');

		// Build axle groups (coaxial gears share identical delta)
		const axleGroups = new Map<string, Set<string>>();
		for (const gear of gears.values()) {
			const axle = gear.axleId ?? gear.id;
			if (!axleGroups.has(axle)) axleGroups.set(axle, new Set());
			axleGroups.get(axle)!.add(gear.id);
		}
		const seedAxle = seed.axleId ?? seed.id;

		// Build adjacency (gear-level) including reverse edges for traversal
		const adj = new Map<string, Connection[]>();
		for (const c of connections) {
			(adj.get(c.a) ?? adj.set(c.a, []).get(c.a)!).push(c);
			(adj.get(c.b) ?? adj.set(c.b, []).get(c.b)!).push({
				a: c.b,
				b: c.a,
				type: c.type,
				backlash: c.backlash,
			});
		}

		// Track accumulated delta per axle group (seed axle starts with full delta)
		const deltaByAxle = new Map<string, number>();
		deltaByAxle.set(seedAxle, deltaDeg);

		const visited = new Set<string>();
		const queue: string[] = [seedAxle];

		while (queue.length) {
			const axle = queue.shift()!;
			if (visited.has(axle)) continue;
			visited.add(axle);
			const sourceDelta = deltaByAxle.get(axle)!;

			// For each gear in this axle, propagate to neighbors in other axles
			const groupGears = Array.from(axleGroups.get(axle) || []);
			for (const gearId of groupGears) {
				const src = gears.get(gearId)!;
				const edges = adj.get(gearId) ?? [];
				for (const e of edges) {
					const dst = gears.get(e.b)!;
					const dstAxle = dst.axleId ?? dst.id;
					if (dstAxle === axle) continue;
					if (deltaByAxle.has(dstAxle)) continue;

					let propagated: number;
					if (e.type === 'coaxial') {
						propagated = sourceDelta;
					} else {
						const useTeeth = (src.teeth ?? 0) > 0 && (dst.teeth ?? 0) > 0;
						const ratio = useTeeth
							? (src.teeth as number) / (dst.teeth as number)
							: src.ratio / dst.ratio;
						propagated = -sourceDelta * ratio;
					}
					deltaByAxle.set(dstAxle, propagated);
					queue.push(dstAxle);
				}
			}
		}

		// Apply accumulated deltas to each non-seed axle group
		for (const [axle, delta] of deltaByAxle.entries()) {
			if (axle === seedAxle) continue;
			for (const gid of axleGroups.get(axle) || []) {
				const g = gears.get(gid)!;
				g.rotation = (g.rotation + delta) % 360;
			}
		}
	}
}

export default GearRotationEngine;
