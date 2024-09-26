import Factory from './../util/factory';
import Entity from './entity';
import M from './../util/math';
import S from './../model/stage';

class Leaf extends Entity {

  constructor(i, color) {
    super();

    const img = Factory.image('leaf/leaf.png');
    const l = 9;
    const g = 360 - 360 / M.phi;
    const d = Math.sqrt(i);
    const a = (g * i) / (180 / Math.PI);
    const p = {
      x: l * d * Math.cos(a) + S.width / 2,
      y: l * d * Math.sin(a) + S.height / 2,
    };

    img.rotation = (a / Math.PI) * 180;
    img.alpha = 0;
    img.center();

    this.repulseRadius = 500;
    this.velocity = 1.6;
    this.img = img;
    this.addChild(img);

    //Actuate.transform(img, 0).color(color, 1);

    this.orig = p;
    this.x = p.x + Math.cos(a) * 50;
    this.y = p.y + Math.sin(a) * 50;

    //Actuate.tween(img, 2, { alpha: 1 });
    //Actuate.tween(this, 1, { x: p.x, y: p.y });
  }

  clamp = (n, min, max) => {
    return Math.min(Math.max(n, min), max);
  };

  update = () => {
	  const dxMouse = this.x - (S.mouseX / S.scale);
    const dyMouse = this.y - (S.mouseY / S.scale);
    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
    const normVec = { x: dxMouse / distMouse, y: dyMouse / distMouse };
    const repulseFactor = this.clamp(
      (1 / this.repulseRadius) *
        (-1 * (distMouse / this.repulseRadius) ** 2 + 1) *
        this.repulseRadius *
        this.velocity,
      0,
      50,
    );

    this.x += normVec.x * repulseFactor;
    this.y += normVec.y * repulseFactor;

    const dx = this.orig.x - this.x;
    const dy = this.orig.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const boost = 1.5;

    if (dist === 0) {
      return;
    }

    if (dist < 1) {
      this.x = this.orig.x;
      this.y = this.orig.y;

      return;
    }

    const v = { x: (dx / dist) * boost, y: (dy / dist) * boost };

    this.x += v.x;
    this.y += v.y;

	  this.img.rotation = Math.atan((this.y - S.height /2) / (this.x - S.width / 2)) * 180 / Math.PI;
  };
}

export default Leaf;
