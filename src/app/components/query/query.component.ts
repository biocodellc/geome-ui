import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import * as L from 'leaflet';
import { QueryFormComponent } from './query-form/query-form.component';
import { MapComponent } from './map/map.component';
import { TeamQueryFormComponent } from './team-query-form/team-query-form.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';
import { QueryService } from '../../../helpers/services/query.service';
import { ToastrService } from 'ngx-toastr';
import { QueryParams } from '../../../helpers/scripts/queryParam';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [CommonModule, QueryFormComponent, TeamQueryFormComponent, MapComponent, NgbDropdownModule],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent{
  // Injectors
  toastr = inject(ToastrService);
  queryService = inject(QueryService);
  activatedRoutes = inject(ActivatedRoute);
  dummyDataService = inject(DummyDataService);
  
  // Variables
  destroy$:Subject<any> = new Subject();
  active:string = 'map';
  isSidebarVisible:boolean = true;
  teamIdNum:number = 0;
  teamQuery:boolean = false;

  entity:string = '';
  queryResult:Array<any> = [];
  entities:Array<any> = [];
  params:QueryParams = new QueryParams();

  constructor(){
    this.activatedRoutes.queryParams.pipe(take(1), takeUntil(this.destroy$)).subscribe((params:any)=>{
      if(params.team){
        this.teamIdNum = parseInt(params.team, 10);
        if(this.teamIdNum === 45 ) this.teamQuery = true;
      };
    })
  }

  updateQueryResult(data:any, tab:string){
    // this.queryResult = data.result;
    console.log("=====query data=====",data);
  }

  onSidebarToggle(event:boolean){
    this.isSidebarVisible = event;
  }

  downloadExcel() {
    this.dummyDataService.loadingState.next(true);
    this.queryService.downloadExcel(
      this.params.buildQuery(this.entities),
      this.entity,
    );
    this.dummyDataService.loadingState.next(false);
    this.toastr.success('Downloading processed!');
  }

  downloadCsv() {
    this.dummyDataService.loadingState.next(true);
    this.queryService.downloadCsv(
      this.params.buildQuery(this.entities),
      this.entity,
    );
    this.dummyDataService.loadingState.next(false);
    this.toastr.success('Downloading processed!');
  }

  downloadFasta() {
    this.dummyDataService.loadingState.next(true);
    this.queryService.downloadFasta(
      this.params.buildQuery(this.entities.concat(['Sample'])),
      'fastaSequence',
    );
    this.dummyDataService.loadingState.next(false);
    this.toastr.success('Downloading processed!');
  }
}
