import Factory from '../../util/factory';
import Entity from '../../entity/entity';

class Floor extends Entity {
  constructor(x, y, callback) {
    super();
    this.tileX = x;
    this.tileY = y;
    this.layer = 3;
    this.view = true;

    this.s = Factory.shape();
    this.s.rectangle(32, 32);
    this.s.onMouseDown(() => {
      callback(this);
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
