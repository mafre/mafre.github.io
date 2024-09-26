import MouseEvent from 'openfl/events/MouseEvent';
import Sprite from 'openfl/display/Sprite';
import Entity from './entity';
import Helper from '../util/helper';
import S from '../model/stage';

class Container extends Entity {
  constructor(onMouseDown = null, onMouseUp = null, onMouseMove = null) {
    super();

    this.xMouse = 0;
    this.yMouse = 0;
    this.mouseDown = false;
    this.items = [];
    this.view = true;
    this.autoCenter = false;

    this.background = new Sprite();
    this.content = new Sprite();

    this.addChild(this.background);
    this.addChild(this.content);

    this.addEventListener(MouseEvent.MOUSE_MOVE, this.onMouseMove);
    this.addEventListener(MouseEvent.MOUSE_DOWN, (e) => {this.onMouseDown(e); onMouseDown && onMouseDown(e);});
    this.addEventListener(MouseEvent.MOUSE_UP, this.onMouseUp);
    this.addEventListener(MouseEvent.MOUSE_LEAVE, this.onMouseLeave);
  }

  onMouseMove = (event) => {
    this.setMousePos(event.stageX, event.stageY);
  };

  onMouseDown = (event) => {
    this.setMousePos(event.stageX, event.stageY);
    this.mouseDown = true;
  };

  onMouseUp = (event) => {
    this.mouseDown = false;
  };

  onMouseLeave = (event) => {
    this.mouseDown = false;
  };

  setMousePos = (x, y) => {
    this.xMouse = x / S.scale;
    this.yMouse = y / S.scale;
  };

  setBackground = (content) => {
    this.background.addChild(content);
  };

  add = (content) => {
    this.content.addChild(content);
    this.items.push(content);

    if (this.autoCenter) {
      this.centerContent();
    }
  };

  fill = (color, width = S.width, height = S.height) => {
    this.background.graphics.beginFill(color);
    this.background.graphics.drawRect(0, 0, width, height);
    this.background.graphics.endFill();
  };

  sort = () => {
    const a = this.items.sort((a, b) => {
      if (a.y > b.y) {
        return 1;
      }

      if (a.y < b.y) {
        return -1;
      }

      return 0;
    });

    for (const item of a) {
      this.content.addChild(item);
    }
  };

  center = () => {
    this.x = S.width / 2 - this.width / 2;
    this.y = S.height / 2 - this.height / 2;
  };

  centerBackground = () => {
    this.background.x = S.width / 2 - this.background.width / 2;
    this.background.y = S.height / 2 - this.background.height / 2;
  };

  centerContent = () => {
    this.content.x = S.width / 2 - this.content.width / 2;
    this.content.y = S.height / 2 - this.content.height / 2;
  };

  removeAll = () => {
    for (const item of this.items) {
      Helper.removeEntity(item);
      this.content.removeChild(item);
    }

    this.items = [];
  };

  dispose = () => {
    this.removeAll();
  };
}

export default Container;
