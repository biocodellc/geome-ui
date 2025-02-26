import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { ProjectService } from '../../../helpers/services/project.service';
import { debounceTime, filter, Subject, Subscription, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy{
  @Input() largeDevice:boolean = false;
  @Input() currentUser:any;

  // Injectors
  authService = inject(AuthenticationService);
  projectService = inject(ProjectService);
  router = inject(Router);
  
  // Variables
  private destroy$ = new Subject<void>();
  projectList:Array<any> = [];
  allPrivateProjects:Array<any> = [];
  allPublicProjects:Array<any> = [];
  allFilteredProjects:Array<any> = [];
  searchedProject:string = '';
  filterProjectSubject:Subject<any> = new Subject();

  currentRouteUrl:string = '';
  currentProject:any;
  isFilterActive: boolean = false;

  constructor(){
    this.projectService.getAllProjectsValue().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res) this.allPublicProjects = res;
    })
    this.projectService.userProjectSubject.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return
      this.allPrivateProjects = res;
      this.projectList = this.allFilteredProjects = [ ...this.allPrivateProjects ];
    })
    this.router.events.pipe( filter((event:any) => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(event => this.currentRouteUrl = event.urlAfterRedirects);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any) =>{
      if(res) this.currentProject = res;
    })
    this.filterProjectSubject.pipe(debounceTime(100)).pipe(takeUntil(this.destroy$)).subscribe(() => this.filterProject());
  }

  onProjectChange(project:any){
    this.projectService.setCurrentProject(project);
  }

  filterProject(){
    const newVal = this.searchedProject.trim().toLowerCase();
    if(newVal){
      this.isFilterActive = true;
      const matchingPrivateProj = this.projectList.filter((proj:any)=> proj.projectTitle.toLowerCase().includes(newVal));
    }
    else this.isFilterActive = false
  }

  onProjectPrefChange(event:any){
    this.searchedProject = '';
    const isChecked = event.target.checked;
    if(isChecked) this.projectList = [ ...this.allPrivateProjects, ...this.allPublicProjects];
    else this.projectList = [ ...this.allPrivateProjects ];
    this.allFilteredProjects = [ ...this.projectList ];
  }

  signoutUser(){ this.authService.logoutUser(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
