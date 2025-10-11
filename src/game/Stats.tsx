import IntervalRender from '../time/IntervalRender';
import { useGameData } from './GameData';
import { Modal } from './Modal';

export default function Stats() {
	const { data } = useGameData();

	return <IntervalRender interval={1000}>
		{() => {
			const entries = Object.entries(data.resources);
			return <Modal>
					<div className="text-left">
					<div>Level: {data.level}</div>
					{entries.length === 0 && <span className="italic">No resources yet</span>}
					{entries.map(([k,]) => {
						const total = data.totals?.[k];
						return <div key={k} className="flex flex-col gap-0.5 py-0.5">
							<div className="flex items-center gap-2">
								<span>{k}: {total}</span>
							</div>
						</div>;
					})}
					</div>
				</Modal>
		}}
	</IntervalRender>
}