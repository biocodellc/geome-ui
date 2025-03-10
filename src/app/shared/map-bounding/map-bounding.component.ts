import { Component, inject, Input } from '@angular/core';
import { MapQueryService } from '../../../helpers/services/map-query.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-bounding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-bounding.component.html',
  styleUrl: './map-bounding.component.scss'
})
export class MapBoundingComponent {
  // Decorators
  @Input() params:any;
  
  // Injectors
  mapQueryService = inject(MapQueryService);

  drawBoundingBox(){
    this.mapQueryService.drawBounds((res:any)=>{
      if(res.northEast && res.southWest) this.params.bounds = res;
    });
  }

  clearBoundingBox(){
    this.mapQueryService.clearBounds();
    this.params.bounds = null;
  }
}
