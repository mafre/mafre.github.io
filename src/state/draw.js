import State from './state';
import Helper from '../util/helper';
import Factory from '../util/factory';

class Draw extends State {
  constructor() {
    super();

    this.w = 150;
    this.h = 150;

    this.container = Factory.container();

    this.bm = Factory.bitmap(this.w, this.h);
    this.bm.x = 20;
    this.bm.y = 20;

    this.container.add(this.bm);

    this.draw1 = Factory.draw(this.bm, 70, 70);
    this.draw2 = Factory.draw(this.bm, 70, 70);
    this.draw3 = Factory.draw(this.bm, 70, 70);
    this.draw4 = Factory.draw(this.bm, 70, 70);
  }

  dispose = () => {
    Helper.removeEntity(this.container);
  };
}

export default Draw;
