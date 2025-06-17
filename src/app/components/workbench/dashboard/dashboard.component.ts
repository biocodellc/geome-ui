import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnDestroy{
  // Injectors
  router = inject(Router);
  toastr = inject(ToastrService);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  authService = inject(AuthenticationService);

  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  searchedProject:string = '';
  searchedPrivateProject:string = '';
  currentProject:any;
  filterProjectSubject:Subject<any> = new Subject();
  userProjects:Array<any> = [];
  filterUserProjects:Array<any> = [];
  allPublicProjects:Array<any> = [];
  filteredPublicProjects:Array<any> = [];

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.getUserProjects();
    this.getAllPublicProjects();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe(x => this.currentUser = x);
    this.filterProjectSubject.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe((type:string) =>{
      if(type === 'private') this.filterPrivateProject();
      else this.filterProject();
    })
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((x:any)=> this.currentProject = x);
  }

  getUserProjects(){
    this.projectService.userProjectSubject.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any) => {
        if(res){
          res = res.map((i:any)=>{
            i.hasPhotos = i?.entityStats?.Sample_PhotoCount > 0 || i?.entityStats?.Event_PhotoCount > 0;
            i.hasSRA = i?.entityStats?.fastqMetadataCount > 0;
            return i;
          })
          this.userProjects = this.filterUserProjects = this.projectService.sortWithKey(res, 'latestDataModification', 'date');
        }
      }
    })
  }

  getAllPublicProjects(){
    this.projectService.getProjectStats(true).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        res = res.map((i:any)=>{
          i.hasPhotos = i.entityStats.Sample_PhotoCount > 0 || i.entityStats.Event_PhotoCount > 0;
          i.hasSRA = i.entityStats.fastqMetadataCount > 0;
          return i;
        })
        this.allPublicProjects = this.filteredPublicProjects = this.projectService.sortWithKey(res, 'latestDataModification', 'date');
        this.dummyDataService.loadingState.next(false);
      },
      error: ()=> this.dummyDataService.loadingState.next(false)
    })
  }

  filterProject(){
    const newVal = this.searchedProject.trim().toLowerCase();
    if(newVal)
      this.filteredPublicProjects = this.allPublicProjects.filter((proj:any)=> proj.projectTitle.toLowerCase().includes(newVal));
    else this.filteredPublicProjects = this.allPublicProjects;
  }

  filterPrivateProject(){
    const newVal = this.searchedPrivateProject.trim().toLowerCase();
    if(newVal)
      this.filterUserProjects = this.userProjects.filter((proj:any)=> proj.projectTitle.toLowerCase().includes(newVal));
    else this.filterUserProjects = this.userProjects;
  }

  selectProject(project:any){
    this.projectService.setCurrentProject(project);
  }

  viewTeamOverview(teamId:any){
    if(this.currentProject && this.currentProject.projectConfiguration.id === teamId){
      this.router.navigate(['/workbench/team-overview']);
      return;
    }
    this.projectService.getAllProjectsValue().pipe(take(1)).subscribe((allProjects:any)=>{
      const projectData = allProjects.find((p:any) => p.projectConfiguration.id === teamId);
      if(projectData)
        this.projectService.setCurrentProject(projectData, true, '/workbench/team-overview');
      else this.toastr.info("No Information Found.");
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
