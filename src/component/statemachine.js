import State from './state';

class StateMachine {
  constructor() {
    this.states = [];
    this.stateType = '';
    this.state = null;
  }

  add = (type, init, dispose) => {
    const state = new State(type, init, dispose);

    this.states.push(state);
  };

  set = (stateType) => {
    if (this.stateType === stateType) {
      return;
    }

    if (this.state) {
      this.state.dispose();
      this.state = null;
      this.stateType = '';
    }

    const state = this.states.find((aState) => {
      return aState.type === stateType;
    });

    if (!state) {
      return;
    }

    this.stateType = stateType;
    this.state = state;
    this.state.init();
  };

  reload = () => {
    const st = this.stateType;

    if (this.state) {
      this.state.dispose();
      this.state = null;
      this.stateType = '';
    }

    this.set(st);
  };

  dispose = () => {
    if (this.state) {
      this.state.dispose();
      this.state = null;
      this.stateType = '';
    }
  };
}

export default StateMachine;
