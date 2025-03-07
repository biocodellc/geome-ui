import { Injectable, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.markercluster';
import { environment } from '../../environments/environment';

import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private clusterLayer!: L.MarkerClusterGroup;
  private baseLayer!: L.TileLayer;
  private satelliteLayer!: L.TileLayer;
  private oceanLayer!: L.TileLayer;
  private boundingBox!: L.Layer;
  private mapboxToken = environment.mapboxToken;

  public mapInitialized = new EventEmitter<void>();

  constructor() {}

  initMap(mapId: string, lat = 0, lng = 0, zoom = 2) {
    this.map = L.map(mapId, {
      center: [lat, lng],
      zoom: zoom,
      closePopupOnClick: false,
      maxBoundsViscosity: 0.5,
    });

    // Base Map Layer
    this.baseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 10, minZoom: 1 }
    ).addTo(this.map);

    // Satellite View
    this.satelliteLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${this.mapboxToken}`,
      { tileSize: 512, zoomOffset: -1, minZoom: 1 }
    );

    // Ocean Basemap
    this.oceanLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 10, minZoom: 1 }
    );

    // Clustering Layer
    this.clusterLayer = new L.MarkerClusterGroup({ chunkedLoading: true });

    this.mapInitialized.emit();
  }

  setMarkers(data: any[], latKey: string, lngKey: string, popupContentCallback?: (resource: any) => string) {
    this.clearMarkers();

    data.forEach((resource) => {
      const lat = resource[latKey];
      const lng = L.Util.wrapNum(resource[lngKey], [0, 360], true);

      if (!lat || !lng) return;

      const marker = L.marker([lat, lng]);

      if (popupContentCallback) {
        marker.bindPopup(popupContentCallback(resource));
      }

      this.markers.push(marker);
    });

    this.clusterLayer.addLayers(this.markers);
    this.map.addLayer(this.clusterLayer);
    this.fitMarkers();
  }

  private fitMarkers() {
    if (this.markers.length > 0 && this.clusterLayer.getBounds().isValid()) {
      this.map.fitBounds(this.clusterLayer.getBounds(), { padding: [30, 30] });
    }
  }

  switchToSatellite() {
    this.map.removeLayer(this.baseLayer);
    this.map.addLayer(this.satelliteLayer);
  }

  switchToMapView() {
    this.map.removeLayer(this.satelliteLayer);
    this.map.addLayer(this.baseLayer);
  }

  switchToOceanView() {
    this.map.removeLayer(this.baseLayer);
    this.map.addLayer(this.oceanLayer);
  }

  drawBounds(createCallback: (bounds: { northEast: L.LatLng; southWest: L.LatLng }) => void) {
    new L.Control.Draw
    const drawControl = new L.Draw.Rectangle(this.map as L.DrawMap, { metric: false, shapeOptions: { fillColor: 'rgb(51, 136, 255)', fillRule: 'evenodd' } });
    drawControl.enable();

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      this.boundingBox = e.layer;
      this.map.addLayer(this.boundingBox);

      createCallback({
        northEast: this.map.getBounds().getNorthEast().wrap(),
        southWest: this.map.getBounds().getSouthWest().wrap(),
      });
    });
  }

  clearBounds() {
    if (this.boundingBox) {
      this.map.removeLayer(this.boundingBox);
      this.boundingBox = null!;
    }
  }

  refreshSize() {
    this.map.invalidateSize();
  }

  setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  private clearMarkers() {
    if (this.clusterLayer) this.clusterLayer.clearLayers();
    this.markers = [];
  }

  handleMapEvents() {
    this.map.on('move', () => this.updateMarkerLocations());
    this.map.on('dragstart', () => {
      const centerLng = this.map.getCenter().lng;
      const nwCorner: [number, number] = [90, centerLng - 1080];
      const seCorner: [number, number] = [-90, centerLng + 1080];
      this.map.setMaxBounds([nwCorner, seCorner]);
    });
  }

  private updateMarkerLocations() {
    const centerLng = this.map.getCenter().lng;
    this.clusterLayer.eachLayer((marker: any) => {
      const latlng = marker.getLatLng();
      if (latlng.lng < centerLng) {
        if (centerLng - 180 > latlng.lng) {
          marker.setLatLng([latlng.lat, latlng.lng + 360]);
        }
      } else if (centerLng + 180 < latlng.lng) {
        marker.setLatLng([latlng.lat, latlng.lng - 360]);
      }
    });
  }
}
