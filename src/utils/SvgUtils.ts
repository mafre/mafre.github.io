export interface NormalizedSvgStyle {
	cx: number;
	cy: number;
	stroke: string;
	fill: string;
	strokeWidth: number;
}

/**
 * SvgUtils: shared helpers for SVG-related coordinate and style handling.
 */
export class SvgUtils {
	/**
	 * Normalize common SVG options (center + stroke/fill styles) with defaults.
	 */
	static normalizeCenterAndStyle(
		opts: {
			centerX?: number;
			centerY?: number;
			stroke?: string;
			fill?: string;
			strokeWidth?: number;
		},
		defaults?: Partial<NormalizedSvgStyle>
	): NormalizedSvgStyle {
		const cx = opts.centerX ?? defaults?.cx ?? 200;
		const cy = opts.centerY ?? defaults?.cy ?? 200;
		const stroke = opts.stroke ?? defaults?.stroke ?? '#222';
		const fill = opts.fill ?? defaults?.fill ?? 'none';
		const strokeWidth = opts.strokeWidth ?? defaults?.strokeWidth ?? 1;

		return { cx, cy, stroke, fill, strokeWidth };
	}

	/** Convert polar coordinates (r, angleRad) to cartesian (x,y) around a center. */
	static polarToCartesian(
		cx: number,
		cy: number,
		radius: number,
		angleRad: number
	): { x: number; y: number } {
		return {
			x: cx + radius * Math.cos(angleRad),
			y: cy + radius * Math.sin(angleRad),
		};
	}
}

export default SvgUtils;
