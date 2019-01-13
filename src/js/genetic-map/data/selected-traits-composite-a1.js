import Papa from "papaparse";
import selectedTraitsText from "./selected-traits-composite-a1.txt";
import soybaseA1Traits from "./soybase-gmcomposite-a1-all-qtl";

const selectedTraits = Papa.parse(selectedTraitsText, { skipEmptyLines: true }).data.map(
  row => row[0]
);

// Sort based on midpoint of the trait from lowest to highest cM
selectedTraits.sort((a, b) => {
  return (
    soybaseA1Traits.find(d => d.objectName === a).midCm -
    soybaseA1Traits.find(d => d.objectName === b).midCm
  );
});

export default selectedTraits;
