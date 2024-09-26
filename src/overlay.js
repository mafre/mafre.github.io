import Sprite from 'openfl/display/Sprite';
import S from './model/stage';
import MessageBus from './message/bus';
import MessageType from './constant/messageType';

class Overlay extends Sprite {
  constructor() {
    super();

    this.content = null;

    this.setScale(S.scale);

    MessageBus.subscribe(MessageType.SHOW_OVERLAY, this.show);
    MessageBus.subscribe(MessageType.HIDE_OVERLAY, this.hide);
    MessageBus.subscribe(MessageType.SET_SCALE, this.setScale);
  }

  show = (content) => {
    if (this.content) {
      this.removeChild(this.content);

      if (this.content === content) {
        this.content = null;
        return;
      }
    }

    this.content = content;
    this.addChild(this.content);
  };

  hide = () => {
    if (this.content) {
      this.removeChild(this.content);

      this.content = null;
    }
  };

  setScale = (scale) => {
    this.scaleX = scale;
    this.scaleY = scale;
  };
}

export default Overlay;
