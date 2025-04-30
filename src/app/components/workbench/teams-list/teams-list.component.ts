import { Component, inject, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { ProjectConfigurationService } from '../../../../helpers/services/project-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { ProjectService } from "../../../../helpers/services/project.service";
import { Router } from "@angular/router";


@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTooltipModule, LoaderComponent],
  templateUrl: './teams-list.component.html',
  styleUrl: './teams-list.component.scss'
})
export class TeamsListComponent implements OnDestroy{
  // Injectors
  router = inject(Router);
  toastr = inject(ToastrService);
  dummyDataService = inject(DummyDataService);
  projectService = inject(ProjectService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  private destroy$ = new Subject<void>();
  searchedTeam: string = '';
  currentProject:any;
  filterTeamSubject: Subject<any> = new Subject();
  allPublicTeams: Array<any> = [];
  filteredPublicTeams: Array<any> = [];

  constructor() {
    this.dummyDataService.loadingState.next(true);
    this.getAllPublicTeams();
    this.filterTeamSubject.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => this.filterTeam());
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe(project => this.currentProject = project)
  }

  getAllPublicTeams() {
    this.projectConfService.allProjConfigSubject.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        const allTeams:[] = res.filter((team:any)=> team.networkApproved);
        allTeams.forEach((team:any, i:number)=> this.getTeamModules(team.id));
        setTimeout(() => {
          this.dummyDataService.loadingState.next(false);
        }, 2000);
      }
    })
  }

  getTeamModules(id:number){
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.allPublicTeams.push(res);
        this.filteredPublicTeams = this.allPublicTeams;
      }
    })
  }

  filterTeam() {
    const newVal = this.searchedTeam.trim().toLowerCase();
    if (newVal)
      this.filteredPublicTeams = this.allPublicTeams.filter((proj: any) => proj.name.toLowerCase().includes(newVal));
    else this.filteredPublicTeams = this.allPublicTeams;
  }

  viewTeamOverview(teamId:any){
    if(this.currentProject && this.currentProject.projectConfiguration.id === teamId){
      this.router.navigate(['/workbench/team-overview']);
      return;
    }
    this.projectService.getAllProjectsValue().pipe(take(1)).subscribe((allProjects:any)=>{
      const projectData = allProjects.find((p:any) => p.projectConfiguration.id === teamId);
      this.projectService.setCurrentProject(projectData, true, '/workbench/team-overview')
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
