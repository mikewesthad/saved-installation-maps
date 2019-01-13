import countrySoyData from "./country-soy-data.json";
import { findRange } from "../../utils/stats";

const allCountryCodes = Object.keys(countrySoyData);
const allValues = Object.values(countrySoyData);
const soySaverData = Object.values(countrySoyData).filter(({ seeds }) => seeds !== 0);

// Just the savers
const stats = {
  annualProduction: findRange(allValues.map(obj => obj.annualProduction)),
  seeds: findRange(allValues.map(obj => obj.seeds)),
  taxa: findRange(allValues.map(obj => obj.taxa)),
  landArea: findRange(allValues.map(obj => obj.landArea))
};

export { countrySoyData, allCountryCodes, soySaverData, stats };
