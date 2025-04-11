import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService } from '../../../helpers/services/project.service';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProjectSelectorComponent } from '../project-selector/project-selector.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ProjectSelectorComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnDestroy{
  // Injectables
  router = inject(Router);
  modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);

  // Variables
  @ViewChild('selectProjectModal', { static: false }) selectProjectModal!:NgbModalRef;
  destroy$:Subject<any> = new Subject();
  @Input() currentUser:any;
  currentProject:any;
  device:string = '';
  isSidebarHidden:boolean = false;
  menuItems:Array<any> = [
    { name: "View Projects", route: '/workbench/dashboard' , icon: 'fa-list-ul', alwaysVisible: true },
    { name: "View Teams", route: '/workbench/teams-list' , icon: 'fa-users', alwaysVisible: true },
    { name: "Generate Template", route: '/workbench/template' , icon: 'fa-file-excel', alwaysVisible: false },
    { name: "Load Data", otherName: 'Validate Data', route: '/workbench/upload' , icon: 'fa-upload', alwaysVisible: false },
    { name: "Upload Photos", route: '/workbench/upload/photos' , icon: 'fa-image', alwaysVisible: false, checkCondition: true },
    { name: "Fastq SRA Upload", route: '/workbench/upload/sra' , icon: 'fa-image', alwaysVisible: false, checkCondition: true },
    { name: "Plate Viewer", route: '/workbench/plates' , icon: 'fa-table-cells', alwaysVisible: false, checkCondition: true },
    { name: "Team Overview", route: '/workbench/team-overview' , icon: 'fa-clipboard-user' , alwaysVisible: false, checkCondition: true },
    { name: "Project Overview", route: '/workbench/project-overview' , icon: 'fa-laptop' , alwaysVisible: true},
  ]

  adminTabs:Array<any> = [
    { name: "Project Expeditions", route: '/workbench/expeditions' , icon: 'fa-gear', alwaysVisible: true },
    { name: "Project Settings", route: '/workbench/project/settings' , icon: 'fa-wrench', alwaysVisible: false },
    { name: "Project Configuration", route: '/workbench/config' , icon: 'fa-wrench', alwaysVisible: false },
    { name: "My Profile", route: '/workbench/user/profile' , icon: 'fa-user', alwaysVisible: true },
  ]

  permissionArr:any = {
    "Upload Photos" : false,
    "Fastq SRA Upload" : false ,
    "Plate Viewer" : false ,
    "Team Overview" : false
  };

  @HostListener('window:resize')
  onResize() {
    if(window.innerWidth >= 991 ) this.device = 'large';
    else this.device = 'small';
  }

  constructor(){
    this.onResize();
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject && !this.currentProject?.limitedAccess){
        Object.keys(this.permissionArr).forEach((key:string) => this.permissionArr[key] = this.checkItemVisiblity(key));
      }
      else{
        Object.keys(this.permissionArr).forEach((key:string) => this.permissionArr[key] = false);
      }
    });
    this.dummyDataService.toggleSidebarSub.pipe(distinctUntilChanged()).subscribe((res:any)=> this.isSidebarHidden = res)
  }

  closeSidebar(){
    if(this.device == 'small')
      this.dummyDataService.toggleSidebarSub.next(!this.dummyDataService.toggleSidebarSub.value);
  }

  checkItemVisiblity(item:string){
    switch(item){
      case 'Upload Photos':
        return  this.currentUser &&
                this.currentProject &&
                this.currentProject.config.entities.some((e:any) => e.type === 'Photo')
      case 'Fastq SRA Upload':
        return  this.currentUser &&
                this.currentProject &&
                this.currentProject.config.entities.some((e:any) => e.type === 'Fastq')
      case 'Plate Viewer':
        return  this.currentProject &&
                this.currentProject.config.entities.some((e:any) => e.conceptAlias === 'Tissue' && e.uniqueKey === 'tissueID')
      case 'Team Overview':
        return  this.currentProject &&
                this.currentProject.projectConfiguration.networkApproved === true
      default:
        return false
    }
  }

  checkAndNavigate(route:string, item:string = ''){
    if(!this.currentProject && !['My Profile', 'View Projects', 'View Teams'].includes(item)) this.openProjectSelectModal()
    else{
      this.router.navigateByUrl(route);
      this.closeSidebar();
    }
  }

  openProjectSelectModal(){
    this.modalService.open( this.selectProjectModal, { animation: true, backdrop: false, windowClass: 'no-backdrop' });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
