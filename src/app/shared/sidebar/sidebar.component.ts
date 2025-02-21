import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // Variables
  @Input() currentUser:any;
  menuItems:Array<any> = [
    { name: "View Projects", route: '/workbench/dashboard' , icon: 'fa-list-ul', alwaysVisible: true },
    { name: "View Teams", route: '/workbench/teams-list' , icon: 'fa-users', alwaysVisible: true },
    { name: "Generate Template", route: '/workbench/template' , icon: 'fa-file-excel', alwaysVisible: true },
    { name: "Load Data", route: '/workbench/upload' , icon: 'fa-upload', alwaysVisible: false },
    { name: "Upload Photos", route: '/workbench/upload/photos' , icon: 'fa-image', alwaysVisible: false },
    { name: "Fastq SRA Upload", route: '/workbench/upload/sra' , icon: 'fa-image', alwaysVisible: false },
    { name: "Plate Viewer", route: '/workbench/plates' , icon: 'fa-table-cells', alwaysVisible: false },
    // { name: "Validate Data", route: '/workbench/' , icon: 'fa-upload', alwaysVisible: true },
    { name: "Team Overview", route: '/workbench/team-overview' , icon: 'fa-clipboard-user' , alwaysVisible: true},
    { name: "Project Overview", route: '/workbench/project-overview' , icon: 'fa-laptop' , alwaysVisible: true},
  ]

  adminTabs:Array<any> = [
    { name: "Project Expeditions", route: '/workbench/expeditions' , icon: 'fa-gear', alwaysVisible: true },
    { name: "Project Settings", route: '/workbench/project/settings' , icon: 'fa-wrench', alwaysVisible: true },
    { name: "My Profile", route: '/workbench/user/profile' , icon: 'fa-user', alwaysVisible: true },
  ]

  constructor(){}
}
