import Papa from "papaparse";
import fs from "fs";

const csv = fs.readFileSync(__dirname + "/datamaps-country-codes.csv", "utf8");

const countryCodeData = Papa.parse(csv, { skipEmptyLines: true })
  .data.slice(1) // Trim column titles
  .map(row => {
    const [countryName, countryCode] = row;
    return {
      countryCode,
      countryName
    };
  });

function getCountryCode(countryName) {
  const data = countryCodeData.find(country => country.countryName === countryName);
  return data ? data.countryCode : null;
}

export default countryCodeData;
export { getCountryCode };
