export class Trait {
  constructor(p, name, diameter, startAngle, stopAngle, color, isSelected, isHighlighted = false) {
    this.p = p;
    this.name = name;
    this.diameter = diameter;
    this.color = color;
    this.isSelected = isSelected;
    this.isHighlighted = isHighlighted;
    this.startAngle = startAngle;
    this.stopAngle = stopAngle;

    const [h, s, l] = color.hsl();
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = 1;

    this.size = 16;

    this.zIndex = 0;
    this.updateZIndex();
  }

  setHighlighted(isHighlighted) {
    this.isHighlighted = isHighlighted;
    this.updateZIndex();
  }

  updateZIndex() {
    if (this.isHighlighted) this.zIndex = 2;
    else if (this.isSelected) this.zIndex = 1;
    else this.zIndex = 0;
  }

  draw() {
    const { p, h, s, l, a, isHighlighted, diameter, startAngle, stopAngle } = this;
    const cx = p.width / 2;
    const cy = p.height / 2;

    // Arcs are drawn clockwise, so convert the angles to counterclockwise
    const a1 = 2 * Math.PI - stopAngle;
    const a2 = 2 * Math.PI - startAngle;

    // White "stroke" arc
    p.noFill();
    p.stroke(255, a);
    p.strokeWeight(isHighlighted ? 38 : 16);
    p.arc(cx, cy, diameter, diameter, a1, a2);

    // Color "fill" arc
    p.noFill();
    p.stroke(h, s, l, a);
    p.strokeWeight(isHighlighted ? 30 : 12);
    p.arc(cx, cy, diameter, diameter, a1, a2);
  }
}
