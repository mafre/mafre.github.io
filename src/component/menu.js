import Sprite from 'openfl/display/Sprite';

const Alignment = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

class Menu extends Sprite {
  constructor() {
    super();

    this.items = [];
    this.alignment = Alignment.HORIZONTAL;
    this.spacing = 0;
    this.selected = null;
    this.selectedIndex = -1;
  }

  add = (item) => {
    this.items.push(item);
    this.addChild(item);
    this.align();
  };

  horizontal = () => {
    this.alignment = Alignment.HORIZONTAL;
  };

  vertical = () => {
    this.alignment = Alignment.VERTICAL;
  };

  align = () => {
    if (this.alignment === Alignment.HORIZONTAL) {
      let w = 0;

      this.items.forEach((i) => {
        i.x = w;

        w += i.width + this.spacing;
      });
    } else if (this.alignment === Alignment.VERTICAL) {
      let h = 0;

      this.items.forEach((i) => {
        i.y = h;

        h += i.height + this.spacing;
      });
    }
  };

  setWidth = (width) => {
    this.items.forEach((i) => {
      i.setWidth(width);
    });
  };

  next = () => {
    this.deselect();
    this.selectedIndex += 1;

    if (this.selectedIndex >= this.items.length) {
      this.selectedIndex = 0;
    }

    this.select(this.selectedIndex);
  };

  previous = () => {
    this.deselect();
    this.selectedIndex -= 1;

    if (this.selectedIndex < 0) {
      this.selectedIndex = this.items.length - 1;
    }

    this.select(this.selectedIndex);
  };

  deselect = () => {
    if (!this.selected) {
      return;
    }

    this.selected.hideHighlight();
    this.selected = null;
  };

  select = (index) => {
    this.selectedIndex = index;
    this.selected = this.items[index];
    this.selected.showHighlight();
  };
}

export default Menu;
