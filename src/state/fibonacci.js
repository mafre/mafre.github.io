import State from './state';
import S from '../model/stage';
import Factory from '../util/factory';
import Helper from '../util/helper';
import Leaf from '../entity/leaf';

const defaultTheme = {
  0: 0x3d5b99,
  1: 0xbc2733,
  2: 0xed5d4a,
  3: 0x73fabf,
  4: 0x4c7f96,
  5: 0x4a9dc8,
  bg: 0x000000,
};

const sakura = {
  0: 0xffb3fb,
  1: 0xff9de5,
  2: 0xffe4fe,
  3: 0xd8bcff,
  4: 0xffc5ea,
  5: 0xf7adff,
  bg: 0x000000,
};

const rose = {
  0: 0xffc9eb,
  1: 0xe77669,
  2: 0xc23754,
  3: 0xf97fbf,
  4: 0xedaaaa,
  5: 0x800000,
  bg: 0x000000,
  rotation: 90,
};

class Fibonacci extends State {
  constructor() {
    super();

    this.leaves = [];
    this.origs = [];
    this.container = Factory.container();
    this.menu = Factory.menu();
    this.container.add(this.menu);
    this.menu.y = 30;

    this.setTheme(defaultTheme);

    this.menu.y = S.height - this.menu.height;
    this.container.center();
  }

  setTheme = (theme) => {
    this.theme = theme;

    const color = this.theme.bg;

    this.container.fill(color);

    this.clear();
    this.addLeaves();
  };

  clear = () => {
    this.leaves.forEach((leaf) => {
      leaf.parent.removeChild(leaf);
    });

    this.leaves = [];
    this.origs = [];

    clearInterval(this.interval);
  };

  addLeaves = () => {
    const delay = 10;
    let i;

    this.interval = setInterval(() => {
      i = this.leaves.length + 1;
      const leaf = new Leaf(i, this.getColor(i));

      this.leaves.push(leaf);

      Helper.addEntity(leaf);

      this.container.add(leaf);

      if (i > 500) {
        clearInterval(this.interval);
      }
    }, delay);
  };

  getColor = (index) => {
    if (index % 12 === 0) {
      return this.theme['5'];
    }

    if (index % 10 === 0) {
      return this.theme['4'];
    }

    if (index % 8 === 0) {
      return this.theme['3'];
    }

    if (index % 5 === 0) {
      return this.theme['2'];
    }

    if (index % 3 === 0) {
      return this.theme['1'];
    }

    return this.theme['0'];
  };

  update = () => {
    this.leaves.forEach((leaf) => {
      leaf.update();
    })
  };

  dispose = () => {
    this.clear();

    Helper.removeEntity(this.container);
    Helper.removeEntity(this.menu);
  };
}

export default Fibonacci;
