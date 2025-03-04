import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent implements OnDestroy{
  // Injectables
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  private destroy$ = new Subject<void>();
  projectDetails:any;
  templateUrl:string = '';
  teamUrl:string = '';
  allExpedition:Array<any> = [];
  displayExpedition:Array<any> = [];
  isLoading:boolean = true;

  constructor(){
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
      },
      complete: ()=> this.isLoading = false
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
