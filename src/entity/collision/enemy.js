import Entity from "./../entity"
import Factory from './../../util/factory'
import EntityType from "../../constant/entityType";
import CollisionType from "../../constant/collisionType";
import Helper from "../../util/helper";
import Planck from 'planck-js'
import Damage from "./damage";

class Enemy extends Entity {

    constructor(imagePath = 'target.png', model, playerModel) {

        super();

        this.model = model;
        this.playerModel = playerModel;

        this.type = EntityType.ENEMY;
        this.view = true;
        this.hp = 50;

        this.i = Factory.image(imagePath);
        this.i.y -= this.i.height / 2;
        this.i.x -= this.i.width / 2;

        this.addChild(this.i);
    }

    init = () => {

        const bd = Factory.body(true, 1, 1);
        const fd = Factory.fixture(0.5, 0.99, 1, this.id, CollisionType.PARTICLE, CollisionType.ENEMY);
        const shape = Factory.planckCircle(this.width / 2);

        Helper.createBody(this, shape, bd, fd);
    }

    setPath = path => {

        this.path = path;

        //this.path.findPath(this, this.playerModel.getPosition());
    }

    damage = amount => {

        this.hp -= amount;

        if (this.hp <= 0) {

            this.remove = true;
        }

        let d = new Damage(amount);

        d.x = this.x;
        d.y = this.y;

        Helper.addEntity(d);
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

        if (time % 100) {

            this.path.findPath(this, this.playerModel.getPosition());
        }

        this.path.update(time);

        let s = this.model.getSpeed();
        let v = Planck.Vec2(s.x, s.y);

        this.body.setLinearVelocity(v);

        let p = this.body.getPosition();

        this.x = p.x;
        this.y = p.y;
    }

    dispose = () => {

        Helper.destroyBody(this.body);
    }
}

export default Enemy;