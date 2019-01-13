import Papa from "papaparse";
import tsv from "./soybase-gmcomposite-a1-all-qtl.tsv";

const soybaseA1Traits = Papa.parse(tsv, { skipEmptyLines: true })
  .data.slice(1) // Trim labels
  .map(row => {
    const [objectName, linkageGroup, startCm, stopCm, objectType] = row;
    const fStart = parseFloat(startCm);
    const fStop = parseFloat(stopCm);
    const midCm = (fStart + fStop) / 2;
    return {
      objectName,
      linkageGroup,
      startCm: fStart,
      stopCm: fStop,
      midCm,
      startFraction: 0,
      stopFraction: 0,
      midFraction: 0,
      objectType
    };
  });

const objectTypes = [];
const linkageGroups = [];
soybaseA1Traits.forEach(({ linkageGroup, objectType }) => {
  if (!objectTypes.includes(objectType)) objectTypes.push(objectType);
  if (!linkageGroups.includes(linkageGroup)) linkageGroups.push(linkageGroup);
});

let minCm = Number.MAX_VALUE;
let maxCm = 0;
soybaseA1Traits.forEach(({ startCm, stopCm }) => {
  if (startCm < minCm) minCm = startCm;
  if (stopCm > maxCm) maxCm = stopCm;
});

// Calculate the start/stop in terms of a fraction
const cmDistance = maxCm - minCm;
const getCmPercent = cm => (cm - minCm) / cmDistance;
soybaseA1Traits.forEach(data => {
  data.startFraction = getCmPercent(data.startCm);
  data.midFraction = getCmPercent(data.midCm);
  data.stopFraction = getCmPercent(data.stopCm);
});

export default soybaseA1Traits;
export { objectTypes, linkageGroups, minCm, maxCm };
