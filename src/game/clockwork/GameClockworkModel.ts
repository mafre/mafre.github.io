import type { ReactNode } from 'react';
import { Clockwork } from './Clockwork';
import GearRenderEngine from './GearRenderEngine';
import Escapement from './Escapement';

/**
 * Instantiable game clockwork model: builds the gear train, advances animation,
 * and knows how to render itself via the GearRenderEngine.
 */
export class GameClockworkModel {
	private readonly clockwork: Clockwork;
	private readonly barrelId = 'gear1';
	private trainEndGearId: string;
	private nextGearIndex: number;
	private nextAxleIndex: number;
	private escapement: Escapement;
	private escapementEnabled = true;

	constructor() {
		this.clockwork =  new Clockwork();
		this.trainEndGearId = this.barrelId;
		this.nextGearIndex = 2; // gear1 is the barrel
		this.nextAxleIndex = 1;

		// Create initial barrel gear
		this.clockwork.generateGear({
			id: this.barrelId,
			ratio: 4,
			teeth: 40,
			radius: 40,
			layer: 0,
		});

		// Position connected gears
		this.clockwork.positionConnected(this.barrelId);

		// Default: treat the current end gear as the escape wheel.
		this.escapement = new Escapement({ gearId: this.trainEndGearId, periodMs: 1000 });
		this.escapement.syncFromClockwork(this.clockwork);
	}

	/** Access underlying mechanical model if needed. */
	get model(): Clockwork {
		return this.clockwork;
	}

	getEscapement(): Escapement {
		return this.escapement;
	}

	get escapementOn(): boolean {
		return this.escapementEnabled;
	}

	setEscapementEnabled(on: boolean): void {
		this.escapementEnabled = on;
	}

	createGear(teeth: number) {
		const id = `gear${this.nextGearIndex++}`;
		const axleId = `axle${this.nextAxleIndex++}`;
		const prevId = this.trainEndGearId;
		const prevLayer = this.clockwork.getGear(prevId)?.layer ?? 0;

		this.clockwork.generateGear({
			id,
			ratio: 1,
			teeth,
			radius: Math.max(8, teeth),
			axleId,
			layer: prevLayer + 1,
		});

		this.clockwork.connect(prevId, id, 'mesh');
		this.trainEndGearId = id;
		this.escapement.setGearId(this.trainEndGearId);
		this.escapement.syncFromClockwork(this.clockwork);

		this.clockwork.positionConnected(this.barrelId);
	}

	updateGear(
		gearId: string,
		updates: {
			teeth?: number;
			radius?: number;
			layer?: number;
			axleId?: string;
			toothDepth?: number;
			toothTopRatio?: number;
			toothRootRatio?: number;
		}
	): boolean {
		const gear = this.clockwork.getGear(gearId);
		if (!gear) return false;

		const prevRadius = gear.radius;
		const prevTeeth = gear.teeth;
		const prevToothDepth = gear.toothDepth;
		const prevPitch = this.pitchPerToothFrom(prevRadius, prevTeeth, prevToothDepth);

		const meshedNeighborIds = this.getMeshedNeighborIds(gearId);
		const isMeshed = meshedNeighborIds.length > 0;

		// Apply toothDepth first so pitch math can use the updated depth.
		if (updates.toothDepth !== undefined) {
			gear.toothDepth = Number.isNaN(updates.toothDepth)
				? undefined
				: Math.max(0, updates.toothDepth);
		}

		const teethUpdated = updates.teeth !== undefined && !Number.isNaN(updates.teeth);
		if (teethUpdated) {
			gear.teeth = Math.max(4, Math.round(updates.teeth as number));

			// Keep tooth pitch consistent with meshed neighbors so teeth interlock.
			const neighborPitch = isMeshed ? this.derivePitchFromMeshedNeighbors(gearId) : NaN;
			const fallbackPitch = Number.isFinite(prevPitch) && prevPitch > 0 ? prevPitch : 1;
			const targetPitch = Number.isFinite(neighborPitch) && neighborPitch > 0 ? neighborPitch : fallbackPitch;

			// If we're meshed and toothDepth isn't explicitly set, try to match depth/profile too.
			if (isMeshed && updates.toothDepth === undefined && gear.toothDepth === undefined) {
				const profile = this.deriveToothProfileFromMeshedNeighbors(gearId);
				if (Number.isFinite(profile.depthFactor) && profile.depthFactor > 0) {
					gear.toothDepth = Math.max(0, profile.depthFactor * targetPitch);
				}
				if (updates.toothTopRatio === undefined && gear.toothTopRatio === undefined && Number.isFinite(profile.topRatio)) {
					gear.toothTopRatio = profile.topRatio;
				}
				if (updates.toothRootRatio === undefined && gear.toothRootRatio === undefined && Number.isFinite(profile.rootRatio)) {
					gear.toothRootRatio = profile.rootRatio;
				}
			}

			// If toothDepth was explicitly set and user didn't override it, preserve the depth ratio.
			if (updates.toothDepth === undefined && prevToothDepth !== undefined && prevRadius > 0) {
				const depthRatio = prevToothDepth / prevRadius;
				const denom = Math.max(1e-6, 1 - depthRatio / 2);
				const newRadius = Math.max(1, ((gear.teeth ?? 0) * targetPitch) / denom);
				gear.radius = newRadius;
				gear.toothDepth = Math.max(0, depthRatio * newRadius);
			} else {
				gear.radius = this.tipRadiusForPitchPerTooth(gear, gear.teeth ?? 0, targetPitch);
			}
		} else if (updates.radius !== undefined && !Number.isNaN(updates.radius)) {
			gear.radius = Math.max(1, updates.radius);

			// If this gear is meshed, keep pitch consistent by adjusting teeth/radius to match neighbors.
			const neighborPitch = isMeshed ? this.derivePitchFromMeshedNeighbors(gearId) : NaN;
			if (Number.isFinite(neighborPitch) && neighborPitch > 0) {
				const pitchRadius = this.pitchRadiusOf(gear);
				const nextTeeth = Math.max(4, Math.round(pitchRadius / neighborPitch));
				gear.teeth = nextTeeth;
				gear.radius = this.tipRadiusForPitchPerTooth(gear, nextTeeth, neighborPitch);
			}
		}
		if (updates.layer !== undefined && !Number.isNaN(updates.layer)) {
			gear.layer = Math.max(0, Math.round(updates.layer));
		}
		if (updates.axleId !== undefined) {
			const trimmed = updates.axleId.trim();
			gear.axleId = trimmed.length > 0 ? trimmed : undefined;
		}
		if (updates.toothTopRatio !== undefined) {
			gear.toothTopRatio = Number.isNaN(updates.toothTopRatio)
				? undefined
				: Math.min(1, Math.max(0, updates.toothTopRatio));
		}
		if (updates.toothRootRatio !== undefined) {
			gear.toothRootRatio = Number.isNaN(updates.toothRootRatio)
				? undefined
				: Math.min(1, Math.max(0, updates.toothRootRatio));
		}

		// If the user edited tooth profile on a meshed gear, propagate it to neighbors.
		const profileEdited =
			updates.toothDepth !== undefined ||
			updates.toothTopRatio !== undefined ||
			updates.toothRootRatio !== undefined;
		if (isMeshed && profileEdited) {
			this.propagateToothProfileToMeshedNeighbors(gearId, meshedNeighborIds);
		}

		// Re-run layout so radius/layer/axle grouping changes are reflected.
		this.clockwork.positionConnected(this.barrelId);
		this.escapement.syncFromClockwork(this.clockwork);
		return true;
	}

	private effectiveToothTopRatio(gear: { toothTopRatio?: number }): number {
		return gear.toothTopRatio ?? 0.4;
	}

	private effectiveToothRootRatio(gear: { toothRootRatio?: number }): number {
		return gear.toothRootRatio ?? 0.8;
	}

	private toothDepthOf(gear: { radius: number; toothDepth?: number }): number {
		// Keep in sync with Gear.renderSVG default (radius * 0.18)
		return gear.toothDepth ?? gear.radius * 0.18;
	}

	private pitchRadiusOf(gear: { radius: number; toothDepth?: number }): number {
		const depth = this.toothDepthOf(gear);
		return Math.max(0, gear.radius - depth / 2);
	}

	private pitchPerToothFrom(radius: number, teeth?: number, toothDepth?: number): number {
		if (!teeth || teeth <= 0) return NaN;
		const depth = toothDepth ?? radius * 0.18;
		const pitchRadius = Math.max(0, radius - depth / 2);
		return pitchRadius / teeth;
	}

	private tipRadiusForPitchPerTooth(gear: { radius: number; toothDepth?: number }, teeth: number, pitch: number): number {
		const pitchRadius = Math.max(0, teeth * pitch);
		if (gear.toothDepth !== undefined) {
			return Math.max(1, pitchRadius + gear.toothDepth / 2);
		}
		// Implicit tooth depth uses a fixed ratio, so pitchRadius = R * (1 - ratio/2)
		const depthRatio = 0.18;
		const denom = Math.max(1e-6, 1 - depthRatio / 2);
		return Math.max(1, pitchRadius / denom);
	}

	private getMeshedNeighborIds(gearId: string): string[] {
		return this.clockwork
			.getConnections()
			.filter((c) => c.type === 'mesh' && (c.a === gearId || c.b === gearId))
			.map((c) => (c.a === gearId ? c.b : c.a));
	}

	private deriveToothProfileFromMeshedNeighbors(gearId: string): {
		depthFactor: number;
		topRatio: number;
		rootRatio: number;
	} {
		const neighborIds = this.getMeshedNeighborIds(gearId);
		const depthFactors: number[] = [];
		const tops: number[] = [];
		const roots: number[] = [];

		for (const id of neighborIds) {
			const g = this.clockwork.getGear(id);
			if (!g || !g.teeth || g.teeth <= 0) continue;
			const pitch = this.pitchRadiusOf(g) / g.teeth;
			const depth = this.toothDepthOf(g);
			if (Number.isFinite(pitch) && pitch > 0 && Number.isFinite(depth) && depth > 0) {
				depthFactors.push(depth / pitch);
			}
			tops.push(this.effectiveToothTopRatio(g));
			roots.push(this.effectiveToothRootRatio(g));
		}

		const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN);
		return {
			depthFactor: avg(depthFactors),
			topRatio: avg(tops),
			rootRatio: avg(roots),
		};
	}

	private propagateToothProfileToMeshedNeighbors(gearId: string, neighborIds: string[]): void {
		const src = this.clockwork.getGear(gearId);
		if (!src || !src.teeth || src.teeth <= 0) return;
		const srcPitch = this.pitchRadiusOf(src) / src.teeth;
		if (!Number.isFinite(srcPitch) || srcPitch <= 0) return;

		const srcDepth = this.toothDepthOf(src);
		const depthFactor = srcDepth / srcPitch;
		const top = this.effectiveToothTopRatio(src);
		const root = this.effectiveToothRootRatio(src);

		for (const nid of neighborIds) {
			const ng = this.clockwork.getGear(nid);
			if (!ng || !ng.teeth || ng.teeth <= 0) continue;

			// Keep pitch width consistent; then match tooth profile to source.
			const neighborPitch = this.pitchRadiusOf(ng) / ng.teeth;
			const pitchToUse = Number.isFinite(neighborPitch) && neighborPitch > 0 ? neighborPitch : srcPitch;

			ng.toothTopRatio = top;
			ng.toothRootRatio = root;
			ng.toothDepth = Math.max(0, depthFactor * pitchToUse);
			ng.radius = this.tipRadiusForPitchPerTooth(ng, ng.teeth, pitchToUse);
		}
	}

	private derivePitchFromMeshedNeighbors(gearId: string): number {
		const conns = this.clockwork
			.getConnections()
			.filter((c) => c.type === 'mesh' && (c.a === gearId || c.b === gearId));

		const pitches: number[] = [];
		for (const c of conns) {
			const otherId = c.a === gearId ? c.b : c.a;
			const other = this.clockwork.getGear(otherId);
			if (!other) continue;
			if (!other.teeth || other.teeth <= 0) continue;
			if (!Number.isFinite(other.radius) || other.radius <= 0) continue;
			pitches.push(this.pitchRadiusOf(other) / other.teeth);
		}

		if (!pitches.length) return NaN;
		return pitches.reduce((a, b) => a + b, 0) / pitches.length;
	}

	/** Advance the animation by a delta time in seconds. */
	advance(dtSeconds: number, speedDegPerSec = 15): void {
		if (this.escapementEnabled) {
			this.escapement.update(dtSeconds * 1000, this.clockwork);
			return;
		}

		const barrel = this.clockwork.getGear(this.barrelId);
		if (!barrel) return;

		const delta = speedDegPerSec * dtSeconds;
		barrel.rotation = (barrel.rotation + delta) % 360;
		this.clockwork.propagateDelta(this.barrelId, delta);
	}

	render(opts?: Parameters<typeof GearRenderEngine.renderSVG>[1]): ReactNode {
		return GearRenderEngine.renderSVG(this.clockwork.getGears(), opts ?? {});
	}
}

export default GameClockworkModel;
