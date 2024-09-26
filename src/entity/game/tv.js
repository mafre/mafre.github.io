import Entity from './../entity'
import Factory from './../../util/factory'
import Helper from './../../util/helper'
import Key from './../../model/key'
import PlayerState from './../../constant/playerState'
import CM from './../../model/control/tv'
import Control from './../../component/control'
import Direction from '../../constant/direction';
import Missile from './../game/missile'
import EntityType from '../../constant/entityType';
class TV extends Entity {

    constructor() {

        super();

        this.view = true;
        this.facing = 0;
        this.layer = 3;
        this.type = EntityType.PLAYER;
        this.physics = true;

        this.control = new Control(CM);

        this.shooting = Factory.interval(30, this.shoot);

        this.sm = Factory.stateMachine();

        this.sm.add(PlayerState.IDLE, () => {

            this.ss = Factory.spritesheet('tv/tv_idle.png', 8, 1, 150);
            this.ss.setIndexX(this.facing);
            this.addChild(this.ss);

        }, () => {

            this.removeChild(this.ss);
        });

        this.sm.add(PlayerState.WALK, () => {

            this.ss = Factory.spritesheet('tv/tv_walk.png', 8, 4, 150);
            this.ss.setIndexX(this.facing);
            this.addChild(this.ss);
            this.ss.play();

        }, () => {

            this.removeChild(this.ss);
        });

        this.sm.set(PlayerState.IDLE);
    }

    shoot = () => {

        let p = new Missile();

        p.x = this.x + this.width / 2;
        p.y = this.y + this.height / 2;

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

        let position = CM.updatePosition();
        let direction = CM.getDirection();

        this.x = position.x;
        this.y = position.y;

        if (CM.getDirection() !== Direction.NONE) {

            this.facing = direction;
        }

        if (this.facing !== Direction.NONE) {

            this.ss.setIndexX(this.facing);
        }

        this.control.isWalking() ?
            this.sm.set(PlayerState.WALK):
            this.sm.set(PlayerState.IDLE);

        if (this.control.isShooting()) {

            this.shooting.update(time);
        }
    }

    dispose = () => {

        if (this.shooting) {

            Helper.removeEntity(this.shooting);
        }

        this.control.dispose();
    }
}

export default TV;