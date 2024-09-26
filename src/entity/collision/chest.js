import Planck from 'planck-js';
import MouseEvent from 'openfl/events/MouseEvent';
import Factory from './../../util/factory';
import Entity from './../entity';
import M from './../../util/math';
import S from './../../model/stage';
import EntityType from '../../constant/entityType';
import CollisionType from '../../constant/collisionType';
import Helper from '../../util/helper';
import { ENGINE_METHOD_DIGESTS } from 'constants';

class Chest extends Entity {
  constructor() {
    super();
    this.view = true;
    this.layer = 2;
    this.physics = true;
    this.fixed = true;
    this.type = EntityType.WALL;
    (this.maskBits = EntityType.PLAYER | EntityType.PARTICLE), EntityType.ENEMY;
    this.categoryBits = EntityType.WALL;

    this.ss = Factory.spritesheet('collision/chest.png', 2, 1);
    this.addChild(this.ss);
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

    let vec2 = Planck.Vec2(this.x + this.width / 2, this.y + this.width / 2);

    this.body.setPosition(vec2);
  };

  open = () => {
    this.ss.setIndexX(1);
  };

  close = () => {
    this.ss.setIndexX(0);
  };

  dispose = () => {
    Helper.destroyBody(this.body);
  };
}

export default Chest;
