import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../helpers/services/authentication.service';
import { ProjectSelectorComponent } from '../project-selector/project-selector.component';
import { DummyDataService } from '../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, NgbDropdownModule, RouterLink, RouterLinkActive, ProjectSelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() largeDevice:boolean = false;
  @Input() currentUser:any;
  isSmallDevice:boolean = false;

  // Injectors
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
  }

  openSidebar(){
    this.dummyDataService.toggleSidebarSub.next(!this.dummyDataService.toggleSidebarSub.value);
  }

  signoutUser(){ this.authService.logoutUser(); }
}
