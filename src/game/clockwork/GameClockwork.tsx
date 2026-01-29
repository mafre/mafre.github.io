import React, { useEffect, useMemo, useRef, useState } from 'react';
import GameClockworkModel from './GameClockworkModel';
import Anchor from './Anchor';

export interface GameClockworkProps {
	model?: GameClockworkModel;
	onSelectGear?: (gearId: string) => void;
	selectedGearId?: string | null;
}

const GameClockwork: React.FC<GameClockworkProps> = ({
	model: externalModel,
	onSelectGear,
	selectedGearId,
}) => {
	// Use provided model if given, otherwise create a default one once
	const model = useMemo(() => externalModel ?? new GameClockworkModel(), [externalModel]);

	// Animate barrel rotation and propagate through train
	const [_, setTick] = useState(0);
	const rafRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number | null>(null);

	useEffect(() => {
		const step = (t: number) => {
			if (lastTimeRef.current == null) lastTimeRef.current = t;
			const dt = (t - lastTimeRef.current) / 1000; // seconds
			lastTimeRef.current = t;

			model.advance(dt);

			// Trigger re-render
			setTick((v) => v + 1);
			rafRef.current = requestAnimationFrame(step);
		};

		rafRef.current = requestAnimationFrame(step);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [model]);

	return (
		<g>
			{model.render({
				centerX: 0,
				centerY: 0,
				stroke: '#333',
				fill: '#d5d5d5',
				strokeWidth: 1,
				selectedGearId: selectedGearId ?? undefined,
				onGearClick: onSelectGear,
			})}
			{(() => {
				if (!model.escapementOn) return null;
				const escapement = model.getEscapement();
				const wheel = model.model.getGear(escapement.gearId);
				if (!wheel) return null;
				return (
					<Anchor
						escapement={escapement}
						clockwork={model.model}
						centerX={wheel.x}
						centerY={wheel.y}
					/>
				);
			})()}
		</g>
	);
};

export default GameClockwork;
