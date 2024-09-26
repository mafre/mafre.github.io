import Entity from './../entity'
import Factory from './../../util/factory'
import Helper from './../../util/helper'

const CharacterState = {
    IDLE    : 'idle',
    WALK    : 'walk',
    ATTACK  : 'attack'
}

class Character extends Entity {

    constructor() {

        super();

        this.direction = 0;
        this.facing = -1;
        this.view = true;

        this.sm = Factory.stateMachine();

        this.sm.add(CharacterState.IDLE, () => {

        }, () => {

        });

        this.sm.add(CharacterState.WALK, () => {

        }, () => {

        });

        this.sm.add(CharacterState.ATTACK, () => {

        }, () => {

        });

        this.sm.set(PlayerState.IDLE);
    }

    update = time => {

    }

    dispose = () => {

    }
}

export default Character;
