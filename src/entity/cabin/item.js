import MouseEvent from "openfl/events/MouseEvent";
import Factory from "../../util/factory";
import Entity from "../entity";
import M from "../../util/math";
import S from "../../model/stage";

class Item extends Entity {
  constructor() {
    super();

    this.view = true;
  }
}

export default Item;
