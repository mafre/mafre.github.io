import GameClock from '../components/GameClock';
import { Modal } from '../modals/Modal';

export default function TopMenu() {
  return (
    <div className="flex items-center justify-center p-2">
      <Modal>
      <GameClock />
      </Modal>
    </div>
  );
}
