import p5 from "p5";
import fontPath from "./fonts/Inconsolata-Bold.ttf";
import parseData, { findMinMaxMap } from "./data/parse-data";
import a1LinkageData from "./data/SoyBase-GmComposite2003_A1_All_QTL_0-9999.js";
import allLinkageData from "./data/SoyBase-GmComposite2003_ALL_LG_All_QTL_0-9999";

// import seedImagePath from "./images/microscope-16.png";
import seedImagePath from "./images/macro.png";
// import seedImagePath from "./images/seed047.png";

const { labels, data, objectTypes, linkageGroups } = parseData(a1LinkageData);

// const colors = ["#ee4035", "#f37736", "#fdf498", "#7bc043", "#0392cf"];
// const colors = ["#a8e6cf", "#dcedc1", "#ffd3b6", "#ffaaa5", "#ff8b94"];
// const colors = ["#d11141", "#00b159", "#00aedb", "#f37735", "#ffc425"];
// const colors = ["#3D2564", "#325292", "#78C848", "#FFB200", "#F27242", "#AA361A"];
// const colors = ["#5fa55a", "#01b4bc", "#f6d51f", "#fa8925", "#fa5457"];
// const colors = ["#328299", "#79C6A6", "#E5DD47", "#EAA000", "#C6640D", "#B20C5C"];
const colors = ["#40A8C4", "#88DFBB", "#ECE34A", "#F7AA00", "#F07810", "#C50D66"];

const { min: minCm, max: maxCm } = findMinMaxMap(data);
const cmDistance = maxCm - minCm;
const getCmPercent = cm => (cm - minCm) / cmDistance;

new p5(function(p) {
  let topCanvas;
  let font;
  let seedImage;
  let hslColors;

  p.preload = () => {
    font = p.loadFont(fontPath);
    seedImage = p.loadImage(seedImagePath);
  };

  p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight);
    topCanvas = p.createGraphics(p.width, p.height);

    p.colorMode(p.HSL, 360, 100, 100, 1);
    p.textFont(font);
    p.textSize(35);
    topCanvas.colorMode(p.HSL, 360, 100, 100, 1);
    topCanvas.textFont(font);
    topCanvas.textSize(35);

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
    let highlightedIndex = Math.floor((p.millis() / 1000) % data.length);

    const x = p.width / 2;
    const y = p.height / 2;
    const maxSize = 1 * Math.min(p.width, p.height);

    p.imageMode(p.CENTER);
    p.image(seedImage, x, y, 300, 300);
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
      const d = p.map(i, 0, numTraits, 300, maxSize * 0.9);
      const isHighlighted = i === highlightedIndex;

      const hue = p.map(objectTypes.indexOf(objectType), 0, objectTypes.length - 1, 192, 353);
      const lightness = isHighlighted ? 60 : 40;
      const alpha = isHighlighted ? 1 : 0.6;
      const color = p.color(hue, 100, lightness, alpha);

      // const [h, s, l] = hslColors[colorIndex];
      // const color = p.color(h, s, l, alpha);

      const target = isHighlighted ? topCanvas : p;
      // White "stroke" arc
      target.noFill();
      target.stroke(255, alpha);
      target.strokeWeight(isHighlighted ? 38 : 16);
      target.arc(x, y, d, d, startAngle, endAngle);
      // Color "fill" arc
      target.stroke(color);
      target.strokeWeight(isHighlighted ? 30 : 12);
      target.arc(x, y, d, d, startAngle, endAngle);

      if (isHighlighted) {
        const textX = maxSize * 0.4 * Math.cos(midAngle) + x;
        const textY = maxSize * 0.4 * Math.sin(midAngle) + y;

        topCanvas.textAlign(p.CENTER, p.CENTER);
        topCanvas.fill(0);
        topCanvas.stroke(255);
        topCanvas.strokeWeight(3);
        topCanvas.text(objectName, textX, textY);
      }

      lastObjectName = objectName;
    });

    p.image(topCanvas, 0, 0);
  };
});
