import Map from '../../../components/map/map';

export default class UploadMap extends Map {
  constructor(latColumn, lngColumn, uniqueKey) {
    super(latColumn, lngColumn);
    this.uniqueKey = uniqueKey;

    if (!this.latColumn || !this.lngColumn)
      throw new Error('latColumn & lngColumn are both required');
  }

  init(mapId) {
    super.init(mapId, {
      scrollWheelZoom: false,
    });
  }

  setMarkers(samples) {
    const transformedData = [];

    samples.forEach((s, i) => {
      const exists = transformedData.find(
        d =>
          d[this.latColumn] === s[this.latColumn] &&
          d[this.lngColumn] === s[this.lngColumn],
      );

      if (exists) {
        exists.description += `, ${this.uniqueKey}: ${
          s[this.uniqueKey]
        } (Row ${i + 1})`;
      } else {
        const d = {
          description: `${this.uniqueKey}: ${s[this.uniqueKey]} (Row ${i + 1})`,
        };
        d[this.latColumn] = s[this.latColumn];
        d[this.lngColumn] = s[this.lngColumn];
        transformedData.push(d);
      }
    });
    return super.setMarkers(
      transformedData,
      this.generatePopupContent.bind(this),
      { maxHeight: 60 },
    );
  }

  generatePopupContent({ description }) {
    return description;
  }
}
