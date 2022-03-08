import { parseEventFile } from "./parsers/events/parseEventFile.mjs";
import { getDataFileType } from "./isDataFile.mjs";

export const parserMap = new Map();

export function findParser(filePath) {
  // attempt to get from map
  if (parserMap.has(filePath)) return parserMap.get(filePath);

  // check types
  let parser;
  const fileType = getDataFileType(filePath);
  switch (fileType) {
    case "event":
      parser = parseEventFile;
      break;
    default:
      return [null, false];
  }

  // handle result
  parserMap.set(filePath, [fileType, parser]);
  return [fileType, parser];
}
