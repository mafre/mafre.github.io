import State from './state';
import Helper from '../util/helper';
import Factory from '../util/factory';
import Item from '../entity/cabin/item';
import SpriteSheet from '../component/spritesheet';

class Cabin extends State {
  constructor() {
    super();

    this.size = 48;
    this.amount = 7;
    this.oneThird = this.size * (1 / 3);
    this.twoThird = this.size * (2 / 3);
    this.tiles = [];
    this.items = [];

    let s;
    let aX;
    let aY;
    let x;
    let y;
    let z;
    let i;

    for (z = 0; z < this.amount; z += 1) {
      aY = [];

      for (y = 0; y < this.amount; y += 1) {
        aX = [];

        for (x = 0; x < this.amount; x += 1) {
          s = Factory.shape();

          s.tile(this.size);

          s.x = x * (this.size - this.oneThird) - y * this.twoThird;
          s.y = y * this.oneThird + x * this.oneThird - z * this.twoThird;

          aX.push(s);
        }

        aY.push(aX);
      }

      this.tiles.push(aY);
    }

    for (x = 0; x < this.amount; x += 1) {
      this.addImage(this.amount - 1, x, 0, 'cabin/border.png');
    }

    for (z = 0; z < this.amount; z += 1) {
      this.addImage(this.amount - 1, 0, z, 'cabin/border.png');
    }

    for (x = 0; x < this.amount; x += 1) {
      this.addImage(x, 0, this.amount - 1, 'cabin/border.png');
    }

    for (x = 0; x < this.amount; x += 1) {
      this.addImage(x, this.amount - 1, 0, 'cabin/border.png');
    }

    for (y = 0; y < this.amount; y += 1) {
      this.addImage(0, y, this.amount - 1, 'cabin/border.png');
    }

    for (y = 0; y < this.amount; y += 1) {
      this.addImage(0, this.amount - 1, y, 'cabin/border.png');
    }

    for (x = 1; x < this.amount; x += 1) {
      for (y = 1; y < this.amount; y += 1) {
        this.addImage(x, y, 1, 'cabin/floor.png');
      }
    }

    for (x = 1; x < this.amount; x += 1) {
      for (z = 1; z < this.amount; z += 1) {
        this.addImage(1, x, z, 'cabin/wall4.png');
      }
    }

    for (x = 1; x < this.amount; x += 1) {
      for (z = 1; z < this.amount; z += 1) {
        this.addImage(x, 1, z, 'cabin/wall3.png');
      }
    }

    for (x = 1; x < 3; x += 1) {
      for (z = 1; z < 2; z += 1) {
        this.addImage(1, z, x, 'cabin/bricks0.png');
      }
    }

    for (x = 1; x < 2; x += 1) {
      for (z = 1; z < 3; z += 1) {
        this.addImage(x, 1, z, 'cabin/bricks1.png');
      }
    }

    for (x = 1; x < 7; x += 1) {
      this.addImage(1, 1, x, 'cabin/divide.png');
    }

    for (x = 1; x < 7; x += 1) {
      this.addImage(5, 1, x, 'cabin/wall2.png');
    }

    for (x = 1; x < 7; x += 1) {
      this.addImage(6, 1, x, 'cabin/wall2.png');
    }

    for (x = 1; x < 2; x += 1) {
      i = this.addImage(1, x, 1, 'cabin/bricks2.png');
      i.x += 3;
      i.y += 4;
    }

    this.addImage(3, 1, 4, 'cabin/window0.png');
    this.addImage(4, 1, 3, 'cabin/window0.png');
    this.addImage(1, 4, 1, 'cabin/door0.png');
    this.addImage(1, 4, 4, 'cabin/door1.png');
    this.addImage(1, 4, 3, 'cabin/door2.png');
    i = this.addImage(1, 6, 1, 'cabin/door0.png');

    i.x += 6;
    i.y -= 3;
    i = this.addImage(1, 6, 4, 'cabin/door1.png');

    i.x += 6;
    i.y -= 3;
    i = this.addImage(1, 6, 3, 'cabin/door2.png');

    i.x += 6;
    i.y -= 3;

    this.addImage(1, 1, 1, 'cabin/ugn.png');
    this.addImage(1, 1, 1, 'cabin/chimney.png');
    this.addImage(1, 1, 3, 'cabin/chimney0.png');
    this.addImage(1, 1, 3, 'cabin/chimney1.png');
    this.addImage(1, 1, 5, 'cabin/chimney2.png');
    this.addImage(3, 1, 6, 'cabin/chimney3.png');
    this.addImage(4, 2, 1, 'cabin/kitchen0.png');
    this.addImage(5, 2, 1, 'cabin/kitchen1.png');
    this.addImage(4, 2, 2, 'cabin/kitchen2.png');
    this.addImage(5, 2, 2, 'cabin/kitchen3.png');
    this.addImage(6, 4, 2, 'cabin/table1.png');
    this.addImage(6, 6, 2, 'cabin/table2.png');
    i = this.addImage(4, 6, 2, 'cabin/table2.png');
    i.x += 4;
    i.y += 2;
    this.addImage(5, 4, 2, 'cabin/table0.png');
    this.addImage(6, 4, 2, 'cabin/table0.png');
    this.addImage(5, 5, 2, 'cabin/table0.png');
    this.addImage(6, 5, 2, 'cabin/table0.png');
    this.addImage(5, 6, 2, 'cabin/table0.png');
    this.addImage(6, 6, 2, 'cabin/table0.png');

    i = this.addItem(1, 1, 2);

    const sh = new SpriteSheet('cabin/kettle.png', 4, 1, 100);

    sh.playX();

    i.addChild(sh);
  }

  addItem = (x, y, z) => {
    const tile = this.tiles[z][y][x];
    const item = new Item();

    item.x = tile.x + 300;
    item.y = tile.y + 200;

    Helper.addEntity(item, z);

    this.items.push(item);

    return item;
  };

  addImage = (x, y, z, path) => {
    const item = this.addItem(x, y, z);
    const image = Factory.image(path);

    item.addChild(image);

    return item;
  };

  dispose = () => {
    this.items.forEach((item) => {
      Helper.removeEntity(item);
    });

    this.items = [];
  };
}

export default Cabin;
