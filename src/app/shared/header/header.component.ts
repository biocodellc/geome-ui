import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { ProjectService } from '../../../helpers/services/project.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() largeDevice:boolean = false;
  @Input() currentUser:any;

  // Injectors
  authService = inject(AuthenticationService);
  projectService = inject(ProjectService);
  
  allPublicProjects:Array<any> = [];

  constructor(){ this.getPublicProjects(); }

  getPublicProjects(){
    this.projectService.getProjectStats(true).pipe(take(1)).subscribe({
      next: (res:any)=> this.allPublicProjects = res
    })
  }

  signoutUser(){ this.authService.logoutUser(); }
}
