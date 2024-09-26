import Factory from './../../util/factory';
import Entity from './../entity';

class Floor extends Entity {
  constructor(x, y, callback) {
    super();
    this.tileX = x;
    this.tileY = y;
    this.layer = 3;
    this.view = true;
    this.hover = Factory.image('collision/hover.png');
    this.addChild(this.hover);
    this.hover.visible = false;

    this.s = Factory.shape();
    this.s.rectangle(32, 32);

    this.s.onMouseDown(() => {
      callback(this);
    });

    this.s.onRollOver(() => {
      this.hover.visible = true;
    });

    this.s.onRollOut(() => {
      this.hover.visible = false;
    });

    this.addChild(this.s);
  }

  tilePos = () => {
    return {
      x: this.tileX,
      y: this.tileY,
    };
  };
}

export default Floor;
