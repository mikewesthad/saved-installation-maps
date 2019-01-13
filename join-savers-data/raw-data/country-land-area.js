import Papa from "papaparse";
import fs from "fs";

const csv = fs.readFileSync(__dirname + "/country-land-area.csv", "utf8");

const landAreaData = Papa.parse(csv, {
  skipEmptyLines: true
})
  .data.slice(1) // Trim column titles
  .map(row => {
    let [countryName, countryCode, landArea] = row;
    return {
      countryCode,
      countryName,
      landArea: parseFloat(landArea)
    };
  });

// Missing data, filled in from https://www.cia.gov/library/publications/the-world-factbook/rankorder/2147rank.html
landAreaData.push({
  countryCode: "TWN",
  countryName: "Taiwan",
  landArea: 35980
});

// Missing data, filled in from https://www.worldatlas.com/webimage/countrys/samerica/frenchguiana/gflandst.htm
landAreaData.push({
  countryCode: "GUF",
  countryName: "French Guiana",
  landArea: 89150
});

function getLandArea(countryCode) {
  const data = landAreaData.find(country => country.countryCode === countryCode);
  return data ? data.landArea : null;
}

export default landAreaData;
export { getLandArea };
