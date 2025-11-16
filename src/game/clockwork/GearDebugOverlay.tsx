import React from 'react';
import { Clockwork } from './Clockwork';

export const GearDebugOverlay: React.FC<{ cw: Clockwork; centerX?: number; centerY?: number }> = ({
	cw,
	centerX = 0,
	centerY = 0,
}) => {
	const gears = cw.getGears();
	return (
		<g className="gear-debug" fontSize={6} fontFamily="monospace" fill="#333">
			{gears.map((g) => {
				const rot = g.rotation % 360;
				// Show more precision for slow moving gears
				const display = Math.abs(rot) < 100 ? rot.toFixed(2) : Math.round(rot).toString();
				return (
					<text key={g.id} x={centerX + g.x} y={centerY + g.y - (g.radius + 8)} textAnchor="middle">
						{g.id}:{display}°
					</text>
				);
			})}
		</g>
	);
};

export default GearDebugOverlay;
