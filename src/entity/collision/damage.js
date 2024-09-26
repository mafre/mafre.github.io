import Entity from './../entity';
import Factory from './../../util/factory';
import S from './../../model/stage';
import EntityType from '../../constant/entityType';
import CollisionType from '../../constant/collisionType';
import Helper from '../../util/helper';
import fonts from '../../constant/fonts';

class Damage extends Entity {
  constructor(amount) {
    super();

    this.time = 0;
    this.view = true;

    let t = Factory.text(amount.toString(), fonts.ATTRACT, 14, 0x000000);

    this.addChild(t);
  }

  update = () => {
    this.y -= 1;
    this.time += 1;

    if (this.time > 20) {
      Helper.removeEntity(this);
    }
  };
}

export default Damage;
