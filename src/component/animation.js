import Sprite from 'openfl/display/Sprite';

class Animation extends Sprite {
  constructor(delay = 1) {
    super();

    this.images = [];
    this.delay = delay;
    this.index = 0;
  }

  add = (image) => {
    image.visible = false;
    this.addChild(image);
    this.images.push(image);
  };

  play = () => {
    let i = this.images[this.index];

    i.visible = true;

    this.interval = setInterval(() => {
      i.visible = false;

      this.index += 1;

      if (this.index >= this.images.length) {
        this.index = 0;
      }

      i = this.images[this.index];

      i.visible = true;
    }, this.delay);
  };

  stop = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
  };
}

export default Animation;
