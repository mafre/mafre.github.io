import MessageType from './constant/messageType';
import MessageBus from './message/bus';
import AppState from './constant/appState';
import Helper from './util/helper';
import Factory from './util/factory';
import Fibonacci from './state/fibonacci';
import Draw from './state/draw';
import Collision from './state/collision';
import Sucia from './state/suica/state';

class States {
  constructor() {
    MessageBus.subscribe(MessageType.SET_STATE, this.onSetStateMessage);
    MessageBus.subscribe(MessageType.SET_SCALE, this.onSetScale);

    this.sm = Factory.stateMachine();

    this.sm.add(
      AppState.DRAW,
      () => {
        this.state = new Draw();

        Helper.addEntity(this.state);
      },
      () => {
        Helper.removeEntity(this.state);
      },
    );

    this.sm.add(
      AppState.FIBONACCI,
      () => {
        this.state = new Fibonacci();

        Helper.addEntity(this.state);
      },
      () => {
        Helper.removeEntity(this.state);
      },
    );

    this.sm.add(
      AppState.COLLISION,
      () => {
        this.state = new Collision();

        Helper.addEntity(this.state);
      },
      () => {
        Helper.removeEntity(this.state);
      },
    );

    this.sm.add(
      AppState.Suica,
      () => {
        this.state = new Sucia();

        Helper.addEntity(this.state);
      },
      () => {
        Helper.removeEntity(this.state);
      },
    );
  }

  onSetStateMessage = (state) => {
    this.sm.set(state);
  };

  onSetScale = () => {
    this.sm.reload();
  };
}

export default States;
