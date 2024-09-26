import Entity from "./../entity"
import Factory from './../../util/factory'
import S from './../../model/stage'
import EntityType from "../../constant/entityType";
import CollisionType from "../../constant/collisionType";
import Helper from "../../util/helper";
import SpriteSheet from "../../component/spritesheet";
import Planck from 'planck-js'

class Missile extends Entity {

    constructor() {

        super();

        this.type = EntityType.PARTICLE;

        this.ss = new SpriteSheet('tv/small_missile.png', 2, 1, 100);
        this.ss.x -= this.ss.width / 2;
        this.ss.y -= this.ss.height / 2;
        this.ss.playX();
        this.addChild(this.ss);

        this.accX = 0;
        this.accY = 0;
        this.velX = 0;
        this.velY = 0;

        this.damage = 1;

        this.view = true;
    }

    init = () => {

        const bd = Factory.body(true, 1, 1, 'dynamic');
        const fd = Factory.fixture(0, 0, 0, this.id, CollisionType.WALL | CollisionType.ENEMY, CollisionType.PARTICLE);
        const shape = Factory.planckCircle(this.width);

        Helper.createBody(this, shape, bd, fd);
    }

    acc = (x, y) => {

        this.accX = x;
        this.accY = y;
    }

    vel = (x, y) => {

        this.velX = x;
        this.velY = y;
    }

    handleCollision = entity => {

        if (!entity || entity.remove) {

            return;
        }

        switch (entity.type) {

            case EntityType.ENEMY:

                this.remove = true;
                break;

            case EntityType.WALL:

                this.remove = true;
                break;
        }
    }

    update = time => {

        this.velX += this.accX;
        this.velY += this.accY;
        this.x += this.velX;
        this.y += this.velY;

        let vec2 = Planck.Vec2(this.x, this.y);

        this.body.setPosition(vec2);

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

export default Missile;