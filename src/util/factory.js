import Planck from 'planck-js';
import Container from '../entity/container';
import Draw from '../entity/draw';
import Interval from '../component/interval';
import Menu from '../component/menu';
import Text from '../component/text';
import Input from '../component/input';
import Image from '../component/image';
import SpriteSheet from '../component/spritesheet';
import Bitmap from '../component/bitmap';
import Shape from '../component/shape';
import Tilemap from '../component/tilemap';
import Tile from '../component/tile';
import StateMachine from '../component/statemachine';
import Drag from '../component/drag';
import Helper from './helper';
import Toggle from '../component/toggle';
import Button from '../component/button';
import Grid from '../component/grid';
import Modal from '../component/modal';
import Steps from '../component/steps';
import Dropdown from '../component/dropdown';

const toggle = () => {
  return new Toggle();
};

const planckCircle = (radius) => {
  return Planck.Circle(radius);
};

const planckBox = (width, height) => {
  return Planck.Box(width, height);
};

const body = (
  bullet = false,
  linearDamping = 1,
  angularDamping = 1,
  type = 'dynamic',
  allowSleep = true,
) => {
  return {
    bullet,
    linearDamping,
    angularDamping,
    type,
    allowSleep,
  };
};

const fixture = (
  friction = 1,
  restitution = 1,
  density = 1,
  id = 0,
  maskBits = 0,
  categoryBits = 0,
  isSensor = false,
) => {
  return {
    friction,
    restitution,
    density,
    userData: {
      id,
    },
    filter: {
      maskBits,
      categoryBits,
    },
    isSensor,
  };
};

const tower = () => {
  const t = new Tower();

  Helper.addEntity(t);

  return t;
};

const container = (onMouseDown, layer) => {
  const c = new Container(onMouseDown);

  if (layer) {
    c.layer = layer;
  }

  Helper.addEntity(c);

  return c;
};

const textButton = (text, callback, path) => {
  const b = new Button(path, callback );

  b.addText(text);

  return b;
};

const imageButton = (path, callback, gridPath) => {
  const b = new Button(gridPath, callback );
  const i = new Image(path);

  b.add(i);

  return b;
};

const menu = () => {
  return new Menu();
};

const image = (path) => {
  return new Image(path);
};

const text = (value, font, size, color) => {
  return new Text(value, font, size, color);
};

const input = (value, font, size, color) => {
  return new Input(value, font, size, color);
};

const spritesheet = (path, framesX, framesY, delay) => {
  return new SpriteSheet(path, framesX, framesY, delay);
};

const bitmap = (width, height) => {
  return new Bitmap(width, height);
};

const shape = (thickness, color, alpha) => {
  return new Shape(thickness, color, alpha);
};

const interval = (delay, callback) => {
  return new Interval(delay, callback);
};

const box = (texture, shadow) => {
  const b = new Box(texture, shadow);

  Helper.addEntity(b);

  return b;
};

const draw = (b, x, y) => {
  const d = new Draw(b, x, y);

  Helper.addEntity(d);

  return d;
};

const tilemap = (bitmapData, framesX, framesY, width, height) => {
  return new Tilemap(bitmapData, framesX, framesY, width, height);
};

const tile = (index) => {
  return new Tile(index);
};

const stateMachine = () => {
  return new StateMachine();
};

const animation = (t, delay) => {
  const a = new Animation(t, delay);

  Helper.addEntity(a);

  return a;
};

const grid = (path) => {
  return new Grid(path);
};

const modal = (path) => {
  return new Modal(path);
};

const drag = (callback) => {
  return new Drag(callback);
};

const steps = (callback) => {
  return new Steps(callback);
};

const dropdown = (label) => {
  return new Dropdown(label);
};

export default {
  toggle,
  tower,
  container,
  textButton,
  imageButton,
  menu,
  image,
  text,
  input,
  animation,
  spritesheet,
  bitmap,
  shape,
  tile,
  interval,
  box,
  draw,
  tilemap,
  stateMachine,
  grid,
  modal,
  drag,
  steps,
  dropdown,
  body,
  fixture,
  planckBox,
  planckCircle,
};
