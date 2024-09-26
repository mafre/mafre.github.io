import Key from '../model/key';
import M from '../util/math';
import MessageBus from '../message/bus';
import MessageType from '../constant/messageType';
import Direction from '../constant/direction';

class Control {
  constructor(model) {
    this.model = model;
  }

  keys = () => {
    MessageBus.subscribe(MessageType.KEY_DOWN, this.onKeyDown);
    MessageBus.subscribe(MessageType.KEY_UP, this.onKeyUp);
  };

  onKeyDown = (key) => {
    if (this.isWalkingKey(key)) {
      this.updateDirection();
      this.updateSpeed();
    }

    if (this.isShootinggKey(key)) {
      this.model.isShooting = true;
    }
  };

  onKeyUp = (key) => {
    if (this.isWalkingKey(key)) {
      this.model.isWalking = this.isWalking();

      if (this.model.isWalking) {
        this.updateDirection();
        this.updateSpeed();
      } else {
        this.model.setDirection(Direction.NONE);
        this.model.setSpeed(0, 0);
      }
    }

    if (this.isShootinggKey(key)) {
      this.model.isShooting = this.isShooting();
    }
  };

  isShootinggKey = (key) => {
    const result = this.model.shootingKeys.find((aKey) => {
      return aKey === key;
    });

    return result;
  };

  isWalkingKey = (key) => {
    const result = this.model.walkingKeys.find((aKey) => {
      return aKey === key;
    });

    return result;
  };

  updateSpeed = () => {
    const direction = this.model.getDirection();

    if (direction === Direction.NONE) {
      this.model.setSpeed(0, 0);

      return;
    }

    switch (direction) {
      case Direction.LEFT:
        this.model.setSpeed(-this.model.speed, 0);
        break;

      case Direction.LEFT_UP:
        this.model.setSpeed(-this.model.speed / 2, -this.model.speed / 2);
        break;

      case Direction.UP:
        this.model.setSpeed(0, -this.model.speed);
        break;

      case Direction.UP_RIGHT:
        this.model.setSpeed(this.model.speed / 2, -this.model.speed / 2);
        break;

      case Direction.RIGHT:
        this.model.setSpeed(this.model.speed, 0);
        break;

      case Direction.RIGHT_DOWN:
        this.model.setSpeed(this.model.speed / 2, this.model.speed / 2);
        break;

      case Direction.DOWN:
        this.model.setSpeed(0, this.model.speed);
        break;

      case Direction.DOWN_LEFT:
        this.model.setSpeed(-this.model.speed / 2, this.model.speed / 2);
        break;

      default:
        break;
    }
  };

  updateDirection = () => {
    const direction = this.getDirection();

    this.model.setDirection(direction);
  };

  getDirection = () => {
    let direction = Direction.NONE;

    if (Key.key(38) || Key.key(87)) {
      // up

      direction = Direction.UP;
    }

    if (Key.key(40) || Key.key(83)) {
      // down

      direction = Direction.DOWN;
    }

    if (Key.key(37) || Key.key(65)) {
      // left
      if (direction === Direction.UP) {
        direction = Direction.LEFT_UP;
      } else if (direction === Direction.DOWN) {
        direction = Direction.DOWN_LEFT;
      } else {
        direction = Direction.LEFT;
      }
    }

    if (Key.key(39) || Key.key(68)) {
      // right
      if (direction === Direction.UP) {
        direction = Direction.UP_RIGHT;
      } else if (direction === Direction.DOWN) {
        direction = Direction.RIGHT_DOWN;
      } else {
        direction = Direction.RIGHT;
      }
    }

    return direction;
  };

  getDirectionToPoint = (from, to) => {
    let direction = Direction.NONE;

    if (from.y > to.y) {
      // up

      direction = Direction.UP;
    }

    if (from.y < to.y) {
      // down

      direction = Direction.DOWN;
    }

    if (from.x > to.x) {
      // left
      if (direction === Direction.UP) {
        direction = Direction.LEFT_UP;
      } else if (direction === Direction.DOWN) {
        direction = Direction.DOWN_LEFT;
      } else {
        direction = Direction.LEFT;
      }
    }

    if (from.x < to.x) {
      // right
      if (direction === Direction.UP) {
        direction = Direction.UP_RIGHT;
      } else if (direction === Direction.DOWN) {
        direction = Direction.RIGHT_DOWN;
      } else {
        direction = Direction.RIGHT;
      }
    }

    return direction;
  };

  setDirection = (direction) => {
    this.model.setDirection(direction);
  };

  moveToPoint = (from, to) => {
    const a = M.radians(from, to);
    const x = this.model.speed * Math.cos(a);
    const y = this.model.speed * Math.sin(a);

    this.model.setSpeed(x, y);
  };

  isWalking = () => {
    this.model.walkingKeys.forEach((aKey) => {
      return Key.key(aKey);
    });

    return false;
  };

  isShooting = () => {
    this.model.shootingKeys.forEach((aKey) => {
      return Key.key(aKey);
    });

    return false;
  };

  stop = () => {
    this.model.setDirection(Direction.NONE);
    this.model.setSpeed(0, 0);
  };

  dispose = () => {
    MessageBus.unsubscribe(MessageType.KEY_DOWN, this.onKeyDown);
    MessageBus.unsubscribe(MessageType.KEY_DOWN, this.onKeyDown);
  };
}

export default Control;
