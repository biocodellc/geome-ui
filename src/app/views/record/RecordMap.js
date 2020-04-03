import Map from '../../components/map/map';

export default class RecordMap extends Map {
  constructor(latColumn, lngColumn) {
    super(latColumn, lngColumn);

    if (!this.latColumn || !this.lngColumn)
      throw new Error('latColumn & lngColumn are both required');
  }

  init(mapId) {
    super.init(mapId, {
      scrollWheelZoom: false,
      zoom: 1,
    });
  }

  setMarkers(event) {
    return super.setMarkers(event, {
      maxHeight: 60,
    });
  }
}
