import palette from "./palette";

// Path from images/chromosome.svg
const chromosomePath = new Path2D(
  "M27,46.5v-32a12.5,12.5,0,0,0-25,0v32c0,4.75,5.92,8.89,9.62,11C7.92,59.61,2,63.75,2,68.5v169a12.5,12.5,0,0,0,25,0V68.5c0-4.75-5.92-8.89-9.62-11C21.08,55.39,27,51.25,27,46.5Z"
);

export default class ChromosomeLegend {
  constructor(p) {
    this.p = p;
    this.trait = null;
    this.w = 30;
    this.h = 254;
    this.x = 0;
    this.y = 0;
  }

  setTrait(trait) {
    this.trait = trait;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    const { p, trait, w, h, x, y } = this;

    p.push();
    p.translate(x, y);
    p.scale(1.4);
    p.noStroke();
    p.fill(palette.brown.hsl());
    p.drawingContext.fill(chromosomePath);

    if (trait) {
      p.push();
      p.drawingContext.clip(chromosomePath);
      const { startAngle, stopAngle, name } = trait;
      const startPercent = startAngle / (2 * Math.PI);
      const stopPercent = stopAngle / (2 * Math.PI);
      const midPercent = (startPercent + stopPercent) / 2;
      p.fill(trait.h, trait.s, trait.l);
      p.stroke(0);
      p.strokeWeight(2);
      p.rect(0, startPercent * h, w - 2, (stopPercent - startPercent) * h);
      p.pop();

      p.textAlign(p.LEFT, p.TOP);
      p.noStroke();
      p.fill(0);
      p.textSize(23);
      p.text(name, w + 45, 20);

      p.stroke(0);
      p.strokeWeight(2);
      p.line(w + 5, midPercent * h, w + 40, 33);
      p.stroke(0);
      p.strokeWeight(2);
    }

    p.drawingContext.stroke(chromosomePath);
    p.pop();
  }
}
