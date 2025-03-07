import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { QueryFormComponent } from './query-form/query-form.component';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [CommonModule, QueryFormComponent, MapComponent],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent{
  active:string = 'map';
  isSidebarVisible:boolean = true;

}
