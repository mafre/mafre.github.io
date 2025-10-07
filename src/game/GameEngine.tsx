
import { useEffect, useRef } from 'react';
import { useGameData } from './GameData';
import { ABILITY_DEFS } from './abilities';
import { advanceGameTime } from './timeLogic';
import useTimer from './useTimer';

export default function GameEngine() {
	const { update } = useGameData();
	const { elapsedTime, handleStart } = useTimer(0);
	const lastRawRef = useRef(0);

	// Start timer once
	useEffect(() => { handleStart(); }, []);

	useEffect(() => {
		const last = lastRawRef.current;
		let delta = elapsedTime - last;
		if (delta < 0) delta = 0; // guard in case elapsed resets after reload
		lastRawRef.current = elapsedTime;
		if (delta <= 0) return;
		update(gd => advanceGameTime(gd, gd.elapsedTime + delta, { abilityDefs: ABILITY_DEFS }));
	}, [elapsedTime, update]);

	return null;
}