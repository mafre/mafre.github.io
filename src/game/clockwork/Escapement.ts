import type { Clockwork } from './Clockwork';
import Oscillator from './Oscillator';

export type PalletSide = 'left' | 'right';

export interface AnchorGeometry {
	/** Radius at which pallets contact the escape wheel (px). */
	palletRadius: number;
	/** Angle between the two pallets around the anchor centerline (deg). */
	palletAngle: number;
	/** Visual-only: pallet face angle marker span (deg). */
	palletFaceDeg: number;
	/** Peak-to-peak anchor swing (deg). */
	swingDegrees: number;
}

/**
 * Minimal pendulum/anchor escapement model.
 *
 * This is intentionally simplified:
 * - pendulum/anchor angle is a sinusoid from an internal oscillator
 * - the escape wheel advances by exactly 1 tooth per beat (zero-crossing)
 * - a tiny impulse is applied each beat to keep motion going
 */
export class Escapement {
	gearId: string;
	oscillator: Oscillator;

	anchor: AnchorGeometry;
	/** Current anchor angle (deg). */
	anchorAngle: number = 0;

	locked: boolean = true;
	engagedPallet: PalletSide = 'left';
	currentLockedTooth: number = 0;
	degreesPerTooth: number = 6; // default; updated from gear.teeth when available

	constructor(opts: {
		gearId: string;
		periodMs?: number;
		anchor?: Partial<AnchorGeometry>;
	}) {
		this.gearId = opts.gearId;
		this.oscillator = new Oscillator(opts.periodMs ?? 1000, 1);
		this.anchor = {
			palletRadius: 40,
			palletAngle: 18,
			palletFaceDeg: 10,
			swingDegrees: 26,
			...(opts.anchor ?? {}),
		};
	}

	setGearId(gearId: string) {
		this.gearId = gearId;
		this.currentLockedTooth = 0;
	}

	syncFromClockwork(clockwork: Clockwork) {
		const wheel = clockwork.getGear(this.gearId);
		if (wheel?.teeth && wheel.teeth >= 4) {
			this.degreesPerTooth = 360 / wheel.teeth;
			// Keep lock index in range if teeth count changed
			this.currentLockedTooth = ((this.currentLockedTooth % wheel.teeth) + wheel.teeth) % wheel.teeth;
		}
		if (wheel) {
			// Roughly align locked tooth index with current wheel rotation.
			const rot = ((wheel.rotation % 360) + 360) % 360;
			this.currentLockedTooth = Math.round(rot / this.degreesPerTooth) % Math.max(1, wheel.teeth ?? 60);
		}
	}

	/** Advance the escapement and (on beats) step the escape wheel + propagate into the train. */
	update(dtMs: number, clockwork: Clockwork): void {
		// Update swing angle continuously
		const halfSwing = this.anchor.swingDegrees / 2;
		this.anchorAngle = Math.sin(this.oscillator.phase) * halfSwing;

		const beat = this.oscillator.update(dtMs);
		if (!beat) return;

		const wheel = clockwork.getGear(this.gearId);
		if (!wheel) return;

		// Ensure tooth step matches wheel tooth count
		this.syncFromClockwork(clockwork);

		// Toggle pallet each beat
		this.engagedPallet = this.engagedPallet === 'left' ? 'right' : 'left';

		// Step wheel by one tooth
		const delta = this.degreesPerTooth;
		wheel.rotation = (wheel.rotation + delta) % 360;
		clockwork.propagateDelta(this.gearId, delta);

		// Keep an approximate locked tooth index for visuals
		const teeth = wheel.teeth ?? Math.max(4, Math.round(wheel.radius * 1.2));
		this.currentLockedTooth = (this.currentLockedTooth + 1) % teeth;
		this.locked = true;

		// Tiny impulse to sustain motion (purely for feel)
		this.oscillator.impulse(0.01);
		this.oscillator.damp(0.00005);
	}
}

export default Escapement;
