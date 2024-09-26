import Planck from 'planck-js';
import Factory from '../../util/factory';
import Entity from '../entity';
import EntityType from '../../constant/entityType';
import CollisionType from '../../constant/collisionType';
import Helper from '../../util/helper';

class Wall extends Entity {
  constructor() {
    super();
    this.view = true;
    this.layer = 2;
    this.physics = true;
    this.fixed = true;
    this.type = EntityType.WALL;
    (this.maskBits = EntityType.PLAYER | EntityType.PARTICLE), EntityType.ENEMY;
    this.categoryBits = EntityType.WALL;

    this.i = Factory.image('collision/wall.png');
    this.addChild(this.i);
  }

  init = () => {
    const bd = Factory.body(true, 1, 1, 'static');
    const fd = Factory.fixture(
      1,
      0.99,
      1,
      this.id,
      CollisionType.PLAYER | CollisionType.PARTICLE | CollisionType.ENEMY,
      CollisionType.WALL,
    );
    const shape = Factory.planckBox(this.width / 2, this.height / 2);

    Helper.createBody(this, shape, bd, fd);
  };

  handleCollision = (entity) => {
    if (!entity || entity.remove) {
      return;
    }

    switch (entity.type) {
      default:
        break;
    }
  };

  addBody = (body) => {
    this.body = body;

    const vec2 = Planck.Vec2(this.x + this.width / 2, this.y + this.width / 2);

    this.body.setPosition(vec2);
  };

  dispose = () => {
    Helper.destroyBody(this.body);
  };
}

export default Wall;
