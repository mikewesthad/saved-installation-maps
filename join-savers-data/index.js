import fs from "fs";
import soyProducersData from "./raw-data/soy-producers-foastat";
import { getLatLong } from "./raw-data/country-lat-long";
import { getLandArea } from "./raw-data/country-land-area";
import soyDepositorData from "./raw-data/svalbard-soy-depositors";
import countryCodeData, { getCountryCode } from "./raw-data/datamaps-country-codes";

// Exclude multiple listings of China from the producer dataset
const excludedCountries = ["CPR", "HKG", "MAC"];
const filteredData = soyProducersData.slice().filter(country => {
  const { countryCode } = country;
  return !excludedCountries.includes(countryCode);
});

// Create the map of countryCode => data from the producer dataset
const soyCountryMap = {};
filteredData.forEach(country => {
  const { countryCode, countryName: foaCountryName, annualProduction } = country;

  // Normalize country name to the ones from datamaps
  const datamapsCountryData = countryCodeData.find(d => d.countryCode === countryCode);
  if (!datamapsCountryData) {
    throw new Error(`${countryName} (${countryCode}) datamaps country name missing!`);
  }
  const countryName = datamapsCountryData.countryName;

  const posData = getLatLong(countryCode);
  const landArea = getLandArea(countryCode);

  if (!posData) throw new Error(`${countryName} (${countryCode}) lat/lng data missing!`);
  if (!landArea) throw new Error(`${countryName} (${countryCode}) land area data missing!`);

  const { lat, long } = posData;

  soyCountryMap[countryCode] = {
    countryName,
    countryCode,
    landArea,
    lat,
    long,
    annualProduction,
    annualProductionRank: 0,
    seeds: 0,
    taxa: 0
  };
});

// Rank the countries by producer (allowing for ties)
const productionAmounts = Object.values(soyCountryMap).map(c => c.annualProduction);
const uniqueProductionAmounts = Array.from(new Set(productionAmounts));
const descendingProductionAmounts = uniqueProductionAmounts.slice().sort((a, b) => b - a);
const countryCodes = Object.keys(soyCountryMap);
countryCodes.forEach(code => {
  const { annualProduction } = soyCountryMap[code];
  const rank = descendingProductionAmounts.indexOf(annualProduction) + 1;
  soyCountryMap[code].annualProductionRank = rank;
});

// Merge in the Svalbard soy depositor dataset
soyDepositorData.forEach(country => {
  const { countryCode, countryName, seeds, taxa } = country;

  const mapEntry = soyCountryMap[countryCode];
  if (mapEntry === undefined) {
    throw new Error(
      `Depositor country (${countryCode} ${countryName}) not in soy producer dataset!`
    );
  }

  mapEntry.seeds = seeds;
  mapEntry.taxa = taxa;
});

// Save the final data to the front-end app
const dataDir = __dirname + "/../src/js/savers-map/data";
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
fs.writeFileSync(dataDir + "/country-soy-data.json", JSON.stringify(soyCountryMap, null, 2));
