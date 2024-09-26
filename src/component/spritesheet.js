import Assets from 'openfl/utils/Assets';
import Matrix from 'openfl/geom/Matrix';
import Bitmap from 'openfl/display/Bitmap';
import BitmapData from 'openfl/display/BitmapData';
import PixelSnapping from 'openfl/display/PixelSnapping';
import Sprite from 'openfl/display/Sprite';

class SpriteSheet extends Sprite {
  constructor(path, framesX, framesY, delay = 10) {
    super();

    this.delay = delay;
    this.bmd = Assets.getBitmapData(`assets/${path}`);
    this.framesX = framesX;
    this.framesY = framesY;
    this.indexX = 0;
    this.indexY = 0;
    this.playing = false;

    this.w = Math.round(this.bmd.width / this.framesX);
    this.h = Math.round(this.bmd.height / this.framesY);

    this.bmd1 = new BitmapData(this.w, this.h, true, 0x000000);
    this.bm = new Bitmap(this.bmd1, PixelSnapping.AUTO, false);

    this.addChild(this.bm);

    this.render();
  }

  setIndexX = (index) => {
    this.indexX = index;
    this.render();
  };

  setIndexY = (index) => {
    this.indexY = index;
    this.render();
  };

  render = () => {
    const m = new Matrix(
      1,
      0,
      0,
      1,
      -this.w * this.indexX,
      -this.h * this.indexY,
    );

    this.bmd1.fillRect(this.bmd1.rect, 0);
    this.bmd1.draw(this.bmd, m);
  };

  play = () => {
    this.playing = true;
    this.interval = setInterval(() => {
      this.indexY += 1;

      if (this.indexY === this.framesY) {
        this.indexY = 0;
      }

      this.render();
    }, this.delay);
  };

  stepX = () => {
    this.indexX += 1;

    if (this.indexX === this.framesX) {
      this.indexX = 0;
    }

    this.render();
  };

  playX = () => {
    this.playing = true;
    this.interval = setInterval(this.stepX, this.delay);
  };

  stop = () => {
    this.playing = false;
    this.indexY = 1;
    this.indexX = 1;
    this.render();

    if (this.interval) {
      clearInterval(this.interval);
    }
  };
}

export default SpriteSheet;
