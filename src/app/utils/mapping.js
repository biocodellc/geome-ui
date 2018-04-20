import Papa from 'papaparse';
import { parseWorkbook, isExcelFile } from './XLSXReader';

const LAT_COL_DEF = 'http://rs.tdwg.org/dwc/terms/decimalLatitude';
const LON_COL_DEF = 'http://rs.tdwg.org/dwc/terms/decimalLongitude';
const SHEET_NAME = 'Samples'; // TODO make this dynamic

// TODO finish porting over biocode-fims-mapping.js
// export function getCoordinates(project, inputFile) {
//   const { config } = project;
//   const latColumn = config.findAttributesByDefinition(LAT_COL_DEF)[0]; // TODO throw error if multiple?
//   const longColumn = config.findAttributesByDefinition(LON_COL_DEF)[0]; // TODO throw error if multiple?
// }

const parseGeoJSONData = (data, latColumn, lngColumn, uniqueKey) => {
  const featureTemplate = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [] },
    properties: {
      description: '',
    },
  };
  const geoJSONData = {
    type: 'FeatureCollection',
    features: [],
  };

  // find the index of the lat and long columns and the uniqueKey
  const latIndex = data[0].indexOf(latColumn);
  const lngIndex = data[0].indexOf(lngColumn);
  const uniqueKeyIndex = data[0].indexOf(uniqueKey);

  data.forEach((row, i) => {
    // 0 index is the column headers, so skip
    if (i !== 0) {
      const f = Object.extend({}, featureTemplate);

      // only add coordinates if we find them
      if (row[lngIndex] !== null && row[latIndex] !== null) {
        // add the coordinates to the feature object
        f.geometry.coordinates.push(row[lngIndex]);
        f.geometry.coordinates.push(row[latIndex]);

        const feature = geoJSONData.features.find(
          feat =>
            feat.geometry.coordinates.toString() ===
            feature.parseGeoJSONData.coordinates.toString(),
        );

        if (feature) {
          feature.properties.description += `, Sample ID: ${
            row[uniqueKeyIndex]
          } (Row ${i + 1})`;
        } else {
          f.properties.description = `Sample ID: ${
            row[uniqueKeyIndex]
          } (Row ${i + 1})`;
          geoJSONData.features.push(f);
        }
      }
    }
  });

  return geoJSONData;
};

export const parseSampleCoordinates = (
  file,
  sheetName,
  latColumn,
  lngColumn,
  uniqueKey,
) => {
  let getData;
  if (isExcelFile(file)) {
    getData = parseWorkbook(file, true).then(
      workbook => workbook.sheets[sheetName].data,
    );
  } else {
    getData = new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: results => {
          if (results.meta.aborted) {
            reject();
            return;
          }

          resolve(results.data);
        },
      });
    });
  }

  return getData().then(data =>
    parseGeoJSONData(data, latColumn, lngColumn, uniqueKey),
  );
};
