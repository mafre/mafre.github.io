import './App.css';
import Game from './Game';
import AbilitiesPanel from './game/AbilitiesPanel';
import EffectsPanel from './game/EffectsPanel';
import { GameDataProvider } from './game/GameData';
import GameEngine from './game/GameEngine';
import Stats from './game/Stats';
import TimeSpeedControl from './game/TimeSpeedControl';

export default function App(){

	return (
		<div className="app bg-cover-bottom text-base ">
			<GameDataProvider>
				<div className="w-64 p-4 flex flex-col gap-4">
					<TimeSpeedControl />
					<Stats />
					<AbilitiesPanel />
				</div>
				<GameEngine />
				<Game />
				<div className="w-64 p-4 flex flex-col gap-4 items-end justify-self-end">
					<EffectsPanel />
				</div>
			</GameDataProvider>
		</div>
	);
}

