import { Tween, default as TWEEN } from "@tweenjs/tween.js";
import time from "./time";

export default class Trait {
  constructor(p, name, diameter, size, startAngle, stopAngle, color) {
    this.p = p;
    this.name = name;
    this.diameter = diameter;
    this.color = color;
    this.isHighlighted = false;
    this.startAngle = startAngle;
    this.stopAngle = stopAngle;

    this.strokeColor = this.color
      .darken(1.5)
      .hsl()
      .slice(0, 3);

    const [h, s, l] = color.brighten(0.5).hsl();
    this.h = h;
    this.s = s;
    this.l = l;
    this.alpha = { min: 0.7, max: 1, value: 0.7 };

    this.size = { min: size, max: size * 2.2, value: size };

    this.zIndex = 0;
    this.cx = 0;
    this.cy = 0;
  }

  setHighlighted(isHighlighted) {
    if (isHighlighted === this.isHighlighted) return;

    this.isHighlighted = isHighlighted;

    if (this.sizeTween) this.sizeTween.stop();
    if (this.alphaTween) this.alphaTween.stop();

    // Need to shim now() since it is used to schedule tween starting time

    if (this.isHighlighted) {
      this.sizeTween = new Tween(this.size)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ value: this.size.max }, 250)
        .start(time.now());
      this.alphaTween = new Tween(this.alpha)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ value: this.alpha.max }, 100)
        .start(time.now());
    } else {
      this.sizeTween = new Tween(this.size)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ value: this.size.min }, 250)
        .start(time.now());
      this.alphaTween = new Tween(this.alpha)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ value: this.alpha.min }, 100)
        .start(time.now());
    }

    return this;
  }

  setZIndex(zIndex) {
    this.zIndex = zIndex;
    return this;
  }

  setCenter(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    return this;
  }

  draw() {
    const { p, cx, cy, h, s, l, alpha, diameter, startAngle, stopAngle, size, strokeColor } = this;

    // Arcs are drawn clockwise, so convert the angles to counterclockwise
    const a1 = 2 * Math.PI - stopAngle;
    const a2 = 2 * Math.PI - startAngle;

    // Darker "stroke" for the arc
    p.noFill();
    p.stroke(...strokeColor, alpha.value);
    p.strokeWeight(size.value * 1.2);
    p.arc(cx, cy, diameter, diameter, a1, a2);

    // Color "fill" arc
    p.noFill();
    p.stroke(h, s, l, alpha.value);
    p.strokeWeight(size.value);
    p.arc(cx, cy, diameter, diameter, a1, a2);
  }
}
