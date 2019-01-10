import p5 from "p5";
import "p5/lib/addons/p5.dom";
import WebFont from "webfontloader";
import { parseLines, parseSoybaseData, findMinMaxMap } from "./parse-data";
import a1LinkageText from "../data/SoyBase-GmComposite2003_A1_All_QTL_0-9999.tsv";
import selectedTraitsText from "../data/selected-traits.txt";
import seedImagePath from "../images/usb-scope-processed.png";
import palette from "./palette";
import Arc from "./arc";
import ChromosomeLegend from "./chromosome-legend";
import time from "./time";
import TWEEN from "@tweenjs/tween.js";
import { Recorder } from "./record";
import { remote } from "electron";

const win = remote.getCurrentWindow();

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

const root = document.querySelector("#root");
root.style.width = `1920px`;
root.style.height = `1080px`;

const isRecording = true;

new p5(function(p) {
  let seedImage;
  let traits;
  const startRadius = 250 * 1.1;
  const traitDurationMs = 4000;
  const chromosomeLegend = new ChromosomeLegend(p);
  let highlightedTrait;
  let lastHighlightedTrait;

  p.preload = () => {
    seedImage = p.loadImage(seedImagePath);
  };

  p.setup = function() {
    p.createCanvas(1920, 1080);

    // Set canvas to scale to fit size of #root
    root.appendChild(p.canvas);
    p.canvas.style.width = "100%";
    p.canvas.style.height = "100%";

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
        trait = new Arc(p, objectName, diameter, 23, startAngle, stopAngle, color);
        trait.setZIndex(1);
      } else {
        const diameter = p.map(i, 0, data.length, startRadius, maxDiameter);
        trait = new Arc(p, objectName, diameter, 15, startAngle, stopAngle, palette.brown);
        trait.setZIndex(0);
        trait.l += p.random(-0.05, 0.05);
      }
      return trait;
    });

    if (isRecording) render();
    else p.frameRate(time.frameRate);
  };

  if (!isRecording) {
    p.draw = () => {
      const frame = time.frame;
      renderFrame(frame);
      time.setFrame(frame + 1);
    };
  }

  async function render() {
    const recorder = new Recorder(win, { output: "testing-alpha.mp4" });

    TWEEN.update(time.now());

    const numTraits = selectedTraits.length;
    const seconds = (numTraits * traitDurationMs) / 1000;
    const frames = time.frameRate * seconds;
    for (let i = 0; i < frames; i++) {
      time.setFrame(i);
      renderFrame();
      await recorder.captureFrame();
    }
    recorder.end();
  }

  function renderFrame() {
    const timeMs = time.now();

    TWEEN.update(timeMs);

    const i = Math.floor(timeMs / traitDurationMs);
    let highlightedName;
    if (i < selectedTraits.length) {
      highlightedName = selectedTraits[i];
      highlightedTrait = traits.find(t => t.name === highlightedName);
    } else {
      highlightedTrait = null;
    }

    if (highlightedTrait !== lastHighlightedTrait) {
      if (highlightedTrait) highlightedTrait.setHighlighted(true).setZIndex(2);
      if (lastHighlightedTrait) lastHighlightedTrait.setHighlighted(false).setZIndex(1);
    }

    const mapCenterX = 1177;
    const mapCenterY = p.height / 2;

    p.clear();

    // p.push();
    // p.imageMode(p.CENTER);
    // p.image(seedImage, mapCenterX, mapCenterY, startRadius, startRadius);
    // p.pop();

    const sorted = traits.slice().sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach(t => {
      t.setCenter(mapCenterX, mapCenterY);
      t.draw();
    });

    chromosomeLegend.setTrait(traits.find(t => t.isHighlighted));
    chromosomeLegend.setPosition(225, 20);
    chromosomeLegend.draw();

    lastHighlightedTrait = highlightedTrait;
  }
});
