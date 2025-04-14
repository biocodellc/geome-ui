import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject, take } from 'rxjs';
import { MapQueryService } from '../../../../helpers/services/map-query.service';
import { NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy{
  // injectors
  mapService = inject(MapQueryService);

  // Variable
  @Input() height:string = '280px';
  @Input() showExtras:boolean = true;
  @Input() mapData?:{ data:any[], lat:string, lng: string };
  @Output() sidebarToggle:EventEmitter<boolean> = new EventEmitter();
  showSidebar:boolean = true;
  destroy$:Subject<any> = new Subject();
  mapId:string = '';
  currentTile:string = 'map';
  mapInited:boolean = false;

  constructor(){
    this.mapId = `map-${parseInt(String(Math.random() * 100), 10)}`;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mapService.initMap(this.mapId);
    }, 10);
    this.mapService.mapInitialized.pipe(take(1)).subscribe(() =>{
      this.mapInited = true;
      this.setMarkersOnMap();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['mapData'] && changes['mapData'].currentValue){
      this.setMarkersOnMap();
    }
  }

  setMarkersOnMap(){
    if(!this.mapData || !this.mapInited) return;
    this.mapService.setMarkers(this.mapData.data, this.mapData.lat, this.mapData.lng);
    this.mapData = undefined;
  }

  toggleSidebar(t:NgbTooltip){
    t.close();
    this.showSidebar = !this.showSidebar;
    this.sidebarToggle.emit(this.showSidebar);
    setTimeout(() => {
      this.mapService.refreshSize();
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
