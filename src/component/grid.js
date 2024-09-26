import Sprite from 'openfl/display/Sprite';
import SpriteSheet from './spritesheet';

class Grid extends Sprite {
  constructor(path = 'grid/default.png') {
    super();

    this.path = path;
    this.images = [];

    let ss;

    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        ss = new SpriteSheet(path, 3, 3);
        ss.setIndexX(x);
        ss.setIndexY(y);
        this.addChild(ss);
        this.images.push(ss);
      }
    }
  }

  setSize = (width, height) => {
    this.images[1].x = this.images[0].width;
    this.images[1].width = width - this.images[0].width * 2;

    // topright
    this.images[2].x = this.images[1].x + this.images[1].width;

    // left
    this.images[3].height = height - this.images[0].height * 2;
    this.images[3].y = this.images[0].height;

    // center
    this.images[4].x = this.images[0].width;
    this.images[4].y = this.images[0].height;
    this.images[4].width = width - this.images[0].width * 2;
    this.images[4].height = height - this.images[0].height * 2;

    // right
    this.images[5].height = height - this.images[0].height * 2;
    this.images[5].y = this.images[0].height;
    this.images[5].x = this.images[2].x;

    // bottomleft
    this.images[6].y = this.images[3].y + this.images[3].height;

    // bottom
    this.images[7].width = this.images[1].width;
    this.images[7].y = this.images[6].y;
    this.images[7].x = this.images[0].width;

    // bottomright
    this.images[8].y = this.images[7].y;
    this.images[8].x = this.images[7].x + this.images[7].width;
  };
}

export default Grid;
