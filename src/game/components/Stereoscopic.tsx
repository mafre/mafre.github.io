import React from 'react';
/**
 * Simple stereoscopic SVG generator (cross-eyed by default).
 * Produces two side-by-side projections of a 3D curve using a pinhole camera.
 *
 * Usage (Node / browser):
 *   const svg = generateStereoSVG();
 *   console.log(svg);
 */

type Vec3 = { x: number; y: number; z: number };
type Vec2 = { x: number; y: number };

function projectPinhole(p: Vec3, eyeX: number, eyeZ: number, f: number): Vec2 {
	// camera looks towards +Z; image plane is at z = eyeZ + f
	const x = p.x - eyeX;
	const y = p.y;
	const z = p.z - eyeZ;

	// Avoid division by zero / behind camera
	const denom = Math.max(0.0001, z);
	return { x: (f * x) / denom, y: (f * y) / denom };
}

function polyline(points: Vec2[], offsetX: number, offsetY: number, scale: number) {
	return points
		.map((q) => `${(q.x * scale + offsetX).toFixed(2)},${(q.y * scale + offsetY).toFixed(2)}`)
		.join(' ');
}

export function generateStereoSVG(
	opts?: Partial<{
		width: number;
		height: number;
		gap: number;
		margin: number;
		// camera
		eyeSeparation: number; // world units
		eyeZ: number; // world units
		focal: number; // world units
		// curve
		samples: number;
		turns: number;
		radius: number;
		zSpan: number;
		// arrangement
		crossEyed: boolean; // true: swap L/R for cross-eyed viewing
	}>
): React.ReactElement {
	const width = opts?.width ?? 900;
	const height = opts?.height ?? 360;
	const gap = opts?.gap ?? 24;
	const margin = opts?.margin ?? 18;

	const panelW = (width - gap - margin * 2) / 2;
	const panelH = height - margin * 2;

	const eyeSeparation = opts?.eyeSeparation ?? 0.4;
	const eyeZ = opts?.eyeZ ?? -2.2;
	const focal = opts?.focal ?? 1.8;

	const samples = opts?.samples ?? 900;
	const turns = opts?.turns ?? 5;
	const radius = opts?.radius ?? 0.85;
	const zSpan = opts?.zSpan ?? 3.6;

	const crossEyed = opts?.crossEyed ?? true;

	// Build a simple 3D helix curve
	const pts3: Vec3[] = [];
	for (let i = 0; i < samples; i++) {
		const t = i / (samples - 1);
		const ang = t * turns * Math.PI * 2;
		const z = t * zSpan; // increasing z
		// add a mild wobble so the stereo effect is obvious
		const wobble = 0.12 * Math.sin(ang * 3.0);
		pts3.push({
			x: (radius + wobble) * Math.cos(ang),
			y: (radius + wobble) * Math.sin(ang) * 0.55,
			z,
		});
	}

	// Project for each eye
	const leftEyeX = -eyeSeparation / 2;
	const rightEyeX = +eyeSeparation / 2;

	const projL: Vec2[] = [];
	const projR: Vec2[] = [];

	for (const p of pts3) {
		projL.push(projectPinhole(p, leftEyeX, eyeZ, focal));
		projR.push(projectPinhole(p, rightEyeX, eyeZ, focal));
	}

	// Fit into panel (compute bounds across both projections)
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;
	for (const q of [...projL, ...projR]) {
		minX = Math.min(minX, q.x);
		maxX = Math.max(maxX, q.x);
		minY = Math.min(minY, q.y);
		maxY = Math.max(maxY, q.y);
	}

	const spanX = Math.max(1e-6, maxX - minX);
	const spanY = Math.max(1e-6, maxY - minY);

	// Scale with padding inside each panel
	const pad = 0.08; // 8% padding
	const scaleX = (panelW * (1 - pad * 2)) / spanX;
	const scaleY = (panelH * (1 - pad * 2)) / spanY;
	const scale = Math.min(scaleX, scaleY);

	// Center in each panel
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;

	const panelCenterY = margin + panelH / 2;
	const leftPanelCenterX = margin + panelW / 2;
	const rightPanelCenterX = margin + panelW + gap + panelW / 2;

	// Decide which projection goes to which panel
	// Cross-eyed viewing works best when the right-eye image is on the left and vice versa.
	const A = crossEyed ? projR : projL; // left panel
	const B = crossEyed ? projL : projR; // right panel

	// Convert projected points into panel space
	const toPanel = (pts: Vec2[], panelCenterX: number) => {
		const normalized = pts.map((q) => ({ x: q.x - cx, y: q.y - cy }));
		return polyline(normalized, panelCenterX, panelCenterY, scale);
	};

	const pathA = toPanel(A, leftPanelCenterX);
	const pathB = toPanel(B, rightPanelCenterX);

	// Styling: simple neon-like line on dark background
	const stroke = '#9ae6ff';
	const stroke2 = '#ffffff';

	return (
		<g>
			<defs>
				<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="2.2" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			<rect x="0" y="0" width={`${width}`} height={`${height}`} fill="#0b0f14" />
			<rect
				x={margin}
				y={margin}
				width={panelW}
				height={panelH}
				rx="10"
				fill="#0b0f14"
				stroke="#273241"
			/>
			<rect
				x={margin + panelW + gap}
				y={margin}
				width={panelW}
				height={panelH}
				rx="10"
				fill="#0b0f14"
				stroke="#273241"
			/>
			<polyline
				points={pathA}
				fill="none"
				stroke={stroke}
				strokeWidth="2"
				filter="url(#glow)"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.95"
			/>
			<polyline
				points={pathA}
				fill="none"
				stroke={stroke2}
				strokeWidth="0.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.85"
			/>
			<polyline
				points={pathB}
				fill="none"
				stroke={stroke}
				strokeWidth="2"
				filter="url(#glow)"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.95"
			/>
			<polyline
				points={pathB}
				fill="none"
				stroke={stroke2}
				strokeWidth="0.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity="0.85"
			/>
			<text
				x={margin}
				y={height - 8}
				fill="#93a4b8"
				fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
				fontSize={12}
			>
				Stereo SVG (${crossEyed ? 'cross-eyed' : 'parallel'}) — tweak eyeSeparation/focal for depth
			</text>
		</g>
	);
}
