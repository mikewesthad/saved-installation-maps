/**
 * Singelton for controlling timing via frame number when rendering
 *
 * @class Time
 */
class Time {
  constructor() {
    this.frame = 0;
    this.frameRate = 30;
  }

  setFrameRate(fps) {
    this.frameRate = fps;
  }

  setFrame(frame) {
    this.frame = frame;
  }

  now() {
    return (this.frame / this.frameRate) * 1000;
  }
}

export default new Time();
