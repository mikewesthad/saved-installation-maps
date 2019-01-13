import Papa from "papaparse";
import fs from "fs";

const csv = fs.readFileSync(__dirname + "/svalbard-soy-depositors.csv", "utf8");

const soyDepositorData = Papa.parse(csv, { skipEmptyLines: true })
  .data.slice(1) // Trim column titles
  .map(row => {
    let [countryCode, countryName, capital, lat, long, seeds, taxa, , annualProduction] = row;
    return {
      countryCode,
      countryName,
      capital,
      lat: parseFloat(lat),
      long: parseFloat(long),
      seeds: parseFloat(seeds),
      taxa: parseFloat(taxa),
      annualProduction: parseFloat(annualProduction)
    };
  });

export default soyDepositorData;
