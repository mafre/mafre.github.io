import M from '../util/math';

class Path {
  constructor(entity, map, control) {
    this.entity = entity;
    this.map = map;
    this.control = control;
    this.path = null;
    this.target = null;
  }

  findPath = (from, to) => {
    this.target = null;

    const f = this.map.getTileAt(from.x, from.y);
    const t = this.map.getTileAt(to.x, to.y);

    this.path = this.map.findPath(f, t);

    this.nextTarget();
  };

  nextTarget = () => {
    if (this.path.length === 0) {
      this.target = null;
      this.control.stop();

      return;
    }

    const target = this.path.shift();

    this.setTarget(target);
  };

  setTarget = (target) => {
    const targetTilePos = {
      x: target[0],
      y: target[1],
    };

    const tilePos = this.map.getTileAt(this.entity.x, this.entity.y);
    const direction = this.control.getDirectionToPoint(tilePos, targetTilePos);

    this.control.setDirection(direction);
    this.target = this.map.getTileCenter(targetTilePos.x, targetTilePos.y);
    this.control.moveToPoint(this.entity.pos(), this.target);
  };

  isAtTarget = () => {
    const d = M.distance(this.entity.pos(), this.target);

    return d < 20;
  };

  update = () => {
    if (this.target) {
      if (this.isAtTarget(this.target)) {
        this.nextTarget();
      }
    }
  };
}

export default Path;
