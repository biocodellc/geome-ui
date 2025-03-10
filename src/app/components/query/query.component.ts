import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import * as L from 'leaflet';
import { QueryFormComponent } from './query-form/query-form.component';
import { MapComponent } from './map/map.component';
import { TeamQueryFormComponent } from './team-query-form/team-query-form.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [CommonModule, QueryFormComponent, TeamQueryFormComponent, MapComponent],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent{
  // Injectors
  activatedRoutes = inject(ActivatedRoute);
  
  // Variables
  destroy$:Subject<any> = new Subject();
  active:string = 'map';
  isSidebarVisible:boolean = true;
  teamIdNum:number = 0;
  teamQuery:boolean = false;

  queryResult:Array<any> = [];

  constructor(){
    this.activatedRoutes.queryParams.pipe(take(1), takeUntil(this.destroy$)).subscribe((params:any)=>{
      if(params.team){
        this.teamIdNum = parseInt(params.team, 10);
        if(this.teamIdNum === 45 ) this.teamQuery = true;
      };
    })
  }

  updateQueryResult(data:any, tab:string){
    this.queryResult = data;
  }

}
