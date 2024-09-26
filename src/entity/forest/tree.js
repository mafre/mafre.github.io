import Item from './item'
import Leaves from './leaves'
import Helper from './../../util/helper'

class Tree extends Item {

    constructor(index) {

        super('tree_stem', index);

        let i = Math.floor(Math.random() * 8);

        this.l = new Leaves(i);

        Helper.addEntity(this.l, 2);
    }

    init = () => {

        this.l.x = this.x;
        this.l.y = this.y;
    }

    dispose = () => {

        Helper.removeEntity(this.l);
    }
}

export default Tree;
