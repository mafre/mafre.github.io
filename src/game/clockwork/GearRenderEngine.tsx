import React from 'react';
import Gear from './Gear';
import SvgUtils from '../../utils/SvgUtils';

export interface ClockworkRenderOptions {
	centerX?: number;
	centerY?: number;
	drawAxles?: boolean;
	axleStroke?: string;
	axleRadius?: number;
	stroke?: string;
	fill?: string;
	strokeWidth?: number;
	selectedGearId?: string;
	onGearClick?: (gearId: string) => void;
}

/**
 * GearRenderEngine: responsible only for rendering a collection of gears as SVG.
 *
 * It does not mutate the graph (layout/rotation are assumed to be precomputed).
 */
export class GearRenderEngine {
	/** Render all gears; overlapping coaxials are layered by `layer` then id. */
	static renderSVG(
		gearsIterable: Iterable<Gear>,
		opts: ClockworkRenderOptions = {}
	): React.ReactNode {
		const { cx, cy, stroke, fill, strokeWidth: sw } = SvgUtils.normalizeCenterAndStyle(opts);

		const gears = Array.from(gearsIterable).sort(
			(g1, g2) => g1.layer - g2.layer || g1.id.localeCompare(g2.id)
		);

		const parts = gears.map((g) => {
			const isSelected = opts.selectedGearId === g.id;
			const el = g.renderSVG({
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
				className: `gear gear-${g.id}${isSelected ? ' gear-selected' : ''}`,
			});
			return React.cloneElement(el, {
				key: g.id,
				onMouseDown: (e: React.MouseEvent) => {
					if (!opts.onGearClick) return;
					e.preventDefault();
					e.stopPropagation();
					opts.onGearClick(g.id);
				},
				style: opts.onGearClick ? { cursor: 'pointer' } : undefined,
			});
		});

		if (opts.drawAxles) {
			const groups = new Map<string, { x: number; y: number }>();
			for (const g of gears) {
				const key = g.axleId ?? `axle:${g.id}`;

				groups.get(key) ?? groups.set(key, { x: cx + g.x, y: cy + g.y }).get(key)!;
			}
			// Currently groups are computed for possible future axle rendering; no SVG output yet.
		}

		return <>{parts}</>;
	}
}

export default GearRenderEngine;
