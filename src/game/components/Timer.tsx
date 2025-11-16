import { useEffect } from 'react';
import { GameData, useGameData } from '../GameData';
import useTimer from '../utils/useTimer';

export default function Timer() {
	const { update, data } = useGameData();
	const { elapsedTime, handleReset, handleStart } = useTimer(0);

	useEffect(() => {
		handleStart();
	}, []);

	useEffect(() => {
		update((prev) => {
			return prev.elapsedTime === elapsedTime ? prev : prev.addTime(elapsedTime);
		});
	}, [elapsedTime, update]);

	const onReset = () => {
		update(() => new GameData());
		handleReset();
	};

	return (
		<>
			{data.elapsedTime}
			<button onClick={() => onReset()}>Reset Time</button>
		</>
	);
}
