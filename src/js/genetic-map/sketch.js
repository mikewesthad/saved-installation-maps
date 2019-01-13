import "p5/lib/addons/p5.dom";
import TWEEN from "@tweenjs/tween.js";
import { remote } from "electron";
import palette from "../palette";
import Arc from "../arc";
import ChromosomeLegend from "./chromosome-legend";
import time from "../utils/time";
import Recorder from "../utils/recorder";
import selectedTraits from "./data/selected-traits-composite-a1.js";
import seedImagePath from "../../images/usb-scope-processed.png";
import soybaseA1Traits from "./data/soybase-gmcomposite-a1-all-qtl";

export default function createSketch(p, showImage = false, isRecording = false) {
  const win = remote.getCurrentWindow();
  const traitColors = [palette.orange, palette.yellow, palette.blue];
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
    p.frameRate(time.frameRate);
    p.colorMode(p.HSL, 360, 1, 1, 1);

    traits = soybaseA1Traits.map((traitData, i) => {
      const { objectName, startFraction, stopFraction } = traitData;
      const indexInSelected = selectedTraits.indexOf(objectName);
      const isSelected = indexInSelected !== -1;
      const startAngle = startFraction * p.TWO_PI;
      const stopAngle = stopFraction * p.TWO_PI;
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
        const diameter = p.map(i, 0, soybaseA1Traits.length, startRadius, maxDiameter);
        trait = new Arc(p, objectName, diameter, 15, startAngle, stopAngle, palette.brown);
        trait.setZIndex(0);
        trait.l += p.random(-0.05, 0.05);
      }
      return trait;
    });

    if (isRecording) render();
    else p.draw = draw;
  };

  function draw() {
    const frame = time.frame;
    renderFrame(frame);
    time.setFrame(frame + 1);
  }

  async function render() {
    const recorder = new Recorder(win, { output: "./renders/genetic-map.mov" });

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

    if (showImage) {
      p.push();
      p.imageMode(p.CENTER);
      p.image(seedImage, mapCenterX, mapCenterY, startRadius, startRadius);
      p.pop();
    }

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
}
