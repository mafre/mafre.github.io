import { useRef, useState } from 'react';

const useTimer = (initialState = 0) => {
	const [elapsedTime, setElapsedTime] = useState(initialState);
	const [isRunning, setIsRunning] = useState(false);
	const countRef = useRef<number | undefined>(undefined);

	const handleStart = () => {
		const startTime = Date.now() - elapsedTime;
		countRef.current = window.setInterval(() => {
			setElapsedTime(Date.now() - startTime);
		}, 200);
		setIsRunning(true);
	};

	const handlePause = () => {
		if (countRef.current !== undefined) {
			clearInterval(countRef.current);
			countRef.current = undefined;
		}
		setIsRunning(false);
	};

	const handleReset = () => {
		if (countRef.current !== undefined) {
			clearInterval(countRef.current);
			countRef.current = undefined;
		}
		setIsRunning(false);
		setElapsedTime(0);
	};

	return { elapsedTime, isRunning, handleStart, handlePause, handleReset };
};

export default useTimer;
