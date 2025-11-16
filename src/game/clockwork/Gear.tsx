import React from 'react';

export default class Gear {
	id: string;
	ratio: number;
	rotation: number;
	teeth?: number;
	x: number;
	y: number;
	radius: number;
	layer: number;
	axleId?: string;
	toothRootRatio?: number; // [0,1], default 0.8
	toothTopRatio?: number; // [0,1], default 0.5,
	toothDepth?: number; // absolute length in px, overrides ratios if set

	constructor(
		id: string,
		ratio: number,
		rotation = 0,
		teeth?: number,
		x: number = 0,
		y: number = 0,
		radius: number = 50,
		layer: number = 0,
		axleId?: string,
		toothRootRatio?: number,
		toothTopRatio?: number,
		toothDepth?: number
	) {
		this.id = id;
		this.ratio = ratio;
		this.rotation = rotation;
		this.teeth = teeth;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.layer = layer;
		this.axleId = axleId;
		this.toothRootRatio = toothRootRatio;
		this.toothTopRatio = toothTopRatio;
		this.toothDepth = toothDepth;
	}

	advance(baseRotation: number) {
		this.rotation = (baseRotation * this.ratio) % 360;
	}

	/**
	 * Render this gear as SVG <g> string with teeth polygons + bore.
	 * Geometry: trapezoid teeth around a base radius. Rotation applied.
	 */
	renderSVG(opts: {
		cx: number; // center x
		cy: number; // center y
		radius?: number; // outer radius (tip radius). Default 50
		toothDepth?: number; // tip-to-root radial depth. Default radius*0.18
		teeth?: number; // overrides this.teeth
		boreRadius?: number; // center hole. Default radius*0.22
		stroke?: string; // default "currentColor"
		fill?: string; // tooth fill. Default "none"
		strokeWidth?: number; // default 1
		className?: string; // <g class="...">
		id?: string; // <g id="...">
		showPitch?: boolean; // draw pitch circle. Default false
		pitchRadius?: number; // optional pitch radius (visual)
		toothTopRatio?: number; // tip angular width ratio in [0,1], default 0.5
		toothRootRatio?: number; // root angular width ratio in [0,1], default 0.8
	}): React.ReactElement {
		const {
			cx,
			cy,
			radius = 50,
			toothDepth = radius * 0.18,
			teeth = this.teeth ?? 60,
			boreRadius = 10,
			stroke = 'currentColor',
			fill = '#000',
			strokeWidth = 1,
			className,
			id,
			showPitch = false,
			pitchRadius,
			toothTopRatio = 0.4,
			toothRootRatio = 0.8,
		} = opts;

		if (teeth < 4) throw new Error('teeth must be >= 4');
		const tipR = radius;
		const rootR = Math.max(0, radius - toothDepth);
		const θ = (2 * Math.PI) / teeth;
		// Define geometry in unrotated space; rotate the whole group instead so
		// teeth, image and mask all rotate together.
		const rot = 0;
		const esc = (s: string | undefined) => (s ? s.replace(/"/g, '&quot;') : undefined);

		// compute tooth vertices
		// angle offsets from tooth centerline (tip-leading edge direction)
		// root is wider than tip for visual effect

		const polar = (r: number, a: number) => ({
			x: cx + r * Math.cos(a),
			y: cy + r * Math.sin(a),
		});

		const polys: React.ReactNode[] = [];
		const tipHalf = (θ * toothTopRatio) / 2;
		const rootHalf = (θ * toothRootRatio) / 2;

		for (let i = 0; i < teeth; i++) {
			const a = i * θ + rot;
			const p1 = polar(rootR, a - rootHalf);
			const p2 = polar(tipR, a - tipHalf);
			const p3 = polar(tipR, a + tipHalf);
			const p4 = polar(rootR, a + rootHalf);

			polys.push(
				<polygon
					key={i}
					points={`${p1.x.toFixed(3)},${p1.y.toFixed(3)} ${p2.x.toFixed(3)},${p2.y.toFixed(3)} ${p3.x.toFixed(3)},${p3.y.toFixed(3)} ${p4.x.toFixed(3)},${p4.y.toFixed(3)}`}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
				/>
			);
		}

		// bore (hole)
		const bore =
			boreRadius > 0 ? (
				<circle
					cx={cx}
					cy={cy}
					r={boreRadius.toFixed(3)}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
				/>
			) : null;

		// optional pitch circle
		const pitch = showPitch ? (
			<circle
				cx={cx}
				cy={cy}
				r={(pitchRadius ?? (rootR + tipR) / 2).toFixed(3)}
				fill="none"
				stroke={stroke}
				strokeDasharray="2,2"
				strokeWidth={Math.max(0.5, strokeWidth * 0.75)}
			/>
		) : null;

		const attrs = {
			className: esc(className),
			id: esc(id),
		};

		return (
			<g filter="url(#shadow)">
				<defs>
					{/* Use userSpaceOnUse and enlarge filter region to avoid clipping of shadows */}
					<filter
						id="shadow"
						filterUnits="userSpaceOnUse"
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
					>
						<feDropShadow dx="0" dy="0" stdDeviation="2" amplitude={10} accentHeight={10} />
					</filter>
				</defs>
				<g {...attrs} transform={`rotate(${this.rotation} ${cx} ${cy})`}>
					{/* Position mask to the gear's image box so coordinates match exactly */}
					<mask
						id={`mask-${this.id}`}
						maskUnits="userSpaceOnUse"
						maskContentUnits="userSpaceOnUse"
						x={cx - radius}
						y={cy - radius}
						width={radius * 2}
						height={radius * 2}
					>
						{/* Directly render mask shapes with fill='white' */}
						{Array.from({ length: teeth }, (_, i) => {
							const a = i * θ + rot;
							const p1 = polar(rootR, a - rootHalf);
							const p2 = polar(tipR, a - tipHalf);
							const p3 = polar(tipR, a + tipHalf);
							const p4 = polar(rootR, a + rootHalf);
							return (
								<polygon
									key={i}
									points={`${p1.x.toFixed(3)},${p1.y.toFixed(3)} ${p2.x.toFixed(3)},${p2.y.toFixed(3)} ${p3.x.toFixed(3)},${p3.y.toFixed(3)} ${p4.x.toFixed(3)},${p4.y.toFixed(3)}`}
									fill="white"
								/>
							);
						})}
						<circle cx={cx} cy={cy} r={rootR.toFixed(3)} fill="white" />
						{bore && <circle cx={cx} cy={cy} r={boreRadius.toFixed(3)} fill="white" />}
						{pitch && (
							<circle
								cx={cx}
								cy={cy}
								r={(pitchRadius ?? (rootR + tipR) / 2).toFixed(3)}
								fill="white"
							/>
						)}
						{boreRadius > 0 && <circle cx={cx} cy={cy} r={boreRadius.toFixed(3)} fill="black" />}
					</mask>
					<image
						x={cx - radius}
						y={cy - radius}
						width={radius * 2}
						height={radius * 2}
						href="gear.png"
						mask={`url(#mask-${this.id})`}
					/>
				</g>
			</g>
		);
	}
}
