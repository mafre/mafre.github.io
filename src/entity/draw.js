import Entity from './entity';

class Draw extends Entity {
  constructor(bitmap, x = 0, y = 0) {
    super();

    this.bitmap = bitmap;
    this.x = x;
    this.y = y;
  }

  getArgb = (rgb, newAlpha) => {
    let argb = 0;

    argb += newAlpha << 24;
    argb += rgb;

    return argb;
  };

  draw = () => {
    let b = (this.bitmap.getPixel(this.x, this.y) >> 24) & 0xff;
    let a = parseInt(b.toString(16));

    if (a === NaN) {
      a = 254;
    }

    let argb = 0x00ffffff;
    let aP = (255 / 100) * (a + 3);

    argb += aP << 24;

    this.bitmap.setPixel(this.x, this.y, argb);
  };

  update = (time) => {
    let rX = Math.random() * 3;

    if (rX < 1) {
      this.x -= 1;
    } else if (rX > 2) {
      this.x += 1;
    }

    if (this.x < 0) {
      this.x = 0;
    }

    if (this.x > this.bitmap.width) {
      this.x = this.bitmap.width;
    }

    let rY = Math.random() * 3;

    if (rY < 1) {
      this.y -= 1;
    } else if (rY > 2) {
      this.y += 1;
    }

    if (this.y < 0) {
      this.y = 0;
    }

    if (this.y > this.bitmap.height) {
      this.y = this.bitmap.height;
    }

    this.draw();
  };
}

export default Draw;
