/**
 * Simple harmonic oscillator model for a clock (e.g., pendulum or balance wheel).
 * Maintains a phase in radians and produces discrete 'beats' at zero crossings.
 */
export class Oscillator {
  /** Angular frequency ω = 2π / period (rad/ms) */
  readonly omega: number;
  /** Current phase (radians) */
  phase: number = 0;
  /** Amplitude in arbitrary units (can modulate escapement impulse) */
  amplitude: number;
  /** Period in ms */
  readonly period: number;
  /** Last sign of sin(phase) for zero-cross detection */
  private lastSign: number = 0;

  constructor(periodMs: number = 1000, amplitude: number = 1) {
    this.period = periodMs;
    this.omega = (2 * Math.PI) / periodMs;
    this.amplitude = amplitude;
  }

  /** Advance oscillator by dt milliseconds; returns true if a beat occurred. */
  update(dt: number): boolean {
    this.phase += this.omega * dt;
    // Keep phase bounded to avoid float growth
    if (this.phase > 1e6) this.phase %= (2 * Math.PI);
    const v = Math.sin(this.phase);
    const sign = v >= 0 ? 1 : -1;
    let beat = false;
    if (this.lastSign !== 0 && sign !== this.lastSign) {
      beat = true; // crossed zero
    }
    this.lastSign = sign;
    return beat;
  }

  /** Optional damping: reduces amplitude slightly each update */
  damp(factor: number = 0.0001) {
    this.amplitude = Math.max(0, this.amplitude * (1 - factor));
  }

  /** Impulse: increase amplitude (e.g., escapement gives energy) */
  impulse(amount: number = 0.05) {
    this.amplitude += amount;
  }
}

export default Oscillator;