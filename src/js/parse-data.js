const splitLines = string => string.split(/\r?\n/);

export function parseTsv(text) {
  const table = splitLines(text.trim()).map(line => line.trim().split("\t"));
  return table;
}

export function parseCsv(text) {
  const table = splitLines(text.trim()).map(line => line.split(","));
  return table;
}

export function parseLines(text) {
  const lines = splitLines(text.trim()).map(line => line.trim());
  return lines;
}

export function parseSoybaseData(text) {
  const table = parseTsv(text);

  let [labels, ...originalData] = table;

  const data = originalData.map(([objectName, linkageGroup, start, stop, objectType]) => {
    const fStart = parseFloat(start);
    const fStop = parseFloat(stop);
    const mid = (fStart + fStop) / 2;
    return {
      objectName,
      linkageGroup,
      start: fStart,
      stop: fStop,
      mid,
      objectType
    };
  });

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
