import Entity from "./entity"
import Factory from './../util/factory'
import S from './../model/stage'
import EntityType from "./../constant/entityType";
import CollisionType from "./../constant/collisionType";
import Helper from "./../util/helper";
import SpriteSheet from "./../component/spritesheet";
import Planck from 'planck-js'

class Projectile extends Entity {

    constructor() {

        super();

        this.type = EntityType.SUICA_1;
        this.speed = 10;
        this.damage = 10;
        this.view = true;
        this.velocity = null;

        this.ss = new SpriteSheet('collision/projectile.png', 2, 1);
        this.ss.x -= this.ss.width / 2;
        this.ss.y -= this.ss.height / 2;
        this.addChild(this.ss);

        this.interval = Factory.interval(30, () => {

            this.ss.stepX();
        });
    }

    init = () => {

        const bd = Factory.body(true, 0.2, 2, 'dynamic', false);
        const fd = Factory.fixture(0, 0, 0, this.id, CollisionType.WALL | CollisionType.SUICA_1 | CollisionType.SUICA_2 | CollisionType.SUICA_3 | CollisionType.SUICA_4, false);
        const shape = Factory.planckCircle(this.width / 2);

        Helper.createBody(this, shape, bd, fd);
    }

    vel = (x, y) => {

        this.velocity = Planck.Vec2(x * this.speed, y * this.speed);
    }

    addBody = body => {

        this.body = body;

        let vec2 = Planck.Vec2(this.x, this.y);

        this.body.setPosition(vec2);
        this.body.setLinearVelocity(this.velocity);
    }

    handleCollision = entity => {

        if (!entity || entity.remove) {

            return;
        }

        switch (entity.type) {

            case EntityType.WALL:

                this.remove = true;

                break;
        }
    }

    update = time => {

        this.interval.update(time);

        let p = this.body.getPosition();

        this.x = p.x;
        this.y = p.y;

        if (this.x < 0 ||
            this.y < 0 ||
            this.x > S.width ||
            this.y > S.height) {

            this.remove = true;
        }
    }

    dispose = () => {

        Helper.destroyBody(this.body);
    }
}

export default Projectile;