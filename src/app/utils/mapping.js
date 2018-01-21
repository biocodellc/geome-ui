const LAT_COL_DEF = "http://rs.tdwg.org/dwc/terms/decimalLatitude";
const LON_COL_DEF = "http://rs.tdwg.org/dwc/terms/decimalLongitude";
const SHEET_NAME = "Samples"; // TODO make this dynamic

//TODO finish porting over biocode-fims-mapping.js
export function getCoordinates(project, inputFile) {
  const { config } = project;
  const latColumn = config.findAttributesByDefinition(LAT_COL_DEF)[0]; //TODO throw error if multiple?
  const longColumn = config.findAttributesByDefinition(LON_COL_DEF)[0]; //TODO throw error if multiple?

}