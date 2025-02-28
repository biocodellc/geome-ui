import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent implements AfterViewInit{
  private map!: L.Map;
  customIcon = L.icon({
    iconUrl: 'images/marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([51.505, -0.09], 13); // Default center: London

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker
    L.marker([51.505, -0.09], { icon: this.customIcon })
      .addTo(this.map)
      .bindPopup('A sample marker!')
      .openPopup();
  }
}
