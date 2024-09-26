import MouseEvent from 'openfl/events/MouseEvent';
import Factory from './../../util/factory';
import Entity from './../entity';
import M from './../../util/math';
import S from './../../model/stage';

class Box extends Entity {
  constructor(texture, shadow = 0) {
    super();

    const s = Factory.shape();

    s.hexagon();

    const ss = Factory.spritesheet(texture, 3, 3);

    ss.setIndexX(1);
    ss.setIndexY(2);

    s.add(ss);

    switch (shadow) {
      case 0:
        break;

      case 1:
        s.addShadow();
        break;

      case 2:
        s.addInverseShadow();
        break;

      case 3:
        Math.random() * 2 < 1 ? s.addInverseShadow() : s.addShadow();

        break;
    }

    s.addLines(2, 0x000000, 1);

    this.addChild(s);

    s.onMouseDown((e) => {});

    this.s = s;
    this.ss = ss;
  }

  setIndex = (x, y) => {
    this.ss.setIndexX(x);
    this.ss.setIndexY(y);
  };
}

export default Box;
