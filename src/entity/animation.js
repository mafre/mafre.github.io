import Entity from './entity'
import Factory from './../util/factory'

class Animation extends Entity {

    constructor(tileMap, delay) {

        super();

        this.tm = tileMap;
        this.delay = delay;
        this.frames = [];
        this.index = 0;
        this.playing = false;
        this.tile = null;
    }

    add = index => {

        this.frames.push(index);
    }

    play = () => {

    }

    stop = () => {

    }

    update = time => {

        if (!this.playing) {

            return;
        }

        if (time % this.delay !== 0) {

            return;
        }

        if (this.tile) {

            this.tm.removeTile(this.tile);
            this.tile = null;
        }

        const frame = this.frames[this.index];

        this.tile = Factory.tile(frame);

        this.tm.add(this.tile);
    }
}

export default Animation
