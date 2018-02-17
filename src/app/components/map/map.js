import leaflet from 'leaflet';
import config from '../../utils/config';

const { mapboxToken } = config;

export default class Map {
  constructor(latColumn, lngColumn) {
    this.latColumn = latColumn;
    this.lngColumn = lngColumn;
    this.markers = [];
  }

  /**
   * @param mapId the id of the the div container for the map
   */
  init(mapId) {
    this.map = leaflet.map(mapId, {
      center: [0, 0],
      zoom: 1,
      closePopupOnClick: false,
      maxBoundsViscocity: 0.5,
    });

    // fill screen with map, roughly 360 degrees of longitude
    const z = this.map.getBoundsZoom([[90, -180], [-90, 180]], true);
    this.map.setZoom(z);

    this.mapTiles = leaflet.tileLayer(
      'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token={access_token}',
      { access_token: mapboxToken },
    );

    this.mapTiles.addTo(this.map);
    this.base = this.mapTiles;

    this.satelliteTiles = leaflet.tileLayer(
      'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token={access_token}',
      { access_token: mapboxToken },
    );

    this.usgsTiles = leaflet.tileLayer.wms(
      'https://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WMSServer',
      { layers: 0, maxZoom: 8 },
    );

    this.clusterLayer = leaflet.markerClusterGroup({ chunkedLoading: true });
  }

  /**
   *
   * @param data data is a json array of objects. Each object should contain a key matching the given latColumn
   * & lngColumn
   * @param popupContentCallback the function to call to populate the popup box content. Will be passed the current resource
   */
  setMarkers(data, popupContentCallback) {
    this._clearMap();

    data.forEach(resource => {
      const lat = resource[this.latColumn];
      const lng = leaflet.Util.wrapNum(
        resource[this.lngColumn],
        [0, 360],
        true,
      ); // center on pacific ocean

      const marker = leaflet.marker([lat, lng]);

      if (typeof popupContentCallback === 'function') {
        marker.bindPopup(popupContentCallback(resource));
      }

      this.markers.push(marker);
    });

    this.clusterLayer.addLayers(this.markers);

    this.map
      .addLayer(this.clusterLayer)
      .setMinZoom(1)
      .spin(false);

    if (this.markers.length > 0) {
      this.map.fitBounds(this.clusterLayer.getBounds(), {
        padding: [30, 30],
      });
    }

    this.map.on('move', this.updateMarkerLocations.bind(this));

    this.map.on('dragstart', () => {
      const centerLng = this.map.getCenter().lng;
      // the following is how leaflet internally calculates the max bounds. Leaflet doesn't provide a way
      // to bound only the latitude, so we do that here. We set the lng to be bound 3x greater the the center
      // and is recalculated upon every dragstart event, which should essentially keep the lng unbound
      const nwCorner = [90, centerLng - 1080];
      const seCorner = [-90, centerLng + 1080];

      this.map.setMaxBounds([nwCorner, seCorner]);
    });
  }

  satelliteView() {
    this.map.removeLayer(this.base);
    this.map.addLayer(this.satelliteTiles);
    this.base = this.satelliteTiles;
  }

  mapView() {
    this.map.removeLayer(this.base);
    this.map.addLayer(this.mapTiles);
    this.base = this.mapTiles;
  }

  usgsView() {
    this.map.removeLayer(this.base);
    this.map.addLayer(this.usgsTiles);
    this.base = this.usgsTiles;
  }

  drawBounds(createCallback) {
    new leaflet.Draw.Rectangle(this.map, {}).enable();

    this.map.on(leaflet.Draw.Event.CREATED, e => {
      this.boundingBox = e.layer;
      this.map.addLayer(this.boundingBox);
      const ne = e.layer
        .getBounds()
        .getNorthEast()
        .wrap();
      const sw = e.layer
        .getBounds()
        .getSouthWest()
        .wrap();

      createCallback({
        northEast: ne,
        southWest: sw,
      });
    });

    this.map.on(leaflet.Draw.Event.DRAWSTOP, () => {
      if (!this.boundingBox) {
        this.map.off(leaflet.Draw.Event.CREATED);
        createCallback();
      }
      this.map.off(leaflet.Draw.Event.DRAWSTOP);
    });
  }

  clearBounds() {
    if (this.boundingBox) {
      this.map.removeLayer(this.boundingBox);
      this.map.off(leaflet.Draw.Event.CREATED);
      this.boundingBox = null;
    }
  }

  /**
   * calls map.invalidateSize(). Used to recalculate the map size if the container has changed dimensions
   */
  refreshSize() {
    this.map.invalidateSize();
  }

  _clearMap() {
    if (this.clusterLayer && this.markers.length > 0) {
      this.clusterLayer.clearLayers();
    }
    this.markers = [];
  }

  /**
   * move the markers as the user pans the map. Otherwise, the markers will be panned out of view
   */
  _updateMarkerLocations() {
    const centerLng = this.map.getCenter().lng;
    const updatedMarkers = [];
    const originalMarkers = [];
    this.clusterLayer.eachLayer(m => {
      const latlng = m.getLatLng();
      if (latlng.lng < centerLng) {
        // marker is W of center
        if (centerLng - 180 > latlng.lng) {
          const mCopy = leaflet.marker([latlng.lat, latlng.lng + 360]);
          mCopy.bindPopup(m.getPopup());
          updatedMarkers.push(mCopy);
          originalMarkers.push(m);
        }
        // marker is E of center
      } else if (centerLng + 180 < latlng.lng) {
        const mCopy = leaflet.marker([latlng.lat, latlng.lng - 360]);
        mCopy.bindPopup(m.getPopup());
        updatedMarkers.push(mCopy);
        originalMarkers.push(m);
      }
    });
    this.clusterLayer.removeLayers(originalMarkers);
    this.clusterLayer.addLayers(updatedMarkers);
  }
}
