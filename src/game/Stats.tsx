import { Modal } from './Modal';
import IntervalRender from '../time/IntervalRender';
import { useGameData } from './GameData';
import { getClockHandColor } from './clockHandColors';

export default function Stats() {
	const { data } = useGameData();

	return <IntervalRender interval={1000}>
		{() => {
			const entries = Object.entries(data.resources);
			return <Modal>
					<div className="text-left">
					<div>Level: {data.level}</div>
					{entries.length === 0 && <span className="italic">No resources yet</span>}
					{entries.map(([k,v]) => {
						const total = data.totals?.[k];
						const color = getClockHandColor(k);
						return <div key={k} className="flex flex-col gap-0.5 py-0.5">
							<div className="flex items-center gap-2">
								{color && <span
									className="inline-block w-3 h-3 rounded-sm border border-black"
									style={{ background: color }}
									aria-label={`${k} hand color`}
								/>}
								<span>{k}: {v}</span>
							</div>
							{total !== undefined && <span className="text-xs opacity-70">total: {total}</span>}
						</div>;
					})}
					</div>
				</Modal>
		}}
	</IntervalRender>
}