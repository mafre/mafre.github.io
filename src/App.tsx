import './App.css';
import Game from './Game';
import { GameDataProvider } from './game/GameData';
import GameEngine from './game/GameEngine';
import Stats from './game/Stats';
import TimeSpeedControl from './game/TimeSpeedControl';

export default function App(){

	return (
		<div className="app bg-cover-bottom">
			<GameDataProvider>
				<div className="w-64 p-4 text-base flex flex-col gap-4">
					<TimeSpeedControl />
					<Stats />
				</div>
				<GameEngine />
				<Game />
			</GameDataProvider>
		</div>
	);
}

