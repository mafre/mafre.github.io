import Entity from "./../entity"
import Factory from './../../util/factory'
import S from './../../model/stage'
import EntityType from "../../constant/entityType";
import CollisionType from "../../constant/collisionType";
import Helper from "../../util/helper";
import Planck from 'planck-js'

class Enemy extends Entity {

    constructor(path = 'target.png') {

        super();

        this.type = EntityType.ENEMY;

        this.i = Factory.image(path);
        this.i.y -= this.i.height / 2;
        this.i.x -= this.i.width / 2;

        this.addChild(this.i);

        this.hp = 10;

        this.view = true;
    }

    init = () => {

        const bd = Factory.body(true, 1, 1);
        const fd = Factory.fixture(0.5, 0.99, 1, this.id, CollisionType.PARTICLE, CollisionType.ENEMY);
        const shape = Factory.planckCircle(this.width);

        Helper.createBody(this, shape, bd, fd);
    }

    damage = amount => {

        this.hp -= amount;

        if (this.hp <= 0) {

            this.remove = true;
        }
    }

    handleCollision = entity => {

        if (!entity || entity.remove) {

            return;
        }

        switch (entity.type) {

            case EntityType.PARTICLE:

                this.damage(entity.damage);
                break;
        }
    }

    update = time => {

        let vec2 = Planck.Vec2(this.x, this.y);

        this.body.setPosition(vec2);
    }

    dispose = () => {

        Helper.destroyBody(this.body);
    }
}

export default Enemy;