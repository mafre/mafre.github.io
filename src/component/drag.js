import MouseEvent from 'openfl/events/MouseEvent';
import Sprite from 'openfl/display/Sprite';
import S from '../model/stage';

class Drag extends Sprite {
  constructor(callback = () => {}) {
    super();

    this.isDragging = false;
    this.moveX = true;
    this.moveY = true;
    this.maxX = 0;
    this.maxY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.callback = callback;

    this.addEventListener(MouseEvent.MOUSE_DOWN, this.onMouseDown);
  }

  onMouseMove = () => {
    if (this.moveX) {
      let newX = this.stage.mouseX / S.scale - this.width / 2 - this.offsetX;

      if (this.maxX && newX > this.maxX) {
        newX = this.maxX;
      }

      if (newX < 0) {
        newX = 0;
      }

      this.x = newX;
    }

    if (this.moveY) {
      this.y = this.stage.mouseY / S.scale - this.height / 2;
    }

    this.callback();
  };

  onMouseDown = () => {
    this.isDragging = true;
    this.stage.addEventListener(MouseEvent.MOUSE_UP, this.onMouseUp);
    this.stage.addEventListener(MouseEvent.MOUSE_MOVE, this.onMouseMove);
    this.stage.addEventListener(MouseEvent.MOUSE_LEAVE, this.onMouseUp);
  };

  onMouseUp = () => {
    this.isDragging = false;
    this.stage.removeEventListener(MouseEvent.MOUSE_UP, this.onMouseUp);
    this.stage.removeEventListener(MouseEvent.MOUSE_MOVE, this.onMouseMove);
    this.stage.removeEventListener(MouseEvent.MOUSE_LEAVE, this.onMouseUp);
  };
}

export default Drag;
