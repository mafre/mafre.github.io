import Entity from "../../entity/entity"
import Factory from '../../util/factory'
import S from '../../model/stage'
import EntityType from "../../constant/entityType";
import Helper from "../../util/helper";
import Planck from 'planck-js'
import Font from '../../constant/fonts';
import Text from "../../component/text";
import { Sprite } from 'openfl'
import CollisionType from "../../constant/collisionType";

class Ball extends Entity {

    constructor(level, color, bodyType = 'dynamic') {

        super();

        this.type = EntityType.SUICA;
        this.speed = 20;
        this.damage = 10;
        this.render = true;
        this.velocity = 1;
        this.level = level;
        this.bodyType = bodyType;

        const sp = new Sprite();
        this.addChild(sp);

        this.s = Factory.shape(0, 0xbc2733, 1);
        this.s.circle((level / 2)+1, color);
        //this.s.glow();

        sp.addChild(this.s);

        const t = new Text(level.toString(), Font.F, 10);
        t.x = -t.width / 2;
        t.y = -t.height / 2;
        //sp.addChild(t)
    }

    init = () => {

        const maskBits = this.bodyType === 'dynamic' ? CollisionType.WALL | CollisionType.SUICA : CollisionType.SUICA;
        const bd = Factory.body(false, 5, 5, this.bodyType)
        const fd = Factory.fixture(0, 0, 0, this.id, maskBits, CollisionType.SUICA, false);

        fd.userData = {
            id: this.id,
            level: this.level,
            type: EntityType.SUICA
        };

        const shape = Factory.planckCircle(this.level / 2, 2);

        setTimeout(() => {

            Helper.createBody(this, shape, bd, fd);
        }, 0);
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

    update = time => {

        if (!this.body) return;

        let p = this.body.getPosition();

        this.x = p.x;
        this.y = p.y;

        if (this.x < 0 ||
            this.y < -50 ||
            this.x > S.width ||
            this.y > S.height) {

            this.remove = true;
        }
    }

    dispose = () => {

        this.removeBody();
    }
}

export default Ball;