import MouseEvent from 'openfl/events/MouseEvent';
import Factory from './../../util/factory';
import Entity from './../entity';
import M from './../../util/math';
import S from './../../model/stage';

class Item extends Entity {
  constructor(type, index) {
    super();

    this.s = Factory.shape();

    //this.s.addLines(0, 0x000000, 1);

    this.addChild(this.s);

    this.s.onMouseDown((e) => {});

    const i = Factory.image('forest/' + type + '.png');

    this.tm = Factory.tilemap(i.bitmapData, 8, 1, 300, 300);

    this.addChild(this.tm);

    const tile = Factory.tile(index);

    this.tm.add(tile);

    this.tm.scaleX = this.tm.scaleY = 0.35;

    this.tm.x -= this.tm.width / 2;
    this.tm.y -= this.tm.height / 2;
  }
}

export default Item;
