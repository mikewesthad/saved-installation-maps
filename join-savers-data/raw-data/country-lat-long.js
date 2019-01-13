import Papa from "papaparse";
import fs from "fs";

const csv = fs.readFileSync(__dirname + "/country-lat-long.csv", "utf8");

const latLongData = Papa.parse(csv, { skipEmptyLines: true })
  .data.slice(1) // Trim column titles
  .map(row => {
    let [countryName, , countryCode, , lat, long] = row;
    return {
      countryName,
      countryCode,
      lat: parseFloat(lat),
      long: parseFloat(long)
    };
  });

function getLatLong(countryCode) {
  const data = latLongData.find(country => country.countryCode === countryCode);
  return data ? { lat: data.lat, long: data.long } : null;
}

export default latLongData;
export { getLatLong };
