import Matrix from 'openfl/geom/Matrix';
import Rectangle from 'openfl/geom/Rectangle';
import Bitmap from 'openfl/display/Bitmap';
import BitmapData from 'openfl/display/BitmapData';
import PixelSnapping from 'openfl/display/PixelSnapping';
import Sprite from 'openfl/display/Sprite';

class BitmapComponent extends Sprite {
  constructor(width, height) {
    super();

    this.bmd = new BitmapData(width, height, true, 0x000000);
    this.bm = new Bitmap(this.bmd, PixelSnapping.NEVER, false);

    this.addChild(this.bm);
  }

  data = () => {
    return this.bmd;
  };

  draw = (content) => {
    this.bmd.draw(content, new Matrix(1, 0, 0, 1, content.x, content.y));
  };

  getPixel = (x, y) => {
    return this.bmd.getPixel32(x, y);
  };

  setPixel = (x, y, color = 0xffffff) => {
    this.bmd.setPixel32(x, y, color);
  };

  rect = (x, y, width, height, color) => {
    const rect = new Rectangle(x, y, width, height);

    this.bmd.fillRect(rect, color);
  };

  clear = () => {
    this.bmd.fillRect(
      new Rectangle(0, 0, this.bm.width, this.bm.height),
      0x000000,
    );
  };
}

export default BitmapComponent;
