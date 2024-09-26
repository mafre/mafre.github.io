import Entity from './../entity'
import Factory from './../../util/factory'
import Helper from './../../util/helper'
import Key from './../../model/key'
import PlayerState from './../../constant/playerState'
import Direction from '../../constant/direction'
import Projectile from './projectile';
import EntityType from '../../constant/entityType'
import CollisionType from '../../constant/collisionType'
import Planck from 'planck-js'
import S from './../../model/stage'

class Droid extends Entity {

    constructor(CM) {

        super();

        this.view = true;
        this.facing = 0;
        this.layer = 3;
        this.type = EntityType.PLAYER;
        this.CM = CM;
        this.shooting = Factory.interval(20, this.shoot);
        this.sm = Factory.stateMachine();

        this.sm.add(PlayerState.IDLE, () => {

            this.ss = Factory.spritesheet('tv/tv_idle.png', 8, 1, 150);
            this.ss.setIndexX(this.facing);
            this.addChild(this.ss);
            this.ss.x -= this.ss.width / 2;
            this.ss.y -= this.ss.height / 2;

        }, () => {

            this.removeChild(this.ss);
        });

        this.sm.add(PlayerState.WALK, () => {

            this.ss = Factory.spritesheet('tv/tv_walk.png', 8, 4, 150);
            this.ss.setIndexX(this.facing);
            this.addChild(this.ss);
            this.ss.x -= this.ss.width / 2;
            this.ss.y -= this.ss.height / 2;
            this.ss.play();

        }, () => {

            this.removeChild(this.ss);
        });

        this.sm.set(PlayerState.IDLE);
    }

    init = () => {

        const bd = Factory.body(true, 1, 1);
        const fd = Factory.fixture(1, 0.99, 1, this.id, CollisionType.ENEMY | CollisionType.WALL, CollisionType.PLAYER);
        const shape = Factory.planckCircle(this.width / 2);

        Helper.createBody(this, shape, bd, fd);

        this.CM.setPosition(this.x, this.y);
    }

    shoot = () => {

        let p = new Projectile();

        p.x = this.x;
        p.y = this.y;

        let a = this.facing / 8 * Math.PI * 2 + Math.PI

        const spd = 3;
        const spdX = spd * Math.cos(a);
        const spdY = spd * Math.sin(a);

        p.x += (this.width + 10) * Math.cos(a) / 2;
        p.y += (this.height + 10) * Math.sin(a) / 2;

        p.rotation = (this.facing / 8) * 360 - 90;

        p.vel(spdX, spdY);

        Helper.addEntity(p);
    }

    update = time => {

        let s = this.CM.getSpeed();
        let v = Planck.Vec2(s.x, s.y);

        this.body.setLinearVelocity(v);

        let p = this.body.getPosition();

        this.x = p.x;
        this.y = p.y;

        this.CM.setPosition(p.x, p.y);

        let direction = this.CM.getDirection();

        if (this.CM.getDirection() !== Direction.NONE) {

            this.facing = direction;
            this.sm.set(PlayerState.WALK);

        } else {

            this.sm.set(PlayerState.IDLE);
        }

        if (this.facing !== Direction.NONE) {

            this.ss.setIndexX(this.facing);
        }

        if (this.CM.isShooting) {

            this.shooting.update(time);
        }
    }

    dispose = () => {

        if (this.shooting) {

            Helper.removeEntity(this.shooting);
        }
    }
}

export default Droid;