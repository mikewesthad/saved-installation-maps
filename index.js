import p5 from "p5";
import fontPath from "./fonts/Inconsolata-Bold.ttf";
import parseData, { findMinMaxMap } from "./data/parse-data";
import a1LinkageData from "./data/SoyBase-GmComposite2003_A1_All_QTL_0-9999.js";
import allLinkageData from "./data/SoyBase-GmComposite2003_ALL_LG_All_QTL_0-9999";
import selectedTraits from "./data/selected-traits";
import seedImagePath from "./images/webcam-processed.png";
import chromosomeMaskImagePath from "./images/chromosome-mask.png";

const { labels, data, objectTypes, linkageGroups } = parseData(a1LinkageData);
const colors = ["#BC4A31", "#E8AC22", "#6BA2D6"];

const { min: minCm, max: maxCm } = findMinMaxMap(data);
const cmDistance = maxCm - minCm;
const getCmPercent = cm => (cm - minCm) / cmDistance;
const scale = 1.1;

new p5(function(p) {
  let mainCanvas;
  let topCanvas;
  let font;
  let seedImage;
  let hslColors;
  let maskImage;

  p.preload = () => {
    font = p.loadFont(fontPath);
    seedImage = p.loadImage(seedImagePath);
    maskImage = p.loadImage(chromosomeMaskImagePath);
  };

  p.setup = function() {
    const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1080);
    mainCanvas = p.createCanvas(1080 * s, 1080 * s);
    topCanvas = p.createGraphics(p.width, p.height);

    p.colorMode(p.HSL, 360, 100, 100, 1);
    p.textFont(font);
    p.textSize(35);
    topCanvas.colorMode(p.HSL, 360, 100, 100, 1);
    topCanvas.textFont(font);
    topCanvas.textSize(scale * 35);

    hslColors = colors.map(c => {
      const pColor = p.color(c);
      const hslString = pColor.toString("hsl"); // Format is hsl(...)
      const [h, s, l] = hslString
        .slice(4, hslString.length - 1) // Trim away "hsl(" and ")"
        .split(",")
        .map(parseFloat);
      return [h, s, l];
    });
  };

  p.draw = function() {
    p.background(255);
    topCanvas.clear();

    const offset = p.millis() / 5000;
    const objectNameIndex = Math.floor((p.millis() / 4000) % selectedTraits.length);
    const highlightedIndex = data.findIndex(d => d.objectName === selectedTraits[objectNameIndex]);
    // let highlightedIndex = Math.floor((p.millis() / 1000) % data.length);

    const x = p.width / 2;
    const y = p.height / 2;
    const maxSize = 1 * Math.min(p.width, p.height);
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

      const startAngle = getCmPercent(start) * p.TWO_PI;
      const endAngle = getCmPercent(stop) * p.TWO_PI;
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const d = p.map(i, 0, numTraits, startRadius, maxSize * 0.9);
      const isHighlighted = i === highlightedIndex;

      // const hue = p.map(objectTypes.indexOf(objectType), 0, objectTypes.length - 1, 192, 353);
      // const lightness = isHighlighted ? 60 : 40;
      // const alpha = isHighlighted ? 1 : 0.6;
      // const color = p.color(hue, 100, lightness, alpha);

      const [h, s, l] = hslColors[colorIndex];
      const color = p.color(h, s, l, alpha);

      const target = isHighlighted ? topCanvas : p;
      // White "stroke" arc
      target.noFill();
      target.stroke(255, alpha);
      target.strokeWeight(scale * (isHighlighted ? 38 : 16));
      target.arc(x, y, d, d, startAngle, endAngle);
      // Color "fill" arc
      target.stroke(color);
      target.strokeWeight(scale * (isHighlighted ? 30 : 12));
      target.arc(x, y, d, d, startAngle, endAngle);

      // if (isHighlighted) {
      //   const textX = maxSize * 0.4 * Math.cos(midAngle) + x;
      //   const textY = maxSize * 0.4 * Math.sin(midAngle) + y;

      //   topCanvas.textAlign(p.CENTER, p.CENTER);
      //   topCanvas.fill(0);
      //   topCanvas.stroke(255);
      //   topCanvas.strokeWeight(scale * 3);
      //   topCanvas.text(objectName, textX, textY);
      // }

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

  // p.mousePressed = () => {
  //   p.saveCanvas(mainCanvas, "myCanvas", "png");
  // };
});

// Only needed to force a page refresh with Parcel's hot module replacement
if (module.hot) module.hot.dispose(() => window.location.reload());
