import p5 from "p5";
import "p5/lib/addons/p5.dom";
import chroma from "chroma-js";
import fontPath from "../fonts/Inconsolata-Bold.ttf";
import parseData, { findMinMaxMap } from "../data/parse-data";
import a1LinkageData from "../data/SoyBase-GmComposite2003_A1_All_QTL_0-9999.js";
import selectedTraits from "../data/selected-traits";
import seedImagePath from "../images/usb-scope-processed.png";
import chromosomeMaskImagePath from "../images/chromosome-mask.png";

const palette = {
  brown: chroma("#C7C1C1"),
  orange: chroma("#D95336"),
  yellow: chroma("#E8AC22"),
  blue: chroma("#6EA8DD")
};
const selectedColors = [palette.orange, palette.yellow, palette.blue];
const { labels, data, objectTypes, linkageGroups } = parseData(a1LinkageData);

// Assign colors to the traits
data.forEach(obj => {
  const { objectName, objectType, start, stop } = obj;
  const i = selectedTraits.indexOf(objectName);
  if (i === -1) obj.color = palette.brown;
  else obj.color = selectedColors[i % selectedColors.length];
});

// Split data based on whether it's a trait we want to highlight
const selectedTraitData = data.filter(obj => selectedTraits.includes(obj.objectName));
const notSelectedTraitData = data.filter(obj => !selectedTraits.includes(obj.objectName));

const { min: minCm, max: maxCm } = findMinMaxMap(data);
const cmDistance = maxCm - minCm;
const getCmPercent = cm => (cm - minCm) / cmDistance;
const scale = 1.1;

new p5(function(p) {
  let mainCanvas;
  let topCanvas;
  let font;
  let seedImage;
  let maskImage;

  function drawTrait(surface, cx, cy, start, stop, diameter, chromaColor, isHighlighted) {
    const [h, s, l] = chromaColor.hsl();
    const alpha = 1;
    const startAngle = getCmPercent(start) * p.TWO_PI;
    const endAngle = getCmPercent(stop) * p.TWO_PI;

    // White "stroke" arc
    surface.noFill();
    surface.stroke(255, alpha);
    surface.strokeWeight(scale * (isHighlighted ? 38 : 16));
    surface.arc(cx, cy, diameter, diameter, startAngle, endAngle);

    // Color "fill" arc
    surface.stroke(h, s, l, alpha);
    surface.strokeWeight(scale * (isHighlighted ? 30 : 12));
    surface.arc(cx, cy, diameter, diameter, startAngle, endAngle);
  }

  p.preload = () => {
    font = p.loadFont(fontPath);
    seedImage = p.loadImage(seedImagePath);
    maskImage = p.loadImage(chromosomeMaskImagePath);
  };

  p.setup = function() {
    // Scale to fit target aspect ratio of 1920 x 1080
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    mainCanvas = p.createCanvas(1920 * s, 1080 * s);

    topCanvas = p.createGraphics(p.width, p.height);

    const saveButton = p.createButton("Save Screenshot");
    saveButton.style("position: absolute");
    saveButton.style("bottom: 10px");
    saveButton.style("left: 10px");
    saveButton.mousePressed(() => p.saveCanvas(mainCanvas, "screenshot", "png"));

    p.colorMode(p.HSL, 360, 1, 1, 1);
    p.textFont(font);
    topCanvas.colorMode(p.HSL, 360, 1, 1, 1);
    topCanvas.textFont(font);
  };

  p.draw = function() {
    p.background(255);
    topCanvas.clear();

    const traitDurationMs = 4000;
    const objectNameIndex = Math.floor((p.millis() / traitDurationMs) % selectedTraits.length);
    const highlightedIndex = data.findIndex(d => d.objectName === selectedTraits[objectNameIndex]);

    const x = p.width / 2;
    const y = p.height / 2;
    const maxSize = Math.min(p.width, p.height);
    const startRadius = 250 * scale;

    p.imageMode(p.CENTER);
    p.image(seedImage, x, y, startRadius, startRadius);
    p.imageMode(p.CORNER);

    notSelectedTraitData.forEach(({ start, stop, color }, i) => {
      const d = p.map(i, 0, notSelectedTraitData.length, startRadius, maxSize * 0.9);
      const isHighlighted = false;
      const surface = isHighlighted ? topCanvas : p;
      drawTrait(surface, x, y, start, stop, d, color, isHighlighted);
    });

    selectedTraitData.forEach(({ start, stop, color }, i) => {
      const d = p.map(i, 0, selectedTraitData.length, startRadius, maxSize * 0.9);
      const isHighlighted = i === highlightedIndex;
      const surface = isHighlighted ? topCanvas : p;
      drawTrait(surface, x, y, start, stop, d, color, isHighlighted);
    });

    const { objectName, objectType, start, stop, color } = data[highlightedIndex];
    const startPercent = getCmPercent(start);
    const midPercent = getCmPercent((stop - start) / 2 + start);
    const stopPercent = getCmPercent(stop);
    const w = 30;
    const h = 254;
    topCanvas.noStroke();
    topCanvas.fill(palette.brown.hsl());
    topCanvas.rect(10, 10, w, h);
    topCanvas.fill(color.hsl());
    topCanvas.stroke(0);
    topCanvas.strokeWeight(1);
    topCanvas.rect(10, 10 + startPercent * h, w - 2, (stopPercent - startPercent) * h);

    topCanvas.textAlign(p.LEFT, p.TOP);
    topCanvas.fill(palette.brown.hsl());
    topCanvas.stroke(255);
    topCanvas.textSize(scale * 20);
    topCanvas.strokeWeight(scale * 3);
    topCanvas.fill(0);
    topCanvas.text(objectName, 90, 10);

    topCanvas.stroke(0);
    topCanvas.strokeWeight(2);
    topCanvas.line(20 + w, 10 + midPercent * h, 80, 25);

    topCanvas.image(maskImage, 10, 10, w, h);

    p.image(topCanvas, 0, 0);
  };
});

// Only needed to force a page refresh with Parcel's hot module replacement
if (module.hot) module.hot.dispose(() => window.location.reload());
