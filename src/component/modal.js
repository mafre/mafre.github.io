import Sprite from 'openfl/display/Sprite';
import Helper from '../util/helper';
import Container from '../entity/container';
import Grid from './grid';

class Modal extends Sprite {
  constructor(path = 'grid/modal.png') {
    super();

    this.padding = 0;
    this.container = new Container();
    this.container.layer = 'modal';

    Helper.addEntity(this.container);

    this.grid = new Grid(path);

    this.container.setBackground(this.grid);
  }

  add = (content) => {
    this.container.add(content);

    this.grid.setSize(
      this.container.content.width + this.padding,
      this.container.content.height + this.padding,
    );

    this.container.centerContent();
    this.container.centerBackground();
  };

  dispose = () => {
    Helper.removeEntity(this.container);
  };
}

export default Modal;
