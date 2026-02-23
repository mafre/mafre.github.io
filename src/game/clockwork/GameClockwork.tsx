import React, { useEffect, useMemo, useRef, useState } from 'react';
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

interface GameClockworkProps {
	cw: Clockwork;
}

const GameClockwork: React.FC<GameClockworkProps> = ({ cw }) => {
	// Build clockwork and static train once
	const clockwork = useMemo(() => {
		cw.generateGear({
			id: 'gear1',
			ratio: 1,
			teeth: 20,
			radius: 40,
			axleId: 'axle1',
		});
		/*
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
		*/

		return cw;
	}, []);

	// Animate barrel rotation and propagate through train
	const [_, setTick] = useState(0);
	const rafRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number | null>(null);

	// Drag state (mutable ref to avoid re-renders during move)
	const dragRef = useRef<{
		id?: string;
		pointerId?: number;
		offsetX?: number;
		offsetY?: number;
	} | null>(null);

	const [activeDraggedId, setActiveDraggedId] = useState<string | null>(null);
	const [highlightId, setHighlightId] = useState<string | null>(null);

	const SNAP_THRESHOLD = 12; // px distance to snap into mesh position

	// Utility: convert pointer event to SVG coordinates
	const toSvgPoint = (e: React.PointerEvent) => {
		const cur = e.currentTarget as Element;
		const svg = (((cur as any).ownerSVGElement ?? cur.closest('svg')) as unknown) as SVGSVGElement | null;
		if (!svg) return { x: e.clientX, y: e.clientY };
		const pt = ((svg as any).createSVGPoint as any)();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const ctm = (svg.getScreenCTM && svg.getScreenCTM()) as DOMMatrix | null;
		if (!ctm) return { x: e.clientX, y: e.clientY };
		const inv = ctm.inverse();
		const res = pt.matrixTransform(inv);
		return { x: res.x, y: res.y };
	};

	const handlePointerDown = (id: string, e: React.PointerEvent) => {
		e.preventDefault();
		const p = toSvgPoint(e);
		const gear = clockwork.getGear(id);
		if (!gear) return;
		dragRef.current = { id, pointerId: e.pointerId, offsetX: gear.x - p.x, offsetY: gear.y - p.y };
		setActiveDraggedId(id);
		setHighlightId(null);
		try {
			(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		} catch (err) {
			// ignore
		}
	};

	const handlePointerMove = (id: string, e: React.PointerEvent) => {
		if (!dragRef.current || dragRef.current.id !== id || dragRef.current.pointerId !== e.pointerId) return;
		const p = toSvgPoint(e);
		const gear = clockwork.getGear(id);
		if (!gear) return;
		// provisional move from pointer
		let newX = p.x + (dragRef.current.offsetX ?? 0);
		let newY = p.y + (dragRef.current.offsetY ?? 0);

		// Compute mesh snap candidates from directly connected mesh neighbors
		const conns = clockwork.getConnections(id);
		let bestDist = Infinity;
		let bestPos: { x: number; y: number } | null = null;
		let bestNeighborId: string | null = null;
		for (const c of conns) {
			if (c.type !== 'mesh') continue;
			const other = clockwork.getGear(c.b);
			if (!other) continue;
			const dx = newX - other.x;
			const dy = newY - other.y;
			const dist = Math.hypot(dx, dy) || 1;
			const desired = gear.radius + other.radius + (c.backlash ?? 0);
			const nx = dx / dist;
			const ny = dy / dist;
			const idealX = other.x + nx * desired;
			const idealY = other.y + ny * desired;
			const delta = Math.hypot(newX - idealX, newY - idealY);
			if (delta < bestDist) {
				bestDist = delta;
				bestPos = { x: idealX, y: idealY };
				bestNeighborId = other.id;
			}
		}

		// Show outline of the nearest mesh neighbor while dragging
		setHighlightId(bestNeighborId);

		if (bestPos && bestDist <= SNAP_THRESHOLD) {
			newX = bestPos.x;
			newY = bestPos.y;
		}

		gear.x = newX;
		gear.y = newY;

		// Reposition connected gears so they snap/mesh while dragging
		try {
			clockwork.positionConnected(id, gear.x, gear.y);
		} catch (err) {
			// ignore positioning errors
		}

		setTick((v) => v + 1);
	};

	const handlePointerUp = (id: string, e: React.PointerEvent) => {
		if (!dragRef.current) return;
		if (dragRef.current.id === id && dragRef.current.pointerId === e.pointerId) {
			try {
				(e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
			} catch (err) {
				// ignore
			}
			// Finalize position and snap neighbors one more time
			const gear = clockwork.getGear(id);
			if (gear) {
				try {
					clockwork.positionConnected(id, gear.x, gear.y);
				} catch (err) {
					// ignore
				}
			}
			dragRef.current = null;
			setActiveDraggedId(null);
			setHighlightId(null);
		}
	};

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
				onGearPointerDown: handlePointerDown,
				onGearPointerMove: handlePointerMove,
				onGearPointerUp: handlePointerUp,
				activeDraggedId: activeDraggedId ?? undefined,
				highlightId: highlightId ?? undefined,
				highlightStroke: '#6cf',
				highlightStrokeWidth: 2,
				highlightDasharray: '3,3',
				highlightPadding: 6,
			})}
		</g>
	);
};

export default GameClockwork;
