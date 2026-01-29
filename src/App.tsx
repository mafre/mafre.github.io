import './App.css';
import Game from './Game';
import { GameDataProvider } from './game/GameData';
import GameEngine from './game/GameEngine';

export default function App() {
	return (
		<div className="app">
			<GameDataProvider>
				<GameEngine />
				<Game />
			</GameDataProvider>
		</div>
	);
}
