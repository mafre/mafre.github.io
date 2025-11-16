import React from 'react';
import { Escapement } from './Escapement';
import { Clockwork } from './Clockwork';

interface AnchorProps {
	escapement: Escapement;
	clockwork: Clockwork;
	gearId?: string; // escape wheel id (defaults to escapement.gearId)
	centerX?: number;
	centerY?: number;
	stroke?: string;
	fill?: string;
}

/** Render a very simplified anchor with two rectangular pallets touching the escape wheel. */
export const Anchor: React.FC<AnchorProps> = ({
	escapement,
	clockwork,
	gearId,
	centerX = 0,
	centerY = 0,
	stroke = '#222',
	fill = '#666',
}) => {
	const id = gearId ?? escapement.gearId;
	const wheel = clockwork.getGear(id);
	if (!wheel) return null;

	const { anchorAngle, anchor } = escapement;
	const r = anchor.palletRadius;

	// Pallet orientation relative to anchor centerline
	const leftAngle = ((anchorAngle - anchor.palletAngle) * Math.PI) / 180;
	const rightAngle = ((anchorAngle + anchor.palletAngle) * Math.PI) / 180;

	const palletW = r * 0.25; // width along tangent
	const palletH = r * 0.08; // thickness radial

	const rectPoints = (angle: number) => {
		// Center point on circle
		const cx = centerX + Math.cos(angle) * r;
		const cy = centerY + Math.sin(angle) * r;
		// Tangent vector
		const tx = -Math.sin(angle);
		const ty = Math.cos(angle);
		// Radial inward
		const rx = Math.cos(angle);
		const ry = Math.sin(angle);
		const w2 = palletW / 2;
		const h = palletH;
		// Four corners (approx rectangle) outward orientation
		return [
			[cx - tx * w2, cy - ty * w2],
			[cx + tx * w2, cy + ty * w2],
			[cx + tx * w2 + rx * h, cy + ty * w2 + ry * h],
			[cx - tx * w2 + rx * h, cy - ty * w2 + ry * h],
		];
	};

	const toPath = (pts: number[][]) =>
		pts.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' ');

	const leftPts = rectPoints(leftAngle);
	const rightPts = rectPoints(rightAngle);

	// Highlight engaged pallet with different fill
	const leftFill = escapement.engagedPallet === 'left' ? '#d33' : fill;
	const rightFill = escapement.engagedPallet === 'right' ? '#3ad' : fill;

	// Locked tooth arc segment
	let toothArc: React.ReactNode = null;
	if (escapement.locked) {
		const toothAngleDeg = escapement.currentLockedTooth * escapement.degreesPerTooth;
		const startDeg = toothAngleDeg - escapement.degreesPerTooth / 2;
		const endDeg = toothAngleDeg + escapement.degreesPerTooth / 2;
		const startRad = (startDeg * Math.PI) / 180;
		const endRad = (endDeg * Math.PI) / 180;
		const arcR = wheel.radius + 4; // slightly outside wheel
		const sx = centerX + arcR * Math.cos(startRad);
		const sy = centerY + arcR * Math.sin(startRad);
		const ex = centerX + arcR * Math.cos(endRad);
		const ey = centerY + arcR * Math.sin(endRad);
		const large = 0;
		toothArc = (
			<path
				d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${arcR} ${arcR} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
				stroke="#fa0"
				strokeWidth={2}
				fill="none"
			/>
		);
	}

	return (
		<g className="anchor" stroke={stroke} strokeWidth={0.5}>
			{/* Swing envelope arc */}
			{(() => {
				const swing = anchor.swingDegrees;
				const rSwing = r * 1.05;
				const start = ((-swing / 2) * Math.PI) / 180;
				const end = ((swing / 2) * Math.PI) / 180;
				const sx = centerX + rSwing * Math.cos(start);
				const sy = centerY + rSwing * Math.sin(start);
				const ex = centerX + rSwing * Math.cos(end);
				const ey = centerY + rSwing * Math.sin(end);
				return (
					<path
						d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${rSwing} ${rSwing} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
						stroke="#888"
						strokeWidth={0.5}
						fill="none"
						strokeDasharray="2,2"
					/>
				);
			})()}

			{/* Anchor arm (centerline) */}
			{(() => {
				const a = (anchorAngle * Math.PI) / 180;
				const ax = centerX + r * 0.7 * Math.cos(a);
				const ay = centerY + r * 0.7 * Math.sin(a);
				return <line x1={centerX} y1={centerY} x2={ax} y2={ay} stroke="#444" strokeWidth={1} />;
			})()}

			{/* Pallets */}
			<polygon points={toPath(leftPts)} fill={leftFill} />
			<polygon points={toPath(rightPts)} fill={rightFill} />

			{/* Unlock threshold guides */}
			{(() => {
				const clearanceDeg = anchor.palletFaceDeg * 0.5;
				const unlock = anchor.swingDegrees / 2 - clearanceDeg;
				const angles = [unlock, -unlock];
				const rGuide = r * 1.2;
				return angles.map((deg, i) => {
					const rad = (deg * Math.PI) / 180;
					const gx = centerX + rGuide * Math.cos(rad);
					const gy = centerY + rGuide * Math.sin(rad);
					return (
						<line
							key={i}
							x1={centerX}
							y1={centerY}
							x2={gx}
							y2={gy}
							stroke={i === 0 ? '#0af' : '#0af'}
							strokeWidth={0.5}
							strokeDasharray="3,2"
						/>
					);
				});
			})()}

			{/* Pallet face angle markers */}
			{(() => {
				const faces = [anchorAngle - anchor.palletAngle, anchorAngle + anchor.palletAngle];
				const rFace = r * 0.9;
				return faces.map((deg, i) => {
					const rad = (deg * Math.PI) / 180;
					const fx = centerX + rFace * Math.cos(rad);
					const fy = centerY + rFace * Math.sin(rad);
					return (
						<circle
							key={i}
							cx={fx}
							cy={fy}
							r={1.1}
							fill={i === 0 ? '#d33' : '#3ad'}
							stroke="none"
						/>
					);
				});
			})()}

			{toothArc}
			{/* Tooth index label */}
			{escapement.locked && (
				<text x={centerX} y={centerY - (r + 12)} fontSize={6} textAnchor="middle" fill="#fa0">
					T{escapement.currentLockedTooth}
				</text>
			)}
			{/* pivot */}
			<circle cx={centerX} cy={centerY} r={3} fill={stroke} />
		</g>
	);
};

export default Anchor;
