import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { debounceTime, filter, Subject, takeUntil } from 'rxjs';
import { ProjectService } from '../../../helpers/services/project.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-project-selector',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule, FormsModule],
  templateUrl: './project-selector.component.html',
  styleUrl: './project-selector.component.scss'
})
export class ProjectSelectorComponent {
  // Injectors
  router = inject(Router);
  dummyDataService = inject(DummyDataService);
  projectService = inject(ProjectService);

  // Decorators and Variables
  @Input() currentUser: any;
  @Output() updatingProject:EventEmitter<boolean> = new EventEmitter();
  destroy$: Subject<any> = new Subject();

  projectList:Array<any> = [];
  allPrivateProjects:Array<any> = [];
  allPublicProjects:Array<any> = [];
  allFilteredProjects:Array<any> = [];
  searchedProject:string = '';
  filterProjectSubject:Subject<any> = new Subject();

  currentRouteUrl:string = '';
  currentProject:any;
  isFilterActive: boolean = false;
  includePublicProj:boolean = false;

  setCurrentProj:boolean = false;

  constructor() {
    this.projectService.getAllProjectsValue().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.allPublicProjects = res;
        this.setInitialProjects();
      }
    })
    this.projectService.userProjectSubject.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (!res) return
      this.allPrivateProjects = res;
      this.projectList = this.allFilteredProjects = [...this.allPrivateProjects];
      if (this.setCurrentProj) {
        this.setCurrentProj = false;
        this.onProjectChange(this.allPrivateProjects[0]);
      }
    })

    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.currentProject = res;
    })
    this.filterProjectSubject.pipe(debounceTime(100)).pipe(takeUntil(this.destroy$)).subscribe(() => this.filterProject());
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(event => {
        if (this.currentRouteUrl.includes('register') && this.allPrivateProjects.length) this.onProjectChange(this.allPrivateProjects[0]);
        else if (this.currentRouteUrl.includes('register') && !this.allPrivateProjects.length) this.setCurrentProj = true;
        this.currentRouteUrl = event.urlAfterRedirects;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['currentUser']) this.setInitialProjects();
  }

  onProjectChange(project:any){
    this.updatingProject.emit(true);
    this.projectService.setCurrentProject(project);
    this.dummyDataService.loadingState.next(true);
  }

  filterProject(){
    const newVal = this.searchedProject.trim().toLowerCase();
    if(newVal){
      this.isFilterActive = true;
      const matchingPrivateProj = this.projectList.filter((proj:any)=> proj.projectTitle.toLowerCase().includes(newVal));
      this.allFilteredProjects = matchingPrivateProj;
    }
    else{
      this.isFilterActive = false;
      this.setInitialProjects();
    }
  }

  onProjectPrefChange(event:any){
    this.searchedProject = '';
    const isChecked = event.target.checked;
    if(isChecked) this.projectList = [ ...this.allPrivateProjects, ...this.allPublicProjects];
    else this.projectList = [ ...this.allPrivateProjects ];
    this.allFilteredProjects = [ ...this.projectList ];
  }

  setInitialProjects(){
    this.includePublicProj = false;
    if(this.currentUser && this.includePublicProj) this.projectList = [ ...this.allPrivateProjects, ...this.allPublicProjects];
    else if(this.currentUser && !this.includePublicProj) this.projectList = [ ...this.allPrivateProjects];
    else{
      this.allPrivateProjects = [];
      this.projectList = [ ...this.allPublicProjects ];
    }
    this.allFilteredProjects = [ ...this.projectList ];
  }
}
