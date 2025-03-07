import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MapQueryService } from '../../../../helpers/services/map-query.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit, OnDestroy{
  // injectors
  mapService = inject(MapQueryService);

  // Variable
  destroy$:Subject<any> = new Subject();
  mapId:string = '';
  currentTile:string = 'map';

  constructor(){
    this.mapId = `map-${parseInt(String(Math.random() * 100), 10)}`;
  }

  ngAfterViewInit(): void {
    this.mapService.mapInitialized.pipe(takeUntil(this.destroy$)).subscribe(()=> console.log('Map Initialized'))
    setTimeout(() => {
      this.mapService.initMap(this.mapId);
    }, 100);
  }

  onViewChange(tile:string){
    if(this.currentTile == tile) return;
    this.currentTile = tile;
    if (tile === 'map') {
      this.mapService.switchToMapView();
    } else if (tile === 'sat') {
      this.mapService.switchToSatellite();
    } else if (tile === 'esri') {
      this.mapService.switchToOceanView();
    } 
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
