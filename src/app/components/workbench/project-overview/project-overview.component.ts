import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule, NgbDropdownModule  } from '@ng-bootstrap/ng-bootstrap';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { Subject, take, takeUntil } from 'rxjs';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { QueryService } from '../../../../helpers/services/query.service';
import { QueryParams } from '../../../../helpers/scripts/queryParam';
import { DataService } from '../../../../helpers/services/data.service';
import { FileService } from '../../../../helpers/services/file.service';
import { ToastrService } from 'ngx-toastr';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule, NgbDropdownModule, RouterLink ],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent implements OnDestroy{
  // Injectables
  private router = inject(Router);
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
  headers:any[] = [];
  menuCache:any = {};

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
        if(res){
          this.allExpedition = this.displayExpedition = res;
          if(this.displayExpedition[0]) this.headers = Object.keys(this.displayExpedition[0]).filter(k =>
            k.endsWith('Count'),
          );
        }
        this.dummyDataService.loadingState.next(false);
      },
    })
  }

  downloadProjectCsv(){
    if(this.downloadingFile) return;
    this.downloadingFile = true;
    const entities = this.worksheetEntities();
    const conceptAlias = entities.shift();
    const query = this.getQuery(undefined, entities);
    this.queryService.downloadCsv(query, conceptAlias);
    setTimeout(() => this.downloadingFile = false, 1000);
  }

  menuOptions(expedition: any): any[] | undefined {
    if (this.projectDetails.limitedAccess) {
      return;
    }

    if (!this.menuCache[expedition.expeditionCode]) {
      let foundWorksheet = false;
      this.menuCache[expedition.expeditionCode] = this.headers
        .map((header:any) => {
          const conceptAlias = header.replace('Count', '');
          const entity = this.projectDetails.config.entities.find(
            (e: any) => e.conceptAlias === conceptAlias
          );

          if (!entity) return;
          if (!Number(expedition[header])) return;

          if (entity.worksheet) {
            if (foundWorksheet) return;
            foundWorksheet = true;
            return {
              fn: () => this.downloadExpCsv(expedition.expeditionCode),
              name: 'CSV Archive',
            };
          } else if (entity.type === 'Fastq') {
            return {
              fn: () => this.downloadFastq(expedition.expeditionCode),
              name: 'Fastq - SRA Metadata',
            };
          }
          else return
        })
        .filter((o): o is { fn: ()=>{}; name: string } => !!o);

      if (foundWorksheet) {
        this.menuCache[expedition.expeditionCode].splice(1, 0, {
          fn: () => this.downloadExcel(expedition.expeditionCode),
          name: 'Excel Workbook',
        });
      }
    }

    return this.menuCache[expedition.expeditionCode];
  }


  downloadExpCsv(expeditionCode:string){
    if(this.downloadingFile) return;
    this.downloadingFile = true;
    this.dataService.exportData(this.projectDetails.projectId, expeditionCode).pipe(take(1)).subscribe((res:any)=>{
      if (!res || res.status === 204) this.toastr.warning('No resources found')
      else if(res.url){
        this.fileService.download(res.url);
        this.toastr.success('Downloading Data!');
      }
      this.downloadingFile = false;
    })
  }

  downloadFastq(expeditionCode:string) {
    if(this.downloadingFile) return;
    this.downloadingFile = true;
    const fileUrl = this.dataService.generateSraData(this.projectDetails.projectId, expeditionCode);
    if(fileUrl){
      this.fileService.download(fileUrl);
      this.toastr.success('Downloading Data!');
    }
    this.downloadingFile = false;
    // this.dataService.generateSraData(this.projectDetails.projectId, expeditionCode)
    // .pipe(take(1)).subscribe((res:any)=>{
    //   if (!res || res.status === 204) this.toastr.warning('No resources found')
    //   else if(res.url){
    //     this.fileService.download(res.url);
    //     this.toastr.success('Downloading Data!');
    //   }
    //   this.downloadingFile = false;
    // })
  }

  downloadExcel(expeditionCode:string) {
    if(this.downloadingFile) return;
    this.downloadingFile = true;
    const entities = this.worksheetEntities();
    const conceptAlias = entities.shift();

    this.queryService.downloadExcel(
      this.getQuery(expeditionCode, entities), 
      conceptAlias
    );
    setTimeout(() => this.downloadingFile = false, 1000);
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

  viewData(expeditionCode:string) {
    this.router.navigateByUrl(`/query?q=_projects_:${this.projectDetails.projectId} and _expeditions_:[${expeditionCode}]`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
