class Interval {
  constructor(delay, callback) {
    this.delay = delay;
    this.callback = callback;
    this.time = Math.floor(Math.random() * 100);
  }

  update = () => {
    this.time += 1;

    if (this.time % this.delay === 0) {
      this.callback();
    }
  };
}

export default Interval;
