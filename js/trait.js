import { TweenLite, TimelineMax } from "gsap";

export class Trait {
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
  }

  setHighlighted(isHighlighted) {
    if (isHighlighted === this.isHighlighted) return;

    this.isHighlighted = isHighlighted;

    if (this.timeline) this.timeline.kill();
    if (this.isHighlighted) {
      this.timeline = new TimelineMax();
      this.timeline.to(this.size, 0.25, { value: this.size.max });
      this.timeline.to(this.alpha, 0.1, { value: this.alpha.max }, 0);
    } else {
      this.timeline = new TimelineMax();
      this.timeline.to(this.size, 0.25, { value: this.size.min });
      this.timeline.to(this.alpha, 0.1, { value: this.alpha.min }, 0);
    }
  }

  setZIndex(zIndex) {
    this.zIndex = zIndex;
  }

  draw() {
    const { p, h, s, l, alpha, diameter, startAngle, stopAngle, size, strokeColor } = this;
    const cx = p.width / 2;
    const cy = p.height / 2;

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
