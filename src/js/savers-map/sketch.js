import p5 from "p5";
import { remote } from "electron";
import TWEEN, { Tween } from "@tweenjs/tween.js";
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
    legend = new Legend(p);
  };

  p.draw = () => {
    p.rect(p.mouseX, p.mouseY, 10, 10);
  };
}
