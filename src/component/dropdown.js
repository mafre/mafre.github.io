import Sprite from 'openfl/display/Sprite';
import Point from 'openfl/geom/Point';
import MouseEvent from 'openfl/events/MouseEvent';
import S from '../model/stage';
import Helper from '../util/helper';
import MessageBus from '../message/bus';
import messageType from '../constant/messageType';
import Button from './button';
import Grid from './grid';
import Menu from './menu';
import SpriteSheet from './spritesheet';

class Dropdown extends Sprite {
  constructor(label = 'label') {
    super();

    this.btn = new Button('grid/dropdown.png', () => {
      const g = this.localToGlobal(new Point(0, 0));

      this.content.x = g.x / S.scale;
      this.content.y = g.y / S.scale + this.btn.height;

      Helper.showOverlay(this.content);
      Helper.enableKeys(this);
    });

    this.btn.addText(label);

    this.addChild(this.btn);

    this.content = new Sprite();

    this.bg = new Grid('grid/dark.png');
    this.content.addChild(this.bg);

    this.menu = new Menu();
    this.menu.vertical();
    this.content.addChild(this.menu);

    this.caret = new SpriteSheet('caret.png', 2, 1);
    this.caret.x = this.btn.width - 4;
    this.caret.y = 6;
    this.btn.add(this.caret);
    this.btn.setWidth(this.btn.width + 4);

    this.btn.addEventListener(MouseEvent.ROLL_OVER, () => {
      this.caret.setIndexX(1);
    });

    this.btn.addEventListener(MouseEvent.ROLL_OUT, () => {
      this.caret.setIndexX(0);
    });
  }

  add = (content) => {
    this.menu.add(content);

    this.updateSize();
  };

  addButton = (title, callback) => {
    const b = new Button('transparent.png', () => {
      callback();
      Helper.showOverlay(this.content);
      Helper.enableKeys(this);
    });

    b.addText(title);

    this.add(b);
  };

  updateSize = () => {
    const width =
      this.content.width > this.btn.width ? this.content.width : this.btn.width;

    const { height } = this.menu;

    this.bg.setSize(width, height);
    this.menu.setWidth(width);
  };

  enableKeyNavigation = () => {
    this.keySubscription = MessageBus.subscribe(messageType.KEY_DOWN, (key) => {
      this.keyDown(key);
    });
  };

  disableKeyNavigation = () => {
    MessageBus.remove(this.keySubscription);
  };

  keyDown = (k) => {
    switch (k) {
      case 38:
        Helper.showOverlay(this.content);
        Helper.enableKeys(this);

        this.menu.previous();
        this.menu.selected.callback();

        break;

      case 40:
        Helper.showOverlay(this.content);
        Helper.enableKeys(this);

        this.menu.next();
        this.menu.selected.callback();

        break;

      default:
        Helper.showOverlay(this.content);
        Helper.enableKeys(this);

        break;
    }
  };
}

export default Dropdown;
