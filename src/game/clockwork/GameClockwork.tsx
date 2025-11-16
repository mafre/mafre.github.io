import React, { useEffect, useMemo, useRef, useState } from 'react';
import GearFactory from './GearFactory';
import { Clockwork } from './Clockwork';

/**
 * GameClockwork
 * Builds a simple illustrative clock gear train inspired by the instructables diagram.
 *
 * Structure (wheel + driving pinion pairs on shared axles):
 *   Barrel(80T) -> CenterPinion(10T) coax CenterWheel(64T) -> MotionPinion(10T) coax HourWheel(48T)
 *     -> ThirdPinion(8T) coax ThirdWheel(60T) -> FourthPinion(8T) coax FourthWheel(75T) -> EscapePinion(7T) coax EscapeWheel(30T)
 *
 * Each "->" denotes a mesh connection between a wheel and the following pinion.
 * Coaxial pairs are locked together (same axle / rotation) but have different tooth counts.
 * This approximates typical clock reduction ratios while keeping counts moderate for rendering.
 */

/*
 M1: 36T → /12L  (=3)

M2: 30T → /10L  (=3)

M3: 24T → /8L   (=3)

M4: 28T → /8L   (=3.5)

M5: 24T → /12L  (=2)

M6: 24T → /12L  (=2)

M7: 24T → /12L  (=2)

M8 (seconds wheel): 60T → /8L  (=7.5)

Escape: /30T
*/

const GameClockwork: React.FC = () => {
	// Build clockwork and static train once
	const clockwork = useMemo(() => {
		const cw = new Clockwork();

		cw.generateGear({
			id: 'gear1',
			ratio: 1,
			teeth: 20,
			radius: 20,
			axleId: 'axle1',
		});

		GearFactory.createExplicitCoaxial(cw, 'gear2', 'gear3', 20, 12, { layer: 1 });

		cw.connect('gear1', 'gear2', 'mesh', -1);

		GearFactory.createExplicitCoaxial(cw, 'gear4', 'gear5', 20, 10, { layer: 2 });

		cw.connect('gear3', 'gear4', 'mesh');

		GearFactory.createExplicitCoaxial(cw, 'gear6', 'gear7', 20, 10, { layer: 3 });

		cw.connect('gear5', 'gear6', 'mesh');

		GearFactory.createExplicitCoaxial(cw, 'gear8', 'gear9', 20, 10, { layer: 4 });

		cw.connect('gear7', 'gear8', 'mesh');

		GearFactory.createExplicitCoaxial(cw, 'gear10', 'gear11', 20, 8, { layer: 5 });

		cw.connect('gear9', 'gear10', 'mesh');

		GearFactory.createExplicitCoaxial(cw, 'gear12', 'gear13', 20, 8, { layer: 5 });

		cw.connect('gear11', 'gear12', 'mesh');

		cw.positionConnected('gear1');

		return cw;
	}, []);

	// Animate barrel rotation and propagate through train
	const [_, setTick] = useState(0);
	const rafRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number | null>(null);

	useEffect(() => {
		const barrel = clockwork.getGear('gear1');

		if (!barrel) return;

		const step = (t: number) => {
			if (lastTimeRef.current == null) lastTimeRef.current = t;
			const dt = (t - lastTimeRef.current) / 1000; // seconds
			lastTimeRef.current = t;

			// Barrel rotation speed (degrees per second). Slow for demonstration.
			const speedDegPerSec = 15; // adjust as desired
			const delta = speedDegPerSec * dt;

			barrel.rotation = (barrel.rotation + delta) % 360;

			// Propagate incremental delta
			clockwork.propagateDelta('gear1', delta);

			// Trigger re-render
			setTick((v) => v + 1);
			rafRef.current = requestAnimationFrame(step);
		};

		rafRef.current = requestAnimationFrame(step);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [clockwork]);

	return (
		<g>
			{clockwork.renderSVG({
				centerX: 0,
				centerY: 0,
				stroke: '#333',
				fill: '#d5d5d5',
				strokeWidth: 1,
			})}
		</g>
	);
};

export default GameClockwork;
