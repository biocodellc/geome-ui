import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PaginatorComponent } from '../../shared/paginator/paginator.component';
import { QueryTableComponent } from './query-table/query-table.component';
import { QueryPhotosComponent } from './query-photos/query-photos.component';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [CommonModule, QueryFormComponent, TeamQueryFormComponent, MapComponent, NgbDropdownModule, LoaderComponent, PaginatorComponent, QueryTableComponent, QueryPhotosComponent],
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
  formattedQueryResult:Array<any> = [];
  entities:Array<any> = [];
  params:QueryParams = new QueryParams();
  requestedParams:any;
  paginatorData:any = { collectionSize: 0, page: 0, pageSize: 50 };

  constructor(){
    this.activatedRoutes.queryParams.pipe(take(1), takeUntil(this.destroy$)).subscribe((params:any)=>{
      if(params.team){
        this.teamIdNum = parseInt(params.team, 10);
        if(this.teamIdNum === 45 ) this.teamQuery = true;
      }
      else if(params.q){
        this.requestedParams = params;
        this.params.queryString = this.requestedParams.q;
      }
    })
  }

  updateQueryResult(data:any, tab:string){
    this.queryResult = data.result;
    this.entity = data.entity;
    this.active = 'map';
    this.paginatorData = { collectionSize: this.queryResult.length, page: 1, pageSize: 50 };
    this.onPageChange();
  }

  onPageChange(){
    this.formattedQueryResult = this.queryResult.slice(
			(this.paginatorData.page - 1) * this.paginatorData.pageSize,
			(this.paginatorData.page - 1) * this.paginatorData.pageSize + this.paginatorData.pageSize,
		);
  }

  onSidebarToggle(event:boolean){
    this.isSidebarVisible = event;
  }

  downloadableEntities(event:any){
    this.entities = event;
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

  detailedView(bcid:string){
    const url = window.location.origin + '/record/' + bcid;
    window.open(url, '_blank')?.focus();
  }
}
