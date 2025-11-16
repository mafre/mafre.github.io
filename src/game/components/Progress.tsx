import IntervalRender from '../../time/IntervalRender';
import { useRef, useState } from 'react';
import { useGameData } from '../GameData';

/**
 * Progress: shows a transient notification each second containing the delta of resources gained
 * during the previous interval. Uses totals snapshot to compute differences.
 */
export default function Progress() {
	const { data } = useGameData();
	// Snapshot of totals at the start of the CURRENT interval
	const prevTotalsRef = useRef<Record<string, number> | null>(null);
	// Last processed tick so we only recalc once per interval even if parent re-renders frequently
	const lastTickRef = useRef<number>(-1);
	const [displayText, setDisplayText] = useState<string>('—');

	return (
		<IntervalRender interval={1000} immediate>
			{({ tick }) => {
				// Only recompute when tick changes
				if (tick !== lastTickRef.current) {
					const current = data.totals || {};
					const prev = prevTotalsRef.current || {};
					const deltas: Array<[string, number]> = [];
					for (const [k, v] of Object.entries(current)) {
						const p = prev[k] ?? 0;
						const d = v - p;
						if (d > 0) deltas.push([k, d]);
					}
					prevTotalsRef.current = { ...current };
					lastTickRef.current = tick;
					setDisplayText(
						deltas.length
							? deltas.map(([k, d]) => `+${d} ${k}${d !== 1 ? 's' : ''}`).join('  ')
							: '—'
					);
				}

				return (
					<div key={tick} className="progress-notification">
						{displayText}
					</div>
				);
			}}
		</IntervalRender>
	);
}
