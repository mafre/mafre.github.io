import KeyboardEvent from "openfl/events/KeyboardEvent";
import MessageType from "../constant/messageType";
import MessageBus from "../message/bus";
import Key from "../model/key";
import Entity from "./entity";

class Input extends Entity {
  constructor() {
    super();

    this.view = true;
    this.keyTarget = null;

    MessageBus.subscribe(MessageType.ENABLE_KEYS, this.onEnableKeys);
    MessageBus.subscribe(MessageType.DISABLE_KEYS, this.onDisableKeys);
  }

  init = () => {
    this.stage.addEventListener(KeyboardEvent.KEY_DOWN, this.onKeyDown);
    this.stage.addEventListener(KeyboardEvent.KEY_UP, this.onKeyUp);
  };

  onKeyDown = (key) => {
    const { keyCode } = key;

    Key.down(keyCode);
    MessageBus.dispatch(MessageType.KEY_DOWN, keyCode);
  };

  onKeyUp = (key) => {
    const { keyCode } = key;

    Key.up(keyCode);
    MessageBus.dispatch(MessageType.KEY_UP, keyCode);
  };

  onEnableKeys = (target) => {
    if (this.keyTarget) {
      this.keyTarget.disableKeyNavigation();

      if (target === this.keyTarget) {
        this.keyTarget = null;

        return;
      }
    }

    this.keyTarget = target;
    this.keyTarget.enableKeyNavigation();
  };

  onDisableKeys = () => {
    if (this.keyTarget) {
      this.keyTarget.disableKeyNavigation();
      this.keyTarget = null;
    }
  };
}

export default Input;
