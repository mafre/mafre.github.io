import MouseEvent from 'openfl/events/MouseEvent';
import Sprite from 'openfl/display/Sprite';
import Text from './text';
import Font from '../constant/fonts';
import Grid from './grid';

class Button extends Sprite {
  constructor(path, callback = () => {}) {
    super();

    this.callback = callback;

    this.bg = new Grid(path);
    this.addChild(this.bg);

    this.highlight = new Grid('grid/btnHighlight.png');
    this.addChild(this.highlight);
    this.highlight.visible = false;

    this.content = new Sprite();
    this.addChild(this.content);

    this.addEventListener(MouseEvent.MOUSE_DOWN, () => {
      callback();
    });

    this.addEventListener(MouseEvent.ROLL_OVER, () => {
      this.showHighlight();
    });

    this.addEventListener(MouseEvent.ROLL_OUT, () => {
      this.hideHighlight();
    });

    this.mouseChildren = false;
  }

  add = (item) => {
    this.content.addChild(item);

    this.bg.setSize(this.content.width, this.content.height);
    this.highlight.setSize(this.content.width, this.content.height);
  };

  addText = (text) => {
    const t = new Text(text, Font.F, 10);

    t.x = 3;
    t.y = 1;

    this.content.addChild(t);

    this.bg.setSize(this.content.width + 8, this.content.height);
    this.highlight.setSize(this.content.width + 8, this.content.height);
  };

  setWidth = (width) => {
    this.highlight.setSize(width, this.content.height);
    this.bg.setSize(width, this.content.height);
  };

  showHighlight = () => {
    this.highlight.visible = true;
  };

  hideHighlight = () => {
    this.highlight.visible = false;
  };
}

export default Button;
