import p5 from "p5";
import "p5/lib/addons/p5.dom";
import WebFont from "webfontloader";
import { parseLines, parseSoybaseData, findMinMaxMap } from "./parse-data";
import a1LinkageText from "../data/SoyBase-GmComposite2003_A1_All_QTL_0-9999.tsv";
import selectedTraitsText from "../data/selected-traits.txt";
import seedImagePath from "../images/usb-scope-processed.png";
import palette from "./palette";
import Trait from "./trait";
import ChromosomeLegend from "./chromosome-legend";

WebFont.load({
  classes: false,
  google: {
    families: ["Roboto"]
  }
});

const selectedTraits = parseLines(selectedTraitsText);
const traitColors = [palette.orange, palette.yellow, palette.blue];
const { labels, data, objectTypes, linkageGroups } = parseSoybaseData(a1LinkageText);

// Sort based on midpoint of the trait from lowest to highest cM
selectedTraits.sort((a, b) => {
  return data.find(d => d.objectName === a).mid - data.find(d => d.objectName === b).mid;
});

const { min: minCm, max: maxCm } = findMinMaxMap(data);
const cmDistance = maxCm - minCm;
const getCmPercent = cm => (cm - minCm) / cmDistance;
const scale = 1.1;

function calculateCanvasSize() {
  // Scale to fit target aspect ratio of 1920 x 1080
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  return [1920 * s, 1080 * s];
}

new p5(function(p) {
  let seedImage;
  let traits;
  const startRadius = 250 * scale;
  const traitDurationMs = 4000;
  const chromosomeLegend = new ChromosomeLegend(p);
  let highlightedTrait;
  let lastHighlightedTrait;

  p.windowResized = () => {
    const [w, h] = calculateCanvasSize();
    p.resizeCanvas(w, h);
  };

  p.preload = () => {
    seedImage = p.loadImage(seedImagePath);
  };

  p.setup = function() {
    const [w, h] = calculateCanvasSize();
    p.createCanvas(w, h);

    p.colorMode(p.HSL, 360, 1, 1, 1);

    traits = data.map((traitData, i) => {
      const { objectName, start, stop } = traitData;
      const indexInSelected = selectedTraits.indexOf(objectName);
      const isSelected = indexInSelected !== -1;
      const startAngle = getCmPercent(start) * p.TWO_PI;
      const stopAngle = getCmPercent(stop) * p.TWO_PI;
      const maxSize = Math.min(p.width, p.height);
      const maxDiameter = maxSize * 0.95;
      let trait;
      if (isSelected) {
        const v = (indexInSelected % 4) / 3;
        const d1 = p.map(v, 0, 1, startRadius, maxDiameter);
        const d2 = p.map(v === 1 ? v - 0.3 : v + 0.3, 0, 1, startRadius, maxDiameter);
        const diameter = p.random(d1, d2);
        const color = traitColors[indexInSelected % traitColors.length];
        trait = new Trait(p, objectName, diameter, 16, startAngle, stopAngle, color);
        trait.setZIndex(1);
      } else {
        const diameter = p.map(i, 0, data.length, startRadius, maxDiameter);
        trait = new Trait(p, objectName, diameter, 10, startAngle, stopAngle, palette.brown);
        trait.setZIndex(0);
        trait.l += p.random(-0.05, 0.05);
      }
      return trait;
    });
  };

  p.draw = function() {
    const objectNameIndex = Math.floor((p.millis() / traitDurationMs) % selectedTraits.length);
    const highlightedName = selectedTraits[objectNameIndex];
    highlightedTrait = traits.find(t => t.name === highlightedName);

    if (highlightedTrait !== lastHighlightedTrait) {
      if (highlightedTrait) highlightedTrait.setHighlighted(true).setZIndex(2);
      if (lastHighlightedTrait) lastHighlightedTrait.setHighlighted(false).setZIndex(1);
    }

    const mapCenterX = 0.66 * p.width;
    const mapCenterY = p.height / 2;

    p.background(255);

    p.push();
    p.imageMode(p.CENTER);
    p.image(seedImage, mapCenterX, mapCenterY, startRadius, startRadius);
    p.pop();

    traits.sort((a, b) => a.zIndex - b.zIndex);
    traits.forEach(t => {
      t.setCenter(mapCenterX, mapCenterY);
      t.draw();
    });

    chromosomeLegend.setTrait(traits.find(t => t.isHighlighted));
    chromosomeLegend.setPosition(100, 20);
    chromosomeLegend.draw();

    lastHighlightedTrait = highlightedTrait;
  };
});
