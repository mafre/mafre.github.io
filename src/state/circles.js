import State from './state';
import Helper from '../util/helper';
import Factory from '../util/factory';
import S from '../model/stage';

class Circles extends State {
  constructor() {
    super();

    this.radius = 50;
    this.offset = 100;
    this.circles = [];
    this.c = Factory.container();

    const w = Math.floor(S.width / this.radius);
    const h = Math.floor(S.height / this.radius);

    for (let x = 0; x < w; x += 1) {
      for (let y = -1; y < h + 1; y += 1) {
        this.add(x, y);
      }
    }

    this.updateCircles();

    this.steps = Factory.steps((value) => {
      this.offset = value * 2;

      this.updateCircles();
    });

    this.c.add(this.steps);

    this.steps.x = 20;
    this.steps.y = S.height - 20;
    this.steps.init(50);
  }

  add = (x = 0, y = 0) => {
    const s = Factory.shape(1, 0xffffff, 0.5);

    s.circle(this.radius);

    s.iX = x;
    s.iY = y;

    this.c.add(s);

    this.circles.push(s);
  };

  updateCircles = () => {
    this.circles.forEach((c) => {
      c.x = (c.iX * this.radius * this.offset) / 100;
      c.y = (c.iY * this.radius * this.offset) / 100;
    });
  };

  dispose = () => {
    Helper.removeEntity(this.c);
  };
}

export default Circles;
