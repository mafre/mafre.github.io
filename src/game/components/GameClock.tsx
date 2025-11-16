import { useMemo } from 'react';
import { useGameData } from '../GameData';
import { GAME_START_TIMESTAMP } from '../gameConfig';

export default function GameClock() {
	const { data } = useGameData();

	const timeMs = useMemo(() => {
		const r = data.resources;
		const seconds =
			(r.second ?? 0) +
			(r.minute ?? 0) * 60 +
			(r.hour ?? 0) * 60 * 60 +
			(r.day ?? 0) * 24 * 60 * 60 +
			(r.week ?? 0) * 7 * 24 * 60 * 60 +
			(r.month ?? 0) * 30 * 24 * 60 * 60 +
			(r.year ?? 0) * 365 * 24 * 60 * 60;

		const base = new Date(GAME_START_TIMESTAMP);
		base.setHours(0, 0, 0, 0);
		return base.getTime() + seconds * 1000;
	}, [data.resources]);

	const date = new Date(timeMs);

	const pad = (n: number, l = 2) => n.toString().padStart(l, '0');
	const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

	return (
		<div className="text-left font-size-xl">
			<span>{clock}</span>
		</div>
	);
}
