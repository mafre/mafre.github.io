import MouseEvent from 'openfl/events/MouseEvent';
import Factory from './../../util/factory';
import Entity from './../entity';
import M from './../../util/math';
import S from './../../model/stage';

class Leaves extends Entity {
  constructor(index) {
    super();

    this.view = true;
    this.layer = 2;

    const i = Factory.image('forest/tree_leaves.png');

    this.tm = Factory.tilemap(i.bitmapData, 8, 1, 300, 300);

    this.addChild(this.tm);

    const tile = Factory.tile(index);

    this.tm.add(tile);

    this.tm.scaleX = this.tm.scaleY = 0.35;

    this.tm.x -= this.tm.width / 2;
    this.tm.y -= this.tm.height / 2;
  }
}

export default Leaves;
