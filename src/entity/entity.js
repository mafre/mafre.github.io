import Sprite from "openfl/display/Sprite";
import Planck from "planck-js";
import EntityType from "../constant/entityType";
import Helper from "../util/helper";

class Entity extends Sprite {
  constructor() {
    super();

    this.id = 0;
    this.layer = 0;
    this.type = EntityType.DEFAULT;
    this.view = false;
    this.render = false;
    this.remove = false;

    this.addEventListener(MouseEvent.MOUSE_DOWN, () => {
      if (this.onMouseDownCallback) {
        this.onMouseDownCallback(this);
      }
    });
  }

  init = () => {};

  mouseDown = (callback) => {
    this.onMouseDownCallback = callback;
  };

  update = () => {};

  addBody = (body) => {
    this.body = body;

    const vec2 = Planck.Vec2(this.x, this.y);

    this.body.setPosition(vec2);
  };

  removeBody = () => {
    if (this.body ) Helper.destroyBody(this.body);
  }

  pos = () => {
    return {
      x: this.x,
      y: this.y,
    };
  };

  handleCollision = () => {};

  dispose = () => {};
}

export default Entity;
