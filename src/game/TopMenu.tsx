import GameClock from './GameClock';
import { Modal } from './Modal';

export default function TopMenu() {
  return (
    <div className="flex items-center justify-center p-2">
      <Modal>
      <GameClock />
      </Modal>
    </div>
  );
}
