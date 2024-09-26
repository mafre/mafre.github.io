import State from '../state';
import S from '../../model/stage';
import A from '../../model/app';
import Factory from '../../util/factory';
import Helper from '../../util/helper';
import entityType from '../../constant/entityType';
import Map from '../../component/map';
import Wall from './wall';
import SuicaBall from './ball';
import messageType from '../../constant/messageType';
import MessageBus from '../../message/bus';
import Text from '../../component/text';

const colors = {
  0: 0x3d5b99,
  1: 0xbc2733,
  2: 0xed5d4a,
  3: 0x73fabf,
  4: 0x4c7f96,
  5: 0x4a9dc8,
  6: 0x4a9dc8,
  7: 0x4a9dc8,
  8: 0x4a9dc8,
  9: 0x4a9dc8,
  10: 0x4a9dc8
};

class Suica extends State {
  constructor() {
    super();

    this.entities = [];
    this.container = Factory.container((e) => {


      const position = {
        x: e.stageX / S.scale,
        y: e.stageY / S.scale
      }

      this.addBall(1, position, 4)
    });
    this.menu = Factory.menu();
    this.container.add(this.menu);
    this.map = new Map(32, 10, 10);
    this.counter = 0;
    this.menu.y = S.height - this.menu.height;
    this.container.center();
    this.balls = {};
    this.s = Factory.shape(0, 0xbc2733, 1);
    this.s.rectangle(S.width, S.height);
    this.s.x = -S.width / 2;
    this.s.y = -S.height / 2;

    this.container.add(this.s);

    const wallWidth = 10;

    //this.wall(0, 0, S.width-wallWidth, wallWidth);
    this.wall(0, S.height - wallWidth, S.width, wallWidth);
    this.wall(0, 0, wallWidth, S.height - wallWidth);
    this.wall(S.width - wallWidth, 0, wallWidth, S.height - wallWidth);

    MessageBus.subscribe(messageType.COLLISION, this.onCollision);

    setInterval(() => {
      this.addBall(1, {x: Math.random()*(S.width - wallWidth*3) + wallWidth*1.5, y: -10}, Math.floor(10*Math.random()+3))
    }, 1000 / A.fps);

    const txt = new Text('Julafton');
    txt.y = -wallWidth + txt.height/2 - 20;
    txt.x = -txt.width/2;

    const txt2 = new Text('2023');
    txt2.y = -wallWidth + txt2.height/2 + txt.height - 20;
    txt2.x = -txt2.width/2;

    this.container.add(txt);
    this.container.add(txt2);
    this.container.centerContent();
  }

  onCollision = (collision) => {

    if (collision.uA.type === entityType.SUICA && collision.uB.type === entityType.SUICA) {

      const ballA = this.balls[collision.uA.id];
      const ballB = this.balls[collision.uB.id];

      if (!ballA || !ballB || ballA.level !== ballB.level || ballA.remove || ballB.remove) {

        return;
      }

      ballA.remove = true;
      ballB.remove = true;

      ballA.removeBody();
      ballB.removeBody();

      const level = ballA.level + 1;
      const position = {
        x: (ballA.x + ballB.x) / 2,
        y: (ballA.y + ballB.y) / 2
      }
      const speed = 0;

      this.addBall(level, position, speed);

      return;
    }

    const ball = collision.uA.type === entityType.SUICA ? this.balls[collision.uA.id] : this.balls[collision.uB.id];

    if (!ball || ball.remove) return;

    const position = {x: ball.x, y: ball.y};
    const level = ball.level;

    ball.remove = true;
    ball.removeBody();

    setTimeout(() => {
      let p = new SuicaBall(level, 0xffffff, 'static');

      const id = entityType.SUICA + this.counter;
      p.id = id;
      p.x = position.x;
      p.y = position.y;

      Helper.addEntity(p);

      this.balls[id] = p;

      this.counter++;
    }, 10);
  };

  addBall = (level, position, speed) => {
    //const color = colors[level-1];
    let p = new SuicaBall(level, 0xffffff);

    p.id = entityType.SUICA + this.counter;
    p.x = position.x;
    p.y = position.y;

    let a = 1.5*Math.PI;

    const spdX = speed * Math.cos(a);
    const spdY = speed * Math.sin(a);

    p.vel(spdX, spdY);

    Helper.addEntity(p);

    this.balls[p.id] = p;

    this.counter++;
  }

  wall = (x, y, width, height) => {
    const wall = new Wall(width, height);
    wall.x = x;
    wall.y = y;

    Helper.addEntity(wall);
    this.entities.push(wall);
  };

  clear = () => {
    this.entities.forEach((e) => {
      e.parent.removeChild(e);
    });

    this.entities = [];

    clearInterval(this.interval);
  };

  update = () => {
    this.entities.forEach((e) => {
      e.update();
    })
  };

  dispose = () => {
    this.clear();

    Helper.removeEntity(this.container);
    Helper.removeEntity(this.menu);
  };
}

export default Suica;
