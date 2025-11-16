import './App.css';
import Game from './Game';
import AbilitiesPanel from './game/panels/AbilitiesPanel';
import EffectsPanel from './game/panels/EffectsPanel';
import { GameDataProvider } from './game/GameData';
import GameEngine from './game/GameEngine';
import Stats from './game/modals/Stats';
import TimeSpeedControl from './game/modals/TimeSpeedControl';

export default function App() {
	return (
		<div className="app bg-cover-bottom text-base ">
			<GameDataProvider>
				<div className="w-64 p-4 flex flex-col gap-4">
					<TimeSpeedControl />
					<Stats />
					<AbilitiesPanel />
				</div>
				<GameEngine />
				<div>
					<Game />
				</div>
				<div className="w-64 p-4 flex flex-col gap-4 items-end justify-self-end">
					<EffectsPanel />
				</div>
			</GameDataProvider>
		</div>
	);
}
