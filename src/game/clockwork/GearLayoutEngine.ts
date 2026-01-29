import Gear from './Gear';
import type { Connection } from './Clockwork';

/**
 * Utility responsible only for positioning gears in 2D space.
 *
 * It traverses the connection graph and assigns (x,y) and initial
 * tooth-aligned rotations for meshing pairs. No rendering concerns.
 */
export class GearLayoutEngine {
	/**
	 * Position all connected gears starting from a seed.
	 *
*	 * - mesh: place tangent at distance rA + rB + backlash and align teeth
	 * - coaxial: share (x,y) and optionally axle id
	 */
	static positionConnected(
		gears: Map<string, Gear>,
		connections: Connection[],
		seedId: string,
		seedX: number = 0,
		seedY: number = 0
	): void {
		const seed = gears.get(seedId);
		if (!seed) throw new Error('unknown seedId');
		seed.x = seedX;
		seed.y = seedY;

		const placed = new Set<string>([seedId]);
		const queue: string[] = [seedId];
		const adj = this.buildAdjacency(connections);

		while (queue.length) {
			const curId = queue.shift()!;
			const cur = gears.get(curId)!;
			const edges = adj.get(curId) ?? [];
			for (const e of edges) {
				const nxt = gears.get(e.b)!;
				if (placed.has(nxt.id)) continue;

				if (e.type === 'coaxial') {
					this.positionCoaxial(cur, nxt);
				} else {
					this.positionMeshed(cur, nxt, e.backlash ?? 0);
				}
				placed.add(nxt.id);
				queue.push(nxt.id);
			}
		}
	}

	// --- helpers -----------------------------------------------------------

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

	private static positionCoaxial(cur: Gear, nxt: Gear): void {
		nxt.x = cur.x;
		nxt.y = cur.y;
		if (!nxt.axleId) nxt.axleId = cur.axleId ?? cur.id;
	}

	private static positionMeshed(cur: Gear, nxt: Gear, backlash: number): void {
		const curDepth = cur.toothDepth ?? cur.radius * 0.18;
		const nxtDepth = nxt.toothDepth ?? nxt.radius * 0.18;
		const curPitchR = Math.max(0, cur.radius - curDepth / 2);
		const nxtPitchR = Math.max(0, nxt.radius - nxtDepth / 2);
		const d = curPitchR + nxtPitchR + backlash;
		// place around current at deterministic angle based on ids for stability
		const hash = Math.abs(this.hashPair(cur.id, nxt.id)) % 180;
		const a = (hash * Math.PI) / 180;
		nxt.x = cur.x + Math.cos(a) * d;
		nxt.y = cur.y + Math.sin(a) * d;

		// Adjust rotation so teeth mesh at contact point
		const contactAngle = Math.atan2(nxt.y - cur.y, nxt.x - cur.x);

		// Align tooth pitch so a tooth from cur meets a gap on nxt.
		const curTeeth = cur.teeth ?? Math.max(4, Math.round(curPitchR * 1.2));
		const nxtTeeth = nxt.teeth ?? Math.max(4, Math.round(nxtPitchR * 1.2));
		const curStep = (2 * Math.PI) / curTeeth;
		const nxtStep = (2 * Math.PI) / nxtTeeth;

		// cur: make contactAngle hit a tooth centerline
		const kCur = Math.round(contactAngle / curStep);
		const curRot = contactAngle - kCur * curStep;
		cur.rotation = ((curRot * 180) / Math.PI) % 360;

		// nxt: make opposite contact (contactAngle+π) hit a gap centerline (half-tooth offset)
		const contactB = contactAngle + Math.PI;
		const kNxt = Math.round(contactB / nxtStep - 0.5);
		const nxtRot = contactB - (kNxt + 0.5) * nxtStep;
		nxt.rotation = ((nxtRot * 180) / Math.PI) % 360;
	}

	/** Quick hash for deterministic mesh angles */
	private static hashPair(a: string, b: string): number {
		let h = 2166136261 >>> 0;
		const s = a + '|' + b;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return h | 0;
	}
}

export default GearLayoutEngine;
