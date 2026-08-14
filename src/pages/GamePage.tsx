
import Game from '../Game';
import { GameDataProvider } from '../game/GameData';
import GameEngine from '../game/GameEngine';
import Stats from '../game/modals/Stats';
import EffectsPanel from '../game/panels/Effects';

export default function GamePage() {

	return (
		<div className="app text-base">
			<GameDataProvider>
				<div className="overlay w-64 p-4 flex flex-col gap-4">
					<EffectsPanel />
					<Stats />
				</div>
				<Game />
				<GameEngine />
			</GameDataProvider>
		</div>
	);
}
