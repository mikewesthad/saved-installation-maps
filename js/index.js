import p5 from "p5";
import "p5/lib/addons/p5.dom";
import fontPath from "../fonts/Inconsolata-Bold.ttf";
import parseData, { findMinMaxMap } from "../data/parse-data";
import a1LinkageData from "../data/SoyBase-GmComposite2003_A1_All_QTL_0-9999.js";
import selectedTraits from "../data/selected-traits";
import seedImagePath from "../images/usb-scope-processed.png";
import palette from "./palette";
import { Trait } from "./trait";
import { ChromosomeMiniMap } from "./chromosome-minimap";

const traitColors = [palette.orange, palette.yellow, palette.blue];
const { labels, data, objectTypes, linkageGroups } = parseData(a1LinkageData);

// Sort based on midpoint of the trait from lowest to highest cM
selectedTraits.sort((a, b) => {
  return data.find(d => d.objectName === a).mid - data.find(d => d.objectName === b).mid;
});

const { min: minCm, max: maxCm } = findMinMaxMap(data);
const cmDistance = maxCm - minCm;
const getCmPercent = cm => (cm - minCm) / cmDistance;
const scale = 1.1;

new p5(function(p) {
  let mainCanvas;
  let font;
  let seedImage;
  let traits;
  const startRadius = 250 * scale;
  const traitDurationMs = 4000;
  const chromosomeMiniMap = new ChromosomeMiniMap(p);

  p.preload = () => {
    font = p.loadFont(fontPath);
    seedImage = p.loadImage(seedImagePath);
  };

  p.setup = function() {
    // Scale to fit target aspect ratio of 1920 x 1080
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    mainCanvas = p.createCanvas(1920 * s, 1080 * s);

    p.colorMode(p.HSL, 360, 1, 1, 1);
    p.textFont(font);

    traits = data.map((traitData, i) => {
      const { objectName, start, stop } = traitData;
      const indexInSelected = selectedTraits.indexOf(objectName);
      const isSelected = indexInSelected !== -1;
      const startAngle = getCmPercent(start) * p.TWO_PI;
      const stopAngle = getCmPercent(stop) * p.TWO_PI;
      const maxSize = Math.min(p.width, p.height);
      const diameter = p.map(i, 0, data.length, startRadius, maxSize * 0.9);
      if (isSelected) {
        const color = traitColors[indexInSelected % traitColors.length];
        const trait = new Trait(p, objectName, diameter, 16, startAngle, stopAngle, color);
        trait.setZIndex(1);
        return trait;
      } else {
        const trait = new Trait(p, objectName, diameter, 10, startAngle, stopAngle, palette.brown);
        trait.setZIndex(0);
        trait.l += p.random(-0.05, 0.05);
        return trait;
      }
    });
  };

  p.draw = function() {
    const objectNameIndex = Math.floor((p.millis() / traitDurationMs) % selectedTraits.length);
    const highlightedName = selectedTraits[objectNameIndex];

    const x = p.width / 2;
    const y = p.height / 2;

    p.background(255);

    p.push();
    p.imageMode(p.CENTER);
    p.image(seedImage, x, y, startRadius, startRadius);
    p.pop();

    traits.forEach(t => {
      if (t.name === highlightedName && !t.isHighlighted) {
        t.setHighlighted(true);
        t.setZIndex(2);
      } else if (t.name !== highlightedName && t.isHighlighted) {
        t.setHighlighted(false);
        t.setZIndex(1);
      }
    });
    traits.sort((a, b) => a.zIndex - b.zIndex);
    traits.forEach(t => t.draw());

    chromosomeMiniMap.setTrait(traits.find(t => t.isHighlighted));
    chromosomeMiniMap.draw();
  };
});

// Only needed to force a page refresh with Parcel's hot module replacement
if (module.hot) module.hot.dispose(() => window.location.reload());
