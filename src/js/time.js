class Time {
  constructor() {
    this.frame = 0;
    this.frameRate = 30;
  }

  setFrame(frame) {
    this.frame = frame;
  }

  now() {
    return (this.frame / this.frameRate) * 1000;
  }
}

export default new Time();
