import Sprite from 'openfl/display/Sprite';
import Shape from 'openfl/display/Shape';
import MouseEvent from 'openfl/events/MouseEvent';
import M from '../util/math';
import { GlowFilter, GradientType, Matrix } from 'openfl';

class ShapeComponent extends Sprite {
  constructor(thickness = 1, color = 0xffffff, alpha = 1) {
    super();

    this.color = color;
    this.alpha = alpha;
    this.s = new Shape();
    this.s.graphics.lineStyle(thickness, color, alpha);
    this.addChild(this.s);
  }

  onMouseDown = (callback) => {
    this.addEventListener(MouseEvent.MOUSE_DOWN, () => {
      callback(this);
    });
  };

  onRollOver = (callback) => {
    this.addEventListener(MouseEvent.ROLL_OVER, () => {
      callback(this);
    });
  };

  onRollOut = (callback) => {
    this.addEventListener(MouseEvent.ROLL_OUT, () => {
      callback(this);
    });
  };

  add = (content) => {
    this.content = content;
    this.content.mask = this.s;
    content.width = this.s.width;
    content.height = this.s.height;
    content.x -= content.width / 2;
    this.addChild(this.content);
  };

  dot = () => {
    this.s.graphics.moveTo(0, 0);
    this.s.graphics.lineTo(0, 0);
  };

  hexagon = () => {
    this.s.graphics.beginFill(0xffffff, 0.3);

    let x = 0;
    let y = 0;

    this.s.graphics.moveTo(x, y);

    x += M.hexTwoThird;
    y += M.hexOneThird;

    this.s.graphics.lineTo(x, y);

    y += M.hexTwoThird;

    this.s.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y += M.hexOneThird;

    this.s.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y -= M.hexOneThird;

    this.s.graphics.lineTo(x, y);

    y -= M.hexTwoThird;

    this.s.graphics.lineTo(x, y);

    x += M.hexTwoThird;
    y -= M.hexOneThird;

    this.s.graphics.lineTo(x, y);
    this.s.graphics.endFill();
  };

  cube = (size) => {
    const oneThird = size * (1 / 3);
    const twoThird = size * (2 / 3);

    let x = 0;
    let y = 0;

    this.s.graphics.moveTo(x, y);

    x += twoThird;
    y += oneThird;

    this.s.graphics.lineTo(x, y);

    y += twoThird;

    this.s.graphics.lineTo(x, y);

    x -= twoThird;
    y += oneThird;

    this.s.graphics.lineTo(x, y);

    x -= twoThird;
    y -= oneThird;

    this.s.graphics.lineTo(x, y);

    y -= twoThird;

    this.s.graphics.lineTo(x, y);

    x += twoThird;
    y -= oneThird;

    this.s.graphics.lineTo(x, y);
  };

  tile = (size) => {
    this.s.graphics.lineStyle(1, 0xffffff, 0);
    this.s.graphics.beginFill(0xffffff, 0);

    const oneThird = size * (1 / 3);
    const twoThird = size * (2 / 3);

    let x = 0;
    let y = 0;

    this.s.graphics.moveTo(x, y);

    x += twoThird;
    y += oneThird;

    this.s.graphics.lineTo(x, y);

    x -= twoThird;
    y += oneThird;

    this.s.graphics.lineTo(x, y);

    x -= twoThird;
    y -= oneThird;

    this.s.graphics.lineTo(x, y);

    x += twoThird;
    y -= oneThird;

    this.s.graphics.lineTo(x, y);

    this.s.graphics.endFill();
  };

  addLines = (thickness = 1, color = 0xffffff, alpha = 1) => {
    this.lines = new Shape();
    this.lines.graphics.lineStyle(thickness, color, alpha);
    this.addChild(this.lines);

    let x = 0;
    let y = 0;

    this.lines.graphics.moveTo(x, y);

    x += M.hexTwoThird;
    y += M.hexOneThird;

    this.lines.graphics.lineTo(x, y);

    y += M.hexTwoThird;

    this.lines.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y += M.hexOneThird;

    this.lines.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y -= M.hexOneThird;

    this.lines.graphics.lineTo(x, y);

    y -= M.hexTwoThird;

    this.lines.graphics.lineTo(x, y);

    x += M.hexTwoThird;
    y -= M.hexOneThird;

    this.lines.graphics.lineTo(x, y);
  };

  addShadow = () => {
    this.shadow = new Shape();
    this.shadow.graphics.lineStyle(0, 0x000000, 0);
    this.addChild(this.shadow);

    let x = 0;
    let y = M.hexTwoThird;

    this.shadow.graphics.beginFill(0x000000, 0.5);
    this.shadow.graphics.moveTo(x, y);

    x += M.hexTwoThird;
    y -= M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y += M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y += M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y -= M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);
    this.shadow.graphics.endFill();

    x = 0;
    y = M.hexTwoThird;

    this.shadow.graphics.beginFill(0x000000, 0.8);
    this.shadow.graphics.moveTo(x, y);

    y += M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y -= M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y -= M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);

    x += M.hexTwoThird;
    y += M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);
    this.shadow.graphics.endFill();
  };

  addInverseShadow = () => {
    this.shadow = new Shape();
    this.shadow.graphics.lineStyle(0, 0x000000, 0);
    this.addChild(this.shadow);

    let x = -M.hexTwoThird;
    let y = M.hexOneThird;

    this.shadow.graphics.beginFill(0x000000, 0.5);
    this.shadow.graphics.moveTo(x, y);

    x += M.hexTwoThird;
    y -= M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y += M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y += M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y -= M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);
    this.shadow.graphics.endFill();

    x = 0;
    y = 0;

    this.shadow.graphics.beginFill(0x000000, 0.8);
    this.shadow.graphics.moveTo(x, y);

    x += M.hexTwoThird;
    y += M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y += M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);

    x -= M.hexTwoThird;
    y -= M.hexOneThird;

    this.shadow.graphics.lineTo(x, y);

    y -= M.hexTwoThird;

    this.shadow.graphics.lineTo(x, y);
    this.shadow.graphics.endFill();
  };

  circle = (radius, color = 0x000000) => {
    var gType = GradientType.RADIAL;
    var matrix = new Matrix();
    //matrix.createGradientBox(radius*2,radius*2, 0,-radius,-radius);

    var gColors = [color,color];
    var gAlphas = [1,0];
    var gRatio = [0,255];

    //this.s.graphics.beginGradientFill(gType,gColors,gAlphas,gRatio,matrix);
    this.s.graphics.lineStyle(0, this.color, 0);
    this.s.graphics.beginFill(color, 1)
    this.s.graphics.drawCircle(0, 0, radius);
    this.s.graphics.endFill();
  };

  glow = () => {
    const filter = new GlowFilter(0xFFFFFF, 1, 6, 6, 6, 1, false, false)
    this.s.filters = [filter];
  }

  rectangle = (width, height) => {
    this.s.graphics.lineStyle(1, this.color, 0);
    this.s.graphics.beginFill(this.color, this.alpha);
    this.s.graphics.moveTo(0, 0);
    this.s.graphics.lineTo(width, 0);
    this.s.graphics.lineTo(width, height);
    this.s.graphics.lineTo(0, height);
    this.s.graphics.lineTo(0, 0);
    this.s.graphics.endFill();
  };
}

export default ShapeComponent;
