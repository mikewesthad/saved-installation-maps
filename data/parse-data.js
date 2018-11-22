export default function parseData(tsvData) {
  const table = tsvData
    .trim()
    .split("\n")
    .map(line => line.trim().split("\t"));

  let [labels, ...originalData] = table;

  const data = originalData.map(([objectName, linkageGroup, start, stop, objectType]) => ({
    objectName,
    linkageGroup,
    start: parseFloat(start),
    stop: parseFloat(stop),
    objectType
  }));

  const objectTypes = [];
  const linkageGroups = [];

  data.forEach(({ linkageGroup, objectType }) => {
    if (!objectTypes.includes(objectType)) objectTypes.push(objectType);
    if (!linkageGroups.includes(linkageGroup)) linkageGroups.push(linkageGroup);
  });

  return { labels, data, objectTypes, linkageGroups };
}

export function findMinMaxMap(data) {
  let minCm = Number.MAX_VALUE;
  let maxCm = 0;
  data.forEach(({ start, stop }) => {
    if (start < minCm) minCm = start;
    if (stop > maxCm) maxCm = stop;
  });
  return { min: minCm, max: maxCm };
}
