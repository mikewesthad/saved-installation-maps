import { remote } from "electron";
import TWEEN from "@tweenjs/tween.js";
import { geoAzimuthalEquidistant } from "d3-geo";
import seedImagePath from "../../images/usb-scope-processed.png";
import Legend from "./legend";
import { allCountryCodes, countrySoyData, stats } from "./data/";
import Recorder from "../utils/recorder";
import Arc from "../arc";
import palette from "../palette";
import time from "../utils/time";

export default function createSketch(p, showImage = false, isRecording = false) {
  const win = remote.getCurrentWindow();
  let seedImage;
  const startRadius = 250 * 1.1;
  const countryDurationMs = 4000;
  let legend;
  let highlightedArc;
  let lastHightlightedArc;
  let countryArcs;
  let project;

  const isSelected = country => country.seeds > 0 || country.annualProductionRank <= 20;
  const selectedCountryCodes = allCountryCodes
    .filter(code => isSelected(countrySoyData[code]))
    .sort(
      (a, b) => countrySoyData[a].annualProductionRank - countrySoyData[b].annualProductionRank
    );

  p.preload = () => {
    seedImage = p.loadImage(seedImagePath);
  };

  p.setup = function() {
    p.createCanvas(1920, 1080);
    p.textLeading(1.2 * 32);
    p.frameRate(time.frameRate);
    p.colorMode(p.HSL, 360, 1, 1, 1);

    legend = new Legend(p);

    // See https://riptutorial.com/d3-js/example/28667/azimuthal-equidistant-projections for a
    // tutorial on creating this projection. This is centered on the north pole. This maps to (0, 0)
    // in XY pixel coordinates. Scale is tweaked manually to fit the 1920x1080 screen.
    project = geoAzimuthalEquidistant()
      .scale(180)
      .center([0, 0])
      .rotate([0, -90])
      .translate([0, 0]);

    const maxSize = Math.min(p.width, p.height);

    countryArcs = allCountryCodes.map((code, i) => {
      const country = countrySoyData[code];
      const { landArea, countryName, lat, long, seeds } = country;
      const isSelected = selectedCountryCodes.includes(code);

      let color;
      if (isSelected) color = seeds === 0 ? palette.orange : palette.blue;
      else color = palette.brown;

      // Calculate the projection and use that to find the angle & diameter of the arc (with the
      // diameter inflated so that nothing overlaps the seed image).
      const [x, y] = project([long, lat]);
      const diameter = 2 * Math.sqrt(y ** 2 + x ** 2) + 0.38 * startRadius;
      const angleMidpoint = Math.atan2(y, x);

      // Attempt to account for radius distortion
      const arcAngularWidth =
        p.map(landArea, stats.landArea.min, stats.landArea.max, 0.05 * Math.PI, 1 * Math.PI) *
        p.map(diameter, startRadius, maxSize, 1, 0.25);
      const startAngle = angleMidpoint - arcAngularWidth / 2;
      const stopAngle = angleMidpoint + arcAngularWidth / 2;

      const size = isSelected ? 23 : 16;
      const arc = new Arc(p, countryName, diameter, size, startAngle, stopAngle, color).setZIndex(
        isSelected ? 1 : -1
      );
      return arc;
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
    const recorder = new Recorder(win, { output: "./renders/savers-map.mov" });

    TWEEN.update(time.now());

    const numCountries = selectedCountryCodes.length;
    const seconds = (numCountries * countryDurationMs) / 1000;
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

    const i = Math.floor(timeMs / countryDurationMs);
    let highlightedCode;
    let highlightedData;
    if (i < selectedCountryCodes.length) {
      highlightedCode = selectedCountryCodes[i];
      highlightedData = countrySoyData[highlightedCode];
      highlightedArc = countryArcs.find(c => c.name === highlightedData.countryName);
    } else {
      highlightedArc = null;
    }

    if (highlightedArc !== lastHightlightedArc) {
      if (highlightedArc) highlightedArc.setHighlighted(true).setZIndex(2);
      if (lastHightlightedArc) lastHightlightedArc.setHighlighted(false).setZIndex(1);
      if (highlightedData)
        legend.setHighlightedCountry(highlightedData.countryCode, highlightedArc.color.hex());
    }

    const mapCenterX = 1264;
    const mapCenterY = p.height / 2;

    p.clear();

    if (showImage) {
      p.push();
      p.imageMode(p.CENTER);
      p.image(seedImage, mapCenterX, mapCenterY, startRadius, startRadius);
      p.pop();
    }

    const sorted = countryArcs.slice().sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach(c => {
      c.setCenter(mapCenterX, mapCenterY);
      c.draw();
    });

    legend.draw();

    lastHightlightedArc = highlightedArc;
  }
}
