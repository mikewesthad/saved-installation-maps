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
const { labels, data, objectTypes, linkageGroups } = parseData(a1LinkageData);
const colors = ["#BC4A31", "#E8AC22", "#6BA2D6"];
const hslColors = colors.map(c => chroma(c).hsl()); // Array [hue 0 - 360, sat 0 - 1, light 0 - 1]

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

  function drawTrait(surface, cx, cy, start, stop, diameter, hslColor, isHighlighted) {
    const [h, s, l] = hslColor;
    const alpha = isHighlighted ? 1 : 0.7;
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

    const numTraits = data.length - 1;
    let colorIndex = 0;
    let lastObjectName = data[0].objectName;

    data.forEach(({ objectName, objectType, start, stop }, i) => {
      if (objectName !== lastObjectName) {
        colorIndex += 1;
        if (colorIndex > hslColors.length - 1) colorIndex = 0;
      }

      const d = p.map(i, 0, numTraits, startRadius, maxSize * 0.9);
      const isHighlighted = i === highlightedIndex;
      const surface = isHighlighted ? topCanvas : p;
      drawTrait(surface, x, y, start, stop, d, hslColors[colorIndex], isHighlighted);

      lastObjectName = objectName;
    });

    const { objectName, objectType, start, stop } = data[highlightedIndex];
    const hue = p.map(objectTypes.indexOf(objectType), 0, objectTypes.length - 1, 192, 353);
    const lightness = 60;
    const alpha = 1;
    const color = p.color(hue, 100, lightness, alpha);
    const startPercent = getCmPercent(start);
    const midPercent = getCmPercent((stop - start) / 2 + start);
    const stopPercent = getCmPercent(stop);
    const w = 20;
    const h = 250;
    topCanvas.noStroke();
    topCanvas.fill("#63544F");
    topCanvas.rect(10, 10, w, startPercent * h);
    topCanvas.fill(color);
    topCanvas.rect(10, 10 + startPercent * h, w, (stopPercent - startPercent) * h);
    topCanvas.fill(0);
    topCanvas.rect(10, 10 + stopPercent * h, w, (1 - stopPercent) * h);

    topCanvas.textAlign(p.LEFT, p.TOP);
    topCanvas.fill(0);
    topCanvas.stroke(255);
    topCanvas.textSize(scale * 20);
    topCanvas.strokeWeight(scale * 3);
    topCanvas.text(objectName, 70, 10);

    topCanvas.stroke(0);
    topCanvas.line(20 + w, 10 + midPercent * h, 60, 25);

    topCanvas.image(maskImage, 10, 10);

    p.image(topCanvas, 0, 0);
  };
});

// Only needed to force a page refresh with Parcel's hot module replacement
if (module.hot) module.hot.dispose(() => window.location.reload());
