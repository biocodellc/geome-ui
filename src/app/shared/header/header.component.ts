import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { Project, ProjectService } from '../../../helpers/services/project.service';
import { filter, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, RouterLink, RouterLinkActive],
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
  
  allPublicProjects:Array<any> = [];
  filteredPublicProjects:Array<any> = [];
  currentRouteUrl:string = '';
  currentProject:any;
  routerChangeSub:Subscription;

  constructor(){
    this.projectService.getAllProjectsValue().subscribe((res:any)=>{
      if(res) this.allPublicProjects = this.filteredPublicProjects = res;
    })
    this.routerChangeSub = this.router.events.pipe( filter((event:any) => event instanceof NavigationEnd))
      .subscribe(event => this.currentRouteUrl = event.urlAfterRedirects);
    this.projectService.currentProject$.subscribe((res:any) =>{
      if(res) this.currentProject = res;
    })
  }

  onProjectChange(project:any){
    this.projectService.setCurrentProject(project);
  }

  signoutUser(){ this.authService.logoutUser(); }

  ngOnDestroy(): void {
    this.routerChangeSub.unsubscribe();
  }
}
