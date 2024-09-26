import MouseEvent from 'openfl/events/MouseEvent';
import Sprite from 'openfl/display/Sprite';
import Factory from './util/factory';
import S from './model/stage';
import MessageBus from './message/bus';
import MessageType from './constant/messageType';
import { BlendMode, GlowFilter } from 'openfl';

class View extends Sprite {
  constructor() {
    super();

    this.background = new Sprite();
    this.addChild(this.background);

    this.content = new Sprite();
    this.addChild(this.content);

    this.bm = Factory.bitmap(S.width, S.height);
    this.bm.blendMode = BlendMode.ALPHA;
    this.addChild(this.bm);

    const strength = 5;

    const filter = new GlowFilter(0xbc2733, 1, strength, strength, strength, 1, true, false)
    //this.bm.filters = [filter];

    this.layers = {};

    this.addEventListener(MouseEvent.MOUSE_MOVE, this.onMouseMove);
    this.addEventListener(MouseEvent.MOUSE_DOWN, this.onMouseDown);
    this.addEventListener(MouseEvent.MOUSE_UP, this.onMouseUp);
    this.addEventListener(MouseEvent.MOUSE_LEAVE, this.onMouseLeave);

    this.subscribeToMessages();

    this.setScale(S.scale);
  }

  subscribeToMessages = () => {
    MessageBus.subscribe(MessageType.SHOW_LAYER, this.showLayer);
    MessageBus.subscribe(MessageType.HIDE_LAYER, this.hideLayer);
    MessageBus.subscribe(MessageType.SET_SCALE, this.setScale);
  };

  showLayer = (id) => {
    const layer = this.layers[id];

    if (!layer) {
      return;
    }

    layer.visible = true;
  };

  hideLayer = (id) => {
    const layer = this.layers[id];

    if (!layer) {
      return;
    }

    layer.visible = false;
  };

  setScale = () => {
    this.scaleX = S.scale;
    this.scaleY = S.scale;
  };

  getLayer = (id) => {
    const layer = this.layers[id] ?? this.addLayer(id);

    return layer;
  };

  addLayer = (id) => {
    const layer = new Sprite();
    this.layers[id] = layer;
    this.content.addChild(layer);

    this.sort();

    return layer;
  };

  render = (entity) => {
    this.bm.draw(entity);
  };

  add = (entity) => {
    const layer = this.getLayer(entity.layer);

    layer.addChild(entity);
  };

  remove = (entity) => {
    const layer = this.getLayer(entity.layer);

    layer.removeChild(entity);
  };

  setMousePos = (x, y) => {
    S.mouseX = x;
    S.mouseY = y;
  };

  onMouseMove = (event) => {
    this.setMousePos(event.stageX, event.stageY);
  };

  onMouseDown = (event) => {
    this.setMousePos(event.stageX, event.stageY);
    this.setMousePos(event.stageX, event.stageY);

    S.mouseDown = true;
  };

  onMouseUp = () => {
    S.mouseDown = false;
  };

  onMouseLeave = () => {
    S.mouseDown = false;
  };

  fill = (color) => {
    this.background.graphics.beginFill(color);
    this.background.graphics.drawRect(0, 0, S.width, S.height);
    this.background.graphics.endFill();
  };

  clear = () => {
    this.bm.clear();
  };

  sort = () => {
    const layers = [];

    for (let l in this.layers) {
      layers.push(this.layers[l]);
    }

    const sorted = layers.sort((a, b) => {
      if (a.layer > b.layer) {
        return 1;
      }

      if (a.layer < b.layer) {
        return -1;
      }

      return 0;
    });

    for (let l of sorted) {
      this.content.addChild(l);
    }
  };
}

export default View;
