import Sprite from 'openfl/display/Sprite';
import StateMachine from './statemachine';

class Toggle extends Sprite {
  constructor() {
    super();

    this.content = [];
    this.index = 0;
    this.current = null;
    this.sm = new StateMachine();
  }

  add = (content) => {
    this.sm.add(
      this.content.length,
      () => {
        this.current = this.content[this.index];
        this.addChild(this.current);
      },
      () => {
        this.removeChild(this.current);
        this.current = null;
      },
    );

    this.content.push(content);

    if (!this.current) {
      this.sm.set(this.index);
    }
  };

  next = () => {
    this.index += 1;

    if (this.index >= this.content.length) {
      this.index = 0;
    }

    this.sm.set(this.index);
  };

  prev = () => {
    this.index -= 1;

    if (this.index < 0) {
      this.index = this.content.length - 1;
    }

    this.sm.set(this.index);
  };
}

export default Toggle;
