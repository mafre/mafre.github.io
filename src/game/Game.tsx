import Progress from "./Progress";
import Stats from "./Stats";
import { GameDataProvider } from './GameData';

export default function Game() {
  return (
    <GameDataProvider>
      <div className="game glass">
        <div className="gap-y" />
        <Stats />
        <div className="gap-y" />
        <Progress />
      </div>
    </GameDataProvider>
  );
}
