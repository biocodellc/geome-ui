import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { Subject, take, takeUntil } from 'rxjs';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { QueryService } from '../../../../helpers/services/query.service';
import { QueryParams } from '../../../../helpers/scripts/queryParam';
import { DataService } from '../../../../helpers/services/data.service';
import { FileService } from '../../../../helpers/services/file.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent implements OnDestroy{
  // Injectables
  private toastr = inject(ToastrService);
  private fileService = inject(FileService);
  private dataService = inject(DataService);
  private queryService = inject(QueryService);
  private projectService = inject(ProjectService);
  private dummyDataService = inject(DummyDataService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  private destroy$ = new Subject<void>();
  projectDetails:any;
  templateUrl:string = '';
  teamUrl:string = '';
  allExpedition:Array<any> = [];
  displayExpedition:Array<any> = [];
  downloadingFile:boolean = false;

  constructor(){
    this.dummyDataService.loadingState.next(true);
    const currentUrl = window.location.href.split('?').slice(0,1).join('');
    this.projectService.currentProject$()
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:any)=>{
      this.projectDetails = res;
      if(res){
        this.getExpeditionStats();
        this.templateUrl = currentUrl.replace('project-overview', 'template') + `?projectId=${res.projectId}`;
        this.teamUrl = currentUrl.replace('project-overview', 'team-overview') + `?projectId=${res.projectId}`;
      }
    })
  }

  getExpeditionStats(){
    this.expeditionService.stats(this.projectDetails.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.allExpedition = this.displayExpedition = res;
        this.dummyDataService.loadingState.next(false);
      },
    })
  }

  downloadProjectCsv(){
    this.downloadingFile = true;
    const entities = this.worksheetEntities();
    const conceptAlias = entities.shift();
    const query = this.getQuery(undefined, entities);
    this.queryService.downloadCsv(query, conceptAlias);
    // this.toastr.success('Downloading Data!');
    this.downloadingFile = false;
  }

  downloadExpCsv(expeditionCode:string){
    this.downloadingFile = true;
    this.dataService.exportData(
      this.projectDetails.projectId,
      expeditionCode,
    ).pipe(take(1)).subscribe((res:any)=>{
      if (!res || res.status === 204) this.toastr.warning('No resources found')
      else if(res.url){
        this.fileService.download(res.url);
        this.toastr.success('Downloading Data!');
      }
      this.downloadingFile = true;
    })
  }

  worksheetEntities() {
    return this.projectDetails.config.entities
      .filter((e:any) => !!e.worksheet)
      .sort((a:any, b:any) => {
        if (a.parentEntity) {
          if (b.parentEntity) return 0;
          return 1;
        } else if (b.parentEntity) {
          return -1;
        }
        return 0;
      })
      .map((e:any) => e.conceptAlias);
  }

  getQuery(expeditionCode:string | any, selectEntities:any[]) {
    const params = new QueryParams();
    if (expeditionCode) {
      params.expeditions.push({ expeditionCode });
    }
    params.projects.push(this.projectDetails);
    return params.buildQuery(selectEntities);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
