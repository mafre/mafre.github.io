
import { useEffect, useRef } from 'react';
import { useGameData } from './GameData';
import { ABILITY_DEFS } from './abilities';
import { advanceGameTime } from './timeLogic';

export default function GameEngine() {
	const { update } = useGameData();
	const rafRef = useRef<number | null>(null);
	const startTimeRef = useRef<number | null>(null);
	const lastElapsedRef = useRef(0); // virtual elapsed (ms) we feed into advanceGameTime
	const lastRealRef = useRef<number | null>(null);

	useEffect(() => {
		const MAX_FRAME_DELTA = 1000; // cap 1s to avoid giant jumps after tab hidden

		function frame(now: number) {
			if (startTimeRef.current == null) startTimeRef.current = now;
			if (lastRealRef.current == null) lastRealRef.current = now;

			let realDelta = now - lastRealRef.current;
			lastRealRef.current = now;
			if (realDelta < 0) realDelta = 0;
			if (realDelta > MAX_FRAME_DELTA) realDelta = MAX_FRAME_DELTA;

			// Accumulate elapsed and advance game state
			const nextElapsed = lastElapsedRef.current + realDelta;
			const delta = realDelta;
			if (delta > 0) {
				update(gd => advanceGameTime(gd, gd.elapsedTime + delta, { abilityDefs: ABILITY_DEFS }));
				lastElapsedRef.current = nextElapsed;
			}

			rafRef.current = requestAnimationFrame(frame);
		}
		rafRef.current = requestAnimationFrame(frame);
		return () => {
			if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
		};
	}, [update]);

	return null;
}