import Papa from "papaparse";
import fs from "fs";

const producersCsv = fs.readFileSync(__dirname + "/soy-producers-foastat.csv", "utf8");
const codesCsv = fs.readFileSync(__dirname + "/foa-stat-country-codes.csv", "utf8");

const foaCodeMap = Papa.parse(codesCsv, { skipEmptyLines: true })
  .data.slice(1) // Trim column titles
  .reduce((map, row) => {
    const countryName = row[1];
    const countryCode = row[4];
    map[countryName] = countryCode;
    return map;
  }, {});

const soyProducersData = Papa.parse(producersCsv, { skipEmptyLines: true })
  .data.slice(1) // Trim column titles
  .filter(row => row[5] === "Production")
  .map(row => {
    const countryName = row[3];
    const flag = row[12];
    const countryCode = foaCodeMap[countryName];

    // Flag "M" indicates data is not available, so assume 0
    // Missing for: CHL Chile, CRI Costa Rica, GUF French Guiana, GUY Guyana, LVA Latvia, MYS Malaysia, NZL New Zealand, SEN Senegal
    const annualProduction = flag !== "M" ? row[11] : 0;

    return {
      countryCode,
      countryName,
      annualProduction: parseFloat(annualProduction)
    };
  });

// Patch data with missing Norway stats using: https://www.indexmundi.com/agriculture/?country=no&commodity=soybean-meal&graph=production
soyProducersData.push({
  countryCode: "NOR",
  countryName: "Norway",
  annualProduction: 363
});

export default soyProducersData;
