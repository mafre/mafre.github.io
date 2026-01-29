import type { CSSProperties, ReactNode } from 'react';
import { DEFAULT_SVG_HEIGHT, DEFAULT_SVG_WIDTH } from '../config';

export interface SvgContainerProps {
	children: ReactNode;
	svgWidth?: number;
	svgHeight?: number;
	overlay?: boolean;
}

/**
 * Encapsulates SVG layout concerns (viewBox, size, and base styles).
 */
class SvgContainerLayout {
	readonly width: number;
	readonly height: number;
	readonly overlay: boolean;

	constructor(width: number, height: number, overlay?: boolean) {
		this.width = width;
		this.height = height;
		this.overlay = !!overlay;
	}

	get viewBox(): string {
		const { width, height } = this;
		return `-${width / 2} -${height / 2} ${width} ${height}`;
	}

	get style(): CSSProperties {
		const base: CSSProperties = { display: 'block', margin: '0 auto', overflow: 'visible' };
		if (!this.overlay) return base;
		return {
			...base,
			position: 'absolute',
			left: 0,
			top: 0,
			pointerEvents: 'none',
		};
	}
}

export default function Container({
	children,
	svgWidth = DEFAULT_SVG_WIDTH,
	svgHeight = DEFAULT_SVG_HEIGHT,
	overlay,
}: SvgContainerProps) {
	const layout = new SvgContainerLayout(svgWidth, svgHeight, overlay);

	return (
		<svg
			viewBox={layout.viewBox}
			width={layout.width}
			height={layout.height}
			style={layout.style}
			imageRendering="optimizeQuality"
			preserveAspectRatio="xMidYMid meet"
		>
			{children}
		</svg>
	);
}
