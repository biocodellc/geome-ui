const template = require('./map.html');

class MapController {
  constructor($timeout) {
    'ngInject';

    this.$timeout = $timeout;
  }

  $onInit() {
    this.tiles = 'map';
    this.mapId = `map-${parseInt(Math.random() * 100, 10)}`;

    this.$timeout(() => {
      this.mapInstance.init(this.mapId);
    }, 3000); // TODO: this should work w/ 0, For queryMap, this broke with
    // commit ff337736321d5eb7d8c6a26983969a1f4e40acb7 when ng-cloak was added to
    // app.html
  }

  toggleMapView(tiles) {
    this.tiles = tiles;
    if (this.tiles === 'map') {
      this.mapInstance.mapView();
    } else if (this.tiles === 'sat') {
      this.mapInstance.satelliteView();
    } else if (this.tiles === 'esri') {
      this.mapInstance.esriOceanBasemapView();
    }
  }
}

export default {
  template,
  controller: MapController,
  bindings: {
    mapInstance: '<',
  },
};
