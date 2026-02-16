import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-team-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-overview.component.html',
  styleUrl: './team-overview.component.scss'
})
export class TeamOverviewComponent implements OnDestroy{
  // Injectors
  router = inject(Router);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);

  // Variables
  private destroy$ = new Subject<void>();
  currentProject:any;
  projectStats:Array<any> = [];
  allProjectsStats:Array<any> = [];

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        this.currentProject = res;
        if(this.allProjectsStats.length) this.filterStats()
        else this.getProjectStats()
      }
    })
  }

  getProjectStats(){
    this.projectService.getProjectStats(true).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res && res.length > 0){
          this.allProjectsStats = res;
          this.filterStats();
        }
      }
    })
  }

  filterStats(){
    this.projectStats = this.allProjectsStats.filter((proj:any)=> proj.projectConfiguration.name == this.currentProject.projectConfiguration.name);
    this.dummyDataService.loadingState.next(false);
  }

  selectProject(project:any){
    this.projectService.setCurrentProject(project);
  }

  get teamAdmin(){
    return this.currentProject?.projectConfiguration?.user || {};
  }

  get teamAdminName():string{
    const firstName = this.teamAdmin?.firstName || '';
    const lastName = this.teamAdmin?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || this.teamAdmin?.name || this.teamAdmin?.username || this.teamAdmin?.email || '-';
  }

  get teamAdminEmail():string{
    return this.teamAdmin?.email || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
