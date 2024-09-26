import Assets from 'openfl/utils/Assets';
import Bitmap from 'openfl/display/Bitmap';
import Sprite from 'openfl/display/Sprite';

class Image extends Sprite {
  constructor(path) {
    super();

    if (!path) {
      return;
    }

    this.bitmapData = Assets.getBitmapData(`assets/${path}`);
    this.bitmap = new Bitmap(this.bitmapData);
    this.bitmap.smoothing = false;
    this.addChild(this.bitmap);
  }

  center = () => {
    this.bitmap.x = -this.bitmap.width / 2;
    this.bitmap.y = -this.bitmap.height / 2;
  };
}

export default Image;
