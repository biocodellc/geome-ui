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
    }, 50); // TODO: this should work w/ 0, git blame to find out why
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
