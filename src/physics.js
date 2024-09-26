import Planck, { Vec2 } from 'planck-js';
import Model from './model/app';
import MessageBus from './message/bus';
import MessageType from './constant/messageType';
import Entity from './entity/entity';

class Physics extends Entity {
  constructor() {
    super();

    this.world = Planck.World({
      gravity: new Vec2(0, 50),
      continuousPhysics: true
    });
    this.world.on('post-solve', (contact) => {
      const fA = contact.getFixtureA();
      const bA = fA.getBody();
      const uA = fA.getUserData();
      const fB = contact.getFixtureB();
      const bB = fB.getBody();
      const uB = fB.getUserData();

      const collision = {
        uA,
        uB,
        bA,
        bB
      };

      MessageBus.dispatch(MessageType.COLLISION, collision);
    });

    MessageBus.subscribe(MessageType.CREATE_BODY, this.createBody);
    MessageBus.subscribe(MessageType.DESTROY_BODY, this.destroyBody);
  }

  createBody = ({ entity, shape, bodyDef, fixDef }) => {
    const body = this.world.createBody(bodyDef);

    body.createFixture(shape, fixDef);
    body.setMassData({ mass: 10, center: Vec2(0, 0), I: 1 })

    entity.addBody(body);
  };

  destroyBody = (body) => {
    this.world.destroyBody(body);
  };

  getBodyAtMouse() {
    this.mousePVec = new Planck.B2Vec2(this.stage.mouseX, this.stage.mouseY);

    const aabb = new Planck.AABB();

    aabb.lowerBound.Set(this.mousePVec.x - 0.001, this.mousePVec.y - 0.001);
    aabb.upperBound.Set(this.mousePVec.x + 0.001, this.mousePVec.y + 0.001);

    this.world.queryAABB(this.getBodyCB, aabb);
  }

  getBodyCB(fixture) {
    if (fixture.GetBody().GetType() !== Planck.B2Body.b2_staticBody) {
      if (
        fixture
          .GetShape()
          .TestPoint(fixture.GetBody().GetTransform(), this.mousePVec)
      ) {
        return false;
      }
    }

    return true;
  }

  update = () => {
    this.world.step(1 / Model.worldStep);
  };
}

export default Physics;
