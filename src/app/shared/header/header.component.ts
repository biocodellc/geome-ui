import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { ProjectSelectorComponent } from '../project-selector/project-selector.component';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';
import { ProjectService } from '../../../helpers/services/project.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, RouterLink, RouterLinkActive, ProjectSelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy{
  @Input() largeDevice:boolean = false;
  @Input() currentUser:any;
  isSmallDevice:boolean = false;
  currentProjectId!:string | number;
  destroy$:Subject<any> = new Subject();
  userProjects:any[] = [];
  currentRouteUrl:string = '';

  // Injectors
  router = inject(Router);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  dummyDataService = inject(DummyDataService);

  @HostListener('window:resize')
    onResize() {
      if(window.innerWidth >= 991 ) this.isSmallDevice = false;
      else this.isSmallDevice = true;
    }

  constructor(){
    this.onResize();
    if(this.isSmallDevice)  this.dummyDataService.toggleSidebarSub.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any) => this.currentProjectId = res?.projectId);
    this.projectService.userProjectSubject.pipe(takeUntil(this.destroy$)).subscribe((res:any) => this.userProjects = res);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(event => {
        this.currentRouteUrl = event.urlAfterRedirects;
      });
  }

  openSidebar(){
    this.dummyDataService.toggleSidebarSub.next(!this.dummyDataService.toggleSidebarSub.value);
  }

  signoutUser(){
    const isPrivateProj = this.userProjects.find((proj:any) => proj.projectId == this.currentProjectId) ? true : false;
    if(isPrivateProj) this.projectService.setCurrentProject(null);
    this.projectService.userProjectSubject.next([]);
    this.authService.logoutUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
