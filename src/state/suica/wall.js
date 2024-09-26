import Planck from 'planck-js';
import Factory from '../../util/factory';
import Entity from '../../entity/entity';
import EntityType from '../../constant/entityType';
import CollisionType from '../../constant/collisionType';
import Helper from '../../util/helper';

class Wall extends Entity {
  constructor(width, height) {
    super();
    this.view = true;
    this.layer = 2;
    this.physics = true;
    this.fixed = true;
    this.type = EntityType.WALL;
    this.categoryBits = EntityType.WALL;

    this.s = Factory.shape(0, 0x000000, 0);
    this.s.rectangle(width, height);

    this.addChild(this.s);
  }

  init = () => {
    const bd = Factory.body(true, 1, 1, 'static');
    const fd = Factory.fixture(
      1,
      0.99,
      1,
      "wall",
      CollisionType.SUICA,
      CollisionType.WALL,
    );

    fd.userData = {
        id: 'wall',
        type: EntityType.WALL
    };

    const shape = Factory.planckBox(this.width / 2, this.height / 2);

    Helper.createBody(this, shape, bd, fd);
  };

  handleCollision = (entity) => {
    if (!entity || entity.remove) {
      return;
    }
  };

  addBody = (body) => {
    this.body = body;

    const vec2 = Planck.Vec2(this.x + this.width / 2, this.y + this.height / 2);

    this.body.setPosition(vec2);
  };

  dispose = () => {
    Helper.destroyBody(this.body);
  };
}

export default Wall;
