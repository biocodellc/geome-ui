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
    { name: "Generate Template", route: '/workbench/project-overview' , icon: 'fa-file-excel', alwaysVisible: true },
    { name: "Load Data", route: '' , icon: 'fa-upload', alwaysVisible: false },
    { name: "Fastq SRA Upload", route: '' , icon: 'fa-image', alwaysVisible: false },
    { name: "Plate Viewer", route: '' , icon: 'fa-table-cells', alwaysVisible: false },
    { name: "Validate Data", route: '' , icon: 'fa-upload', alwaysVisible: true },
    { name: "Project Overview", route: '' , icon: 'fa-laptop' , alwaysVisible: true},
  ]

  adminTabs:Array<any> = [
    { name: "Project Expenditure", route: '' , icon: 'fa-gear', alwaysVisible: true },
    { name: "My Profile", route: '' , icon: 'fa-user', alwaysVisible: true },
  ]

  constructor(){}
}
