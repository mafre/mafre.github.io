import Sprite from 'openfl/display/Sprite';
import fonts from '../constant/fonts';
import Grid from './grid';
import Drag from './drag';
import Image from './image';
import Text from './text';

class Steps extends Sprite {
  constructor(callback) {
    super();

    this.border = new Grid('grid/dark.png');
    this.border.setSize(110, 10);
    this.addChild(this.border);

    this.drag = new Drag(() => {
      callback(this.drag.x);
      this.text.setText(this.drag.x.toString());
    });

    this.drag.moveY = false;
    this.drag.maxX = 100;

    const b = new Image('handle.png');

    this.drag.addChild(b);

    this.addChild(this.drag);

    this.text = new Text('50', fonts.F, 10, 0xeeeeee);

    this.addChild(this.text);

    this.text.x = 110;
    this.text.y -= 2;
  }

  init = (value) => {
    this.drag.offsetX = this.x;
    this.drag.x = value;
  };
}

export default Steps;
