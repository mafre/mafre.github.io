import { Clockwork } from "./Clockwork";
import Oscillator from "./Oscillator";

/**
 * Escapement couples an Oscillator to the gear train, releasing one tooth per beat.
 * For simplicity we directly increment the seconds gear rotation by a fixed angle per released tooth.
 */
export interface AnchorGeometry {
  /** Total swing arc (degrees) of the anchor centerline */
  swingDegrees: number;
  /** Pallet lock angle offset from centerline (deg) */
  palletAngle: number;
  /** Distance from anchor pivot to pallet face (px) */
  palletRadius: number;
  /** Width of each pallet face (deg along escape wheel) */
  palletFaceDeg: number;
}

export class Escapement {
  cw: Clockwork;
  oscillator: Oscillator;
  /** ID of the escape (seconds) gear */
  gearId: string;
  /** Degrees advanced per released tooth */
  degreesPerTooth: number;
  /** Teeth released so far */
  released: number = 0;
  /** Accumulator for partial beats (allows fractional tooth release if desired) */
  private beatAccumulator: number = 0;
  /** Beats per tooth (e.g., 2 beats per tooth for a typical tick-tock) */
  beatsPerTooth: number;

  anchor: AnchorGeometry;
  anchorAngle: number = 0; // current centerline angle (deg)
  /** Current locked state: true if a tooth is held against a pallet */
  locked: boolean = true;
  /** Index of the tooth currently locked (conceptual; not stored in gear) */
  private toothIndex: number = 0;
  /** Escape wheel tooth count cache */
  private wheelTeeth: number = 60;
  /** Index of currently locked tooth (for visual highlight) */
  currentLockedTooth: number = 0;
  /** Which pallet is engaging: 'left' | 'right' | null */
  engagedPallet: 'left' | 'right' | null = 'left';

  /** Timestamp (ms) of last released tooth */
  private lastReleaseTime: number = performance.now();
  /** Fallback drive threshold (ms) after which we nudge gear if no release occurred */
  private fallbackDriveThresholdMs: number = 0;
  /** Degrees per second to nudge when fallback engaged */
  private fallbackDriveDegPerSec: number = 0;

  constructor(cw: Clockwork, gearId: string, oscillator: Oscillator, opts: { degreesPerTooth?: number; beatsPerTooth?: number; anchor?: Partial<AnchorGeometry>; fallbackDriveThresholdMs?: number; fallbackDriveDegPerSec?: number; } = {}) {
    this.cw = cw;
    this.gearId = gearId;
    this.oscillator = oscillator;
    // Auto compute degreesPerTooth from gear teeth if available else fallback
    const g = cw.getGear(gearId);
    const autoDeg = g?.teeth ? (360 / g.teeth) : 6;
    this.degreesPerTooth = opts.degreesPerTooth ?? autoDeg;
    this.beatsPerTooth = opts.beatsPerTooth ?? 2; // tick & tock
    this.fallbackDriveThresholdMs = opts.fallbackDriveThresholdMs ?? 0;
    this.fallbackDriveDegPerSec = opts.fallbackDriveDegPerSec ?? 0;
    this.anchor = {
      swingDegrees: opts.anchor?.swingDegrees ?? 10, // widen swing for clearer unlock
      palletAngle: opts.anchor?.palletAngle ?? 12,
      palletRadius: opts.anchor?.palletRadius ?? 30,
      palletFaceDeg: opts.anchor?.palletFaceDeg ?? 3, // narrower face -> easier unlock
    };
  }

  /** Update escapement; returns number of teeth released this frame. */
  update(dt: number): number {
  const beat = this.oscillator.update(dt);
    if (beat) {
      this.beatAccumulator += 1;
      // Each beat gives a tiny impulse to keep oscillator going
      this.oscillator.impulse(0.001);
      // Update anchor angle: map oscillator phase (-amplitude..amplitude) to swingDegrees
  // Use cosine so zero-cross (beat) happens at swing extremes, improving natural unlock timing
  const norm = Math.cos(this.oscillator.phase); // [-1,1]
  this.anchorAngle = norm * (this.anchor.swingDegrees / 2);
      // Evaluate lock/unlock based on anchor angle vs pallet thresholds
      this.evaluateLock();
      // Beat occurred: anchor angle updated; logging removed.
    }
    let releasedThisFrame = 0;
    while (this.beatAccumulator >= this.beatsPerTooth) {
      this.beatAccumulator -= this.beatsPerTooth;
      // Only release if unlocked
      if (!this.locked) {
        this.releaseTooth();
        releasedThisFrame++;
        // Lock again until next swing returns toward center
        this.locked = true;
        // Release executed; logging removed.
      }
    }
    // Fallback: if enabled and too long since last release, nudge gear forward for visual motion
    if (this.fallbackDriveThresholdMs > 0 && this.fallbackDriveDegPerSec > 0) {
      const now = performance.now();
      const since = now - this.lastReleaseTime;
      if (since >= this.fallbackDriveThresholdMs) {
        const gear = this.cw.getGear(this.gearId);
        if (gear) {
          const advance = (this.fallbackDriveDegPerSec * dt) / 1000;
          gear.rotation = (gear.rotation + advance) % 360;
        }
      }
    }
    return releasedThisFrame;
  }

  /** Determine if the pallet is still locking the next tooth or has unlocked allowing advance */
  private evaluateLock() {
    const gear = this.cw.getGear(this.gearId);
    if (!gear) return;
    this.wheelTeeth = gear.teeth ?? this.wheelTeeth;
    // Lock occurs when anchor angle magnitude is below half swing minus a clearance margin.
    // Unlock when anchor passes a threshold angle letting the escape tooth drop.
    const clearanceDeg = this.anchor.palletFaceDeg * 0.5; // simplistic
    const unlockThreshold = (this.anchor.swingDegrees / 2) - clearanceDeg;
    const absAngle = Math.abs(this.anchorAngle);
    if (absAngle >= unlockThreshold) {
      // Unlock: allow release
      this.locked = false;
    } else {
      this.locked = true;
    }
    // Decide engaged pallet by sign of anchorAngle when locked
    this.engagedPallet = this.locked ? (this.anchorAngle >= 0 ? 'right' : 'left') : null;
    if (this.locked) {
      // Determine which tooth is locked by current wheel rotation
      this.currentLockedTooth = Math.floor(((gear.rotation % 360) + 360) / this.degreesPerTooth) % this.wheelTeeth;
    }
  }

  private releaseTooth() {
    const gear = this.cw.getGear(this.gearId);
    if (!gear) return;
    // Advance rotation of the escape gear (seconds gear)
    gear.rotation = (gear.rotation + this.degreesPerTooth) % 360;
    // Tooth advancement logging removed.
    this.released++;
    this.toothIndex = (this.toothIndex + 1) % this.wheelTeeth;
    this.currentLockedTooth = this.toothIndex; // next tooth conceptually locked after drop
    this.lastReleaseTime = performance.now();
  }
}

/**
 * Future improvements:
 * - Implement anchor pallets geometry interacting with an escape wheel.
 * - Variable impulse dependent on oscillator amplitude (simulate energy feedback).
 * - Add a mainspring/barrel providing torque, with gradual unwinding.
 * - Simulate friction leading to amplitude decay if no impulse.
 * - Support adjustable beat (period) and calibration routine.
 * - Deadbeat escapement modeling: pallets at slightly differing radial distances to eliminate recoil.
 * - Recoil simulation for anchor, storing previous gear rotation delta.
 * - Drop & lock calibration: measure angle overshoot vs required tooth clearance.
 */

export default Escapement;