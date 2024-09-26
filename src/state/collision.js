import State from './state';
import Helper from '../util/helper';
import Factory from '../util/factory';
import Control from '../component/control';
import CM from '../model/control/droid';
import ECM from '../model/control/enemy';
import Droid from '../entity/collision/droid';
import Enemy from '../entity/collision/enemy';
import Wall from '../entity/collision/wall';
import Floor from '../entity/collision/floor';
import entityType from '../constant/entityType';
import Map from '../component/map';
import Path from '../component/path';

class Collision extends State {
  constructor() {
    super();

    this.items = [];
    this.control = new Control(CM);
    this.control.keys();
    this.map = new Map(32, 15, 10);
    this.player = new Droid(CM);
    this.path = new Path(this.player, this.map, this.control);

    this.add(this.player, 5, 5);

    this.c = Factory.container();
    this.c.fill(0x939e8d);

    this.m = Factory.container(5);

    this.menu = Factory.menu();
    this.m.add(this.menu);
    this.menu.y = 16;

    this.menu.add(
      Factory.textButton('reset', () => {
        this.items.forEach((e) => {
          Helper.removeEntity(e);
        });

        this.items = [];

        Helper.removeType(entityType.PARTICLE);

        this.build();
      }),
    );

    this.enemySpawner = Factory.interval(100, () => {
      const t = Math.floor(Math.random() * 3) + 1;
      const x = Math.floor(Math.random() * (this.map.width - 4)) + 2;
      const y = Math.floor(Math.random() * (this.map.height - 4)) + 2;

      this.enemy(`collision/enemy${t}.png`, x, y);
    });

    this.build();
  }

  build = () => {
    for (let x = 0; x < this.map.width; x += 1) {
      this.wall(x, 0);
    }

    for (let x = 0; x < this.map.width; x += 1) {
      this.wall(x, this.map.height - 1);
    }

    for (let y = 1; y < this.map.height - 1; y += 1) {
      this.wall(0, y);
    }

    for (let y = 1; y < this.map.height - 1; y += 1) {
      this.wall(this.map.width - 1, y);
    }

    for (let x = 1; x < this.map.width - 1; x += 1) {
      for (let y = 1; y < this.map.height - 1; y += 1) {
        const r = Math.random() * 10;

        if (r < 2) {
          this.wall(x, y);
        } else {
          this.floor(x, y);
        }
      }
    }
  };

  add = (item, x, y) => {
    this.map.add(item, x, y);
    this.items.push(item);
    Helper.addEntity(item);
  };

  wall = (x = 0, y = 0) => {
    this.add(new Wall(), x, y);
    this.map.setWalkableAt(x, y, false);
  };

  floor = (x = 0, y = 0) => {
    const floor = new Floor(x, y, (e) => {
      this.target = null;
      this.path.findPath(this.player, e);
    });

    this.add(floor, x, y);
  };

  enemy = (path, x, y) => {
    const m = new ECM();
    const c = new Control(m);
    const e = new Enemy(path, m, CM);

    e.setPath(new Path(e, this.map, c));

    this.add(e, x, y);
  };

  update = (time) => {
    this.enemySpawner.update(time);
    this.path.update(time);
  };

  dispose = () => {
    Helper.removeEntity(this.p);
    Helper.removeEntity(this.walls);

    this.items.forEach((item) => {
      Helper.removeEntity(item);
    });

    this.items = [];

    this.control.dispose();
  };
}

export default Collision;
