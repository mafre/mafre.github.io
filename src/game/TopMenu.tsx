import { Modal } from './Modal';
import TimeSpeedControl from './TimeSpeedControl';

export default function TopMenu() {
  return (
    <div className="flex items-center justify-center p-2">
      <Modal>
        <TimeSpeedControl />
      </Modal>
    </div>
  );
}
