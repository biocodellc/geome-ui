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
    }, 0);
  }

  $onChanges(changesObj) {
    if ('refreshSize' in changesObj && this.refreshSize) {
      this.$timeout(() => {
        this.mapInstance.refreshSize();
        this.refreshSize = false;
      });
    }
  }

  toggleMapView(tiles) {
    this.tiles = tiles;
    if (this.tiles === 'map') {
      this.mapInstance.mapView();
    } else if (this.tiles === 'sat') {
      this.mapInstance.satelliteView();
    } else if (this.tiles === 'usgs') {
      this.mapInstance.usgsView();
    }
  }
}

export default {
  template,
  controller: MapController,
  bindings: {
    mapInstance: '<',
    refreshSize: '<',
  },
};
