import Entity from "./../entity"
import Factory from './../../util/factory'
import S from './../../model/stage'
import EntityType from "../../constant/entityType";
import Helper from "../../util/helper";

class Particle extends Entity {

    constructor(path = 'particle.png') {

        super();

        this.type = EntityType.PARTICLE;

        this.physics = true;
        this.maskBits = EntityType.WALL | EntityType.ENEMY;
        this.categoryBits = EntityType.PARTICLE;

        this.i = Factory.image(path);
        this.i.y -= this.i.height / 2;
        this.i.x -= this.i.width / 2;

        this.addChild(this.i);

        this.accX = 0;
        this.accY = 0;
        this.velX = 0;
        this.velY = 0;

        this.damage = 1;

        this.view = true;
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

        if (this.x < 0 ||
            this.y < 0 ||
            this.x > S.width ||
            this.y > S.height) {

            this.remove = true;
        }
    }
}

export default Particle;