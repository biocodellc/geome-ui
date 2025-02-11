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
    { name: "Generate Template", route: '' , icon: 'fa-file-excel', alwaysVisible: true },
    { name: "Validate Data", route: '' , icon: 'fa-upload', alwaysVisible: true },
    { name: "Project Overview", route: '' , icon: 'fa-laptop' , alwaysVisible: true},
  ]

  constructor(){}
}
