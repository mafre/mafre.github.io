import AppState from './../constant/appState';
import Helper from './../util/helper';
import Entity from './../entity/entity';
import Model from './../model/app';
import Text from '../component/text';
import Dropdown from '../component/dropdown';
import Menu from '../component/menu';
import Toggle from '../component/toggle';
import Container from './container';

class AppMenu extends Entity {
  constructor() {
    super();

    this.c = new Container();
    this.c.layer = 'menu';

    Helper.addEntity(this.c);

    this.menu = new Menu();
    this.c.add(this.menu);

    this.toggle = new Toggle()

    this.menu.add(this.toggle);

    this.states = new Dropdown('navigate')

    for (let key in AppState) {
      let stateName = AppState[key];

      this.states.addButton(stateName, () => {
        Helper.setState(stateName);
      });
    }

    this.menu.add(this.states);

    this.zoom = new Dropdown('zoom')

    for (let z = 1; z < 5; z += 1) {
      this.zoom.addButton(z.toString(), () => {
        Helper.setScale(z);
      });
    }

    this.menu.add(this.zoom);

    this.fps = new Dropdown('fps')

    for (let f = 1; f < 5; f += 1) {
      const value = f * 30;

      this.fps.addButton(value.toString(), () => {
        Helper.setFPS(value);
      });
    }

    this.menu.add(this.fps);

    this.count = new Text('Entities: 0');

    //this.menu.add(this.count);
  }

  update = () => {
    this.count.setText('Entities: ' + Model.entityCount.toString());
  };
}

export default AppMenu;
