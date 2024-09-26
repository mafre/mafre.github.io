import Entity from './../entity'
import Factory from './../../util/factory'
import Helper from './../../util/helper'
import M from './../../util/math'

class Tower extends Entity {

    constructor() {

        super();

        this.interval = Factory.interval(3, this.intervalCallback);
        this.i = Factory.image('hex/hex_0.png');
        this.i.y -= this.i.height;
        this.i.x -= this.i.width / 2;

        this.x = 100;
        this.y = 100;

        this.addChild(this.i);

        this.view = true;
    }

    intervalCallback = () => {

        let p = Factory.particle();

        p.x = this.x;
        p.y = this.y - 10;

        let a = M.angle(this.pos());

        const spd = 3;
        const spdX = spd * Math.cos(a);
        const spdY = spd * Math.sin(a);

        p.vel(spdX, spdY);
    }

    update = time => {


    }

    dispose = () => {

        Helper.removeEntity(this.interval);
    }
}

export default Tower;