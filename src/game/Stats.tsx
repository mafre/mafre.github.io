import { useGameData } from './GameData';

export default function Stats() {
	const { data } = useGameData();
	return <div className="stats">
		<h2>Stats</h2>
		<div>
			Resources:
			{Object.keys(data.resources).length === 0 && <span> none</span>}
			<ul>
				{Object.entries(data.resources).map(([k,v]) => <li key={k}>{k}: {v}</li>)}
			</ul>
		</div>
	</div>;
}